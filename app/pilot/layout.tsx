import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Pilot-Programm für Hochzeits-DJs | BeatControl',
  description:
    'Wir suchen 2 Hochzeits-DJs für die Pilot-Saison 2026: Pro-Lizenz gratis für die ganze Saison, dafür ehrliches Feedback nach der Hochzeit. Nur 2 Plätze.',
  alternates: { canonical: '/pilot' },
  openGraph: {
    title: 'Pilot-Programm für Hochzeits-DJs | BeatControl',
    description:
      'Pro-Lizenz gratis für die ganze Saison 2026, dafür ehrliches Feedback nach der Hochzeit. Nur 2 Plätze.',
    url: 'https://beatcontrol.io/pilot',
  },
};

export default function PilotLayout({ children }: { children: ReactNode }) {
  return children;
}
