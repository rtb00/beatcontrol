// llms.txt: kompakte, maschinenlesbare Produktbeschreibung für KI-Suchsysteme
// (ChatGPT Search, Perplexity, Claude, Google AI Overviews). Muss inhaltlich
// mit der Landingpage und /pricing übereinstimmen.
const CONTENT = `# BeatControl

> Musikwunsch- und Live-Voting-Web-App für Hochzeits-DJs in Deutschland. Gäste wünschen Songs per QR-Code und voten vom Handy, der DJ sieht live sortiert nach Stimmen, welcher Song als Nächstes zieht. Kein App-Download, läuft im Browser neben Rekordbox und Serato.

## Was BeatControl macht

- Gäste scannen einen QR-Code, schlagen Songs vor und voten für Vorschläge anderer (10 Sekunden, ohne App, ohne Account, anonym)
- Der DJ sieht die Wunschliste live auf iPad oder Laptop, sortiert nach Stimmen
- Der DJ entscheidet weiterhin selbst, was gespielt wird; unpassende Wünsche entfernt er mit einem Klick
- Song-Suche mit Titelbildern über Deezer-Katalog, Export der Wünsche zur Nachbereitung

## Zielgruppe

Hochzeits-DJs, Party- und Firmenfeier-DJs im deutschsprachigen Raum sowie Brautpaare, die ihrem DJ das Tool schenken. Team-Tarif für DJ-Kollektive und Eventagenturen (Whitelabel, Sub-Accounts, eigene Subdomain).

## Preise (https://beatcontrol.io/pricing)

- Free: 0 €, für immer kostenlos, 1 aktives Event, bis zu 30 Songwünsche
- Je Hochzeit: 19 € einmalig, kein Abo, unbegrenzte Songwünsche, eigenes Branding
- Pro: 49,99 €/Monat bei jährlicher Abrechnung (monatlich 59,99 €), unbegrenzte Events, 30 Tage Geld-zurück-Garantie
- Team: 124 €/Monat bei jährlicher Abrechnung (monatlich 149 €), Whitelabel für DJ-Kollektive

## Abgrenzung

BeatControl ist eine deutsche Vibo-Alternative mit Fokus auf den Live-Moment am Pult (Voting während der Feier), nicht auf Playlist-Vorbereitung. Deutsche AGB, EU-Hosting, DSGVO-konform anonymisierte Gastdaten.

## Wichtige Seiten

- https://beatcontrol.io — Produkt für DJs
- https://beatcontrol.io/brautpaar — Angebot für Brautpaare
- https://beatcontrol.io/pricing — Tarife im Vergleich
- https://beatcontrol.io/vibo-alternative — Vergleich mit Vibo
- https://beatcontrol.io/pilot — Pilot-Programm für Hochzeits-DJs

Kontakt: nibor.bauer1+beatcontrol@gmail.com
`;

export function GET() {
  return new Response(CONTENT, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
