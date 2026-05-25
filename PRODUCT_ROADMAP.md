# Product Roadmap

> Live-Steuerungs-Dokument. Jede Iteration aktualisiert diesen File.
> Owner-Marker: 🤖 KI autonom, 👤 Robin entscheidet/liefert, 🤝 gemeinsam

## Nordstern

Live-Wunschlisten-Plattform für Events (Hochzeiten primär, Geburtstage/Firmenfeste sekundär).
Skalierbar (DACH zuerst, dann EN-Markets), Whitelabel-fähig (Reseller wie DJ-Akademien).
Positionierung: "Versicherung gegen Party-Flop" — emotionale Outcomes, nicht Feature-Listen.

## Pricing-Modell (final)

| Tier | Preis | Zielgruppe | Kern-Berechtigung |
|---|---|---|---|
| Free | €0 | Test/erste Hochzeit | 1 Event, 30 Songs, kein Branding |
| Event-Pass | €34,99 einmalig | Brautpaar oder Single-Event-DJ | 1 Event, unbegrenzt Songs, Branding, Export |
| Pro | €59,99/Mo (jährl. günstiger) | Aktiver Hochzeits-DJ | Unbegrenzt Events, Branding, Export |
| **Studio** | €149/Mo | DJ-Akademien, Eventagenturen, Reseller | Pro + Sub-Accounts + Custom-Domain |

## ICP / Käufer-Logik

- **Brautpaar** = Top-of-Funnel, entdeckt via Insta/Hochzeitsplaner → "Versicherung gegen Party-Flop"
- **DJ** = primärer Zahler (Pro-Abo), wird vom Brautpaar oder via Mike-Hoffmann-Channel adressiert
- **Studio-Kunde** = Akademie/Agentur, kauft Mass-Lizenz für seine Sub-DJs

## Strategische Wetten

| # | Wette | Zeitfenster | Status |
|---|---|---|---|
| A | Mike Hoffmann als Channel-Partner (516 DJ-Schüler) | nach Phase 0 (Juli/Aug 26) | 👤 Pitch erst nach 3 Reference-Cases |
| B | Marielle (Miss Ella) — bestehende Beziehung, GC+DACH | sofort | 👤 warm-Outreach Robin |
| C | Annika (Happily) — GC-Lead, mehrsprachig | sofort | 👤 warm-Outreach Robin |
| D | Insta-Funnel "Versicherung gegen Party-Flop" | Q3 2026 → Saison 27 | 🤝 Content via Phase-0-Aftermovies |

## Phasenplan

### Phase 0 — Reference-Generation (Mai–Juli 2026)
**Ziel:** 3 echte Live-Hochzeiten mit Aftermovie + Brautpaar-Quote im Kasten.
Ohne diese: kein Mike-Pitch, keine Insta-Glaubwürdigkeit.

- [x] 1× Reference (Platen, Daniel Lemke) — 64 Songs Live-Engagement nachgewiesen
- [ ] 2× weitere echte Live-Hochzeiten zwischen jetzt und Ende Juli — 👤 Robin akquiriert
- [ ] Pro-Lifetime-Tausch gegen Aftermovie-Rechte standardisieren

### Phase 1 — Produkt-Härtung (parallel zu Phase 0)
- [ ] **i18n EN+DE** (next-intl) — 🤖 als nächste Code-Iteration
- [ ] **Whitelabel-Routing** (Subdomain `djname.tanzfunke.app`) — 🤖
- [ ] **DSGVO-Härtung** (IP-Anonymisierung via SHA-256 + Event-Salt) — 🤖
- [ ] **Polling → SSE/WebSocket** — 🤖 KRITISCH vor Mike-Pitch
- [ ] **Offline-Mode + 4G-Fallback** für DJ-iPad — 🤖 (relevant für GC-Locations)
- [ ] **Stripe-Price-IDs** für 34,99/59,99/149 anlegen — 👤 Robin macht Stripe-Setup, 🤖 verkabelt
- [x] Studio-Tier in plans.ts vorbereitet
- [ ] Pricing-Page-Refactor (neue Preise + 4 Tiers, DE+EN) — 🤖 nach Brand-Entscheidung

### Phase 2 — Channel + Brand Launch (Juli–Sep 2026)
- [ ] Brand-Decision + Domain-Lock — 👤 Robin entscheidet aus KI-Top-5
- [ ] Mike-Hoffmann-Channel-Pitch (3-Optionen-Deal-Sheet) — 🤖 Draft, 👤 versendet
- [ ] Marielle Reciprocal-Deal (Tanzfunke ↔ Dirndl-Plattform) — 👤
- [ ] Annika Affiliate-Setup — 👤
- [ ] Insta-Account-Launch mit 3 Phase-0-Aftermovies — 🤝

### Phase 3 — Hochzeitsplaner-Skalierung (Sep 2026 – Q1 2027)
- [ ] Top-10 DACH-Planer Affiliate-Onboarding — 👤
- [ ] Top-3 GC-Planer Affiliate-Onboarding (Inselboda, Talento, CB) — 👤
- [ ] Saison-2027-Anbahnung über Planer-Pipeline

### Phase 4 — Studio-Tier Reseller (Q2 2027 ff.)
- [ ] Stripe Connect für Studio-Mandanten
- [ ] Studio-Admin-Dashboard (Sub-DJs verwalten)
- [ ] Custom-Domain-Onboarding-Flow

## Architektur-Entscheidungen (geltend)

- **Framework:** Next.js 14 App Router, bleibt
- **DB:** Neon Postgres via `@vercel/postgres`, bleibt
- **Auth:** next-auth v5 beta + @auth/pg-adapter, bleibt
- **i18n:** `next-intl` (default-Locale `de`, secondary `en`); rechtliche Pages bleiben DE-only
- **Whitelabel:** Subdomain-Routing per `middleware.ts`, tenant aus `branding_*`-Feldern in users-Tabelle; Custom-Domain Phase 4
- **Realtime:** Migration von Polling → Server-Sent-Events (Vercel-native, keine Extra-Infra)
- **DSGVO:** IP wird gehasht (SHA-256 + Event-Salt aus ENV-Pepper) bevor sie in `submitter_ip`/`voter_ip` landet; Spalten umbenennen zu `submitter_hash`/`voter_hash` in Migration
- **Currency:** EUR primär, GBP/USD opt-in via Stripe später
- **Analytics:** vorhandene `analytics`-Tabelle bleibt, ergänzt um `locale` + `tenant_id` Spalten

## KPI-Dashboard (Sonntag-Sync)

3 Zahlen, sichtbar auf Robins Pinnwand:

1. **Aktive Pilot-DJs** (Phase 0) — Ziel KW 25: ≥3
2. **Live-Events durchgeführt** — Ziel Ende August: ≥10
3. **Zahlende Customer** — Ziel Ende August: ≥1, Ende September: ≥5

## Eskalations-Schwellen

| 🤖 KI entscheidet | 👤 Robin entscheidet |
|---|---|
| Architektur, Libraries, Code-Refactor | Brand, Naming, Positionierung |
| Pricing-Page-Layout, Copy | Pricing-Zahlen, Tier-Schnitte |
| Outreach-Drafts vorbereiten | Externe Kommunikation versenden |
| Domain-Registration, SaaS-Tools <€100 | Geldausgaben >€100 |
| Bug-Fixes, Performance, Security | Vision-Pivots (DACH→global, B2C→B2B) |

## Offene CEO-Decisions

1. **Brand-Name** — wartet auf internationalen Subagent-Output
2. **Domain-Registrar** — INWX / Hetzner / Namecheap / Vercel?
3. **Phase-0-Pilot-DJs #2 und #3** — wer wird angefragt?
