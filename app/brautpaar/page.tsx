'use client';

import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';

const EVENT_PASS_PRICE = '19';

export default function BrautpaarLanding() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const isWhiteLabel = !!branding.subdomain;

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      {/* Navbar */}
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
            href="/pricing#event-pass"
            className="text-sm px-4 py-1.5 rounded-full bg-[#c9a961] text-white hover:bg-[#b8953a] transition-colors"
          >
            Event-Pass · €{EVENT_PASS_PRICE}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-5">
          Für Brautpaare
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.05] mb-8">
          Die Tanzfläche bleibt voll.<br />
          <span className="text-[#c9a961]">Weil eure Gäste mitreden.</span>
        </h1>
        <p className="text-[#8a7a6e] text-lg leading-relaxed max-w-2xl mx-auto mb-10">
          Fast jede Hochzeit hat diesen einen Moment: Die Tanzfläche wird leer und keiner weiß warum. Mit BeatControl schlagen eure Gäste vom Handy ihre Songs vor und voten füreinander. Euer DJ sieht live, was gerade gefragt ist, und legt sicher nach.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/pricing#event-pass"
            className="px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm"
          >
            Event-Pass kaufen · €{EVENT_PASS_PRICE}
          </Link>
          <Link
            href="#wie"
            className="px-8 py-4 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors"
          >
            Wie es funktioniert
          </Link>
        </div>
        <p className="text-xs text-[#8a7a6e] mt-5">
          Einmalig · 30 Tage vor bis 1 Tag nach der Feier gültig · keine Abos
        </p>
      </section>

      {/* Pain Section */}
      <section className="bg-[#f4ede0] py-20 border-y border-[#e8d9b8]">
        <div className="max-w-4xl mx-auto px-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6 text-center">
            Ihr kennt das von anderen Hochzeiten
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16 leading-tight">
            Die Tanzfläche, die plötzlich leer ist.
          </h2>
          <div className="grid md:grid-cols-3 gap-10 text-sm">
            {[
              {
                t: 'Der DJ kennt eure Gäste nicht',
                d: 'Er weiß nicht, dass dein bester Freund auf 90er-Hits steht und deine Cousine nur tanzt, wenn etwas Italienisches läuft. Er spielt das, was er denkt — nicht das, was zündet.',
              },
              {
                t: 'Zettel, WhatsApp und Geschrei',
                d: 'Gäste schreiben Wünsche auf Servietten, schicken sie per WhatsApp, gehen ans Pult. Manche Wünsche gehen verloren, andere wiederholen sich. Stress für alle.',
              },
              {
                t: 'Niemand sagt was — bis es zu spät ist',
                d: 'Wenn die Stimmung kippt, geht keiner zum DJ. Die Gäste denken "das wird schon", der DJ denkt "läuft", und am Ende reden alle drüber, dass es zwischen 23 und 24 Uhr "ruhig wurde".',
              },
            ].map(({ t, d }) => (
              <div key={t}>
                <p className="font-semibold text-base mb-2">{t}</p>
                <p className="text-[#8a7a6e] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="wie" className="max-w-4xl mx-auto px-4 py-20">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6 text-center">
          So funktioniert es
        </p>
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-16 leading-tight">
          Drei Schritte, sechs Minuten Setup.
        </h2>

        <div className="space-y-8">
          {[
            {
              num: '1',
              t: 'Ihr legt euer Event an',
              d: 'Datum, Hochzeits-Name, optional Logo. BeatControl erstellt einen QR-Code für eure Gäste. Druckt ihn auf die Menükarte, klebt ihn an die Bar, packt ihn ins Save-the-Date.',
            },
            {
              num: '2',
              t: 'Gäste schlagen vor und voten',
              d: 'Jeder Gast scannt den QR-Code mit seinem Handy. Schlägt 1–3 Lieblingssongs vor, stimmt für andere Vorschläge ab. Kein Account, keine App, keine Anmeldung. Funktioniert auf jedem Handy seit 2018.',
            },
            {
              num: '3',
              t: 'Der DJ sieht alles live',
              d: 'Sortiert nach Stimmen, in Echtzeit. Er spielt die Top-Wünsche zwischen seinen geplanten Sets, markiert gespielte Songs als erledigt. Eure Gäste sehen sofort, dass ihr Wunsch durchgekommen ist. Stimmung trägt sich selbst.',
            },
          ].map(({ num, t, d }) => (
            <div key={num} className="flex gap-6 items-start">
              <span className="font-serif text-5xl font-bold text-[#c9a961] shrink-0 leading-none">{num}</span>
              <div>
                <p className="font-serif text-xl font-semibold mb-2">{t}</p>
                <p className="text-[#8a7a6e] leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Reference */}
      <section className="bg-[#f4ede0] py-16 border-y border-[#e8d9b8]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6">
            Aus der Pilot-Saison
          </p>
          <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-[#2a2520] mb-6">
            &ldquo;Die Gäste haben den ganzen Abend gevotet. Ich wusste jederzeit, was als Nächstes zieht, statt zu raten.&rdquo;
          </blockquote>
          <cite className="text-sm text-[#8a7a6e] not-italic block">
            Hochzeits-DJ · erste Pilot-Hochzeit 2026
          </cite>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-20">
        <h2 className="font-serif text-3xl md:text-4xl font-bold text-center mb-12 leading-tight">
          Häufige Fragen
        </h2>
        <div className="space-y-8">
          {[
            {
              q: 'Was kostet das?',
              a: '€19 einmalig. Kein Abo. Gültig 30 Tage vor bis 1 Tag nach eurer Feier. Wenn ihr es nicht braucht, kein Verlust.',
            },
            {
              q: 'Was muss unser DJ tun?',
              a: 'Wir senden euch einen Link, den ihr eurem DJ weitergebt. Er öffnet ihn auf seinem iPad — fertig. Kein Account-Setup auf seiner Seite, keine extra Software.',
            },
            {
              q: 'Was wenn unser DJ das nicht möchte?',
              a: 'Dann nehmt es selbst in die Hand. Ihr seid die Event-Owner. Eine Person aus der Hochzeitsgesellschaft (Trauzeuge, Schwiegervater, ein Freund) kann das Display am DJ-Pult auf dem iPad zeigen. Der DJ sieht die Wünsche, ohne dass er aktiv mitmachen muss.',
            },
            {
              q: 'Was passiert mit unseren Daten?',
              a: 'Hosting in der EU. Keine Werbe-Cookies, kein Google Analytics, keine Profile. IP-Adressen werden anonymisiert per kryptographischem Hash gespeichert (nur für Spam-Schutz innerhalb des Events). DSGVO-konform, deutsche Rechtslage.',
            },
            {
              q: 'Können wir das vorab testen?',
              a: 'Ja. Ihr könnt jederzeit ein Test-Event anlegen, ein paar Beispiel-Songs eingeben und sehen wie es aussieht. Der Event-Pass startet erst, wenn ihr eure echte Hochzeit aktiviert.',
            },
          ].map(({ q, a }) => (
            <div key={q}>
              <p className="font-semibold text-base mb-2">{q}</p>
              <p className="text-[#8a7a6e] leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#2a2520] text-[#faf6f0] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6">
            Ihr plant alles. Plant auch die Tanzfläche.
          </h2>
          <p className="text-[#a89786] text-lg leading-relaxed mb-10">
            Für €19 weiß euer DJ den ganzen Abend, was eure Leute hören wollen. Einmal zahlen, kein Abo. Und wenn ihr es am Ende nicht braucht, habt ihr nichts verloren.
          </p>
          <Link
            href="/pricing#event-pass"
            className="inline-block px-10 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors"
          >
            Jetzt Event-Pass kaufen
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1510] text-[#8a7a6e] py-10">
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
