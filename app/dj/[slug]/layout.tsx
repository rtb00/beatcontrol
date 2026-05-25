import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { initDB, sql } from '@/app/lib/db';

export default async function DJEventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  await initDB();
  const { rows } = await sql`
    SELECT 1 FROM events
    WHERE slug = ${params.slug}
      AND dj_id = ${session.user.id}
    LIMIT 1
  `;
  if (rows.length === 0) {
    redirect('/dj');
  }

  return <>{children}</>;
}
