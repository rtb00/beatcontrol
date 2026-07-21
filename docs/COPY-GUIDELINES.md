# BeatControl Copy-Guidelines

Verbindliche Sprach- und Claim-Regeln für alle sichtbaren Texte (Landingpage,
Marketing-Seiten, App-UI, Metadata, JSON-LD, llms.txt). Stand: Juli 2026.
Änderungen an diesen Regeln nur nach Abstimmung mit Robin.

## Kern-Claims (die eine abgestimmte Formulierung verwenden, nicht variieren)

| Claim | Abgestimmte Formulierung |
|---|---|
| Was Gäste tun | „Gäste wünschen Songs per QR-Code und voten vom Handy" |
| Was der DJ sieht | „Der DJ sieht live, welcher Song die Tanzfläche füllt" bzw. „…sortiert nach Stimmen, was die Gäste hören wollen" |
| Kontrolle | „Du entscheidest, was gespielt wird" / „Ob du zugreifst, entscheidest du" |
| Technik | „Ohne App, läuft im Browser neben Rekordbox & Serato" |
| Einstieg | „Kostenlos starten" / „Free-Tarif für immer kostenlos, keine Kreditkarte nötig" |
| Herkunft | „Gebaut von DJs für DJs" (nur einmal pro Seite verwenden) |

## No-Go-Liste (nie verwenden)

| Verboten | Warum | Stattdessen |
|---|---|---|
| „zieht" / „ziehen" (im Sinn von „gut ankommen") | Umgangssprachlich, unklar | „ankommt", „die Tanzfläche füllt", „was die Gäste hören wollen" (kontextabhängig) |
| Em-Dash / Spiegelstrich („—") | Explizite Stilvorgabe | Punkt, Komma oder Doppelpunkt |
| Punkt am Ende von Überschriften | Explizite Stilvorgabe | Ohne Satzzeichen; zwei Teilsätze mit Komma verbinden |
| Unbelegter Social Proof („DJs nutzen längst…", „Meist gewählt", „Du bist in guter Gesellschaft") | Nicht belegbar (Stand Juli 2026: 1 externer Nutzer), zerstört Vertrauen | Ehrliche Claims: Pilot-Status benennen, Risiko-Reversal („Free für immer, keine Kreditkarte") |
| Startup-/Tech-Jargon („VC-finanziert", „Burn-Rate", „Bootstrapped", „Library-Lock-In", „Reseller", „Sub-Accounts" ohne Erklärung) | Zielgruppe ist der 40-jährige Nachbarschafts-DJ, nicht Tech-Szene | Klartext („Ich finanziere BeatControl selbst", „eigene Zugänge für jeden deiner DJs") |
| „Akademie(n)" als Zielgruppe | Klingt nach Ausbildungsstätte | „DJ-Kollektive", „Eventagenturen" |
| Alte Tarifnamen „Studio", „Pro Hochzeit", „Event-Pass" (sichtbar) | Umbenannt | „Team", „Je Hochzeit" (interne Enums `studio`/`event_pass` bleiben) |
| „Einwände" für die FAQ-Sektion | Negativ gerahmt | „Die häufigsten Fragen" |
| Englische Marketing-Begriffe („Co-Branded Visibility") | Bruch mit dem deutschen, einfachen Ton | Deutsche Entsprechung |
| meta keywords im HTML | Seit 2009 wirkungslos, signalisiert veraltetes SEO | Weglassen |

## Ton

- Direkt, konkret, ehrlich. Kurze Sätze, maximal zwei Gedanken pro Satz.
- Deutsch mit echten Umlauten im Text; URLs bleiben ASCII (ae/oe/ue).
- Der Leser ist ein DJ, der Hochzeiten nebenberuflich oder als kleines
  Business macht: keine Fachbegriffe voraussetzen, keine Buzzwords.
- Zahlen und überprüfbare Aussagen statt Superlativen („72 Songwünsche auf
  einer echten Hochzeit" schlägt „das beste Tool").

## Absicherung

Sichtbare Texte sind per AST-Regression eingefroren
(`node scripts/text-baseline.mjs check`). Jede gewollte Textänderung braucht
danach ein bewusstes `baseline`-Update. Kontraste prüft
`node scripts/contrast-check.mjs`.
