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

  await sql`
    DELETE FROM votes
    WHERE song_id = ${songId}
      AND voter_ip = ${fp}
  `;

  const res = NextResponse.json({ ok: true });
  return attachGuestCookie(res, guestId, guestIdIsNew);
}
