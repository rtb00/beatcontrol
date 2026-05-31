# BeatControl — GTM-Playbook (DJ-zu-DJ) — FINAL

> **Stand:** 31.05.2026 · **Gültige Quelle:** Master `~ BeatControl.md` (29.05., DR-1–DR-7) + Live-Code. STATUS.md / PRODUCT_ROADMAP.md / README.md (16.05.) sind **veraltet** — alte Positionierung „Versicherung gegen Party-Flop", Preis 34,99, Brautpaar-Top-of-Funnel: alles verworfen.

---

## 1. TL;DR

BeatControl ist ein Live-Tool für Hochzeits- und Event-DJs: Gäste voten still per QR vom Handy, welche Songs sie hören wollen, der Favorit steht mit Stimmenzahl oben auf dem DJ-Screen — **der DJ entscheidet wie immer selbst.** Verkauft wird an den **DJ als Käufer** (nie das Brautpaar), Idealtyp wie Pilot Daniel Lemke: erfahren, kuratiert, nutzt das Voting als Sicherheitsanker im Song-Übergang. Der einzige nachweislich konvertierende Kanal ist **1:1-Direktkontakt nach eingeholter Einwilligung + Peer-Empfehlung** (100% Conversion vs. 0% Self-Discovery) — Cold-Mail/Cold-DM sind in DE ab der ersten Nachricht abmahnbar und werden technisch ausgeschlossen. Der Hebel ist nicht Volumen, sondern **2–3 Piloten ehrlich durch ein echtes Live-Event bringen**, deren O-Töne + Empfehlungen freischalten und erst danach Self-Serve und den Akademie-Multiplikator scharfschalten. Engpass ist **Nutzung (0 zahlende Kunden, 0 fremde Live-Events)**, nicht Traffic.

---

## 2. PRE-FLIGHT-BLOCKER (zuerst lesen — sonst läuft alles ins Leere)

Zwei Dinge müssen **vor** dem ersten Lead-Touch stehen. Klartext, keine Ausreden:

### Blocker A — Funnel & Domain müssen live & konsistent sein
- Die Outreach-Texte und der `/pilot`-Link sind der Lead-Magnet. Wenn ein DJ klickt und auf eine kaputte/widersprüchliche Seite kommt, ist der wertvollste Moment (das Mikro-Ja) verbrannt.
- **Konkret offen:**
  - `www`-Redirect auf `beatcontrol.io` ist **noch nicht geschlossen** → ein DJ, der `www.beatcontrol.io` tippt, landet im Nichts. **Schließen, bevor der erste Link rausgeht.**
  - Versand-/Marketing-Domain (`trybeatcontrol.com` o.ä.) muss registriert sein und der `/pilot`-Pfad muss **dort konsistent** auflösen (`trybeatcontrol.com/pilot`), weil alle Mail-Links auf die Marketing-Domain zeigen.
  - **Stripe ist im Test-Mode in Prod (Promo PILOT100).** Solange kein KYC/IBAN + Live-Keys-Tausch → **kein Euro fließt.** Für die Pilot-Phase ist das OK (Piloten zahlen 0€), aber **Self-Serve-Monetarisierung darf erst announced werden, wenn Stripe live ist.** Sonst verbrennst du zahlbereite Leads an einer Test-Checkout-Wand.
- **Entscheidung:** Pilot-Track läuft auch ohne Live-Stripe (gratis). Self-Serve (`/start` → 19€/49,99€) erst freigeben, wenn Stripe live.

### Blocker B — Rechtssichere Channel-Wahl (UWG, nicht verhandelbar)
Robin ist Einzelperson, DJs sind Gewerbetreibende → **B2B, aber es gibt KEINE B2B-Ausnahme bei elektronischer Post.**
- **Verboten ab der ersten Nachricht** (abmahnbar, Beweislast beim Versender, ~5.000 € Vertragsstrafe/Verstoß): Kalt-E-Mail · Kalt-DM (Insta/WhatsApp/Messenger, OLG Hamm 15.11.2023) · Werbung übers Website-Kontaktformular · Telefon-Kaltakquise (BVerwG 29.01.2025: bloßer Branchenbezug reicht nicht).
- **Erlaubt ohne Einwilligung:** Brief/Postkarte an Geschäftsadresse · öffentliche Insta-Interaktion (Kommentar/Story-Reply) · Face-to-face auf Branchenevents · Mehrwert-Posts in FB-Gruppen.
- **Erlaubt nach Einwilligung:** 1:1-Mail/DM, **sobald der DJ selbst „schick mir Infos" gesagt** oder per Funnel opt-in gegeben hat. Das ist gleichzeitig der konversionsstärkste Zustand.
- **Eiserne Faustregel:** Hat der DJ nicht vorher „Ja" gesagt, darf **nichts Werbliches** in seinen privaten Posteingang (Mail/DM/Formular). Punkt.

> **Konsequenz für die Lead-Liste unten:** Die personalisierten Erst-Nachrichten in §8 sind **nicht** als Kalt-Mail zu versenden. Sie sind (a) der Inhalt, den du schickst, **nachdem** der DJ über öffentlichen Touch/Postkarte/Inbound „ja, schick" gesagt hat, oder (b) Vorlage für die Warm/Referral-Variante. Der Erstkontakt selbst läuft über die erlaubten Kanäle.

---

## 3. Positionierung & ICP (kompakt)

**One-Liner:** *Dein Gespür für die Tanzfläche. Von den Gästen bestätigt.* — Gäste voten still vom Handy, der Favorit steht mit Stimmenzahl oben auf deinem Screen, du entscheidest wie immer selbst.

**ICP (Käufer = DJ):** Professioneller Hochzeits- und Event-DJ in DACH mit eigenem Setup, der live abliefern muss und am Pult das letzte Wort behalten will. Idealtyp wie Daniel Lemke: erfahren, kuratiert, nutzt das Voting als Sicherheitsanker. **Sekundär:** derselbe DJ auf Geburtstags-/Firmenfeiern (Firmenfeier-Schmerz ist härter — keine Wunschliste, unbekannte Crowd).

**Kern-Pains:** Druckmoment im Übergang („welcher Song hält die Fläche?") · Einzelwunsch vs. Mehrheit nicht unterscheidbar · ein Griff daneben kostet (20 Leute setzen sich) · Firmenfeier ohne Briefing · Wunschzettel/Zurufe/WhatsApp am Pult sortieren.

**Value Props:** Sicherheit im riskantesten Moment (bestätigte Next-Song-Queue) · echte Stimmen statt Vermutung · **volle Kontrolle, kein Jukebox-Modus** (Spickzettel nur für dich) · Verstärker, kein Ersatz · Diskretion (anonym, niemand kommt ans Pult) · läuft neben Rekordbox/Serato/Engine, QR ohne App · Burggraben = Live-Echtzeit-Validierung (kann eine Vorab-Playlist strukturell nicht).

**Disqualifier (nicht bespielen):** Brautpaar als Käufer · Ü60-Schlager-/Standard-Set-DJs · DJs ohne digitale Präsenz/Setup · Self-Discovery-Google-Sucher (0% Conversion) · B2C-Hochzeitsmessen.

**Pricing (gültig):** Free 0 € (1 Event, 30 Wünsche, QR, BC-Branding) · **Pro Hochzeit / Pay-per-Use 19 €** einmalig · **Pro 59,99 €/Mon** bzw. **49,99 €/Mon jährlich** (599,88 €/Jahr, −25 %, 30 Tage Geld-zurück) · **Studio 149 €** (Whitelabel, Sales-led, B2B2B) · **Pilot Saison 2026: Pro gratis (~600 € Wert)** gegen ehrliches Feedback + O-Ton. *Verworfen: 34,99 / 8,99 / 12,99 / 25,99.*

---

## 4. Robin als DJ — Founder-Story für den Pitch

Robin ist **selbst aktiver Hochzeits-DJ** aus Rheinhessen/Nierstein — er kennt den Druck-Moment am Pult aus erster Hand: Tanzfläche füllt sich, und die eine Frage ist, welcher Song als Nächstes zieht, ohne die Kontrolle abzugeben. Genau das hat ihn als Informatiker (TH Mittelhessen, Bachelor 1,0, Head of Operations) so genervt, dass er BeatControl gebaut hat — **kein Tool von einem Tech-Bro, der nie hinterm Pult stand**, sondern von einem Kollegen, der es beim eigenen nächsten Gig einsetzt. Er sucht keine Massen-Signups, sondern **2–3 Pilot-DJs**, denen er beim echten Event vor Ort alles kostenlos aufsetzt und ehrlich fragt, ob's was taugt.

**DJ-Credibility (Peer-Belege):** eigenes Equipment (Soundboks, Licht-/Tontechnik, DJI-Drohne) · Licht-/Ton-AG am Gymnasium Oppenheim (Ehrung) · Eventtechnik-Erfahrung (Spotlight Eventtechnik, Uluna Night) · eigenes DJ-Netzwerk · benannter Peer-Proof Daniel.

**Voice (so klingt jede Nachricht):** direkt, auf den Punkt · Kollege-zu-Kollege, nie von oben herab · respektvoll vorm Profi-Handwerk (das Tool bestätigt das Gespür, ersetzt es nie) · ehrlich/unaufgeregt statt marktschreierisch · werkzeugneutral (Rekordbox/Serato/Engine) · neugierig, fragt nach.

**Personal Angles (Türöffner):** „Ich leg selbst auf Hochzeiten auf" · der geteilte Übergangs-Moment · „Ich bau das fürs eigene Pult, nicht um's dir zu verkaufen" · kostenloses Vor-Ort-Setup + ehrliches Feedback · Daniel als Pult-zu-Pult-Empfehlung.

---

## 5. Channel-Strategie & Recht (was tun / was lassen)

**Drei-Stufen-Plan (Permission-First):**

1. **Sichtbar werden, wo DJs schon sind** (kein §7-Risiko): Mehrwert-Content in FB-Gruppen (discjockey.de >5.000, „DJs und ihre Technik"), eigener Insta-Auftritt mit #hochzeitsdj/#eventdj, BVD-Präsenz (>1.000 Mitglieder), ggf. eventpeppers-Profil. Robin postet *von DJ zu DJ*, nicht „Produkt kaufen".
2. **Einwilligung einsammeln:** starke Opt-in-Landingpage (`/pilot`, 2 Plätze, Knappheit) + öffentliche Insta-Interaktion (Kommentar/Story-Reply auf vom DJ initiierte CTAs), die im „schick mir Infos" endet.
3. **Personalisiertes 1:1 NUR an warme Leads:** Google Workspace + Personennamen-From, SPF/DKIM/DMARC, sauberes Warmup, Lemlist/Instantly. Gleichzeitig die konversionsstärkste Variante, weil erwartet.

| Kanal | Status | Warum |
|---|---|---|
| Brief/Postkarte an Geschäftsadresse | ✅ erlaubt ohne Opt-in | Einziger werblicher Erstkontakt-Kanal ohne Einwilligung (berechtigtes Interesse). Hohe Aufmerksamkeit, ~1 €/Stück, langsam. |
| Öffentlicher Insta-Kommentar / Story-Reply | ✅ erlaubt | Keine „elektronische Post". Erzeugt das „schick mir Infos". |
| FB-Gruppen / BVD / Foren (Mehrwert-Post) | ✅ erlaubt | Öffentlich, kein §7-Fall. Gruppenregeln beachten (Mehrwert statt Pitch). |
| Face-to-face (Messen, DJ-Expos, BVD) | ✅ erlaubt | Nicht von §7 erfasst, Visitenkartentausch = oft direkte Einwilligung. |
| Mail/DM **nach** Opt-in | ✅ erlaubt + höchste Conversion | Sobald DJ „ja, schick" sagt. Zielzustand jedes Leads. |
| Inbound-Landingpage mit Opt-in | ✅ erlaubt + skaliert | DJ trägt sich selbst ein → rechtssicher + warm. |
| Kalt-E-Mail | ⛔ verboten | §7 Abs.2 Nr.3 UWG, keine B2B-Ausnahme, abmahnbar ab Mail 1. |
| Kalt-DM (Insta/WA/Messenger) | ⛔ verboten | OLG Hamm: „elektronische Post". + Meta-Shadowban. |
| Telefon-Kaltakquise | ⛔ faktisch verboten | BVerwG 29.01.2025, Bußgeld bis 300.000 €. |
| Werbung über DJ-Kontaktformular | ⛔ verboten | Rechtlich = Kalt-Mail. Kein Schlupfloch. |
| Gekaufte/gescrapte Adresslisten | ⛔ verboten | UWG + DSGVO, Domain-Reputation ruiniert. |

---

## 6. Mail-/Outreach-Infrastruktur (Checkliste — „Robin-Action" markiert)

> Grundprinzip: Mail wird **nur für warme Leads** scharfgemacht. Cold ist technisch ausgeschlossen (§6-Permission-Gate).

**0. Entscheidungen zuerst:** Versand-Domain `trybeatcontrol.com` (NICHT `beatcontrol.io`) · From `robin@trybeatcontrol.com` (Personenname schlägt `info@`/`hallo@`) · `hallo@beatcontrol.io` bleibt transaktional/Newsletter auf der Produktdomain · Reply-To darf auf `beatcontrol.io` zeigen · Hauptkanal ist Inbound, nicht Mail.

**1. Domain & Postfach**
- [ ] **Robin-Action:** Versand-Domain registrieren (`trybeatcontrol.com`)
- [ ] **Robin-Action:** 301-Redirect der Versand-Domain → `beatcontrol.io`
- [ ] **Robin-Action:** Google Workspace Business Starter (~6–7 €/Mon), Mailbox `robin@trybeatcontrol.com`, 2FA

**2. DNS-Records (Robin-Action, DNS-Panel der Versand-Domain)**
- [ ] TXT `@`: Google `google-site-verification=…`
- [ ] MX `@`: `1 smtp.google.com` (oder alte ASPMX-Einträge)
- [ ] SPF, TXT `@`: `v=spf1 include:_spf.google.com -all` (nur **ein** SPF-Record!)
- [ ] DKIM: im Admin 2048-bit-Key generieren → TXT auf `google._domainkey` → **„Authentifizierung starten"** klicken
- [ ] DMARC, TXT `_dmarc`, Start: `v=DMARC1; p=none; rua=mailto:dmarc@trybeatcontrol.com; fo=1; adkim=s; aspf=s` → nach 2–4 Wochen `p=quarantine` → Ziel `p=reject`
- [ ] **Robin-Action:** nach ~1h `dig +short TXT …` prüfen + mail-tester.com Ziel **10/10**

**3. Signatur + Footer (Pflicht unter JEDE Mail, auch warm — §5 DDG, §5a/§7 Abs.3 Nr.4 UWG)**
- [ ] **Robin-Action:** ladungsfähige Anschrift + Telefon + ggf. USt-IdNr. eintragen (Platzhalter ausfüllen, sonst NICHT versandfähig); Abmeldehinweis + Datenschutz-Link

**4. Warmup (eine Mailbox, Solo)**
- [ ] **Robin-Action:** Warmup 2–4 Wochen **vor** dem ersten echten Send. Woche 1–2: 5–10/Tag · 3–4: 15–25 · ab 5–6: 20–50 (Obergrenze). Konstant, keine Spikes. Mehr Volumen nie durch Hochschrauben, sondern weitere gewärmte Mailbox (solo praktisch nie nötig).

**5. Tools (günstig, Solo):** Lemlist (1:1-Personalisierung) **oder** Instantly (Founder-freundlich, Warmup eingebaut) ~30–60 €/Mon · Carrd/Tally für Opt-in-Landingpage + Double-Opt-in. **Wichtig:** Tools lösen Zustellbarkeit, **nicht** die Rechtsfrage — Einwilligung muss VORHER vorliegen. Click-Tracking ja, Open-Tracking eher aus (DE-datenschutzsensibel, Reply-Rate ist ehrlicher).

**6. Permission-Beleg (der eigentliche Setup-Kern):** Lead-Status-Spalte `kalt`/`warm – Opt-in am [Datum] via [Quelle]`. Nur warme Leads dürfen ins Tool. Einwilligungsnachweis pro Lead speichern (Screenshot „schick mir Infos" / Formular-Timestamp / Double-Opt-in-Mail).

**7. Instagram:** Business-/Creator-Account, Link-in-Bio → Opt-in-Landingpage. **Kein Cold-DM, keine Bots.** Daily-Block 20–30 Min für 5–10 qualitativ öffentliche Interaktionen. DM erst, wenn der DJ wörtlich gefragt hat — Screenshot als Nachweis.

---

## 7. Messaging-Assets (final, copy-paste-fähig)

> **Channel-Regie (heilig):** 1:1-Mail/DM nur an warme/eingewilligte Leads. Erstkontakt ohne Einwilligung nur über öffentlichen Insta-Touch, Brief/Postkarte oder Face-to-face. Die Mail-Vorlage ist als **Antwort auf eine Info-Bitte** formuliert. Versand über `trybeatcontrol.com`, `/pilot`-Link konsistent dort, RFC-8058-One-Click-Unsubscribe, Abmeldungen < 2 Tage. Jede Mail trägt Signatur + Footer.

### 7.0 Standard-Signatur + Footer (unter JEDE Mail)
```
Beste Grüße vom Pult zum Pult
Robin

—
Robin Bauer · BeatControl
[Straße + Hausnr.] · [PLZ Ort]
robin@trybeatcontrol.com · [Telefon]
[ggf. USt-IdNr.]

Du bekommst diese Mail, weil du nach Infos zu BeatControl gefragt hast.
Kein Interesse mehr? Antworte einfach mit „Stopp" — dann hörst du nichts mehr von mir.
Wie ich mit deinen Daten umgehe: trybeatcontrol.com/datenschutz
```
> Platzhalter `[Straße + Hausnr.]`, `[PLZ Ort]`, `[Telefon]`, ggf. USt-IdNr. vor Versand ausfüllen — sonst keine Mail versandfähig.

### 7.1 Cold-Email v1 (für warme/eingewilligte Leads)

**Betreff:** Wie versprochen — kurz zu BeatControl, {Name}

```
Hey {Name},

der Song läuft aus, drei könnten passen, und du setzt in zehn Sekunden den, der die
Stimmung weiterträgt. Du triffst das aus dem Bauch, jedes Mal — und meistens sitzt es.
Genau für diesen Moment hab ich mir was gebaut. Du hattest nach Infos gefragt: hier in
zwei Minuten, was BeatControl ist.

Ich leg selbst auf Hochzeiten auf, in {Stadt}/Rheinhessen. BeatControl legt dir für genau
diesen Moment eine zweite Info aufs iPad: Die Gäste voten still per QR vom Handy, welche
Songs sie hören wollen. Auf deinem iPad steht der Favorit mit Stimmenzahl ganz oben — du
siehst sofort, ob ein Wunsch von einem kommt oder von der halben Feier. Entscheiden tust
DU, wie immer.

Wie das am Pult aussieht:
- Es ist ein Spickzettel, den nur du liest — du steuerst alles weiter in deiner Software,
  wie immer.
- Was nicht passt, wischst du mit einem Klick weg — geräuschlos, niemand sieht's, niemand
  kommt ans Pult. Das Pult bleibt deins, BeatControl flüstert dir nur zu, was die Fläche
  gerade will.
- Läuft neben Rekordbox, Serato oder Engine. Du spielst in deiner Software wie immer.

Ehrlich gesagt: Das ist noch neu. Bisher hat's ein Kollege live getestet — eine Hochzeit,
rund 120 Gäste, er hat sich beim Tanz-Block drauf verlassen und meinte hinterher, er hätte
zwei Wünsche gespielt, die er sonst nie gebracht hätte. Klein, aber echt — keine
aufgeblähten Zahlen.

Für die Saison 2026 setze ich 2 DJs als Piloten auf: die Saison-Pro-Version, die du sonst
bezahlen würdest, aufs Haus — und das ist der eigentliche Deal: Ich komm zu deinem echten
Gig und bau dir alles selbst vor Ort auf. Dafür sagst du mir hinterher ehrlich, ob's taugt.

Klingt das nach was für deinen nächsten Gig? Dann reservier ich dir deinen Pilot-Platz —
ein kurzes „ja" reicht, den Rest mach ich.

[Signatur + Footer]
```
> **Bias-Regie:** Liking/Peer + Pattern-Interrupt (geteilter Pult-Moment auf Satz 1, DJ-Können bestätigt statt Druck → DR-5) · positiver Kontroll-/Verstärker-Frame statt Jukebox-Dementi · Spezifität (120 Gäste, konkretes Outcome) trägt fehlende Menge · Reziprozität über persönlichen Aufwand + ehrliche Verknappung (2 Plätze) · ein niedrigschwelliger CTA (Reply als Mikro-Ja).

### 7.2 Fünf alternative Betreffzeilen
1. „Der Moment, wenn drei Wünsche gleichzeitig kommen — kurz für dich, {Name}" *(Spezifität, kein Versagens-Frame)*
2. „Von DJ zu DJ: das hab ich fürs eigene Pult gebaut" *(Liking/Peer)*
3. „2 Pilot-Plätze für die Saison 2026 — magst du einen?" *(Verknappung ohne Spam-Wort „gratis")*
4. „Welcher Song als Nächstes? Die Stimmen aus dem Raum auf deinem iPad" *(Spezifität + Verstärker-Frame)*
5. „Ein Kollege hat's live auf einer Hochzeit getestet — hier der kurze Stand" *(ehrlicher Social Proof)*

### 7.3 Instagram-DM-Sequenz (casual)

> **Regie (rechtlich heikel):** DM ERST, wenn der DJ **wörtlich** um Infos bittet. Davor nur öffentlicher Touch (2–3 echte Likes + ernstgemeinter Kommentar). Screenshot der Info-Bitte als Einwilligungs-Nachweis. Kalt-DM ist ab erster Nachricht abmahnbar (OLG Hamm). Texte variieren, wenige DMs/Tag (Shadowban). Bei Wachstum auf Inbound setzen.

**Öffentlicher Kommentar (Türöffner, KEINE DM):**
> Sauberer Übergang in dem Reel 🔥 Leg selbst auf Hochzeiten auf — wie entscheidest du eigentlich im Übergang, welcher Song als Nächstes zieht?

**Opener-DM (nur nach wörtlicher Info-Bitte):**
> Hey {Name}, DJ aus Rheinhessen hier. Hab für genau den Übergangs-Moment was gebaut — ein Hardcore-Spickzettel fürs Pult, du steuerst alles weiter wie immer. Soll ich's dir in 2 Sätzen schicken?

**Follow-up 1 (nach „ja/klar"):**
> Kurz: Gäste voten still per QR, du siehst den Favoriten mit Stimmenzahl auf dem iPad — entscheiden tust du. Läuft neben Rekordbox/Serato/Engine. Ein Kollege hat's letztens live auf 'ner Hochzeit getestet und sich im Übergang drauf verlassen. Ich setz für die Saison 2 DJs als Piloten auf — richte alles vor Ort ein. Interesse?

**Follow-up 2 (nur bei Interesse, sonst Ruhe):**
> Top — sag mir einfach deinen nächsten Gig-Termin, dann schau ich, ob's passt und reservier dir den Pilot-Platz.

### 7.4 E-Mail-Follow-up-Sequenz (2 Touches nach v1)

> Nur an Leads mit Opt-in. Bei „kein Interesse" sofort Stopp. Jede Mail mit Signatur + Footer.

**Touch 2 — Tag +4 — Einwand „Kontrolle/Aufwand" entkräften**
**Betreff:** Re: Wie versprochen — eine Sache noch, {Name}
> Hey {Name},
> kurzer Nachtrag, weil das die häufigste Frage von Kollegen ist: Nein, das nimmt dir nichts aus der Hand — und nein, das ist kein Jukebox-Ding, niemand drückt Play außer dir. BeatControl ist ein Spickzettel, den nur du siehst — die Gäste sehen nur ihr Handy, nicht deinen Screen. Aufsetzen dauert keine 5 Minuten, QR ausdrucken, fertig. Du legst in deiner Software weiter wie immer.
> Wenn's für deinen nächsten Gig passt: Sag mir kurz Bescheid, dann reservier ich dir deinen Pilot-Platz.
> [Signatur + Footer]

**Touch 3 — Tag +9 — sauberer Abschluss + Tür offen**
**Betreff:** Letzte Mail dazu — dann ist Ruhe
> Hey {Name},
> ich nerv dich nicht weiter — eine Sache noch: Ich starte die Piloten vor der Saison, damit ich vor deinem ersten Gig vor Ort aufbauen kann. Wenn du dieses Jahr eh Hochzeiten spielst und's ausprobieren willst, ist jetzt der einfachste Moment — danach wird's terminlich eng. Gratis, ich richte alles vor Ort ein, du sagst ehrlich, ob's taugt.
> Kein Stress, wenn nicht — dann hör ich hier auf. Sonst reicht ein kurzes „ja".
> [Signatur + Footer]

### 7.5 Warm/Referral-Variante (DJ-Kollegen aus Robins Netzwerk)

> Kanal: WhatsApp/Mail an bestehende Kontakte (eingewilligt durch Beziehung) oder DJ-WhatsApp-Gruppe. Stärkster Hebel. **Vor Gruppen-Post:** Regeln prüfen, ggf. Admin fragen (Ban-Risiko, keine Abmahnung).

**Direkt an einen Kollegen:**
> Hey {Name}, du kennst den Übergangs-Moment so gut wie ich — Song läuft aus, welcher trägt die Stimmung weiter. Ich hab dafür was gebaut: BeatControl. Gäste voten still per QR, du siehst den Favoriten mit Stimmenzahl, entscheidest aber selbst wie immer.
> Ich setz für die Saison 2 Kollegen als Piloten auf und richte alles vorm Gig vor Ort ein — die Saison-Pro aufs Haus. Würd's gern bei dir testen und ehrlich hören, ob's was taugt. Bock?
> Falls nicht für dich, aber du kennst jemand, der live abliefern muss: eine Empfehlung von dir wäre Gold wert. 🙏
> Schau's dir an: trybeatcontrol.com/pilot

**Kurz-Post für die DJ-WhatsApp-Gruppe (erst Wert, dann beiläufig der Ask):**
> Kurze Frage in die Runde — wie löst ihr den Übergangs-Moment, wenn drei Wünsche gleichzeitig kommen und ihr nicht wisst, ob's eine Person oder die halbe Feier ist? Ich hab mir dafür ein Live-Tool gebaut: Gäste voten still per QR, DJ entscheidet selbst. Such 2 von euch, die's diese Saison mit mir testen (ich bau vor Ort auf, ehrliches Feedback ist der Deal). Wer Bock hat: DM.

### 7.6 Voicemail / Telefon-Opener-Notiz

> **Recht-Hinweis (riskanter Kanal):** Nur anrufen, wenn der DJ vorher Kontakt/Anruf ausdrücklich gewünscht hat. Reine Telefon-Kaltakquise bei Gewerbetreibenden ist praktisch unzulässig und abmahnbar — **nicht** kalt anrufen.

**Voicemail (≤ 20 Sek.):**
> „Hey {Name}, hier ist Robin — DJ-Kollege aus Rheinhessen, wir hatten ja kurz geschrieben. Ich ruf wegen BeatControl an — dem kleinen Pult-Spickzettel, der dir im Übergang zeigt, was die Fläche gerade will. Du entscheidest, wie immer. Magst du kurz zurückrufen oder mir 'ne Nachricht schreiben? Zwei Minuten reichen. Danke dir — und schönen Gig am Wochenende!"

**Opener live am Telefon (erste 2 Sätze):**
> „Hey {Name}, Robin hier — danke, dass du drangehst. Ich halt's kurz: Ich leg selbst auf Hochzeiten auf und hab fürs eigene Pult ein Tool gebaut, das dir im Übergang die Stimmen aus dem Raum aufs iPad legt — du siehst, was gerade zieht, und entscheidest wie immer selbst. Passt's, dass ich dir in zwei Minuten zeig, wie's beim Gig aussieht?"

**CTA Telefon:** „Ich setz für die Saison 2 Kollegen als Piloten auf — soll ich dir deinen Platz reservieren und vor dem nächsten Gig vorbeikommen?"

> **Roter Faden über alle Varianten:** DJ-zu-DJ auf Augenhöhe, Auflege-Moment als Held (kein Versagens-Frame, DR-5), Kontrolle/Diskretion/Respekt positiv gerahmt (Verstärker, kein Ersatz), ehrlicher benannter Peer-Proof mit Spezifität. Jede Variante endet mit **einem** niedrigschwelligen CTA (bei warmen Leads die Reply, Funnel-Link erst nach dem Ja). Verbrannte Wörter (**raten, hoffen, fremd, Spotify, Headliner**) durchgehend vermieden; kein Angst-/Defizit-Framing; „Lyranio" nie verwenden.

---

## 8. Lead-Liste (29) + 8 versandfertige Erst-Nachrichten

> **Lese-Hinweis zur §2-Regel:** Die 8 Nachrichten unten sind **Inhalt nach Einwilligung** bzw. **Warm/Referral** — nicht für Kalt-Versand. Für jeden Lead gilt: zuerst erlaubter Erstkontakt (öffentlicher Insta-Touch / Postkarte / Inbound), dann erst diese Nachricht. Spalte „Kanal" = der Kanal, über den der DJ verifiziert erreichbar ist, sobald die Einwilligung steht.

### 8.1 Alle 29 Leads

| Name | Typ | Stadt | Kanal | Fit | Hook |
|---|---|---|---|:--:|---|
| Ben (DJ Lazy Bee) | Hochzeit | Hamburg | Mail | 5 | Wechsel Club→Hochzeit — exakt Robins Weg |
| Villy (DJ ViLLY) | Hochzeit (Vinyl) | NRW (Ddf/Köln/Essen) | Mail | 5 | „kein Ballermann, kein Schlager", 100% Vinyl-Kurator |
| Julian Hügelmeyer (JH Ent.) | Hochzeit + Moderation | Osnabrück/Münster | Mail | 5 | DJ + Live-Moderation → „das Publikum will gerade…" |
| Tim Turner | Hochzeit | Stuttgart/Ludwigsburg | Mail | 5 | Musik-Nerd (Vocal-/Balearic-House) → bestes Detail-Feedback |
| Sina Klaizer (DJane) | Hochzeit | Allgäu | Mail | 5 | „Passion–Experience–Elegance", Berg-Hochzeiten |
| Freddy Arevalo (Einfach Freddy) | Hochzeit | Frankfurt/Rhein-Main | Mail | 5 | „Club-Vibes auf Hochzeitsniveau", Crowd lesen; nah an Rheinhessen |
| Dennis Stock (DJ Stoggi) | Hochzeit/Event | FFM/Mainz/Wiesbaden | Mail | 5 | Club-Residenzen seit 2010, „Gespür für die Crowd"; nah |
| Alexander Pavel | Hochzeit | Nürnberg/Fürth/Erlangen | Mail | 5 | Live-Mixing statt Playlist, liest emotionale Temperatur |
| Chris Migge | Hochzeit/Event | Köln/Ddf/Bergisches Land | Mail | 5 | Open-Format seit 1998, 102 Reviews — viele Genres = viel Voting-Wert |
| Franziska Schadel (Die DJane) | Hochzeit | Stuttgart/DE+AT | Mail | 5 | Highclass-DJane, >30 HZ/Jahr, „volle Eskalation" alle Altersgruppen |
| Daniel Schuler (DJ Daniel) | Hochzeit/Event | Zürich (CH) | Mail | 5 | seit 1996, ~80 Gigs/Jahr, „feel the mood on the dance floor" |
| Oliver (DJ Ollo) | Hochzeit | Hamburg/Altes Land | Insta-DM | 4 | Hochzeiten im Alten Land/HH-Umland |
| Chris Dahler | Hochzeit (Premium) | Berlin/Brandenburg | Insta-DM | 4 | Wedding-King-Award — Premium, nichts dem Zufall überlassen |
| DJ Hung | Hochzeit/Event | Berlin | Insta-DM | 4 | „passt Musik an die Stimmung im Raum an" — 1:1 BC-Hebel |
| Andrea Schöne (Miss Parhelion) | Hochzeit/Event | Berlin | Insta-DM | 4 | aktive DJane, Perspektiven-Vielfalt |
| DJ Sascha Juranek | Hochzeit/Firmen | Dresden | Insta-DM | 4 | Hochzeit + Firmenevent, ~5,7k Follower |
| Leonard Schumann (Event-DJ Leo) | Hochzeit/Event | Leipzig | Web-Formular | 4 | 15 Jahre Erfahrung — Urteil mit Gewicht |
| DJ Alex Awesome | Hochzeit/Event | Köln/Bonn | Insta-DM | 4 | gut vernetzt im Rheinland, ~4,1k |
| Matze (DJ Maze) | Hochzeit | München | Insta-DM | 3 | nahbarer HZ-DJ, niederschwellig |
| Conny (DJ Fun) | Hochzeit | Allgäu | Mail | 4 | Komplettpaket Licht+Fotobox, bodenständig |
| DJ Brano | Hochzeit | Bodensee/Dreiländereck | Web-Formular | 4 | viele Tanzflächen/Stimmungen DE/AT/CH |
| Martin Pickel (DJ eMPi) | Hochzeit/Event | Nürnberg/Nordbayern | Insta-DM | 4 | „dass sich eure Feier rund anfühlt" — Raum lesen |
| Carlos (DJ PAZ) | Hochzeit/Event | Düsseldorf/Köln | Mail | 4 | spanische Wurzeln, Latin — vielfältiges Publikum |
| Jonas Moser | Hochzeit | Köln/NRW | Mail | 4 | „Musik soll für sich sprechen", moderiert wenig — Crowd-Signal ohne Mikro |
| DJane Simone | Hochzeit/Event | dt.spr. Raum | Mail | 4 | >30 J., 2.700+ Buchungen — Mail im Impressum verifizieren |
| Laura Schaible (DJane) | Hochzeit | Aalen/Ostwürttemberg | Insta-DM | 4 | DJane + Live-Pianistin (Doppelrolle) |
| DJ Wilson | Hochzeit/Event | Zürich/Ostschweiz (CH) | Mail | 4 | Open-Format, Premium-Venues (Marriott, CLOUDS) |
| Patric Pleasure | Hochzeit/Event | Zürich/Wattwil (CH) | Mail | 4 | „Music Time Machine", >1.700 Events |
| DJ Matthias (Maxday) | Hochzeit | Wien (AT) | Mail | 4 | „Gigi D'Agostino mit serbischem Kolo" — sehr gemischte Crowds |

### 8.2 Acht personalisierte Erst-Nachrichten (Top-8 nach fitScore)

> Ton wie §7.1, jede auf den konkreten Hook gemünzt. Signatur + Footer (§7.0) immer anhängen. Erst senden, wenn die Einwilligung steht (oder als Warm-Variante bei bekanntem Kontakt).

**1) Ben — DJ Lazy Bee (Hamburg) · Betreff: Vom Club aufs Pult — kurz, Ben**
> Hey Ben,
> du bist den Weg vom Club rüber auf Hochzeiten und Privatevents gegangen — genau meiner. Im Club trägt dich der Vibe, auf der Hochzeit kippt eine Fläche schneller, als dir lieb ist, und im Übergang ist die eine Frage: welcher Song hält die Leute jetzt?
> Ich leg selbst auf Hochzeiten auf (Rheinhessen) und hab mir für genau den Moment was gebaut: BeatControl. Gäste voten still per QR, auf deinem iPad steht der Favorit mit Stimmenzahl ganz oben — du siehst sofort, ob das einer will oder die halbe Feier. Entscheiden tust du, wie immer; läuft neben Rekordbox/Serato/Engine.
> Ehrlich: noch neu, bisher ein Kollege live getestet (Hochzeit, ~120 Gäste). Ich setz für die Saison 2 DJs als Piloten auf — die Saison-Pro aufs Haus, und ich bau dir alles beim echten Gig vor Ort auf. Dafür ehrlich: taugt's was?
> Bock auf einen Platz? Ein kurzes „ja" reicht.

**2) Villy — DJ ViLLY (NRW, Vinyl) · Betreff: Für den Kurator: die Stimmen aus dem Raum, Villy**
> Hey Villy,
> „kein Ballermann, kein Schlager, kein Dorffest", 100% live von der Platte — du kuratierst hart, und genau deshalb schreib ich dir. Ein Wunsch sagt dir nicht, ob ihn einer will oder die halbe Feier. Ein Zuruf erst recht nicht.
> Ich leg selbst auf Hochzeiten auf und hab BeatControl gebaut: Gäste voten still per QR, du siehst den Favoriten mit Stimmenzahl auf dem iPad — was nicht in deine Linie passt, wischst du mit einem Klick weg, geräuschlos, niemand sieht's. Kein Jukebox-Ding: das Pult bleibt deins, es flüstert dir nur zu, was die Fläche gerade trägt. Deine Kuration bleibt der Maßstab.
> Noch neu, ein Kollege hat's live getestet. Ich setz 2 DJs als Saison-Piloten auf — Pro aufs Haus, Setup vor Ort beim echten Gig, du sagst ehrlich, ob's taugt. Magst du einen Platz?

**3) Julian Hügelmeyer — JH Entertainment (Osnabrück/Münster) · Betreff: DJ + Mikro: was das Publikum gerade will, Julian**
> Hey Julian,
> du verbindest DJ-Set und Live-Moderation — da ist „das Publikum will gerade…" kein Floskel, sondern dein Werkzeug. Nur: woran machst du im Moment fest, was es gerade will, ohne ans Mikro zu raten?
> Ich leg selbst auf Hochzeiten auf und hab BeatControl gebaut: Gäste voten still per QR, der Favorit steht mit Stimmenzahl auf deinem iPad — du siehst, ob ein Wunsch von einem kommt oder von der halben Feier, und kannst es sogar moderativ aufgreifen. Entscheiden tust du, wie immer; läuft neben Rekordbox/Serato/Engine.
> Noch neu — ein Kollege hat's live auf einer Hochzeit getestet. Ich setz 2 Saison-Piloten auf: Pro aufs Haus, ich bau vor Ort auf, du gibst ehrliches Feedback. Klingt das nach was für deinen nächsten Gig?

**4) Tim Turner (Stuttgart) · Betreff: Für jemand, der über Musik nachdenkt — kurz, Tim**
> Hey Tim,
> Mixed-Music auf der Hochzeit, privat Vocal-/Balearic-House — du denkst über Musik nach, nicht nur über die nächste Schublade. Deshalb interessiert mich genau dein Blick auf das hier.
> Ich leg selbst auf Hochzeiten auf und hab BeatControl gebaut: Gäste voten still per QR, auf dem iPad steht der Favorit mit Stimmenzahl — du unterscheidest Einzelwunsch von Mehrheit, bevor du im Übergang entscheidest. Spickzettel, den nur du liest; was nicht passt, ein Klick weg. Läuft neben Rekordbox/Serato/Engine, dein Gespür bleibt der Maßstab.
> Noch neu, ein Kollege live getestet. 2 Saison-Pilot-Plätze: Pro aufs Haus, Setup vor Ort beim echten Gig, dafür dein ehrliches Detail-Feedback — das wäre mir bei dir besonders viel wert. Magst du einen?

**5) Sina Klaizer — DJane (Allgäu) · Betreff: Berg-Hochzeit, gemischte Crowd — die Stimmen aufs iPad, Sina**
> Hey Sina,
> „Passion – Experience – Elegance" und Berg-Hochzeiten im Allgäu — da sitzt oft eine bunt gemischte Gesellschaft, und im Übergang ist die Frage, was diese Crowd gerade trägt.
> Ich leg selbst auf Hochzeiten auf und hab BeatControl gebaut: Gäste voten still per QR vom Handy, der Favorit steht mit Stimmenzahl auf deinem iPad — du siehst sofort, ob ein Wunsch von einem kommt oder von der halben Feier. Diskret und anonym, niemand kommt ans Pult, du entscheidest wie immer; läuft neben Rekordbox/Serato/Engine.
> Noch neu — bisher ein Kollege live getestet. Ich setz 2 DJs als Saison-Piloten auf: Pro aufs Haus, ich richte alles beim echten Gig vor Ort ein, du sagst ehrlich, ob's taugt. Bock auf einen Platz?

**6) Freddy Arevalo — Einfach Freddy (Frankfurt/Rhein-Main) · Betreff: Nachbar-DJ aus Rheinhessen — kurz, Freddy**
> Hey Freddy,
> „Club-Vibes auf Hochzeitsniveau" und das Lesen von Crowd und Tanzfläche — wann ein Song wirken soll, wann eskaliert wird: genau das Gespür meine ich. Ich leg selbst auf Hochzeiten auf, quasi nebenan in Rheinhessen.
> Ich hab BeatControl gebaut, ein zweites Signal für genau den Moment: Gäste voten still per QR, der Favorit steht mit Stimmenzahl auf deinem iPad — du siehst, ob das einer will oder die halbe Feier, und entscheidest wann eskaliert wird, wie immer. Verstärker, kein Ersatz; läuft neben Rekordbox/Serato/Engine.
> Noch neu, ein Kollege hat's live getestet. Ich setz 2 Saison-Piloten auf — Pro aufs Haus, Setup vor Ort. Weil wir quasi Nachbarn sind: ich komm gern persönlich vorbei und bau's bei deinem nächsten Gig auf. Magst du?

**7) Dennis Stock — DJ Stoggi (FFM/Mainz/Wiesbaden) · Betreff: Club-Residenz → Hochzeit, und das Gespür dazwischen — Dennis**
> Hey Dennis,
> Club-Residenzen seit 2010 und Erfolg über „Vielseitigkeit, gute Technik und Gespür für die Crowd" — das ist fast meine Bio, ich bin den Club→Event-Weg auch gegangen und leg in Rheinhessen auf, also quasi nebenan.
> Ich hab BeatControl gebaut: Gäste voten still per QR, auf dem iPad steht der Favorit mit Stimmenzahl — im Übergang siehst du, ob ein Wunsch von einem kommt oder von der halben Feier. Dein Gespür bleibt der Chef, das ist nur ein Sinn mehr; läuft neben Rekordbox/Serato/Engine, was nicht passt ist einen Klick weg.
> Noch neu, ein Kollege live getestet. 2 Saison-Pilot-Plätze: Pro aufs Haus, ich bau beim echten Gig vor Ort auf — bei der Nähe gern persönlich. Dafür sagst du ehrlich, ob's taugt. Bock auf einen?

**8) Alexander Pavel (Nürnberg) · Betreff: Live-Mixing statt Playlist — ein Signal dazu, Alexander**
> Hey Alexander,
> du setzt bewusst auf Live-Mixing statt fertige Playlist und liest die emotionale Temperatur des Raums — und genau da dockt das hier an, ohne dir was wegzunehmen.
> Ich leg selbst auf Hochzeiten auf und hab BeatControl gebaut: Gäste voten still per QR, der Favorit steht mit Stimmenzahl auf deinem iPad — du liest den Raum wie immer, nur mit einem Sinn mehr, und siehst, ob ein Wunsch von einem kommt oder von der halben Feier. Kein Jukebox-Modus, du mixt und entscheidest wie immer; läuft neben Rekordbox/Serato/Engine.
> Noch neu — ein Kollege hat's live auf einer Hochzeit getestet. Ich setz 2 DJs als Saison-Piloten auf: Pro aufs Haus, Setup vor Ort beim echten Gig, dafür dein ehrliches Feedback. Klingt das nach was für deinen nächsten Gig?

---

## 9. Conversion-Funnel & KPIs

**Reihenfolge-Entscheidung:** **Pilot-Track (`/pilot`) zuerst** — 0 zahlende Kunden, 0 öffentlicher Proof. Erst wenn 2–3 belegte Pilot-Erfolge stehen, Self-Serve (`/start` → 19€/49,99€) + Multiplikator (Mike-Hoffmann-Akademie, ~516 Schüler) scharfschalten.

| # | Stufe | Ziel-Übergang | Rechtsstatus |
|---|---|---|---|
| 0 | Sichtbarkeit / Lead-Quelle | DJ wird aufmerksam | §7 unkritisch |
| 1 | Erstkontakt (einwilligungserzeugend) | DJ bittet selbst um Infos | öffentlich/permission |
| 2 | Antwort / Reply | warmer, eingewilligter Lead | 1:1 erst NACH Opt-in |
| 3 | Funnel `/start` oder `/pilot` | geführte Selbst-Qualifikation | eigene Property |
| 4 | Anmeldung (Google-OAuth) | Account, Event vorbefüllt | sicher |
| 5 | Onboarding-Call (15 min) | erstes echtes Event terminiert | sicher |
| 6 | **Erstes Event live** | Aktivierung (Kern-Conversion) | sicher |
| 7 | Testimonial / Referral-Loop | O-Ton + Peer-Weitergabe | freigabebasiert |
| → | Monetarisierung | Free→PerUse 19€ / Pro | nach Stripe-KYC |

**Realistische Conversion (Kohorte: 40 erlaubte Erstkontakte, konservativ):**

| Übergang | Rate | aus 40 |
|---|:--:|:--:|
| Erstkontakt → Reply/Opt-in | 15–25% | ~8 |
| Reply → Funnel gestartet | 50–60% | ~5 |
| Funnel → Anmeldung | 50–60% | ~3 |
| Anmeldung → Onboarding-Call | 50–60% | ~2 |
| Onboarding → erstes Event live | 60–70% | ~1–2 |
| **Erstkontakt → aktives Live-Event** | **~3–5%** | **1–2 aktive DJs** |
| Live-Event → Testimonial freigegeben | 50–70% | ~1 |
| Testimonial-DJ → ≥1 Empfehlung | 40–60% | ~0,5–1 |

**Kanal-Benchmarks (Discovery):** Empfehlung/Peer ~100% (dünn skalierbar) · Direkt-Outreach nach Opt-in = einziger zweiter messbarer Kanal · Self-Discovery/Google kalt ~0% (nicht bespielen).

**Monetarisierung:** Piloten zahlen 0€. Nach belegtem Erfolg Pilot→zahlend realistisch 30–50%, sobald Stripe live. **Erstes Ziel ist nicht Umsatz, sondern 2–3 belegte Live-Events + freigegebene O-Töne** — das ist der Engpass, der alles entriegelt.

**Nordstern-KPI:** Anzahl echter Live-Events auf echten Hochzeiten/Feiern (= Aktivierung). Sekundär: freigegebene Testimonials, dann zahlende DJs.

**CRM (Solo, kostenlos):** Google Sheet, Tab „Leads" (Spalten u.a. `ICP_Fit A/B/DQ`, `Opt_in NEIN/JA+Datum`, `Stage 0–7`, `Track Pilot/Self-Serve`, `Followup_Datum`, `Plan`, `Testimonial`) + Tab „Funnel" (Wochen-KPIs). Bedingte Formatierung: `Followup_Datum < heute` → rot, `Opt_in = NEIN` → Warnung (nie versehentlich werblich mailen). Reminder via `Followup_Datum`-Filter + Google-Kalender.

**Follow-up-Kadenz:** Vor Opt-in nur 1 öffentlicher Touch + ggf. 1 Postkarte, kein Nachfassen im privaten Postfach (max. 1 weiterer organischer Touch nach ~10–14 Tagen). Nach Opt-in: schlanke 4-Touch-Sequenz (sofort <2h Einzeiler+Link → +3 Tage Value-Punkt+Frage nach Event-Datum → +7 Tage Peer-Proof+Knappheit → +14 Tage Soft-Close, sauberer Exit). Danach „nurture", kein aktives Nachfassen.

**Testimonial-/Referral-Mechanik (ehrlich):** Erwartung im Onboarding setzen („nach dem Event 2 ehrliche Sätze") → frisch abgreifen (<24–72h) → ausdrücklich freigeben lassen (Name+Satz+Location, wie bei Daniel ausstehend) → einsetzen (Reference-Card, Landing sobald Stats über Schwelle). Referral im selben Erfolgs-Gespräch: „Kennst du jemanden mit demselben Übergangs-Problem? Ich pitche niemanden zu." → Empfehlung macht aus kaltem Lead einen warmen auf Stufe 2. Multiplikator (Akademie) erst nach 2–3 belegten Erfolgen, nie vorgezogen.

---

## 10. 14-Tage-Action-Plan

> **Logik:** Tag 1–3 entriegeln die Blocker (sonst läuft nichts). Sichtbarkeit + Warmup laufen ab Tag 1 parallel, weil sie Zeit brauchen. Echte 1:1-Mails frühestens, wenn Warmup ≥2 Wochen lief — d.h. die ersten Erstkontakte laufen über öffentliche Kanäle/Postkarte, nicht über Mail.

| Tag | Robin-Action | KI-Action |
|---|---|---|
| **1** | `www`-Redirect auf `beatcontrol.io` schließen; `/pilot` end-to-end auf Live-Domain durchklicken | Pre-Flight-Check: `/pilot` & `/start` live testen, kaputte Links/Texte gegen Master abgleichen, Mängelliste |
| **2** | Versand-Domain `trybeatcontrol.com` registrieren + 301 auf `beatcontrol.io`; Google Workspace + `robin@try…` + 2FA | DNS-Werte (SPF/DKIM/DMARC) fertig formatiert liefern; mail-tester-Checkliste |
| **3** | DNS eintragen (Verify, MX, SPF, DKIM→„Authentifizierung starten", DMARC p=none); Warmup-Tool (Lemlist/Instantly) verbinden, **Warmup AN** | DNS via `dig` verifizieren; Signatur+Footer mit Robins echten Daten finalisieren |
| **4** | Insta Business-Account + Link-in-Bio → `/pilot`; Beitritt discjockey.de + „DJs und ihre Technik" + BVD prüfen | Content-Plan 14 Tage (Reels/Posts: „so handhabe ich den Übergang"), 3 Post-Entwürfe + Hashtag-Set |
| **5** | Google-Sheet-CRM anlegen (Tabs Leads/Funnel), 29 Leads importieren | CRM-Template + alle 29 Leads vorausgefüllt (ICP_Fit, Quelle, Kanal, Opt_in=NEIN) liefern |
| **6** | Erste 5–8 Postkarten an Top-Mail-Leads ohne öffentliche Insta-Präsenz raus (erlaubter Erstkontakt) | Postkarten-Text (kurz, „schick mir Infos auf trybeatcontrol.com/pilot") + Adress-Recherche aus Impressen |
| **7** | 1 Mehrwert-Post in einer FB-Gruppe (Regeln prüfen!); 5–10 öffentliche Insta-Interaktionen bei Top-Leads | Gruppen-Post-Entwurf (Frage statt Pitch) + Kommentar-Vorlagen je Lead-Hook |
| **8** | Tagesblock öffentliche Interaktionen (Top-8 Leads); eingehende „schick mir Infos" sofort screenshoten → CRM `Opt_in=JA` | eingehende Replies einsortieren; je warmem Lead die passende Erst-Nachricht aus §8.2 personalisieren |
| **9** | Robins eigenes nächstes Gig als Referenz #2 terminieren/vorbereiten (Echtdaten, 0€) | Onboarding-Call-Leitfaden (15 min) + „erstes Event mit Datum festnageln"-Checkliste |
| **10** | Warmup läuft weiter; Status-Review CRM (wer warm, wer offen) | Wochen-KPI-Auswertung Tab „Funnel"; Nachfass-Liste (Followup_Datum) |
| **11** | An warme Leads (Opt-in) erste 1:1-Mail (§8.2) — **nur** wenn Warmup ≥ Woche 2 sauber | mail-tester 10/10 final bestätigen; Touch-2/3-Sequenz terminieren |
| **12** | Daniel um O-Ton-Freigabe bitten (Name + 1 Satz, Schloss Platen) | Freigabe-Mikrotext für Daniel + Reference-Card-Entwurf vorbereiten |
| **13** | Onboarding-Calls mit warmen Interessenten terminieren; Firmenfeier-Angebot gezielt streuen | Termin-Vorschläge; Firmenfeier-Pain-Snippet für Outreach |
| **14** | Retro: belegte Erstkontakte/Replies/Opt-ins zählen; Plan Woche 3–4 (Pilot-Onboarding) | Funnel-Raten gegen §9-Benchmarks; Empfehlung, welche 2 Piloten zuerst onboarden + nächste 14-Tage-Schritte |

**Was bewusst NICHT in den 14 Tagen passiert:** keine Self-Serve-Monetarisierung (Stripe-KYC erst danach), kein Akademie-Multiplikator (erst nach 2–3 belegten Erfolgen), keine Kalt-Mail/Kalt-DM/Kalt-Telefon (rechtswidrig). Engpass bleibt Nutzung — der ganze Plan zielt auf **das erste echte fremde Live-Event**, nicht auf Umsatz.