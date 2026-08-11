import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Preise: Free, Je Event, Pro & Team | BeatControl',
  description:
    'BeatControl-Tarife für Hochzeits-DJs im Vergleich: Free zum Ausprobieren, Je Event für 19 € einmalig, Pro-Abo für aktive DJs, Team für DJ-Kollektive. 30 Tage Geld-zurück auf Pro.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Preise: Free, Je Event, Pro & Team | BeatControl',
    description:
      'Alle BeatControl-Tarife im Vergleich: Free, Je Event (19 € einmalig), Pro und Team für DJ-Kollektive.',
    url: 'https://beatcontrol.io/pricing',
  },
};

// Product-/Offer-Daten für Google Rich Results und KI-Suchsysteme. Preise
// müssen mit den Konstanten in page.tsx übereinstimmen.
const PRICING_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'BeatControl',
  description:
    'Musikwunsch- und Live-Voting-Tool für Hochzeits-DJs: Gäste wünschen Songs per QR-Code, der DJ sieht live sortiert nach Stimmen, was die Gäste hören wollen.',
  brand: { '@type': 'Brand', name: 'BeatControl' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      description: '1 aktives Event, unbegrenzte Songwünsche, QR-Code für Gäste. Für immer kostenlos.',
    },
    {
      '@type': 'Offer',
      name: 'Je Event',
      price: '19',
      priceCurrency: 'EUR',
      description: 'Einmalig je Event, unbegrenzte Songwünsche, eigenes Branding, kein Abo.',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '249',
      priceCurrency: 'EUR',
      description:
        'Jahres-Abo für aktive DJs (249 € pro Jahr, monatlich 29 €): unbegrenzte Events und Songwünsche, eigenes Branding mit Namen und Logo. 30 Tage Geld-zurück-Garantie.',
    },
    {
      '@type': 'Offer',
      name: 'Team',
      price: '124',
      priceCurrency: 'EUR',
      description:
        'Monatsabo für DJ-Kollektive und Eventagenturen (jährliche Abrechnung, monatlich 149 €): Sub-Accounts, eigene Subdomain, komplettes Whitelabel-Branding.',
    },
  ],
};

export default function PricingLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PRICING_JSON_LD) }}
      />
      {children}
    </>
  );
}
