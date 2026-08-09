import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { auth } from '@/auth';
import { SessionProvider } from 'next-auth/react';

// Private Seite des Brautpaars: nie in Suchmaschinen, nie in der Sitemap.
export const metadata: Metadata = {
  title: 'Eure Feier | BeatControl',
  description: 'Die Musikwünsche eurer Gäste auf einen Blick.',
  robots: { index: false, follow: false },
};

export default async function FeierLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
