import { NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';

// Öffentliche, aggregierte Kennzahlen für den Social-Proof-Block auf der Landing.
// Nur Counts — niemals Personen-/Event-Daten. Gecacht (s-maxage), damit die DB
// nicht bei jedem Seitenaufruf getroffen wird. Bei Fehler: alles 0 (Block blendet sich aus).

export const dynamic = 'force-dynamic';

// Durchschnittliche Songlänge zur ehrlichen Schätzung der "Tanzflächen-Minuten".
const AVG_SONG_MINUTES = 3.5;

// Dev-Demo: lokal befüllte Proof-Cards, ohne die (geteilte) Prod-DB mit Fake-Daten zu verschmutzen.
// In Produktion greift dieser Block NIE — dort kommen ausschließlich echte DB-Counts.
const DEMO_STATS = { djs: 14, events: 23, songRequests: 1847, votes: 5210, playedSongs: 1217, minutes: 4260 };

export async function GET() {
  if (process.env.NODE_ENV !== 'production') {
    return NextResponse.json(DEMO_STATS, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  try {
    await initDB();
    // Nur echte, fremde Nutzung zählt. Ohne diese Einschränkung standen eigene
    // Testkonten, Seed-Daten und der Demo-Gig als Social Proof auf der
    // Startseite — also erfundene Zahlen mit echtem Anstrich.
    const { rows } = await sql`
      WITH echte_djs AS (
        SELECT id FROM users
        WHERE email IS NOT NULL
          AND email NOT LIKE '%@example.com'
          AND email NOT LIKE '%bc-seed.local'
          AND email NOT LIKE 'demo+%'
          AND email NOT LIKE 'e2e.%'
          AND email NOT LIKE '%nibor.bauer1%'
          AND email NOT LIKE '%henselundkretel%'
          AND email NOT LIKE '%robin.test%'
      ),
      echte_events AS (
        SELECT e.id FROM events e JOIN echte_djs d ON d.id = e.dj_id
      )
      SELECT
        (SELECT COUNT(*) FROM echte_djs)                                        AS djs,
        (SELECT COUNT(*) FROM echte_events)                                     AS events,
        (SELECT COUNT(*) FROM songs WHERE event_id IN (SELECT id FROM echte_events))  AS song_requests,
        (SELECT COUNT(*) FROM votes v JOIN songs s ON s.id = v.song_id
          WHERE s.event_id IN (SELECT id FROM echte_events))                    AS votes,
        (SELECT COUNT(*) FROM songs WHERE played AND event_id IN (SELECT id FROM echte_events)) AS played_songs
    `;
    const r = rows[0] ?? {};
    const num = (v: unknown) => Number(v ?? 0) || 0;

    const playedSongs = num(r.played_songs);
    const stats = {
      djs: num(r.djs),
      events: num(r.events),
      songRequests: num(r.song_requests),
      votes: num(r.votes),
      playedSongs,
      minutes: Math.round(playedSongs * AVG_SONG_MINUTES),
    };

    return NextResponse.json(stats, {
      status: 200,
      // 5 Min frisch, danach bis zu 10 Min stale-while-revalidate ausliefern.
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json(
      { djs: 0, events: 0, songRequests: 0, votes: 0, playedSongs: 0, minutes: 0 },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
