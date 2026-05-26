# Pre-Launch-Checkliste — BeatControl

Status-Snapshot: Alle KI-autonomen Code-Tasks erledigt. Robin's Aktionen blockieren jetzt das Launch.

**Definition "Launch ready":** Erste Brautpaar kauft Event-Pass via beatcontrol.io und nutzt das Tool auf einer realen Hochzeit ohne dass Robin manuell eingreifen muss.

**Definition "Mike-Pitch ready":** Drei echte Reference-Hochzeiten gelaufen mit Aftermovie + Quote, Demo-Subdomain mikehoffmann.beatcontrol.io live.

---

## A. Sofort-Schritte (heute–morgen, ~30 Min)

### A1. Domain-Lock
**Owner:** Robin
**Wo:** Terminal mit `vercel` CLI
**Warum:** ohne Domain kein Brand, kein Email, kein Outreach

```bash
vercel domains buy beatcontrol.io    # ~$11
vercel domains buy beatcontrol.io    # ~$10
```

Dann `beatcontrol.io` separat (Vercel TLD-Support fehlt):
- INWX, Hetzner oder Cloudflare, ~€8/Jahr

**Geschätzte Zeit:** 10 Min
**Geschätzte Kosten:** ~$21 + €8 = ~€27 total

### A2. Vercel-Project mit Domain verkabeln
**Owner:** Robin
**Wo:** Vercel Dashboard
**Warum:** sonst zeigt beatcontrol.io nur Vercel-Default-Page

1. Vercel Dashboard → Project `beatcontrol` → Settings → Domains
2. Add Domain `beatcontrol.io` (als Primary)
3. Add Domain `*.beatcontrol.io` als Wildcard für Whitelabel-Subdomains
4. DNS auto-konfiguriert via Vercel

**Geschätzte Zeit:** 5 Min

### A3. Production-ENV-Variablen
**Owner:** Robin
**Wo:** Vercel Dashboard → Project → Settings → Environment Variables
**Warum:** ohne diese Vars läuft Production-Build nicht

```
BEATCONTROL_HASH_PEPPER=<openssl rand -hex 32>
AUTH_SECRET=<openssl rand -base64 32>
AUTH_URL=https://beatcontrol.io
NEXT_PUBLIC_URL=https://beatcontrol.io
```

Die Postgres-Variablen sind via Vercel Postgres Integration automatisch gesetzt.

**Geschätzte Zeit:** 5 Min

### A4. Email-Adresse hallo@beatcontrol.io
**Owner:** Robin
**Wo:** Google Workspace, Fastmail, oder Vercel Email
**Warum:** Pricing-Page hat mailto:hallo@beatcontrol.io als Studio-CTA — muss funktionieren

Empfehlung Google Workspace: €5,75/Mo/User, einfaches Setup mit Vercel DNS
Pragmatic-Alternative: ImprovMX (free, leitet hallo@beatcontrol.io an Robins Gmail)

**Geschätzte Zeit:** 15 Min
**Geschätzte Kosten:** €5,75/Mo (Workspace) oder gratis (ImprovMX)

---

## B. Diese Woche (3–4h)

### B1. Stripe Production-Setup
**Owner:** Robin
**Voraussetzung:** A1 + A2 + A3 müssen erledigt sein
**Warum:** ohne Stripe kein Verkauf

```bash
brew install stripe/stripe-cli/stripe
brew install --cask 1password-cli
stripe login    # Browser-Auth
op signin       # 1Password
```

Dann Stripe-Produkte via CLI anlegen (Robin gibt Go, KI führt aus):

```bash
# Beispiel — wird live ausgeführt
stripe products create --name "BeatControl Event-Pass"
stripe products create --name "BeatControl Pro"
stripe products create --name "BeatControl Studio"
stripe prices create --product=prod_xxx --currency=eur --unit-amount=3499
# ...
```

Price-IDs in 1Password speichern, dann via `op read` in Vercel-ENV.

**Geschätzte Zeit:** 60 Min (interactiv, mit KI-Begleitung)

### B2. Phase-0-Outreach senden
**Owner:** Robin
**Voraussetzung:** A1 erledigt (Domain für Glaubwürdigkeit)
**Drafts:** `outreach/01-marielle-miss-ella.md`, `outreach/02-annika-happily.md`, `outreach/03-daniel-lemke-erweiterung.md`

Sendet Robin selbst persönlich (WhatsApp / Email / Anruf).

**Geschätzte Zeit:** 30 Min für alle drei

### B3. Pilot-DJ-Reichweiten-Post
**Owner:** Robin
**Voraussetzung:** A1 erledigt
**Draft:** `outreach/04-pilot-dj-akquise-vorlage.md`
**Wo posten:** LinkedIn (Robins persönliches Profil) + Insta-Story

**Geschätzte Zeit:** 20 Min

---

## C. Mai–Juli (Phase 0 Reference-Generation)

### C1. 2 weitere echte Hochzeiten finden
**Owner:** Robin (Akquise) + Pilot-DJs (Ausführung)
**Voraussetzung:** B2 + B3 müssen Resultate gebracht haben

**Ziel:** 2 weitere echte Hochzeiten mit BeatControl durchgeführt, Aftermovie + Quote im Kasten.

**Tracking:** `outreach/07-reference-card-template.md` ausfüllen pro Event.

### C2. Aftermovie-Editing & Insta-Setup
**Owner:** Robin
**Was:**
- BeatControl-Insta-Account anlegen
- 3 Reference-Reels schneiden (vertical 9:16, 15-30 Sek je)
- Pinned Posts in Profile

**Geschätzte Zeit:** 4h verteilt über Mai–Juli

---

## D. August (Mike-Hoffmann-Pitch)

### D1. Mike-Hoffmann-DM vorbereiten
**Owner:** Robin
**Voraussetzung:** C1 abgeschlossen
**Draft:** `outreach/05-mike-hoffmann-channel-partner.md`

**Vor dem Senden Check:**
- [ ] 3 Reference-Cards komplett ausgefüllt (Aftermovie + Quote + Numbers)
- [ ] Demo-URL `mikehoffmann.beatcontrol.io` zeigt ein Studio-mit-Mike-Branding (Robin reserviert Subdomain manuell)
- [ ] Pricing-Page final mit funktionierendem Checkout (Stripe live)
- [ ] Insta-Profil mit min 3 Reels (Reference-Material)

### D2. Demo-Call-Vorbereitung
**Owner:** Robin
- 10-Min-Demo-Skript schreiben (KI hilft im Folge-Iteration)
- 3-Optionen-Deal-Sheet ready als PDF

---

## E. Risiken & Mitigations

| Risiko | Wahrscheinlichkeit | Mitigation |
|---|---|---|
| Domain `beatcontrol.io` wird zwischen heute und Robins Kauf reserviert | sehr niedrig (~0.1%) | Sofort kaufen (A1) |
| Kein DJ committed sich auf Phase-0-Pilot | mittel | Daniel-Push verstärken, Familie-Hochzeiten als Fallback, persönliches Netzwerk durchforsten |
| Mike Hoffmann sagt ab | mittel | Fallback-Liste: DJ Schoolzz, MasterDJ, Patrick Loosch — alle in `outreach/05-...md` dokumentiert |
| Stripe-Setup hängt an Steuerthemen | niedrig | Stripe Tax automatisch konfiguriert, OSS für EU-Cross-Border |
| Erste Live-Hochzeit hat technischen Crash | mittel | Polling-Hardening ✅ erledigt; zusätzlich Backup-Plan: Robin als Live-Standby per Telefon erreichbar |

---

## F. Was die KI weiter macht (autonom)

Während Robin A–D erledigt, kann KI parallel:
- i18n Pages-Migration zu `app/[locale]/` für EN-Markt
- Brautpaar-Onboarding-Flow nach Stripe-Success
- Email-Notifications (Transactional via Resend) — sobald Domain live
- Demo-Script für Mike-Call
- Stripe-Webhook-Robustness-Audit

Jede Iteration des Ralph-Loops nimmt eines davon.

---

## G. Geschätzter Gesamt-Aufwand für Robin bis Mike-Pitch

| Block | Stunden |
|---|---|
| A (Sofort) | 0.5h |
| B (Diese Woche) | 2h |
| C (Mai–Juli, Phase 0) | 6–10h verteilt |
| D (August, Mike-Pitch) | 3h |
| **Total** | **~12–16h über 3 Monate** |

Bei Robins 2h-Bandbreite/Woche ist das machbar.

---

## H. Status-Snapshot heute (16. Mai 2026)

✅ Code-Foundation komplett:
- Brand "BeatControl" überall
- DSGVO-Hash für Anonymisierung
- i18n Foundation (Pages-Migration pending)
- Whitelabel-Subdomain-Storage + UI + Routing
- Pricing-Page mit 4 Tiers + ehrlicher Pilot-Saison-Hinweis
- Polling-Hardening mit ETag/304 + Backoff
- SEO/OG-Image/Favicon/Sitemap/404

✅ Outreach-Material komplett:
- 5 Outreach-Drafts (Marielle, Annika, Daniel, Pilot-Akquise, Mike Hoffmann)
- Vibo-Vergleich
- Reference-Card-Template

⏳ Blockiert auf Robin:
- Domain-Kauf
- Stripe-CLI-Setup
- Phase-0-Hochzeiten 2+3 akquirieren
- Outreach versenden
