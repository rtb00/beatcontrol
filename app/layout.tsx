import type { Metadata } from 'next';
import { Playfair_Display, Inter, Baloo_2, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { getCurrentTenant } from '@/app/lib/tenant';
import { BrandingProvider } from '@/app/lib/branding-context';

// Legacy "Hochzeits-Elegance" faces — kept until every page has migrated to the
// Confetti Rave design system (see migration plan, Phase 3 cleanup).
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// "Confetti Rave" design system (Version 3): bold rounded display face + mono
// for eyebrows/labels. Body stays on Inter.
const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['600', '700', '800'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['500', '600'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant();
  const isWhiteLabel = !!tenant.subdomain;
  const brandName = tenant.brandingName ?? 'BeatControl';

  // Title-Muster nach aktueller Google-Praxis: primäres Keyword vorn, Marke
  // kurz am Ende, 40-60 Zeichen (längere Titles werden zu ~76% umgeschrieben).
  const title = isWhiteLabel
    ? `${brandName} — Live Musikwünsche für eure Hochzeit`
    : 'Musikwünsche & Live-Voting für Hochzeits-DJs | BeatControl';
  const description = isWhiteLabel
    ? `Eure Gäste schlagen Songs vor, ${brandName} sieht sie live. Die Versicherung gegen Party-Flop.`
    : 'Gäste wünschen Songs per QR-Code und voten vom Handy. Der DJ sieht live, welcher Song als Nächstes zieht. Ohne App, läuft neben Rekordbox & Serato. Kostenlos starten.';

  return {
    metadataBase: new URL('https://beatcontrol.io'),
    title,
    description,
    applicationName: brandName,
    authors: [{ name: brandName }],
    alternates: isWhiteLabel ? undefined : { canonical: '/' },
    openGraph: {
      title,
      description,
      siteName: brandName,
      type: 'website',
      locale: 'de_DE',
      url: 'https://beatcontrol.io',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    icons: tenant.brandingLogoUrl ? { icon: tenant.brandingLogoUrl } : undefined,
  };
}

// Organization + WebSite + SoftwareApplication für Google Knowledge Graph und
// KI-Suchsysteme (AI Overviews, Perplexity, ChatGPT Search). Nur auf der
// Haupt-Domain, nicht auf Whitelabel-Subdomains.
const SITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://beatcontrol.io/#organization',
      name: 'BeatControl',
      url: 'https://beatcontrol.io',
      email: 'nibor.bauer1+beatcontrol@gmail.com',
      foundingDate: '2026',
      founder: { '@type': 'Person', name: 'Robin Bauer' },
      areaServed: { '@type': 'Country', name: 'Deutschland' },
    },
    {
      '@type': 'WebSite',
      '@id': 'https://beatcontrol.io/#website',
      url: 'https://beatcontrol.io',
      name: 'BeatControl',
      inLanguage: 'de-DE',
      publisher: { '@id': 'https://beatcontrol.io/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      '@id': 'https://beatcontrol.io/#app',
      name: 'BeatControl',
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Web',
      inLanguage: 'de-DE',
      description:
        'Web-App für Hochzeits-DJs: Gäste wünschen Songs per QR-Code und voten vom Handy, der DJ sieht live sortiert nach Stimmen, welcher Song als Nächstes zieht. Ohne App-Download, läuft im Browser neben Rekordbox und Serato.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '0',
        highPrice: '149',
        offerCount: 4,
      },
      publisher: { '@id': 'https://beatcontrol.io/#organization' },
    },
  ],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();
  const isWhiteLabel = !!tenant.subdomain;

  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable} ${baloo.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-cream text-ink antialiased font-sans">
        {!isWhiteLabel && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(SITE_JSON_LD) }}
          />
        )}
        <BrandingProvider value={tenant}>{children}</BrandingProvider>
      </body>
    </html>
  );
}
