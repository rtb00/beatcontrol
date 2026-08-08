'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';
import { Accordion, Card, NavBar, buttonVariants } from '@/app/components/ui';

const COUPLE_PRICE = '49';

// Icons für die zwei Pain-Karten, gleicher Stroke-Stil wie auf der Landingpage:
// 0 = unbekannte Gäste (Person mit Fragezeichen), 1 = Zettel-Chaos (Notizzettel).
const PAIN_ICONS = [
  <g key="gaeste">
    <circle cx="9" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M3.5 19.5c.7-3.4 3-5.3 5.5-5.3s4.8 1.9 5.5 5.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16.6 8.3a2.4 2.4 0 114 1.8c-.8.8-1.6 1.1-1.6 2.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="19" cy="15.6" r="0.9" fill="currentColor" stroke="none" />
  </g>,
  <g key="zettel">
    <path d="M6.5 3.5h8l4 4v13h-12z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14.5 3.5v4h4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M9.5 12h6M9.5 15h6M9.5 18h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </g>,
];

export default function BrautpaarLanding() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const isWhiteLabel = !!branding.subdomain;

  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">
      {/* Navbar */}
      <NavBar>
        <Link href="/" className="flex items-center gap-3">
          {branding.brandingLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.brandingLogoUrl} alt={brandName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-display text-xl font-bold tracking-tight">{brandName}</span>
          )}
        </Link>
        <Link href="/auth/register?plan=couple_pass" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
          Für eure Feier · €{COUPLE_PRICE}
        </Link>
      </NavBar>

      {/* Hero mit Tanzflächen-Bild: Overlays dunkeln oben (Navbar), Mitte
          (Headline-Lesbarkeit) und unten (Übergang in die Seite) gezielt ab */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brautpaar-hero.jpg"
            alt=""
            className="h-full w-full object-cover object-[center_40%] opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-base via-base/30 to-base" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 pt-20 pb-16 md:pt-28 md:pb-24 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-5">
          Für Brautpaare
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase leading-[1.05] mb-8 text-glow-gold">
          Der interaktive DJ<br />
          <span className="text-turquoise">für eine volle Tanzfläche</span>
        </h1>
        <p className="text-fg/90 [text-shadow:0_1px_4px_rgba(0,0,0,0.6)] text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Um halb elf ist die Tanzfläche leer und der DJ weiß nicht weiter. Mit BeatControl wünschen sich eure Gäste ihre Songs vom Handy und stimmen über die Wünsche der anderen ab. Euer DJ sieht den ganzen Abend, worauf eure Leute gerade Lust haben.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register?plan=couple_pass" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Für eure Feier kaufen · €{COUPLE_PRICE}
          </Link>
          <Link href="#wie" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
            Wie es funktioniert
          </Link>
        </div>
        <p className="text-xs text-fg-muted mt-5">
          Einmalig · kein Abo · vorher jederzeit kostenlos ausprobieren
        </p>
        </div>
      </section>

      {/* Pain Section */}
      <section className="bg-panel py-20 border-y border-line">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6 text-center">
            Die Sache mit der Musik
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-16 leading-tight">
            Auch der beste DJ kann nicht wissen,<br />was eure Leute feiern
          </h2>
          <div className="grid md:grid-cols-2 gap-10 text-sm max-w-3xl mx-auto">
            {[
              {
                t: 'Der DJ kennt eure Gäste nicht',
                d: 'Er weiß nicht, dass dein bester Freund auf 90er-Hits steht und deine Cousine nur tanzt, wenn etwas Italienisches läuft. Er spielt das, was er denkt, nicht das, was eure Leute wirklich auf die Tanzfläche holt.',
              },
              {
                t: 'Zettel, WhatsApp und Geschrei',
                d: 'Gäste schreiben Wünsche auf Servietten, schicken sie per WhatsApp, gehen ans Pult. Manche Wünsche gehen verloren, andere wiederholen sich.',
              },
            ].map(({ t, d }, i) => (
              <div key={t} className="flex items-center gap-5">
                <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 shrink-0 text-turquoise" aria-hidden="true">
                  {PAIN_ICONS[i]}
                </svg>
                <div>
                  <p className="font-semibold text-fg mb-2">{t}</p>
                  <p className="text-fg-muted leading-relaxed">{d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-fg mt-14 max-w-2xl mx-auto leading-relaxed">
            Mit BeatControl zeigen eure Gäste dem DJ den ganzen Abend, was sie abfeiern.
            Ihr müsst nur noch tanzen.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section id="wie" className="max-w-4xl mx-auto px-4 py-20">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6 text-center">
          So funktioniert es
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-16 leading-tight">
          Drei Schritte
        </h2>

        <div className="space-y-10">
          {/* Schritt 1 */}
          <div className="flex gap-6 items-start">
            <span className="font-display text-5xl font-black text-neon-gold shrink-0 leading-none">1</span>
            <div>
              <p className="font-display text-xl font-semibold mb-2">Ihr legt euer Event an</p>
              <p className="text-fg-muted leading-relaxed">
                Datum und Name eurer Feier eingeben, fertig. Ihr bekommt schöne Gastkarten mit QR-Code zum
                Ausdrucken: auf die Tische legen, an die Bar kleben oder mit der Einladung verschicken.
              </p>
            </div>
          </div>

          {/* Schritt 2 mit zwei Momenten: vorher und am Abend */}
          <div className="flex gap-6 items-start">
            <span className="font-display text-5xl font-black text-neon-gold shrink-0 leading-none">2</span>
            <div className="min-w-0 flex-1">
              <p className="font-display text-xl font-semibold mb-4">Eure Gäste wünschen und voten</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-line bg-panel px-5 py-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-neon-gold mb-2">
                    Vor der Feier
                  </p>
                  <p className="text-fg-muted text-sm leading-relaxed">
                    Schickt den Link einfach mit der Einladung oder in die Familien-Gruppe, mehr müsst ihr
                    nicht tun. Eure Gäste wünschen sich ihre Songs schon Wochen vorher, und euer DJ kommt am
                    großen Tag mit einer Wunschliste an, die eure Leute sich selbst gebaut haben.
                  </p>
                </div>
                <div className="rounded-2xl border border-line bg-panel px-5 py-4">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-widest text-turquoise mb-2">
                    Am Abend
                  </p>
                  <p className="text-fg-muted text-sm leading-relaxed">
                    Jeder Gast scannt den QR-Code mit der Handykamera, wünscht sich bis zu drei Songs und gibt
                    den Wünschen der anderen ein Like. Keine App, keine Anmeldung. Wenn eure Oma WhatsApp kann,
                    kann sie das hier auch.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Schritt 3 */}
          <div className="flex gap-6 items-start">
            <span className="font-display text-5xl font-black text-neon-gold shrink-0 leading-none">3</span>
            <div>
              <p className="font-display text-xl font-semibold mb-2">Der DJ sieht alles live</p>
              <p className="text-fg-muted leading-relaxed">
                Er sieht jederzeit, welche Songs sich gerade die meisten wünschen. Und wenn der Wunsch-Song
                vom Kolleginnen-Tisch läuft, wissen die das, und stehen als Erste auf der Fläche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reference */}
      <section className="bg-panel py-16 border-y border-line">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6">
            Von DJs für eure Feier gebaut
          </p>
          <blockquote className="font-display text-2xl md:text-3xl leading-relaxed text-fg mb-6">
            72 Songwünsche und über 230 Stimmen auf einer einzigen Hochzeit.
          </blockquote>
          <p className="text-sm text-fg-muted">
            BeatControl haben DJs gebaut, die selbst auf Hochzeiten auflegen. Damit eure Feier die wird,
            von der eure Gäste noch lange erzählen.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-12 leading-tight">
          Häufige Fragen
        </h2>
        <Accordion
          items={[
            {
              question: 'Was kostet das?',
              answer: '€49 einmalig. Kein Abo. Gültig 30 Tage vor bis 1 Tag nach eurer Feier. Zum Vergleich: weniger als ein Hochzeitsstrauß, und es wirkt den ganzen Abend.',
            },
            {
              question: 'Was muss unser DJ tun?',
              answer: 'Fast nichts: Ihr gebt ihm einfach einen Link, er öffnet ihn auf seinem iPad, fertig. Die meisten DJs freuen sich, weil sie den ganzen Abend sehen, was eure Gäste wirklich hören wollen.',
            },
            {
              question: 'Was wenn unser DJ das nicht möchte?',
              answer: 'Dann nehmt es selbst in die Hand. Ihr seid die Event-Owner. Eine Person aus der Hochzeitsgesellschaft (Trauzeuge, Schwiegervater, ein Freund) kann das Display am DJ-Pult auf dem iPad zeigen. Der DJ sieht die Wünsche, ohne dass er aktiv mitmachen muss.',
            },
            {
              question: 'Was, wenn sich jemand etwas Peinliches wünscht?',
              answer: 'Jeder Gast hat nur drei Wünsche, und nach oben kommt, was viele wollen. Ein einzelner Scherz-Wunsch geht in der Liste einfach unter. Und am Ende entscheidet sowieso euer DJ, was läuft. Ihr müsst mit niemandem diskutieren.',
            },
            {
              question: 'Was passiert mit unseren Daten?',
              answer: 'Hosting in der EU. Keine Werbe-Cookies, kein Google Analytics, keine Profile. IP-Adressen werden anonymisiert per kryptographischem Hash gespeichert (nur für Spam-Schutz innerhalb des Events). DSGVO-konform, deutsche Rechtslage.',
            },
            {
              question: 'Können wir das vorab testen?',
              answer: 'Ja. Ihr könnt jederzeit ein Test-Event anlegen, ein paar Beispiel-Songs eingeben und sehen wie es aussieht. Bezahlt wird erst, wenn ihr eure echte Hochzeit aktiviert.',
            },
          ]}
        />
      </section>

      {/* CTA */}
      <section className="py-20">
        <Card tone="party" elevated className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight mb-6 text-glow-gold">
            Ihr plant alles, plant auch die Tanzfläche
          </h2>
          <p className="text-fg-muted text-lg leading-relaxed mb-10">
            Die Deko sehen eure Gäste, die Party fühlen sie. Für €49 weiß euer DJ den ganzen Abend, was eure Leute hören wollen.
          </p>
          <Link href="/auth/register?plan=couple_pass" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Jetzt für eure Feier kaufen
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="bg-base text-fg-muted py-10 border-t border-line">
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
