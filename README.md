# BeatControl

> Live-Musikwunschliste für Hochzeiten und Events. Gäste scannen QR-Code, schlagen Songs vor, voten gemeinsam. DJ sieht alles live auf dem iPad.
>
> **Positionierung:** Versicherung gegen Party-Flop.

## Status

- Pilot-Saison 2026, neu im Markt
- 1 echte Reference-Hochzeit (Schloss Platen, April 2026, 64 Live-Songs)
- 4 Tiers: Free / Event-Pass €34,99 / Pro €59,99/Mo / Studio €149/Mo
- Whitelabel-fähig (Studio-Tier mit eigener Subdomain + Branding)
- DSGVO-konform (EU-Hosting, anonymisierte Gast-Daten via SHA-256-Hash)

## Lebende Dokumente

| Datei | Zweck |
|---|---|
| [STATUS.md](./STATUS.md) | Single Source of Truth — Gesamtblick |
| [PRE_LAUNCH_CHECKLIST.md](./PRE_LAUNCH_CHECKLIST.md) | Was Robin tun muss bis Launch |
| [PRODUCT_ROADMAP.md](./PRODUCT_ROADMAP.md) | Phase 0–4 Roadmap |
| [I18N_MIGRATION.md](./I18N_MIGRATION.md) | EN-Markt Roadmap |
| [outreach/README.md](./outreach/README.md) | Outreach-Versende-Reihenfolge |

## Pages

| Route | Persona | Zweck |
|---|---|---|
| `/` | Beide | Marketing-Landing, DJ-zentriert mit Brautpaar-Brücke |
| `/brautpaar` | Brautpaar | B2C-Funnel mit Event-Pass-CTA |
| `/about` | Trust-skeptisch | Founder-Story, Anti-Positionierung |
| `/pricing` | Alle | 4 Tiers, Stripe-Checkout |
| `/dj` | DJ | Dashboard, Event-Verwaltung |
| `/dj/[slug]` | DJ | Live-Ansicht eines Events |
| `/[slug]` | Gast | Song-Vorschlag + Voting |
| `/account` | DJ | Profil, Branding, Studio-Subdomain |
| `/auth/signin` `/auth/register` | Alle | next-auth Flow |
| `/impressum` `/datenschutz` `/agb` | Alle | Legal (DE-only) |

## Setup

### 1. Dependencies

```bash
npm install
```

### 2. Environment

```bash
cp .env.example .env.local
# Postgres-URL via Vercel-CLI ziehen:
vercel env pull .env.local
# Plus AUTH_SECRET + BEATCONTROL_HASH_PEPPER generieren:
echo "AUTH_SECRET=\"$(openssl rand -base64 32)\"" >> .env.local
echo "BEATCONTROL_HASH_PEPPER=\"$(openssl rand -hex 32)\"" >> .env.local
```

### 3. Dev-Server

```bash
npm run dev    # → http://localhost:3000
```

### 4. Health-Check

```bash
node scripts/check-deployment.mjs           # lokal
node scripts/check-deployment.mjs --prod    # gegen https://beatcontrol.io
```

## Tech Stack

- **Next.js 14** App Router + TypeScript
- **Neon Postgres** via `@vercel/postgres`
- **next-auth v5** + `@auth/pg-adapter`
- **Stripe** für Pricing (Event-Pass + Pro + Studio Abos)
- **next-intl** für i18n-Foundation (DE + EN ready, Pages-Migration pending)
- **Tailwind CSS** + Playfair Display / Inter
- **Polling-Hardening:** ETag/304 + Visibility-Pause + Exponential-Backoff
- **Whitelabel:** Subdomain-Routing via Server-Component-Helper + React-Context

## Regeln

- Max. **3 unbespielte Vorschläge** pro Gast-Fingerprint pro Event
- **1 Stimme** pro Song pro Gast-Fingerprint
- Wer einen Song vorschlägt, gibt automatisch die erste Stimme ab
- Doppelte Songs (gleicher Deezer-Track ODER gleicher Titel+Künstler) werden zusammengeführt
- Profanitätsfilter (Deutsch + Englisch) aktiv
- Fingerprint = SHA-256(IP + clientId + eventSlug + serverPepper) — nicht reversible

## Scripts

| Script | Zweck |
|---|---|
| `scripts/setup-stripe-products.sh` | Legt Stripe Products + Prices an + speichert in 1Password |
| `scripts/seed-demo-tenant.mjs` | Seedet Demo-Tenant mit Beispiel-Hochzeit + 20 Songs (für Mike-Demo) |
| `scripts/check-deployment.mjs` | Health-Check ENV/DB/HTTP/Brand |
| `scripts/backfill-dj-id.mjs` | Legacy-Migration |
| `scripts/backfill-genre.mjs` | Legacy AI-Genre-Backfill |

## Production-Deployment

1. Domain `beatcontrol.io` + `*.beatcontrol.io` in Vercel
2. ENV-Vars in Vercel-Dashboard setzen (siehe `scripts/check-deployment.mjs` Recommended-Liste)
3. Stripe Products via `scripts/setup-stripe-products.sh`
4. Auto-Deploy bei Push auf `main`

## Kontakt

- Email: hallo@beatcontrol.io
- Founder: Robin Bauer
- Impressum: [/impressum](https://beatcontrol.io/impressum)
