import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { initDB, sql } from '@/app/lib/db';
import { getFingerprint } from '@/app/lib/fingerprint';
import { containsProfanity } from '@/app/lib/profanity';
import { getSongSuggestions } from '@/app/lib/ai';
import { getEffectivePlan, getPlanLimits } from '@/app/lib/plans';
import { FREE_VISIBLE_SONGS, isUnlocked } from '@/app/lib/visibility';
import { auth } from '@/auth';

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

type Mode = 'full' | 'owner' | 'guest';

// Zufällige Auswahl ohne Reihenfolge-Verzerrung (Fisher-Yates auf einer Kopie).
function pickRandom<T>(items: T[], count: number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const fp = getFingerprint(req, params.slug);
  const url = new URL(req.url);
  const requestedView = url.searchParams.get('view') === 'owner' ? 'owner' : 'guest';
  const djTokenParam = url.searchParams.get('dj');

  const { rows: eventRows } = await sql`
    SELECT
      e.id,
      e.dj_id,
      e.dj_token,
      e.credit_redeemed,
      u.plan AS owner_plan,
      u.plan_status AS owner_plan_status,
      u.current_period_end AS owner_current_period_end
    FROM events e
    LEFT JOIN users u ON u.id = e.dj_id
    WHERE e.slug = ${params.slug}
  `;

  if (eventRows.length === 0) {
    return NextResponse.json(
      { songs: [], unlocked: false, total: 0, hidden_count: 0 },
      { status: 200, headers: { 'Cache-Control': 'private, no-store' } }
    );
  }

  const evt = eventRows[0];
  const unlocked = isUnlocked(
    evt.owner_plan
      ? {
          plan: evt.owner_plan,
          plan_status: evt.owner_plan_status,
          current_period_end: evt.owner_current_period_end,
        }
      : null,
    evt.credit_redeemed === true
  );

  // Der DJ-Screen bleibt immer vollständig: eingeloggter Besitzer ohne explizite
  // Paar-Ansicht oder gültiges dj_token aus dem geteilten Link.
  let isOwner = false;
  if (!unlocked) {
    const session = await auth();
    isOwner = !!session?.user?.id && session.user.id === evt.dj_id;
  }
  const hasDjToken = !!djTokenParam && !!evt.dj_token && djTokenParam === evt.dj_token;

  let mode: Mode;
  if (unlocked || hasDjToken || (isOwner && requestedView !== 'owner')) {
    mode = 'full';
  } else if (requestedView === 'owner' && isOwner) {
    mode = 'owner';
  } else {
    // view=owner ohne Besitz fällt bewusst auf die Gästeregeln zurück.
    mode = 'guest';
  }

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

  let ordered = all;
  const visibleIds = new Set<number>();

  if (mode === 'full') {
    for (const s of all) visibleIds.add(s.id);
  } else if (mode === 'owner') {
    const newest = [...all].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id
    );
    for (const s of newest.slice(0, FREE_VISIBLE_SONGS)) visibleIds.add(s.id);
  } else {
    // Gäste sehen ihre eigenen Wünsche plus drei zufällige fremde. Die Reihenfolge
    // wird chronologisch, damit die Position keine Rangfolge verrät.
    ordered = [...all].sort(
      (a, b) =>
        Number(a.played) - Number(b.played) ||
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
        a.id - b.id
    );
    const foreign: SongRow[] = [];
    for (const s of ordered) {
      if (s.is_mine) visibleIds.add(s.id);
      else foreign.push(s);
    }
    for (const s of pickRandom(foreign, FREE_VISIBLE_SONGS)) visibleIds.add(s.id);
  }

  const songs = ordered.map((s) => {
    if (visibleIds.has(s.id)) return { ...s, hidden: false };
    // Sicherheitsrelevant: Titel, Interpret, Cover und Vorschläge werden serverseitig
    // geleert. Ein reines Weichzeichnen im Browser wäre über die Entwicklerwerkzeuge
    // auslesbar und damit keine Bezahlschranke.
    return {
      ...s,
      title: '',
      artist: '',
      deezer_id: null,
      album_art_url: null,
      suggestions: null,
      // Gäste erfahren keine Rangfolge, das Paar sieht die Like-Zahlen als Kaufanreiz.
      vote_count: mode === 'guest' ? null : s.vote_count,
      has_voted: mode === 'guest' ? false : s.has_voted,
      hidden: true,
    };
  });

  const body = JSON.stringify({
    songs,
    unlocked,
    total: songs.length,
    hidden_count: songs.filter((s) => s.hidden).length,
  });

  // Die Gästeauswahl wechselt pro Aufruf. Ein ETag würde die drei sichtbaren
  // Songs über 304-Antworten einfrieren, deshalb gibt es hier bewusst keinen.
  if (mode === 'guest') {
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, no-store',
      },
    });
  }

  const etag = `W/"${createHash('sha1').update(body).digest('hex').slice(0, 16)}"`;

  if (req.headers.get('if-none-match') === etag) {
    return new NextResponse(null, {
      status: 304,
      headers: {
        ETag: etag,
        'Cache-Control': 'private, no-store',
      },
    });
  }

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag,
      'Cache-Control': 'private, no-store',
    },
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const fp = getFingerprint(req, params.slug);
  const body = await req.json();

  const { title, artist, deezerId, albumArt } = body as {
    title: string;
    artist: string;
    deezerId?: string;
    albumArt?: string;
  };

  if (!title?.trim() || !artist?.trim()) {
    return NextResponse.json({ error: 'title and artist required' }, { status: 400 });
  }
  if (title.trim().length > 200 || artist.trim().length > 200) {
    return NextResponse.json({ error: 'title/artist too long' }, { status: 400 });
  }

  if (containsProfanity(title) || containsProfanity(artist)) {
    return NextResponse.json({ error: 'Bitte keine anstößigen Inhalte.' }, { status: 422 });
  }

  const { rows: eventRows } = await sql`
    SELECT id, dj_id, credit_redeemed FROM events WHERE slug = ${params.slug}
  `;
  if (eventRows.length === 0) {
    return NextResponse.json({ error: 'event not found' }, { status: 404 });
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
        return NextResponse.json(
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
      return NextResponse.json({ duplicate: true, songId }, { status: 200 });
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
      return NextResponse.json({ duplicate: true, songId }, { status: 200 });
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
    return NextResponse.json(
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

  return NextResponse.json({ songId }, { status: 201 });
}
