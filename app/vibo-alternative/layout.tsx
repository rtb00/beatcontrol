import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Vibo-Alternative: Der ehrliche Vergleich | BeatControl',
  description:
    'Vibo-Alternative aus Deutschland: BeatControl bringt Live-Voting der Gäste an dein Pult, statt nur Playlists vorzubereiten. Deutsche AGB, EU-Hosting, ab 0 € statt 165 €/Monat. Der faire Vergleich Punkt für Punkt.',
  alternates: { canonical: '/vibo-alternative' },
  openGraph: {
    title: 'Vibo-Alternative: Der ehrliche Vergleich | BeatControl',
    description:
      'Vibo-Alternative aus Deutschland: Live-Voting statt nur Playlist-Vorbereitung. Deutsche AGB, EU-Hosting, ab 0 €.',
    url: 'https://beatcontrol.io/vibo-alternative',
  },
};

export default function ViboAlternativeLayout({ children }: { children: ReactNode }) {
  return children;
}
