import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { initDB, sql } from '@/app/lib/db';
import { getFingerprint } from '@/app/lib/fingerprint';
import { readOrCreateGuestId, attachGuestCookie } from '@/app/lib/guest-id';
import { isRateLimited } from '@/app/lib/rate-limit';
import { containsProfanity } from '@/app/lib/profanity';
import { getSongSuggestions } from '@/app/lib/ai';
import { getEffectivePlan, getPlanLimits } from '@/app/lib/plans';
import { auth } from '@/auth';
import {
  FREE_VISIBLE_FOREIGN_SONGS,
  FREE_VISIBLE_SONGS,
  isUnlocked,
  pickForeignForGuest,
  redactHiddenSongs,
} from '@/app/lib/visibility';

interface SongRow {
  id: number;
  title: string;
  artist: string;
  deezer_id: string | null;
  album_art_url: string | null;
  suggestions: string | null;
  created_at: string;
  played: boolean;
  vote_count: number;
  has_voted: boolean | null;
  is_mine: boolean;
}

// Drei Sichtweisen einer nicht freigeschalteten Feier: der Gast sieht einen
// Ausschnitt, DJ-Screen und Paar-Seite sehen die drei beliebtesten offen.
type View = 'guest' | 'owner' | 'dj';

function parseView(raw: string | null): View {
  if (raw === 'owner' || raw === 'dj') return raw;
  return 'guest';
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { id: guestId, isNew: guestIdIsNew } = readOrCreateGuestId(req);
  const fp = getFingerprint(guestId, params.slug);
  const url = new URL(req.url);
  const requestedView = parseView(url.searchParams.get('view'));

  const { rows: eventRows } = await sql`
    SELECT
      e.id,
      e.dj_id,
      e.dj_token,
      e.credit_redeemed,
      e.unlocked_at,
      u.plan AS owner_plan,
      u.plan_status AS owner_plan_status,
      u.current_period_end AS owner_current_period_end
    FROM events e
    LEFT JOIN users u ON u.id = e.dj_id
    WHERE e.slug = ${params.slug}
  `;

  if (eventRows.length === 0) {
    const res = NextResponse.json(
      { songs: [], unlocked: false, total: 0, hidden_count: 0 },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } }
    );
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  const evt = eventRows[0];

  // Sicherheitsrelevant: view=owner (Paar-Seite) und view=dj (DJ-Screen)
  // schalten die Bezahlschranke aus (die drei beliebtesten Titel offen statt
  // der eingeschränkten Gästeauswahl). Ohne diese Prüfung könnte jeder, der
  // nur den normalen Gästelink kennt, sich per Query-Parameter selbst zum
  // Besitzer oder DJ erklären. view=owner ist nur dem eingeloggten Besitzer
  // der Feier erlaubt, view=dj zusätzlich jedem mit gültigem dj_token. Fehlt
  // beides, fällt die Anfrage auf die Gästesicht zurück.
  let view = requestedView;
  if (requestedView === 'owner' || requestedView === 'dj') {
    const session = await auth();
    const isOwner = !!session?.user?.id && session.user.id === evt.dj_id;
    if (requestedView === 'owner') {
      if (!isOwner) view = 'guest';
    } else {
      const djToken = url.searchParams.get('dj');
      const hasValidToken = !!djToken && djToken === evt.dj_token;
      if (!isOwner && !hasValidToken) view = 'guest';
    }
  }

  // Rate-Limiting für die Gästesicht: begrenzt, wie oft pro IP+Feier in
  // kurzer Zeit unterschiedliche Gästeauswahlen abgefragt werden können.
  // Kein Ersatz für den Cookie-Schutz, aber macht automatisiertes
  // Durchprobieren zusätzlich langsamer.
  if (view === 'guest') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
      req.headers.get('x-real-ip') ??
      'unknown';
    if (isRateLimited(`songs:${params.slug}:${ip}`, 60, 60_000)) {
      const res = NextResponse.json({ error: 'rate_limited' }, { status: 429 });
      return attachGuestCookie(res, guestId, guestIdIsNew);
    }
  }

  const unlocked = isUnlocked(
    evt.owner_plan
      ? {
          plan: evt.owner_plan,
          plan_status: evt.owner_plan_status,
          current_period_end: evt.owner_current_period_end,
        }
      : null,
    evt.credit_redeemed === true,
    evt.unlocked_at
  );

  const { rows } = await sql`
    SELECT
      s.id,
      s.title,
      s.artist,
      s.deezer_id,
      s.album_art_url,
      s.suggestions,
      s.created_at,
      s.played,
      COUNT(v.id)::int AS vote_count,
      BOOL_OR(v.voter_ip = ${fp}) AS has_voted,
      (s.submitter_ip = ${fp}) AS is_mine
    FROM songs s
    JOIN events e ON e.id = s.event_id
    LEFT JOIN votes v ON v.song_id = s.id
    WHERE e.slug = ${params.slug}
    GROUP BY s.id
    ORDER BY s.played ASC, vote_count DESC, s.created_at ASC
  `;
  const all = rows as SongRow[];

  const visibleIds = new Set<number>();

  if (unlocked || all.length < FREE_VISIBLE_SONGS) {
    // Freigeschaltet, oder es gibt ohnehin weniger als drei Songs: alles offen.
    for (const s of all) visibleIds.add(s.id);
  } else if (view === 'owner' || view === 'dj') {
    // Paar-Seite und DJ-Screen sehen die drei beliebtesten Songs offen.
    const top = [...all]
      .sort(
        (a, b) =>
          b.vote_count - a.vote_count ||
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
          a.id - b.id
      )
      .slice(0, FREE_VISIBLE_SONGS);
    for (const s of top) visibleIds.add(s.id);
  } else {
    // Gast: der älteste eigene Wunsch plus zwei fremde, deterministisch aus
    // der Gästekennung ausgewählt. Fehlen fremde, wird mit weiteren eigenen
    // aufgefüllt, bis drei Songs sichtbar sind (oder alle eigenen aufgebraucht).
    const own = all
      .filter((s) => s.is_mine)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime() || a.id - b.id);
    const foreign = all.filter((s) => !s.is_mine);

    if (own.length > 0) visibleIds.add(own[0].id);

    const foreignCount = own.length > 0 ? FREE_VISIBLE_FOREIGN_SONGS : FREE_VISIBLE_SONGS;
    const pickedForeign = pickForeignForGuest(foreign, fp, foreignCount);
    for (const s of pickedForeign) visibleIds.add(s.id);

    // Auffüllen mit weiteren eigenen Songs, falls zu wenig fremde vorhanden waren.
    let i = 1;
    while (visibleIds.size < FREE_VISIBLE_SONGS && i < own.length) {
      visibleIds.add(own[i].id);
      i++;
    }
  }

  // Sicherheitsrelevant: Titel, Interpret, Cover und Vorschläge werden serverseitig
  // geleert. Ein reines Weichzeichnen im Browser wäre über die Entwicklerwerkzeuge
  // auslesbar und damit keine Bezahlschranke. Like-Zahlen bleiben bei allen
  // Songs sichtbar, auch verschwommenen.
  const songs = redactHiddenSongs(all, visibleIds);

  // Sichtbare zuerst (bestehende Reihenfolge), versteckte danach nach
  // Like-Zahl absteigend.
  const visible = songs.filter((s) => !s.hidden);
  const hidden = songs
    .filter((s) => s.hidden)
    .sort((a, b) => b.vote_count - a.vote_count || a.id - b.id);
  const ordered = [...visible, ...hidden];

  const body = JSON.stringify({
    songs: ordered,
    unlocked,
    total: ordered.length,
    hidden_count: hidden.length,
  });

  // Die Antwort hängt vom Fingerprint ab (Gästeauswahl, has_voted): der Hash
  // fließt in den ETag ein, damit kein Gast über einen fremden 304 die
  // Auswahl oder den Like-Status eines anderen Gastes zwischengespeichert
  // bekommt. Cache-Control bleibt zusätzlich privat.
  if (view === 'guest' && !unlocked) {
    // Die Gästeauswahl ist zwar deterministisch pro Fingerprint, aber ein
    // fixer ETag würde nach neuen Wünschen/Likes veraltete Daten ausliefern.
    const res = new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  const etag = `W/"${createHash('sha1').update(body + fp).digest('hex').slice(0, 16)}"`;

  if (req.headers.get('if-none-match') === etag) {
    const res = new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': 'private, no-store',
      },
    });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  const res = new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': 'private, no-store',
    },
  });
  return attachGuestCookie(res, guestId, guestIdIsNew);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { id: guestId, isNew: guestIdIsNew } = readOrCreateGuestId(req);
  const fp = getFingerprint(guestId, params.slug);
  // Hängt den Gäste-Cookie an jede Antwort dieses Handlers an.
  function json(payload: unknown, init?: ResponseInit) {
    return attachGuestCookie(NextResponse.json(payload, init), guestId, guestIdIsNew);
  }
  const body = await req.json();

  const { title, artist, deezerId, albumArt } = body as {
    title: string;
    artist: string;
    deezerId?: string;
    albumArt?: string;
  };

  if (!title?.trim() || !artist?.trim()) {
    return json({ error: 'title and artist required' }, { status: 400 });
  }
  if (title.trim().length > 200 || artist.trim().length > 200) {
    return json({ error: 'title/artist too long' }, { status: 400 });
  }

  if (containsProfanity(title) || containsProfanity(artist)) {
    return json({ error: 'Bitte keine anstößigen Inhalte.' }, { status: 422 });
  }

  const { rows: eventRows } = await sql`
    SELECT id, dj_id, credit_redeemed FROM events WHERE slug = ${params.slug}
  `;
  if (eventRows.length === 0) {
    return json({ error: 'event not found' }, { status: 404 });
  }
  const eventId = eventRows[0].id;
  const djId = eventRows[0].dj_id as string;

  // Plan-Check: DJ-Besitzer laden, Songs zählen, gegen Limit prüfen.
  // Per Guthaben freigeschaltete Events haben wie der Event-Pass kein Song-Limit.
  const creditRedeemed = eventRows[0].credit_redeemed === true;
  const { rows: ownerRows } = await sql`
    SELECT plan, plan_status, current_period_end
    FROM users WHERE id = ${djId}
  `;
  if (ownerRows.length > 0 && !creditRedeemed) {
    const owner = ownerRows[0];
    const plan = getEffectivePlan({
      plan: owner.plan,
      plan_status: owner.plan_status,
      current_period_end: owner.current_period_end,
    });
    const limits = getPlanLimits(plan);
    if (Number.isFinite(limits.maxSongs)) {
      const { rows: countRows } = await sql`
        SELECT COUNT(*)::int AS cnt FROM songs WHERE event_id = ${eventId}
      `;
      const songCount = countRows[0].cnt as number;
      if (songCount >= limits.maxSongs) {
        return json(
          { error: 'plan_limit', limit: 'songs', current: songCount, max: limits.maxSongs },
          { status: 402 }
        );
      }
    }
  }

  // Deezer duplicate check
  if (deezerId) {
    const { rows: dupeRows } = await sql`
      SELECT id FROM songs
      WHERE event_id = ${eventId}
        AND deezer_id = ${deezerId}
        AND played = FALSE
    `;
    if (dupeRows.length > 0) {
      const songId = dupeRows[0].id;
      try {
        await sql`INSERT INTO votes (song_id, voter_ip) VALUES (${songId}, ${fp})`;
      } catch {
        // Already voted — ignore
      }
      return json({ duplicate: true, songId }, { status: 200 });
    }
  }

  // Manual duplicate check
  if (!deezerId) {
    const { rows: manualDupe } = await sql`
      SELECT id FROM songs
      WHERE event_id = ${eventId}
        AND played = FALSE
        AND LOWER(title) = LOWER(${title.trim()})
        AND LOWER(artist) = LOWER(${artist.trim()})
    `;
    if (manualDupe.length > 0) {
      const songId = manualDupe[0].id;
      try {
        await sql`INSERT INTO votes (song_id, voter_ip) VALUES (${songId}, ${fp})`;
      } catch {
        // Already voted — ignore
      }
      return json({ duplicate: true, songId }, { status: 200 });
    }
  }

  // Spam check: only count unplayed songs (played songs free up slots)
  const { rows: spamRows } = await sql`
    SELECT COUNT(*)::int AS cnt
    FROM songs
    WHERE event_id = ${eventId}
      AND submitter_ip = ${fp}
      AND played = FALSE
  `;
  if (spamRows[0].cnt >= 3) {
    return json(
      { error: 'Du hast bereits 3 Songs vorgeschlagen. Bitte warte etwas.' },
      { status: 429 }
    );
  }

  const { rows: inserted } = await sql`
    INSERT INTO songs (event_id, title, artist, deezer_id, album_art_url, submitter_ip)
    VALUES (
      ${eventId},
      ${title.trim()},
      ${artist.trim()},
      ${deezerId ?? null},
      ${albumArt ?? null},
      ${fp}
    )
    RETURNING id
  `;
  const songId = inserted[0].id;

  // Auto-vote for submitter
  try {
    await sql`INSERT INTO votes (song_id, voter_ip) VALUES (${songId}, ${fp})`;
  } catch {
    // Ignore
  }

  // Fire-and-forget: enrich with AI song suggestions after response is sent
  const titleForAI = title.trim();
  const artistForAI = artist.trim();
  ;(async () => {
    try {
      const suggestions = await getSongSuggestions(titleForAI, artistForAI);
      await sql`
        UPDATE songs
        SET suggestions = ${JSON.stringify(suggestions)}
        WHERE id = ${songId}
      `;
    } catch {
      // ignore — song already saved, just without suggestions
    }
  })();

  return json({ songId }, { status: 201 });
}
