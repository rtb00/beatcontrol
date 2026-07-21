'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';
import { Card, NavBar, buttonVariants } from '@/app/components/ui';

export default function ViboAlternative() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';

  const rows = [
    { feature: 'Live-Voting der Gäste im Saal', vibo: '✕ (Fokus Vorbereitung)', beatcontrol: '✓ Kern-Feature', winner: 'beatcontrol' },
    { feature: 'Nächster Song vom Publikum bestätigt', vibo: '✕', beatcontrol: '✓ live sortiert', winner: 'beatcontrol' },
    { feature: 'Pricing pro DJ/Monat',    vibo: '$179 (~€165)', beatcontrol: '€59,99 (Pro)', winner: 'beatcontrol' },
    { feature: 'Single-Event-Option',     vibo: '✕',           beatcontrol: '€19 einmalig', winner: 'beatcontrol' },
    { feature: 'Whitelabel für DJ-Kollektive', vibo: '✕',           beatcontrol: '€149 Team',    winner: 'beatcontrol' },
    { feature: 'Hosting in EU',           vibo: 'Unklar (US)',   beatcontrol: 'EU (Vercel + Neon)', winner: 'beatcontrol' },
    { feature: 'Deutsche AGB / Support',  vibo: '✕',           beatcontrol: '✓',              winner: 'beatcontrol' },
    { feature: 'Native App nötig',        vibo: 'Ja',            beatcontrol: 'Nein, Web-App',  winner: 'beatcontrol' },
    { feature: 'Spotify-Direkt-Sync',     vibo: 'Ja, native',    beatcontrol: 'Über Deezer-Match', winner: 'vibo' },
    { feature: 'Timeline-Templates',      vibo: '100+',          beatcontrol: 'Roadmap Q4 2026', winner: 'vibo' },
    { feature: 'Track Record',            vibo: '6+ Jahre, 4-5k DJs', beatcontrol: 'Pilot-Saison 2026', winner: 'vibo' },
    { feature: 'DSGVO-Hash für Gäste-IPs', vibo: 'Unklar',       beatcontrol: 'SHA-256 + Event-Salt', winner: 'beatcontrol' },
  ];

  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">
      <NavBar>
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          {brandName}
        </Link>
        <Link href="/pricing" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
          Tarife ansehen
        </Link>
      </NavBar>

      <article className="max-w-3xl mx-auto px-4 py-20 md:py-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-5">
          Vergleich
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight mb-6 text-glow-gold">
          BeatControl vs. Vibo: die ehrliche Gegenüberstellung
        </h1>
        <p className="text-fg-muted text-lg leading-relaxed mb-6">
          Der wichtigste Unterschied steht in keiner Tabelle: Vibo löst die <strong className="text-fg">Vorbereitung</strong>: Playlists, Timelines, Abstimmung mit dem Brautpaar vor der Hochzeit. BeatControl löst den <strong className="text-fg">Live-Moment</strong>: die Sekunde am Pult, in der du entscheidest, welcher Song als Nächstes läuft, und deine Gäste das gerade per Voting für dich bestätigt haben.
        </p>
        <p className="text-fg-muted text-lg leading-relaxed mb-12">
          Anders gesagt: Deine Playlist baust du in Spotify oder Vibo. Was im Saal gerade wirklich zieht, zeigt dir BeatControl in Echtzeit. Das ist keine billigere Vibo-Kopie, das ist ein anderer Job. Trotzdem hier der faire Vergleich Punkt für Punkt.
        </p>

        <div className="overflow-x-auto rounded-3xl border border-line bg-panel shadow-lg shadow-black/30 mb-12">
          <table className="w-full text-sm">
            <thead className="bg-panel-elevated text-fg">
              <tr>
                <th className="text-left px-4 py-3 font-display font-semibold uppercase">Feature</th>
                <th className="text-left px-4 py-3 font-display font-semibold uppercase">Vibo</th>
                <th className="text-left px-4 py-3 font-display font-semibold uppercase">BeatControl</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.map((r) => (
                <tr key={r.feature}>
                  <td className="px-4 py-3 font-medium">{r.feature}</td>
                  <td className={`px-4 py-3 ${r.winner === 'vibo' ? 'text-turquoise font-semibold' : 'text-fg-muted'}`}>
                    {r.vibo}
                  </td>
                  <td className={`px-4 py-3 ${r.winner === 'beatcontrol' ? 'text-turquoise font-semibold' : 'text-fg-muted'}`}>
                    {r.beatcontrol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-display text-2xl font-bold uppercase mb-4">Wann Vibo besser ist</h2>
        <p className="text-fg-muted leading-relaxed mb-6">
          Wenn du primär US-/UK-Hochzeiten machst, Spotify als Library-Lock-In willst und 100+ Timeline-Templates ein zentrales Feature ist, dann ist Vibo die etabliertere Wahl. Auch wenn du mit einem 6-Jahre-Track-Record arbeiten möchtest, hat Vibo dort den Vorteil.
        </p>

        <h2 className="font-display text-2xl font-bold uppercase mb-4 mt-12">Wann BeatControl die bessere Wahl ist</h2>
        <ul className="list-disc pl-6 space-y-3 text-fg-muted leading-relaxed mb-6">
          <li>
            <strong className="text-fg">Du willst Hilfe im Live-Moment, nicht nur bei der Vorbereitung.</strong> Genau hier sitzt BeatControls Kern: Gäste voten live, der bestätigte nächste Song steht oben in deiner Liste. Das hat Vibo nicht, und Spotify auch nicht.
          </li>
          <li>
            <strong className="text-fg">Du arbeitest im DACH-Markt.</strong> Deutsche AGB, deutscher Support, EU-Hosting, deutsche Brautpaare: BeatControl ist dafür gebaut, Vibo nicht.
          </li>
          <li>
            <strong className="text-fg">Du willst nicht €165/Mo zahlen.</strong> BeatControl Pro €59,99/Mo ist dreimal günstiger. Für DJs mit 20-30 Hochzeiten/Jahr ist das ~€1.500 Jahresunterschied.
          </li>
          <li>
            <strong className="text-fg">Du willst Event-Pass-Modell.</strong> Vibo zwingt dich ins Abo. BeatControl gibt deinen Brautpaaren die Option, für ihre Hochzeit einmalig €19 zu zahlen.
          </li>
          <li>
            <strong className="text-fg">Du leitest ein DJ-Kollektiv.</strong> Whitelabel-Tier (€149/Mo) gibt es bei Vibo nicht. BeatControl Team macht dich zum Reseller: eigene Subdomain, eigenes Branding, Sub-Accounts.
          </li>
          <li>
            <strong className="text-fg">Deine Brautpaare sollen keine App downloaden müssen.</strong> BeatControl ist Web-First. Gäste scannen QR, öffnen Browser, los geht's. Vibo zwingt zur Native-App-Installation.
          </li>
        </ul>

        <h2 className="font-display text-2xl font-bold uppercase mb-4 mt-12">Was wir nicht behaupten</h2>
        <p className="text-fg-muted leading-relaxed mb-6">
          BeatControl ist neu, 2026 live gegangen. Bislang eine echte Hochzeit im Echtbetrieb, auf der ein DJ sich live darauf verlassen hat. Vibo hat tausende Nutzer und Jahre Track Record. Wenn dir eine lange Referenzliste wichtiger ist als der Live-Vorteil, ist Vibo die sicherere Wahl.
          <br /><br />
          Aber: wir sind nicht VC-finanziert mit Burn-Rate-Risiko. Solo-Founder, profitable Lifestyle-Ambition. In 12 Monaten existiert BeatControl, weil ich rechne, nicht weil ich Investor-Druck habe.
        </p>

        <Card elevated className="mt-16 text-center p-8">
          <h3 className="font-display text-2xl md:text-3xl font-bold uppercase mb-4 text-glow-gold">
            Kostenlos testen, dann entscheiden.
          </h3>
          <p className="text-fg-muted mb-8 leading-relaxed">
            BeatControl Pro ist 30 Tage Geld-zurück-Garantie. Wenn du Vibo vorziehst, kein Schaden.
          </p>
          <Link href="/auth/signin?callbackUrl=/dj" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            BeatControl kostenlos starten
          </Link>
        </Card>

        <p className="text-xs text-fg-muted mt-10 text-center">
          Quellen: <a href="https://vibodj.com/pricing" className="underline" target="_blank" rel="noreferrer">vibodj.com/pricing</a> (Stand Mai 2026) · eigene Recherche.
          Vibo ist ein Markenname der Vibo App Inc. Wir haben keinerlei Verbindung zu Vibo.
        </p>
      </article>

      <footer className="bg-base-alt text-fg-muted py-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-bold text-fg">{brandName}</span>
          <p className="text-xs text-center">© 2026 {brandName}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/about" className="hover:text-turquoise transition-colors">Über uns</Link>
            <Link href="/impressum" className="hover:text-turquoise transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-turquoise transition-colors">Datenschutz</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
