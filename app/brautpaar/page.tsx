'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';
import { Card, NavBar, buttonVariants } from '@/app/components/ui';

const COUPLE_PRICE = '49';

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

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-5">
          Für Brautpaare
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase leading-[1.05] mb-8 text-glow-gold">
          Die Tanzfläche bleibt voll,<br />
          <span className="text-turquoise">weil eure Gäste mitreden</span>
        </h1>
        <p className="text-fg-muted text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Ihr kennt das von anderen Hochzeiten: Um elf ist die Tanzfläche auf einmal leer, und keiner weiß warum. Mit BeatControl wünschen sich eure Gäste ihre Songs vom Handy und stimmen füreinander ab. Euer DJ sieht den ganzen Abend, worauf eure Leute gerade Lust haben.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/register?plan=couple_pass" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
            Für eure Feier kaufen · €{COUPLE_PRICE}
          </Link>
          <Link href="#wie" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
            Wie es funktioniert
          </Link>
        </div>
        <p className="text-xs text-fg-muted mt-5">
          Einmalig · 30 Tage vor bis 1 Tag nach der Feier gültig · keine Abos
        </p>
      </section>

      {/* Pain Section */}
      <section className="bg-panel py-20 border-y border-line">
        <div className="max-w-4xl mx-auto px-4">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6 text-center">
            Ihr kennt das von anderen Hochzeiten
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-16 leading-tight">
            Die Tanzfläche, die plötzlich leer ist
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-sm">
            {[
              {
                t: 'Der DJ kennt eure Gäste nicht',
                d: 'Er weiß nicht, dass dein bester Freund auf 90er-Hits steht und deine Cousine nur tanzt, wenn etwas Italienisches läuft. Er spielt das, was er denkt, nicht das, was eure Leute wirklich auf die Tanzfläche holt.',
              },
              {
                t: 'Zettel, WhatsApp und Geschrei',
                d: 'Gäste schreiben Wünsche auf Servietten, schicken sie per WhatsApp, gehen ans Pult. Manche Wünsche gehen verloren, andere wiederholen sich. Stress für alle.',
              },
              {
                t: 'Niemand sagt was, bis es zu spät ist',
                d: 'Wenn die Stimmung kippt, geht keiner zum DJ. Die Gäste denken "das wird schon", der DJ denkt "läuft", und am Ende reden alle drüber, dass es zwischen 23 und 24 Uhr "ruhig wurde".',
              },
            ].map(({ t, d }) => (
              <div key={t}>
                <p className="font-semibold text-fg mb-2">{t}</p>
                <p className="text-fg-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="wie" className="max-w-4xl mx-auto px-4 py-20">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6 text-center">
          So funktioniert es
        </p>
        <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-16 leading-tight">
          Drei Schritte, sechs Minuten Setup
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
                    Schon vor der Feier
                  </p>
                  <p className="text-fg-muted text-sm leading-relaxed">
                    Kennt ihr die Musikwunsch-Zeile in Hochzeitseinladungen? Das hier ist dasselbe, nur dass
                    die Wünsche wirklich beim DJ landen. Schickt den Link mit der Einladung, eure Gäste wünschen
                    schon Wochen vorher, und euer DJ kennt eure Leute, bevor er zum ersten Mal auflegt.
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
                Er sieht jederzeit, welche Songs sich gerade die meisten wünschen. Und wer für einen Song
                gestimmt hat, kommt auch tanzen, wenn er läuft: Der Tisch, der ihn sich gewünscht hat, ist als
                erster auf der Fläche.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Reference */}
      <section className="bg-panel py-16 border-y border-line">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-6">
            Von einer echten Hochzeit
          </p>
          <blockquote className="font-display text-2xl md:text-3xl leading-relaxed text-fg mb-6">
            &ldquo;Die Gäste haben den ganzen Abend gevotet. Ich wusste jederzeit, was als Nächstes ankommt, statt zu raten.&rdquo;
          </blockquote>
          <cite className="text-sm text-fg-muted not-italic block">
            Hochzeits-DJ · echte Hochzeit 2026
          </cite>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="font-display text-3xl md:text-4xl font-black uppercase text-center mb-12 leading-tight">
          Häufige Fragen
        </h2>
        <div className="space-y-8">
          {[
            {
              q: 'Was kostet das?',
              a: '€49 einmalig. Kein Abo. Gültig 30 Tage vor bis 1 Tag nach eurer Feier. Zum Vergleich: weniger als ein Hochzeitsstrauß, und es wirkt den ganzen Abend.',
            },
            {
              q: 'Was muss unser DJ tun?',
              a: 'Nichts kaufen, nichts installieren: Ihr schenkt ihm das Voting. Ihr gebt ihm einfach einen Link, er öffnet ihn auf seinem iPad, fertig. Die meisten DJs freuen sich, weil sie den ganzen Abend sehen, was eure Gäste wirklich hören wollen.',
            },
            {
              q: 'Was wenn unser DJ das nicht möchte?',
              a: 'Dann nehmt es selbst in die Hand. Ihr seid die Event-Owner. Eine Person aus der Hochzeitsgesellschaft (Trauzeuge, Schwiegervater, ein Freund) kann das Display am DJ-Pult auf dem iPad zeigen. Der DJ sieht die Wünsche, ohne dass er aktiv mitmachen muss.',
            },
            {
              q: 'Was, wenn sich jemand etwas Peinliches wünscht?',
              a: 'Jeder Gast hat nur drei Wünsche, und nach oben kommt, was viele wollen. Ein einzelner Scherz-Wunsch geht in der Liste einfach unter. Und am Ende entscheidet sowieso euer DJ, was läuft. Ihr müsst mit niemandem diskutieren.',
            },
            {
              q: 'Was passiert mit unseren Daten?',
              a: 'Hosting in der EU. Keine Werbe-Cookies, kein Google Analytics, keine Profile. IP-Adressen werden anonymisiert per kryptographischem Hash gespeichert (nur für Spam-Schutz innerhalb des Events). DSGVO-konform, deutsche Rechtslage.',
            },
            {
              q: 'Können wir das vorab testen?',
              a: 'Ja. Ihr könnt jederzeit ein Test-Event anlegen, ein paar Beispiel-Songs eingeben und sehen wie es aussieht. Bezahlt wird erst, wenn ihr eure echte Hochzeit aktiviert.',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-fg mb-2">{q}</p>
              <p className="text-fg-muted leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <Card tone="party" elevated className="max-w-2xl mx-auto px-4 py-16 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight mb-6 text-glow-gold">
            Ihr plant alles, plant auch die Tanzfläche
          </h2>
          <p className="text-fg-muted text-lg leading-relaxed mb-10">
            Hinterher reden eure Gäste nicht über die Deko, sie reden über die Party. Für €49 weiß euer DJ den ganzen Abend, was eure Leute hören wollen. Ihr schenkt es ihm, er muss nichts kaufen und nichts installieren. Einmal zahlen, kein Abo.
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
