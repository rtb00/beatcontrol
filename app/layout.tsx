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

  const title = isWhiteLabel
    ? `${brandName} — Live Musikwünsche für eure Hochzeit`
    : 'BeatControl — Live Musikwünsche für eure Hochzeit';
  const description = isWhiteLabel
    ? `Eure Gäste schlagen Songs vor, ${brandName} sieht sie live. Die Versicherung gegen Party-Flop.`
    : 'Eure Gäste schlagen Songs vor, der DJ sieht sie live. Die Versicherung gegen Party-Flop.';

  return {
    title,
    description,
    applicationName: brandName,
    authors: [{ name: brandName }],
    openGraph: {
      title,
      description,
      siteName: brandName,
      type: 'website',
    },
    icons: tenant.brandingLogoUrl ? { icon: tenant.brandingLogoUrl } : undefined,
  };
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover' as const,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getCurrentTenant();

  return (
    <html lang="de" className={`${playfair.variable} ${inter.variable} ${baloo.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-cream text-ink antialiased font-sans">
        <BrandingProvider value={tenant}>{children}</BrandingProvider>
      </body>
    </html>
  );
}
