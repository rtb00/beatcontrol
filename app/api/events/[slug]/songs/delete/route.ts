import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { songId } = await req.json();
  if (!songId) {
    return NextResponse.json({ error: 'songId required' }, { status: 400 });
  }

  await sql`
    DELETE FROM songs
    WHERE id = ${songId}
      AND event_id = (SELECT id FROM events WHERE slug = ${params.slug})
  `;

  return NextResponse.json({ ok: true });
}
