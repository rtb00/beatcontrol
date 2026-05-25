import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { getFingerprint } from '@/app/lib/fingerprint';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const fp = getFingerprint(req, params.slug);
  const { songId } = await req.json();

  if (!songId) {
    return NextResponse.json({ error: 'songId required' }, { status: 400 });
  }

  const { rows } = await sql`
    SELECT s.submitter_ip, s.played
    FROM songs s
    JOIN events e ON e.id = s.event_id
    WHERE s.id = ${songId}
      AND e.slug = ${params.slug}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const song = rows[0];

  if (song.submitter_ip !== fp) {
    return NextResponse.json({ error: 'not your song' }, { status: 403 });
  }

  if (song.played) {
    return NextResponse.json({ error: 'song already played' }, { status: 403 });
  }

  await sql`DELETE FROM songs WHERE id = ${songId}`;

  return NextResponse.json({ ok: true });
}
