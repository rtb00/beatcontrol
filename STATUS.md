# BeatControl — Projektstatus

> Single Source of Truth. Eine Datei für den Gesamtblick.
> Stand: 16. Mai 2026. Bei Änderungen aktualisieren.

## 🎯 Nordstern

Live-Wunschlisten-Plattform für Hochzeiten (primär DACH), skalierbar zu Geburtstagen/Firmenfesten, Whitelabel-fähig für DJ-Akademien.
**Positionierung:** "Versicherung gegen Party-Flop" — emotional, outcome-orientiert, nicht feature-list.

## 📊 KPI-Snapshot

| Kennzahl | Aktuell | Ziel Sept 2026 |
|---|---|---|
| Zahlende Customer | 0 | 5 |
| Aktive Pilot-DJs | 1 (Daniel) | 3 |
| Live-Events durchgeführt | 1 (Platen) | 10 |
| Insta-Reichweite | 0 | 500 Follower |
| MRR | €0 | ~€300 |

## 🏗️ Was steht

### Produkt
- [x] **Brand:** BeatControl (entschieden 16.05., .com/.app frei, registrierung pending)
- [x] **Tech-Stack:** Next.js 14, Vercel, Neon Postgres, NextAuth, Stripe verkabelt
- [x] **Pricing:** 4 Tiers (Free / Event-Pass €34,99 / Pro €59,99 / Studio €149)
- [x] **DSGVO:** SHA-256 Event-Salt Hash für IP-Anonymisierung, Datenschutz aktualisiert
- [x] **i18n Foundation:** next-intl installiert, messages/de+en.json mit allen Strings
- [x] **Whitelabel:** Subdomain-Storage, Validation, Routing, Tab-Title-Branding, Navbar-Logo
- [x] **Polling-Hardening:** ETag/304 + Backoff + Visibility-Pause → ~70% weniger DB-Last
- [x] **SEO:** robots.ts, sitemap.ts, Custom 404, Branded OG-Image, ♪ Favicon
- [x] **UX-Polish:** Checkout-Success-Banner, Pilot-Saison-Honesty auf Landing+Pricing
- [ ] **i18n Pages-Migration** ({locale}-Routing für EN-Markt) — Phase 4

### Outreach-Material
- [x] 5 Outreach-Drafts (Marielle, Annika, Daniel, Pilot-DJ-Reichweiten-Post, Mike Hoffmann)
- [x] Vibo-vs-BeatControl Argumentations-Brief
- [x] Reference-Card-Template für Phase-0-Aftermovies
- [x] PRE_LAUNCH_CHECKLIST.md mit Aufwandsschätzungen
- [x] Mike-Demo-Call-Skript (siehe `outreach/08-mike-demo-call-skript.md`)

### Strategie
- [x] ICP-Klärung: DJ zahlt, Brautpaar entdeckt (Product-led-Growth-Funnel)
- [x] Markt-Analyse DACH: ~150–180k DJ-Hochzeiten/Jahr DE, Wettbewerb Vibo (zu teuer/US-zentriert)
- [x] Markt-Analyse Gran Canaria: ~600–900 Destination-Weddings/Jahr, antizyklisch
- [x] Kanal-Wette: DJ-Direct-Outreach (Saison 2026) + Hochzeitsplaner-Pipeline (Saison 2027)
- [x] Mike-Hoffmann-Strategie: 3-Optionen-Deal-Sheet (Affiliate / Whitelabel / Founding Partner)

## 🚧 Was fehlt (blockiert auf Robin)

| # | Was | Aufwand | Block für |
|---|---|---|---|
| 1 | `vercel domains buy beatcontrol.io beatcontrol.io` | 10 Min | Alles Public |
| 2 | Vercel Project mit Domain verkabeln | 5 Min | Wie 1 |
| 3 | Production ENV-Vars setzen (BEATCONTROL_HASH_PEPPER, AUTH_SECRET, AUTH_URL) | 5 Min | Production-Sicherheit |
| 4 | Email-Adresse hallo@beatcontrol.io | 15 Min | Studio-CTAs in Pricing |
| 5 | Stripe CLI + 1Password CLI Setup | 30 Min | Checkout-Funktionalität |
| 6 | Stripe Products + Prices via CLI anlegen (mit KI-Begleitung) | 30 Min | Verkauf |
| 7 | Outreach-Versand an Marielle + Annika + Daniel | 30 Min | Phase-0-Akquise |
| 8 | Pilot-DJ-Reichweiten-Post (LinkedIn) | 20 Min | Phase-0-Akquise |
| 9 | 2 weitere echte Hochzeiten akquirieren | 6–10h verteilt | Mike-Pitch |
| 10 | Mike-Hoffmann-Pitch versenden | 30 Min nach Phase 0 | Channel-Skalierung |

**Total Robin-Zeit bis Mike-Pitch-Ready:** ~12–16h über 3 Monate. Bei 2h/Woche: machbar.

## 📁 Wo liegt was

```
/                              Root des Projekts
├── app/                       Next.js App Router
│   ├── page.tsx               Landing (Pilot-Saison-Story)
│   ├── pricing/page.tsx       4-Tier Pricing
│   ├── account/page.tsx       Konto + Branding + Subdomain
│   ├── dj/page.tsx            DJ-Dashboard
│   ├── dj/[slug]/page.tsx     Event-Detail (für DJ)
│   ├── [slug]/page.tsx        Gast-View (Vote/Suggest)
│   ├── auth/                  next-auth Pages
│   ├── api/                   API Routes
│   ├── lib/
│   │   ├── plans.ts           Plan + Limits + Tier-Logic
│   │   ├── stripe.ts          Stripe Client + Price-IDs
│   │   ├── branding.ts        Subdomain Validation + Reserved-List
│   │   ├── branding-context.tsx  React-Context-Provider
│   │   ├── tenant.ts          getCurrentTenant Server-Helper
│   │   ├── use-polling.ts     Adaptive Polling Hook
│   │   ├── fingerprint.ts     SHA-256 Hash Fingerprint
│   │   └── db.ts              DB + Migrations
│   ├── robots.ts              SEO
│   ├── sitemap.ts             SEO
│   ├── icon.tsx               Dynamic Favicon
│   ├── opengraph-image.tsx    Social-Share-Image
│   └── not-found.tsx          Custom 404
├── i18n/
│   ├── routing.ts             next-intl Routing-Config
│   └── request.ts             getRequestConfig
├── messages/
│   ├── de.json                Deutsche UI-Strings
│   └── en.json                Englische UI-Strings
├── outreach/                  Marketing-Drafts (NICHT Code)
│   ├── 01-marielle...md
│   ├── 02-annika...md
│   ├── 03-daniel...md
│   ├── 04-pilot-dj...md
│   ├── 05-mike-hoffmann...md
│   ├── 06-vibo-vergleich.md
│   ├── 07-reference-card-template.md
│   ├── 08-mike-demo-call-skript.md
│   └── README.md
├── PRE_LAUNCH_CHECKLIST.md    Was Robin tun muss
├── PRODUCT_ROADMAP.md         Phase-0–4 Roadmap
├── I18N_MIGRATION.md          EN-Markt Roadmap
└── STATUS.md                  Diese Datei
```

## 🎬 Nächste 30 Tage — Mini-Plan

**Woche 1:**
- Robin: Domain + Stripe-CLI Setup (1h)
- Robin: Outreach an Daniel + Marielle (15 Min)
- KI: Stripe-Products via CLI anlegen, sobald Robin authentifiziert (30 Min)

**Woche 2:**
- Robin: Pilot-DJ-Reichweiten-Post + Annika-Email
- Erste Pilot-DJ-Antworten kommen rein
- Daniel beginnt Sommer-Hochzeiten

**Woche 3–4:**
- Erste 1–2 Pilot-DJs committed
- Erste echte Hochzeit Mai/Juni mit neuem Pilot-DJ
- Reference-Card #2 ausgefüllt

**Ende 30 Tage:**
- 2 von 3 Phase-0-Hochzeiten gelaufen
- Mike-Pitch-Vorbereitung beginnt im August

## 📞 Bei Fragen / Unklarheiten

BeatControl hat folgende lebende Doks:
- **STATUS.md** (diese Datei) — Gesamtblick
- **PRE_LAUNCH_CHECKLIST.md** — Robins ToDo-Liste
- **PRODUCT_ROADMAP.md** — Phase 0–4 Roadmap
- **I18N_MIGRATION.md** — Internationalisierungs-Plan
- **outreach/README.md** — Outreach-Versende-Reihenfolge
