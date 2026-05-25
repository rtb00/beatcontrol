'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';

export default function ViboAlternative() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';

  const rows = [
    { feature: 'Live-Voting der Gäste im Saal', vibo: '✕ (Fokus Vorbereitung)', beatcontrol: '✓ Kern-Feature', winner: 'beatcontrol' },
    { feature: 'Nächster Song vom Publikum bestätigt', vibo: '✕', beatcontrol: '✓ live sortiert', winner: 'beatcontrol' },
    { feature: 'Pricing pro DJ/Monat',    vibo: '$179 (~€165)', beatcontrol: '€59,99 (Pro)', winner: 'beatcontrol' },
    { feature: 'Single-Event-Option',     vibo: '✕',           beatcontrol: '€19 einmalig', winner: 'beatcontrol' },
    { feature: 'Whitelabel für Akademien', vibo: '✕',           beatcontrol: '€149 Studio',    winner: 'beatcontrol' },
    { feature: 'Hosting in EU',           vibo: 'Unklar (US)',   beatcontrol: 'EU (Vercel + Neon)', winner: 'beatcontrol' },
    { feature: 'Deutsche AGB / Support',  vibo: '✕',           beatcontrol: '✓',              winner: 'beatcontrol' },
    { feature: 'Native App nötig',        vibo: 'Ja',            beatcontrol: 'Nein, Web-App',  winner: 'beatcontrol' },
    { feature: 'Spotify-Direkt-Sync',     vibo: 'Ja, native',    beatcontrol: 'Über Deezer-Match', winner: 'vibo' },
    { feature: 'Timeline-Templates',      vibo: '100+',          beatcontrol: 'Roadmap Q4 2026', winner: 'vibo' },
    { feature: 'Track Record',            vibo: '6+ Jahre, 4-5k DJs', beatcontrol: 'Pilot-Saison 2026', winner: 'vibo' },
    { feature: 'DSGVO-Hash für Gäste-IPs', vibo: 'Unklar',       beatcontrol: 'SHA-256 + Event-Salt', winner: 'beatcontrol' },
  ];

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">
            {brandName}
          </Link>
          <Link
            href="/pricing"
            className="text-sm px-4 py-1.5 rounded-full bg-[#c9a961] text-white hover:bg-[#b8953a] transition-colors"
          >
            Tarife ansehen
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-4 py-20 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-5">
          Vergleich
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-6">
          BeatControl vs. Vibo — die ehrliche Gegenüberstellung
        </h1>
        <p className="text-[#8a7a6e] text-lg leading-relaxed mb-6">
          Der wichtigste Unterschied steht in keiner Tabelle: Vibo löst die <strong className="text-[#2a2520]">Vorbereitung</strong> — Playlists, Timelines, Abstimmung mit dem Brautpaar vor der Hochzeit. BeatControl löst den <strong className="text-[#2a2520]">Live-Moment</strong> — die Sekunde am Pult, in der du entscheidest, welcher Song als Nächstes läuft, und deine Gäste das gerade per Voting für dich bestätigt haben.
        </p>
        <p className="text-[#8a7a6e] text-lg leading-relaxed mb-12">
          Anders gesagt: Deine Playlist baust du in Spotify oder Vibo. Was im Saal gerade wirklich zieht, zeigt dir BeatControl — in Echtzeit. Das ist keine billigere Vibo-Kopie, das ist ein anderer Job. Trotzdem hier der faire Vergleich Punkt für Punkt.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-[#e8d9b8] bg-white shadow-sm mb-12">
          <table className="w-full text-sm">
            <thead className="bg-[#f4ede0] text-[#2a2520]">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Feature</th>
                <th className="text-left px-4 py-3 font-semibold">Vibo</th>
                <th className="text-left px-4 py-3 font-semibold">BeatControl</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e8d9b8]">
              {rows.map((r) => (
                <tr key={r.feature}>
                  <td className="px-4 py-3 font-medium">{r.feature}</td>
                  <td className={`px-4 py-3 ${r.winner === 'vibo' ? 'text-[#c9a961] font-semibold' : 'text-[#8a7a6e]'}`}>
                    {r.vibo}
                  </td>
                  <td className={`px-4 py-3 ${r.winner === 'beatcontrol' ? 'text-[#c9a961] font-semibold' : 'text-[#8a7a6e]'}`}>
                    {r.beatcontrol}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className="font-serif text-2xl font-bold mb-4">Wann Vibo besser ist</h2>
        <p className="text-[#8a7a6e] leading-relaxed mb-6">
          Wenn du primär US-/UK-Hochzeiten machst, Spotify als Library-Lock-In willst und 100+ Timeline-Templates ein zentrales Feature ist — dann ist Vibo die etabliertere Wahl. Auch wenn du mit einem 6-Jahre-Track-Record arbeiten möchtest, hat Vibo dort den Vorteil.
        </p>

        <h2 className="font-serif text-2xl font-bold mb-4 mt-12">Wann BeatControl die bessere Wahl ist</h2>
        <ul className="list-disc pl-6 space-y-3 text-[#8a7a6e] leading-relaxed mb-6">
          <li>
            <strong className="text-[#2a2520]">Du willst Hilfe im Live-Moment, nicht nur bei der Vorbereitung.</strong> Genau hier sitzt BeatControls Kern: Gäste voten live, der bestätigte nächste Song steht oben in deiner Liste. Das hat Vibo nicht — und Spotify auch nicht.
          </li>
          <li>
            <strong className="text-[#2a2520]">Du arbeitest im DACH-Markt.</strong> Deutsche AGB, deutscher Support, EU-Hosting, deutsche Brautpaare — BeatControl ist dafür gebaut, Vibo nicht.
          </li>
          <li>
            <strong className="text-[#2a2520]">Du willst nicht €165/Mo zahlen.</strong> BeatControl Pro €59,99/Mo ist dreimal günstiger. Für DJs mit 20-30 Hochzeiten/Jahr ist das ~€1.500 Jahresunterschied.
          </li>
          <li>
            <strong className="text-[#2a2520]">Du willst Event-Pass-Modell.</strong> Vibo zwingt dich ins Abo. BeatControl gibt deinen Brautpaaren die Option, für ihre Hochzeit einmalig €19 zu zahlen.
          </li>
          <li>
            <strong className="text-[#2a2520]">Du leitest eine DJ-Akademie.</strong> Whitelabel-Tier (€149/Mo) gibt es bei Vibo nicht. BeatControl Studio macht dich zum Reseller — eigene Subdomain, eigenes Branding, Sub-Accounts.
          </li>
          <li>
            <strong className="text-[#2a2520]">Deine Brautpaare sollen keine App downloaden müssen.</strong> BeatControl ist Web-First. Gäste scannen QR, öffnen Browser, los geht's. Vibo zwingt zur Native-App-Installation.
          </li>
        </ul>

        <h2 className="font-serif text-2xl font-bold mb-4 mt-12">Was wir nicht behaupten</h2>
        <p className="text-[#8a7a6e] leading-relaxed mb-6">
          BeatControl ist neu, 2026 live gegangen. Bislang eine echte Hochzeit im Echtbetrieb, auf der ein DJ sich live darauf verlassen hat. Vibo hat tausende Nutzer und Jahre Track Record. Wenn dir eine lange Referenzliste wichtiger ist als der Live-Vorteil, ist Vibo die sicherere Wahl.
          <br /><br />
          Aber: wir sind nicht VC-finanziert mit Burn-Rate-Risiko. Solo-Founder, profitable Lifestyle-Ambition. In 12 Monaten existiert BeatControl — weil ich rechne, nicht weil ich Investor-Druck habe.
        </p>

        <div className="bg-[#2a2520] text-[#faf6f0] rounded-2xl p-8 mt-16 text-center">
          <h3 className="font-serif text-2xl md:text-3xl font-bold mb-4">
            Kostenlos testen, dann entscheiden.
          </h3>
          <p className="text-[#a89786] mb-8 leading-relaxed">
            BeatControl Pro ist 30 Tage Geld-zurück-Garantie. Wenn du Vibo vorziehst, kein Schaden.
          </p>
          <Link
            href="/auth/signin?callbackUrl=/dj"
            className="inline-block px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors"
          >
            BeatControl kostenlos starten
          </Link>
        </div>

        <p className="text-xs text-[#8a7a6e] mt-10 text-center">
          Quellen: <a href="https://vibodj.com/pricing" className="underline" target="_blank" rel="noreferrer">vibodj.com/pricing</a> (Stand Mai 2026) · eigene Recherche.
          Vibo ist ein Markenname der Vibo App Inc. Wir haben keinerlei Verbindung zu Vibo.
        </p>
      </article>

      <footer className="bg-[#2a2520] text-[#8a7a6e] py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-[#faf6f0]">{brandName}</span>
          <p className="text-xs text-center">© 2026 {brandName}</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/about" className="hover:text-[#c9a961] transition-colors">Über uns</Link>
            <Link href="/impressum" className="hover:text-[#c9a961] transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[#c9a961] transition-colors">Datenschutz</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
