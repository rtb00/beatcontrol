import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['de', 'en'],
  defaultLocale: 'de',
  // Legal pages (Impressum, AGB, Datenschutz) bleiben DE-only — siehe migrationsplan
  localePrefix: 'as-needed',
});

export type Locale = (typeof routing.locales)[number];
