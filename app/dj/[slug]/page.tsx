import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { initDB, sql } from '@/app/lib/db';
import DJEventClient from './DJEventClient';

// Server-Guard für den Live-Screen. Zwei Wege hinein:
// 1) Eingeloggter Owner (klassisch).
// 2) DJ-Link mit gültigem Token (?dj=…) — das Brautpaar teilt den Screen mit
//    seinem DJ, ohne Zugangsdaten weiterzugeben. Layouts können keine
//    searchParams lesen, deshalb sitzt der Guard hier statt im Layout.
export default async function DJEventPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { dj?: string };
}) {
  await initDB();

  const token = typeof searchParams.dj === 'string' ? searchParams.dj : '';
  if (token) {
    const { rows } = await sql`
      SELECT 1 FROM events
      WHERE slug = ${params.slug} AND dj_token = ${token}
      LIMIT 1
    `;
    if (rows.length > 0) {
      return <DJEventClient />;
    }
    redirect('/auth/signin');
  }

  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const { rows } = await sql`
    SELECT 1 FROM events
    WHERE slug = ${params.slug} AND dj_id = ${session.user.id}
    LIMIT 1
  `;
  if (rows.length === 0) {
    redirect('/dj');
  }

  return <DJEventClient />;
}
