import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Der Brautpaar-Funnel ist ein Conversion-Schritt, keine Inhaltsseite — für
// Suchmaschinen uninteressant und als eigenständiges Suchergebnis eher verwirrend.
export const metadata: Metadata = {
  title: 'Musikwunschliste anlegen | BeatControl',
  description: 'Legt die Musikwunschliste für eure Feier in einer Minute an: Link für eure Gäste, Abstimmen vom Handy.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/brautpaar/start' },
};

export default function BrautpaarStartLayout({ children }: { children: ReactNode }) {
  return children;
}
