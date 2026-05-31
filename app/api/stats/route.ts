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
    const { rows } = await sql`
      SELECT
        (SELECT COUNT(*) FROM users)               AS djs,
        (SELECT COUNT(*) FROM events)              AS events,
        (SELECT COUNT(*) FROM songs)               AS song_requests,
        (SELECT COUNT(*) FROM votes)               AS votes,
        (SELECT COUNT(*) FROM songs WHERE played)  AS played_songs
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
