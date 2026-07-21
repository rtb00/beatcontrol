'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';
import { NavBar, buttonVariants } from '@/app/components/ui';

export default function AboutPage() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const isWhiteLabel = !!branding.subdomain;

  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">
      <NavBar>
        <Link href="/" className="flex items-center gap-3">
          {branding.brandingLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.brandingLogoUrl} alt={brandName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-display text-xl font-bold tracking-tight">{brandName}</span>
          )}
        </Link>
        <Link href="/pricing" className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Tarife ansehen
        </Link>
      </NavBar>

      <article className="max-w-2xl mx-auto px-4 py-20 md:py-24">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6">
          Über BeatControl
        </p>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight mb-10 text-glow-gold">
          Gebaut von einem DJ, weil mich Wunsch-Chaos auf Hochzeiten nervte.
        </h1>

        <div className="prose prose-lg text-fg leading-relaxed space-y-6">
          <p>
            Ich bin Robin Bauer, lebe in Mainz und bin seit Jahren in der DJ-Szene unterwegs, eher Club-Sets als Hochzeits-Premium, aber genug Hochzeiten gesehen, um das eine Muster zu erkennen:
          </p>

          <p className="text-xl font-display italic text-fg-muted">
            Niemand löst das Musikwunsch-Problem.
          </p>

          <p>
            Brautpaar und Gäste schreiben Songwünsche in WhatsApp-Gruppen, auf Zetteln, rufen sie dem DJ zu. Der DJ versucht freundlich zu bleiben, den Mix zu halten und sich Wünsche zu merken. Eines davon klappt nicht. Am Ende des Abends sind Wünsche verloren, ein paar Gäste fühlen sich nicht gehört, die Tanzfläche kippt zwischen 23 und 24 Uhr ohne dass jemand weiß warum.
          </p>

          <p>
            Ich hab gedacht: das muss besser gehen.
          </p>

          <h2 className="font-display text-2xl font-bold uppercase mt-12 mb-4">Was BeatControl anders macht</h2>

          <p>
            Web-App, kein App-Download. Gäste scannen einen QR-Code, schlagen Songs vor, voten. Der DJ sieht alles live auf dem iPad neben dem Pult, sortiert nach Stimmen. Er spielt was passt, markiert gespielte Songs ab. Alle sehen sofort, dass ihr Wunsch durchkam.
          </p>

          <p>
            Die App informiert, sie entscheidet nicht. Der DJ bleibt der Profi. Aber er muss nicht mehr raten.
          </p>

          <h2 className="font-display text-2xl font-bold uppercase mt-12 mb-4">Pilot-Saison 2026</h2>

          <p>
            Erste echte Hochzeit lief im April 2026. 64 Live-Songs in einer Nacht. Das Brautpaar wollte das System bis um drei Uhr morgens nicht abdrehen.
          </p>

          <p>
            Aktuell suche ich zwei weitere Hochzeits-DJs für Pilot-Slots Mai–Juli 2026. Kostenlose Pro-Lizenz im Tausch gegen ehrliches Feedback und Aftermovie-Schnipsel. Wenn das du sein könntest:{' '}
            <Link href="/auth/signin?callbackUrl=/dj" className="text-turquoise underline">
              hier anmelden
            </Link>{' '}
            oder mir direkt eine{' '}
            <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-turquoise underline">
              Mail schicken
            </a>
            .
          </p>

          <h2 className="font-display text-2xl font-bold uppercase mt-12 mb-4">Was BeatControl nicht ist</h2>

          <ul className="list-disc pl-6 space-y-2 text-fg-muted">
            <li>Kein VC-finanziertes Startup mit Burn-Rate-Risiko. Bootstrapped, Solo-betrieben, profitable Lifestyle-Ambition.</li>
            <li>Keine US-Plattform mit DSGVO-Grauzone. Hosting in der EU, deutsche AGB, anonymisierte Gast-Daten via kryptographischem Hash.</li>
            <li>Keine native App mit App-Store-Friction. Web-First. Funktioniert auf jedem Handy seit 2018.</li>
            <li>Kein Pay-per-Vote-Modell. Brautpaar zahlt einmalig 19 €, DJ bekommt unbegrenzte Songs für seine Hochzeit. Fertig.</li>
          </ul>

          <h2 className="font-display text-2xl font-bold uppercase mt-12 mb-4">Kontakt</h2>

          <p>
            Direkter Draht für DJs, Brautpaare, Hochzeitsplaner und Akademien:
            <br />
            <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-turquoise underline">Mail schicken</a>
          </p>

          <p className="text-sm text-fg-muted mt-8">
            BeatControl ist eine Marke von Robin Bauer. Sitz und Rechtsdetails siehe{' '}
            <Link href="/impressum" className="text-turquoise underline">Impressum</Link>.
          </p>
        </div>
      </article>

      <footer className="bg-base-alt text-fg-muted py-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-bold text-fg">{brandName}</span>
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
            <Link href="/impressum" className="hover:text-turquoise transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-turquoise transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-turquoise transition-colors">AGB</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
