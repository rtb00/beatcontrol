import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Musikwünsche für eure Hochzeit | BeatControl',
  description:
    'Eure Gäste wünschen Songs per QR-Code und voten vom Handy, euer DJ sieht live, was die Feier hören will. Einmalig 19 €, kein Abo, keine App. So bleibt die Tanzfläche voll.',
  alternates: { canonical: '/brautpaar' },
  openGraph: {
    title: 'Musikwünsche für eure Hochzeit | BeatControl',
    description:
      'Gäste wünschen Songs per QR-Code, der DJ sieht live, was die Feier hören will. Einmalig 19 €, kein Abo.',
    url: 'https://beatcontrol.io/brautpaar',
  },
};

export default function BrautpaarLayout({ children }: { children: ReactNode }) {
  return children;
}
