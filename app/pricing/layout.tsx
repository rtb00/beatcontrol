import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Preise: Free, Je Hochzeit, Pro & Team | BeatControl',
  description:
    'BeatControl-Tarife für Hochzeits-DJs im Vergleich: Free zum Ausprobieren, Je Hochzeit für 19 € einmalig, Pro-Abo für aktive DJs, Team für DJ-Kollektive. 30 Tage Geld-zurück auf Pro.',
  alternates: { canonical: '/pricing' },
  openGraph: {
    title: 'Preise: Free, Je Hochzeit, Pro & Team | BeatControl',
    description:
      'Alle BeatControl-Tarife im Vergleich: Free, Je Hochzeit (19 € einmalig), Pro und Team für DJ-Kollektive.',
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
    'Musikwunsch- und Live-Voting-Tool für Hochzeits-DJs: Gäste wünschen Songs per QR-Code, der DJ sieht live sortiert nach Stimmen, was als Nächstes zieht.',
  brand: { '@type': 'Brand', name: 'BeatControl' },
  offers: [
    {
      '@type': 'Offer',
      name: 'Free',
      price: '0',
      priceCurrency: 'EUR',
      description: '1 aktives Event, bis zu 30 Songwünsche, QR-Code für Gäste. Für immer kostenlos.',
    },
    {
      '@type': 'Offer',
      name: 'Je Hochzeit',
      price: '19',
      priceCurrency: 'EUR',
      description: 'Einmalig je Hochzeit, unbegrenzte Songwünsche, eigenes Branding, kein Abo.',
    },
    {
      '@type': 'Offer',
      name: 'Pro',
      price: '49.99',
      priceCurrency: 'EUR',
      description:
        'Monatsabo für aktive DJs (jährliche Abrechnung, monatlich 59,99 €): unbegrenzte Events und Songwünsche, eigenes Branding mit Namen und Logo. 30 Tage Geld-zurück-Garantie.',
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
