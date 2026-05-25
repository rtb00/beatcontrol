# Argumentations-Munition: Vibo vs. BeatControl

**Zweck:** Wenn Mike Hoffmann, andere DJ-Akademien oder einzelne DJs nach Vibo fragen — hier ist die ehrliche Differenzierung. NICHT Vibo schlecht reden, sondern positionieren.

---

## Was Vibo gut macht (ehrlich)

- US-Marktführer mit ~4.000–5.000 zahlenden DJs weltweit
- Sehr breiter Feature-Umfang: Spotify/Apple/Beatsource-Sync, 100+ Timeline-Templates, Serato/Rekordbox-Export
- Mobile Native App für Brautpaare und Gäste
- Etabliert seit Jahren, US-Brand stark
- Tippping-Feature (Gäste können Geld an DJ überweisen)

## Wo Vibo schwach ist

- **Pricing: $179/Mo (~€165) monatlich oder $149/Mo jährlich** — fast 3× so teuer wie BeatControl Pro
- US-zentriert: kein dedizierter DACH-Sales, kein deutsches Onboarding, kein deutscher Support
- DSGVO-/EU-Hosting: keine offizielle Aussage, vermutlich US-Server (Risiko für DACH-DJs mit Abmahn-Sorge)
- UI-Reviews (G2, MyWeddingSongs): "dated", "structured system", wenig DJ-Flexibilität
- Native App-Zwang für Gäste: zusätzliche Friction (Brautpaar muss App-Download-Anweisung kommunizieren)
- Kein Whitelabel: DJ kann Vibo nicht unter eigener Brand verkaufen

---

## Wo BeatControl bewusst anders ist

### 1. Pricing
| Tier | Vibo | BeatControl |
|---|---|---|
| Subscription | $179/Mo ($149 yearly) | €59,99/Mo (€49,99 yearly) |
| Single Event | nicht angeboten | €34,99 einmalig |
| Whitelabel | nicht angeboten | €149/Mo Studio |

BeatControl Pro ist **3× günstiger** als Vibo. Für einen DACH-DJ mit 20-40 Hochzeiten/Jahr macht das ~€1.500/Jahr Differenz.

### 2. Sprache & Markt
- **BeatControl:** Deutsch primär, Englisch von Tag 1 mitgeliefert. AGB/Datenschutz nach DACH-Recht. Support auf Deutsch.
- **Vibo:** Englisch primär, keine deutsche AGB, US-Privacy-Policy.

### 3. DSGVO-First-by-Design
- **BeatControl:** Hosting in der EU (Vercel EU-Region + Neon Postgres EU). IP-Adressen werden via SHA-256 + Event-Salt anonymisiert gespeichert (keine Klartext-IPs in der DB). AVV-Standardvertrag verfügbar.
- **Vibo:** Hosting-Region unklar, IP-Handling intransparent, kein offizielles AVV.

### 4. Web-First statt Native-App
- **BeatControl:** Brautpaar und Gäste öffnen einen Link. Kein App-Download. Kein App-Store-Approval. Funktioniert auf jedem Smartphone seit 2018.
- **Vibo:** Gäste sollen die Vibo-App herunterladen. Reibung pro Gast bei einer Hochzeit mit 100 Gästen = signifikante Drop-out-Quote.

### 5. Whitelabel für DJ-Akademien
- **BeatControl Studio (€149/Mo):** Akademie / Eventagentur kann das Tool unter eigenem Branding an ihre DJs weiterverkaufen. Eigene Subdomain, eigenes Logo, Sub-Accounts für jeden DJ.
- **Vibo:** kein Whitelabel-Modell. DJ-Akademie kann nur als Empfehler agieren, nicht als Reseller.

### 6. "Versicherung gegen Party-Flop"-Framing
- **BeatControl:** verkauft die emotionale Outcome — Brautpaar kauft Sicherheit, nicht Software. DJ verkauft Professionalität, nicht Features.
- **Vibo:** verkauft Feature-Liste — QR-Codes, Timeline-Templates, Spotify-Sync.

---

## Wo BeatControl (noch) schwächer ist

Ehrlich, weil DJs Bullshit riechen:
- **Less mature:** Mai 2026 live, 3 Reference-Cases bisher. Vibo hat 6+ Jahre Track Record.
- **Kein In-App-Tipping:** Vibo hat Venmo/PayPal-Integration für DJ-Trinkgeld via App. BeatControl noch nicht.
- **Keine native Spotify/Apple-Library-Search:** BeatControl nutzt Deezer-API (gut, aber weniger bekannt als Spotify).
- **Solo-Founder-Risiko:** BeatControl ist Robin allein. Vibo hat Team. Mitigations: Daten-Export jederzeit, Quellcode-Escrow auf Anfrage.

---

## Standard-Antwort wenn jemand fragt "Was unterscheidet euch von Vibo?"

> "Vibo ist gut, aber für den US-Markt gebaut. Wir sind für DACH gebaut. Drei harte Differenzen: 3× günstiger, DSGVO-konform mit EU-Hosting, und wir haben Whitelabel — du könntest das Tool unter deiner Brand an deine Schüler weitergeben. Vibo kann das nicht. Plus wir haben deutsche AGB und deutschen Support."

Wenn Skeptisch:
> "Probier es. Pilot-Saison kostenlos, ich pflanze persönlich auf. Wenn dir nach 1 Hochzeit Vibo lieber ist, kein Drama — du hast nichts verloren."

---

## Quellen

- Vibo Pricing: https://vibodj.com/pricing
- Vibo G2/MyWeddingSongs-Reviews (extrahiert in Iteration 2)
- BeatControl Reference-Case: Hochzeit Platen (Daniel Lemke), 64 Live-Songs, Mai 2026
