import Link from 'next/link';

export const metadata = {
  title: 'Impressum · BeatControl',
  description: 'Impressum und Anbieterkennzeichnung von BeatControl, Spotlight Eventtechnik.',
};

export default function ImpressumPage() {
  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight hover:text-[#c9a961] transition-colors">
            BeatControl
          </Link>
          <Link href="/" className="text-sm text-[#8a7a6e] hover:text-[#c9a961] transition-colors">
            ← Zurück zur Startseite
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-4">Rechtliches</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-10">Impressum</h1>

        <div className="space-y-10 text-[#2a2520] leading-relaxed">
          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Angaben gemäß § 5 TMG</h2>
            <p>
              Spotlight Eventtechnik<br />
              Inhaber: Robin Bauer<br />
              An der Alten Zündholzfabrik 36<br />
              55246 Wiesbaden<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Kontakt</h2>
            <p>
              E-Mail:{' '}
              <a href="mailto:info@spotlight-eventtechnik.com" className="text-[#c9a961] hover:underline">
                info@spotlight-eventtechnik.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Umsatzsteuer</h2>
            <p>
              Kleinunternehmer im Sinne von § 19 UStG. Es wird daher keine Umsatzsteuer ausgewiesen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">
              Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
            </h2>
            <p>
              Robin Bauer<br />
              An der Alten Zündholzfabrik 36<br />
              55246 Wiesbaden
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">EU-Streitschlichtung</h2>
            <p className="mb-3">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a961] hover:underline"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              .
            </p>
            <p>Unsere E-Mail-Adresse findest du oben im Impressum.</p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">
              Verbraucherstreitbeilegung / Universalschlichtungsstelle
            </h2>
            <p>
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Haftung für Inhalte</h2>
            <p className="mb-3">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p>
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Haftung für Links</h2>
            <p>
              Unser Angebot enthält ggf. Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-xl font-bold mb-3">Urheberrecht</h2>
            <p>
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-[#e8d9b8]">
          <Link href="/" className="text-sm text-[#c9a961] hover:underline">
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    </div>
  );
}
