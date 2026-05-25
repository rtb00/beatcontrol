import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initDB();

  const { songId } = await req.json();
  if (!songId) {
    return NextResponse.json({ error: 'songId required' }, { status: 400 });
  }

  await sql`
    UPDATE songs
    SET played = NOT played
    WHERE id = ${songId}
      AND event_id = (
        SELECT id FROM events
        WHERE slug = ${params.slug}
          AND dj_id = ${session.user.id}
      )
  `;

  return NextResponse.json({ ok: true });
}
