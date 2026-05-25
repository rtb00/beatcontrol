# i18n Migration Plan

Foundation gelegt — Pages müssen schrittweise umgestellt werden.

## Status: Foundation ✅

- [x] `next-intl@4.12` installiert
- [x] `i18n/routing.ts` mit `de` + `en` Locales, default `de`
- [x] `i18n/request.ts` als getRequestConfig
- [x] `messages/de.json` mit allen UI-Strings (Brand, Landing, Guest, DJ, Pricing, Auth, Account)
- [x] `messages/en.json` mit Übersetzungen
- [x] `next.config.js` wrapped mit createNextIntlPlugin

## Status: Pages-Migration ⏳ pending

Folgendes muss noch passieren (große Refactor, in eigener Iteration):

### Schritt 1: Routing-Restructure
- `app/page.tsx` → `app/[locale]/page.tsx`
- `app/pricing/page.tsx` → `app/[locale]/pricing/page.tsx`
- `app/dj/page.tsx` → `app/[locale]/dj/page.tsx`
- `app/account/page.tsx` → `app/[locale]/account/page.tsx`
- `app/[slug]/page.tsx` → `app/[locale]/[slug]/page.tsx` (Gast-View)
- `app/auth/*` → `app/[locale]/auth/*`

**API-Routes bleiben:** `app/api/...` — keine Locale-Präfix-Logik dort.

**Rechtliche Pages bleiben DE-only:** Impressum, AGB, Datenschutz NICHT in `[locale]` verschieben — die deutsche Fassung ist rechtlich verbindlich, EN-Übersetzung wäre rechtsunsicher.

### Schritt 2: Middleware-Integration
`middleware.ts` muss mit `next-intl`'s `createMiddleware` und `next-auth`'s Auth-Middleware verbunden werden. Pattern: nested middleware (intl outer, auth inner).

### Schritt 3: useTranslations in Components
Alle Hardcoded-DE-Strings in Pages durch `useTranslations()` / `getTranslations()` ersetzen:

```tsx
// Vorher
<h1>Was wollt ihr hören?</h1>

// Nachher
const t = useTranslations('guest');
<h1>{t('title')}</h1>
```

### Schritt 4: Language Switcher
- UI-Component für Locale-Wahl im Header
- `useRouter()` aus `next-intl/navigation`
- Cookie-Persistierung

### Schritt 5: SEO
- `<link rel="alternate" hreflang="...">` Tags in jeder Page
- Locale-spezifische OG-Tags
- `sitemap.xml` mit Locale-Varianten

### Schritt 6: Accept-Language Detection
- Automatische Locale-Erkennung auf erstem Visit
- Cookie-Setzung nach Auswahl

## Weitere Locales (Roadmap)

| Locale | Wann | Begründung |
|---|---|---|
| `es` (Spanisch) | Phase 4 (2027) | Gran Canaria B2B-Whitelabel, falls Pilot mit Annika/Marielle erfolgreich |
| `fr` (Französisch) | tbd | Hochzeitsmarkt Frankreich ist groß, aber kompetitiv. Nur wenn Inbound-Demand. |

## Code-Beispiel: Erste Page-Migration

`app/[locale]/page.tsx`:

```tsx
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

export default function LandingPage({ params: { locale } }) {
  setRequestLocale(locale);
  const t = useTranslations('landing');
  
  return (
    <main>
      <h1>{t('headline')}</h1>
      <p>{t('subheadline')}</p>
      <button>{t('ctaPrimary')}</button>
    </main>
  );
}

export function generateStaticParams() {
  return [{ locale: 'de' }, { locale: 'en' }];
}
```
