'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';

export default function AboutPage() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const isWhiteLabel = !!branding.subdomain;

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            {branding.brandingLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={branding.brandingLogoUrl} alt={brandName} className="h-8 w-auto object-contain" />
            ) : (
              <span className="font-serif text-xl font-bold tracking-tight">{brandName}</span>
            )}
          </Link>
          <Link
            href="/pricing"
            className="text-sm px-4 py-1.5 rounded-full border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-white transition-colors"
          >
            Tarife ansehen
          </Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-4 py-20 md:py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6">
          Über BeatControl
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-10">
          Gebaut von einem DJ, weil mich Wunsch-Chaos auf Hochzeiten nervte.
        </h1>

        <div className="prose prose-lg text-[#2a2520] leading-relaxed space-y-6">
          <p>
            Ich bin Robin Bauer, lebe in Mainz und bin seit Jahren in der DJ-Szene unterwegs — eher Club-Sets als Hochzeits-Premium, aber genug Hochzeiten gesehen, um das eine Muster zu erkennen:
          </p>

          <p className="text-xl font-serif italic text-[#8a7a6e]">
            Niemand löst das Musikwunsch-Problem.
          </p>

          <p>
            Brautpaar und Gäste schreiben Songwünsche in WhatsApp-Gruppen, auf Zetteln, rufen sie dem DJ zu. Der DJ versucht freundlich zu bleiben, den Mix zu halten und sich Wünsche zu merken. Eines davon klappt nicht. Am Ende des Abends sind Wünsche verloren, ein paar Gäste fühlen sich nicht gehört, die Tanzfläche kippt zwischen 23 und 24 Uhr ohne dass jemand weiß warum.
          </p>

          <p>
            Ich hab gedacht: das muss besser gehen.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Was BeatControl anders macht</h2>

          <p>
            Web-App, kein App-Download. Gäste scannen einen QR-Code, schlagen Songs vor, voten. Der DJ sieht alles live auf dem iPad neben dem Pult — sortiert nach Stimmen. Er spielt was passt, markiert gespielte Songs ab. Alle sehen sofort, dass ihr Wunsch durchkam.
          </p>

          <p>
            Die App informiert, sie entscheidet nicht. Der DJ bleibt der Profi. Aber er muss nicht mehr raten.
          </p>

          <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Pilot-Saison 2026</h2>

          <p>
            Erste echte Hochzeit lief im April 2026 auf Schloss Platen mit DJ Daniel Lemke. 64 Live-Songs in einer Nacht. Das Brautpaar wollte das System bis um drei Uhr morgens nicht abdrehen.
          </p>

          <p>
            Aktuell suche ich zwei weitere Hochzeits-DJs für Pilot-Slots Mai–Juli 2026. Kostenlose Pro-Lizenz im Tausch gegen ehrliches Feedback und Aftermovie-Schnipsel. Wenn das du sein könntest:{' '}
            <Link href="/auth/signin?callbackUrl=/dj" className="text-[#c9a961] underline">
              hier anmelden
            </Link>{' '}
            oder direkt schreiben an{' '}
            <a href="mailto:hallo@beatcontrol.io" className="text-[#c9a961] underline">
              hallo@beatcontrol.io
            </a>
            .
          </p>

          <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Was BeatControl nicht ist</h2>

          <ul className="list-disc pl-6 space-y-2 text-[#8a7a6e]">
            <li>Kein VC-finanziertes Startup mit Burn-Rate-Risiko. Bootstrapped, Solo-betrieben, profitable Lifestyle-Ambition.</li>
            <li>Keine US-Plattform mit DSGVO-Grauzone. Hosting in der EU, deutsche AGB, anonymisierte Gast-Daten via kryptographischem Hash.</li>
            <li>Keine native App mit App-Store-Friction. Web-First. Funktioniert auf jedem Handy seit 2018.</li>
            <li>Kein Pay-per-Vote-Modell. Brautpaar zahlt einmalig 19 €, DJ bekommt unbegrenzte Songs für seine Hochzeit. Fertig.</li>
          </ul>

          <h2 className="font-serif text-2xl font-bold mt-12 mb-4">Kontakt</h2>

          <p>
            Direkter Draht für DJs, Brautpaare, Hochzeitsplaner und Akademien:
            <br />
            <a href="mailto:hallo@beatcontrol.io" className="text-[#c9a961] underline">hallo@beatcontrol.io</a>
          </p>

          <p className="text-sm text-[#8a7a6e] mt-8">
            BeatControl ist eine Marke von Robin Bauer. Sitz und Rechtsdetails siehe{' '}
            <Link href="/impressum" className="text-[#c9a961] underline">Impressum</Link>.
          </p>
        </div>
      </article>

      <footer className="bg-[#2a2520] text-[#8a7a6e] py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-[#faf6f0]">{brandName}</span>
          <p className="text-xs text-center">
            © 2026 {brandName} · Für Hochzeiten und die, die sie machen.
            {isWhiteLabel && (
              <>
                <br />
                <span className="text-[10px] opacity-60">Powered by BeatControl</span>
              </>
            )}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/impressum" className="hover:text-[#c9a961] transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[#c9a961] transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[#c9a961] transition-colors">AGB</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
