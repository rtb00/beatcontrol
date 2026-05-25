import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import './globals.css';
import { getCurrentTenant } from '@/app/lib/tenant';
import { BrandingProvider } from '@/app/lib/branding-context';

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
    <html lang="de" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream text-ink antialiased font-sans">
        <BrandingProvider value={tenant}>{children}</BrandingProvider>
      </body>
    </html>
  );
}
