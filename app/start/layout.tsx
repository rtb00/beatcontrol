import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Der Funnel ist ein Conversion-Schritt, keine Inhaltsseite — für Suchmaschinen
// uninteressant und als eigenständiges Suchergebnis eher verwirrend.
export const metadata: Metadata = {
  title: 'Event anlegen | BeatControl',
  description: 'Richte dein Event in einer Minute ein: QR-Code, Live-Voting und dein DJ-Screen.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/start' },
};

export default function StartLayout({ children }: { children: ReactNode }) {
  return children;
}
