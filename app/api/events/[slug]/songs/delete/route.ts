import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { songId, djToken } = await req.json();
  if (!songId) {
    return NextResponse.json({ error: 'songId required' }, { status: 400 });
  }

  // Zwei Wege zur Berechtigung: eingeloggter Owner oder gültiges DJ-Token
  // (Link, den das Brautpaar seinem DJ geteilt hat).
  let authorized = false;
  if (typeof djToken === 'string' && djToken.length > 0) {
    const { rows } = await sql`
      SELECT 1 FROM events WHERE slug = ${params.slug} AND dj_token = ${djToken}
    `;
    authorized = rows.length > 0;
  }
  if (!authorized) {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { rows } = await sql`
      SELECT 1 FROM events WHERE slug = ${params.slug} AND dj_id = ${session.user.id}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  await sql`
    DELETE FROM songs
    WHERE id = ${songId}
      AND event_id = (
        SELECT id FROM events
        WHERE slug = ${params.slug}
      )
  `;

  return NextResponse.json({ ok: true });
}
