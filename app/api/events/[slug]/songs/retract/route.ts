import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { getFingerprint } from '@/app/lib/fingerprint';
import { readOrCreateGuestId, attachGuestCookie } from '@/app/lib/guest-id';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { id: guestId, isNew: guestIdIsNew } = readOrCreateGuestId(req);
  const fp = getFingerprint(guestId, params.slug);
  const { songId } = await req.json();

  if (!songId) {
    const res = NextResponse.json({ error: 'songId required' }, { status: 400 });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  const { rows } = await sql`
    SELECT s.submitter_ip, s.played
    FROM songs s
    JOIN events e ON e.id = s.event_id
    WHERE s.id = ${songId}
      AND e.slug = ${params.slug}
  `;

  if (rows.length === 0) {
    const res = NextResponse.json({ error: 'not found' }, { status: 404 });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  const song = rows[0];

  if (song.submitter_ip !== fp) {
    const res = NextResponse.json({ error: 'not your song' }, { status: 403 });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  if (song.played) {
    const res = NextResponse.json({ error: 'song already played' }, { status: 403 });
    return attachGuestCookie(res, guestId, guestIdIsNew);
  }

  await sql`DELETE FROM songs WHERE id = ${songId}`;

  const res = NextResponse.json({ ok: true });
  return attachGuestCookie(res, guestId, guestIdIsNew);
}
