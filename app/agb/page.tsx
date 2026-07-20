import Link from 'next/link';
import { CalmScope, NavBar, Badge, Card } from '@/app/components/ui';

export const metadata = {
  title: 'AGB · BeatControl',
  description: 'Allgemeine Geschäftsbedingungen für die Nutzung von BeatControl.',
};

export default function AgbPage() {
  return (
    <CalmScope className="min-h-screen bg-base text-fg font-sans">
      <NavBar tone="calm">
        <Link href="/" className="font-display text-xl font-bold tracking-tight hover:text-neon-gold transition-colors">
          BeatControl
        </Link>
        <Link href="/" className="text-sm text-fg-muted hover:text-neon-gold transition-colors">
          ← Zurück zur Startseite
        </Link>
      </NavBar>

      <main className="max-w-3xl mx-auto px-4 py-16">
        <Badge color="gold" tone="calm" className="mb-4">Rechtliches</Badge>
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
          Allgemeine Geschäftsbedingungen
        </h1>
        <p className="text-sm text-fg-muted mb-12">Stand: April 2026</p>

        <div className="space-y-12 text-fg leading-relaxed">

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 1 Geltungsbereich, Anbieter</h2>
            <p className="mb-3">
              (1) Diese Allgemeinen Geschäftsbedingungen (nachfolgend „AGB") gelten für alle Verträge zwischen Robin Bauer, Spotlight Eventtechnik (nachfolgend „Anbieter") und seinen Kunden (nachfolgend „Nutzer") über die Nutzung des Online-Dienstes BeatControl (nachfolgend „Dienst").
            </p>
            <p className="mb-3">
              (2) Anbieter ist:
              <br />
              Robin Bauer, Spotlight Eventtechnik
              <br />
              E-Mail:{' '}
              <a href="mailto:info@spotlight-eventtechnik.com" className="text-neon-gold hover:underline">
                info@spotlight-eventtechnik.com
              </a>
              <br />
              Vollständige Anbieterkennzeichnung im{' '}
              <Link href="/impressum" className="text-neon-gold hover:underline">
                Impressum
              </Link>
              .
            </p>
            <p>
              (3) Abweichende Bedingungen des Nutzers werden nicht anerkannt, es sei denn, der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 2 Vertragsgegenstand</h2>
            <p className="mb-3">
              (1) BeatControl ist eine webbasierte Software-as-a-Service-Anwendung, die DJs ermöglicht, Musikwünsche von Hochzeitsgästen zu sammeln, nach Beliebtheit zu sortieren und während eines Events live einzusehen.
            </p>
            <p className="mb-3">
              (2) Konkret ermöglicht der Dienst:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Anlage und Verwaltung von Events durch den DJ</li>
              <li>Bereitstellung eines QR-Codes / Links für Gäste zur Eingabe von Musikwünschen ohne Account</li>
              <li>Live-Sortierung und -Darstellung der Wünsche nach Stimmen</li>
              <li>Markierung gespielter Songs sowie Entfernen unpassender Wünsche</li>
              <li>Optionaler Export der Wunschliste</li>
            </ul>
            <p>
              (3) Der Anbieter stellt die musikalischen Inhalte (Audiodateien) ausdrücklich nicht bereit. Der Nutzer spielt Musik weiterhin in seiner eigenen DJ-Software auf Basis eigener Lizenzen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 3 Vertragsschluss, Registrierung</h2>
            <p className="mb-3">
              (1) Voraussetzung für die Nutzung der DJ-Funktionen ist die Registrierung eines Nutzerkontos. Mit Absenden der Registrierung gibt der Nutzer ein Angebot auf Abschluss eines Nutzungsvertrags ab. Der Vertrag kommt mit Bestätigung der Registrierung durch den Anbieter (z. B. Bestätigungs-E-Mail oder Freischaltung) zustande.
            </p>
            <p className="mb-3">
              (2) Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen und diese bei Änderungen aktuell zu halten.
            </p>
            <p>
              (3) Die Nutzung des Dienstes ist Personen vorbehalten, die das 18. Lebensjahr vollendet haben oder mit Einverständnis der gesetzlichen Vertreter handeln. Pro Person ist nur ein Account zulässig.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 4 Leistungen, Tarife</h2>
            <p className="mb-3">
              (1) Der Anbieter stellt die folgenden Tarife bereit:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>
                <strong>Free</strong> — dauerhaft kostenfreier Tarif mit eingeschränktem Funktions- und Mengenumfang.
              </li>
              <li>
                <strong>Pro</strong> — kostenpflichtiges Abonnement mit erweitertem Funktionsumfang.
              </li>
              <li>
                <strong>Event-Pass</strong> — einmalige Buchung für ein einzelnes Event mit zeitlich befristeter Gültigkeit.
              </li>
            </ul>
            <p>
              (2) Der jeweils gebuchte Funktionsumfang ergibt sich aus der zum Zeitpunkt der Buchung gültigen Leistungsbeschreibung auf der Website.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 5 Preise und Zahlung</h2>
            <p className="mb-3">
              (1) Es gelten die zum Zeitpunkt der Buchung auf der Website angegebenen Preise. Alle Preise sind Endpreise. Aufgrund der Anwendung der Kleinunternehmerregelung nach § 19 UStG wird keine Umsatzsteuer ausgewiesen.
            </p>
            <p className="mb-3">
              (2) Die Zahlung des Pro-Abonnements erfolgt im Voraus für den jeweiligen Abrechnungszeitraum (monatlich) per zugelassenem Zahlungsmittel. Der Event-Pass wird einmalig im Voraus gezahlt.
            </p>
            <p>
              (3) Bei Zahlungsverzug kann der Anbieter den Zugang zum Dienst nach vorheriger Ankündigung einschränken oder sperren.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 6 Geld-zurück-Garantie</h2>
            <p>
              Unabhängig vom gesetzlichen Widerrufsrecht (§ 7) gewährt der Anbieter eine 30-tägige Geld-zurück-Garantie auf Pro-Abonnements und Event-Pässe. Sofern der Nutzer innerhalb von 30 Tagen nach Buchung per E-Mail an{' '}
              <a href="mailto:info@spotlight-eventtechnik.com" className="text-neon-gold hover:underline">
                info@spotlight-eventtechnik.com
              </a>{' '}
              eine Rückerstattung verlangt, erstattet der Anbieter den vollen Kaufpreis ohne Angabe von Gründen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 7 Widerrufsrecht für Verbraucher</h2>
            <Card tone="calm" className="mb-4">
              <h3 className="font-display font-semibold mb-3">Widerrufsbelehrung</h3>
              <p className="mb-3">
                <strong>Widerrufsrecht:</strong> Du hast das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsabschlusses.
              </p>
              <p className="mb-3">
                Um dein Widerrufsrecht auszuüben, musst du uns (Robin Bauer, Spotlight Eventtechnik,{' '}
                <a href="mailto:info@spotlight-eventtechnik.com" className="text-neon-gold hover:underline">
                  info@spotlight-eventtechnik.com
                </a>
                ) mittels einer eindeutigen Erklärung (z. B. ein mit der Post versandter Brief oder eine E-Mail) über deinen Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
              <p className="mb-3">
                <strong>Folgen des Widerrufs:</strong> Wenn du diesen Vertrag widerrufst, haben wir dir alle Zahlungen, die wir von dir erhalten haben, unverzüglich und spätestens binnen vierzehn Tagen ab dem Tag zurückzuzahlen, an dem die Mitteilung über deinen Widerruf bei uns eingegangen ist.
              </p>
              <p>
                <strong>Vorzeitiges Erlöschen des Widerrufsrechts bei digitalen Inhalten / Dienstleistungen:</strong> Das Widerrufsrecht erlischt vorzeitig, wenn der Anbieter mit der Ausführung der Dienstleistung begonnen hat, nachdem du deine ausdrückliche Zustimmung dazu erteilt und gleichzeitig deine Kenntnis davon bestätigt hast, dass du dein Widerrufsrecht mit Beginn der Ausführung verlierst.
              </p>
            </Card>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 8 Pflichten des Nutzers</h2>
            <p className="mb-3">(1) Der Nutzer verpflichtet sich,</p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>seine Zugangsdaten geheim zu halten und vor unbefugtem Zugriff Dritter zu schützen,</li>
              <li>den Dienst nicht missbräuchlich, insbesondere nicht zur Verbreitung rechtswidriger Inhalte zu nutzen,</li>
              <li>die Sicherheit, Verfügbarkeit oder Integrität des Dienstes nicht zu beeinträchtigen,</li>
              <li>geltendes Recht (insb. Urheber-, Datenschutz- und Wettbewerbsrecht) zu beachten.</li>
            </ul>
            <p>
              (2) Der Nutzer ist allein verantwortlich für die Inhalte, die er einstellt oder die unter seinem Account von Gästen eingestellt werden. Der Anbieter behält sich vor, rechtswidrige Inhalte nach Kenntniserlangung zu entfernen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 9 Verfügbarkeit</h2>
            <p>
              Der Anbieter ist um eine möglichst hohe Verfügbarkeit des Dienstes bemüht, schuldet jedoch keine ununterbrochene Verfügbarkeit. Wartungsfenster, Updates und kurzfristige Störungen können zu vorübergehenden Einschränkungen führen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 10 Haftung</h2>
            <p className="mb-3">
              (1) Der Anbieter haftet uneingeschränkt bei Vorsatz und grober Fahrlässigkeit, bei Verletzung von Leben, Körper oder Gesundheit sowie nach Maßgabe des Produkthaftungsgesetzes.
            </p>
            <p className="mb-3">
              (2) Bei einfacher Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten). Die Haftung ist in diesem Fall auf den vorhersehbaren, vertragstypischen Schaden begrenzt.
            </p>
            <p>
              (3) Im Übrigen ist die Haftung ausgeschlossen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 11 Vertragslaufzeit, Kündigung</h2>
            <p className="mb-3">
              (1) Free-Accounts laufen auf unbestimmte Zeit und können vom Nutzer jederzeit ohne Frist gekündigt bzw. gelöscht werden.
            </p>
            <p className="mb-3">
              (2) Pro-Abonnements werden für die jeweils gewählte Laufzeit (monatlich) abgeschlossen und verlängern sich automatisch um denselben Zeitraum, wenn sie nicht vor Ablauf der jeweiligen Laufzeit gekündigt werden. Die Kündigung kann jederzeit zum Ende des laufenden Abrechnungszeitraums in Textform (z. B. E-Mail) erfolgen.
            </p>
            <p className="mb-3">
              (3) Der Event-Pass endet automatisch nach Ablauf der gebuchten Gültigkeitsdauer ohne dass es einer Kündigung bedarf.
            </p>
            <p>
              (4) Das Recht zur außerordentlichen Kündigung aus wichtigem Grund bleibt unberührt.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 12 Datenschutz</h2>
            <p>
              Informationen zur Verarbeitung personenbezogener Daten findest du in unserer{' '}
              <Link href="/datenschutz" className="text-neon-gold hover:underline">
                Datenschutzerklärung
              </Link>
              .
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 13 Änderungen der AGB</h2>
            <p>
              Der Anbieter behält sich vor, diese AGB anzupassen, soweit dies aus rechtlichen oder technischen Gründen erforderlich ist. Über Änderungen wird der Nutzer in geeigneter Form (z. B. per E-Mail) informiert. Widerspricht der Nutzer den Änderungen nicht innerhalb von sechs Wochen, gelten diese als angenommen. Auf das Widerspruchsrecht und die Folgen eines Schweigens wird in der Mitteilung gesondert hingewiesen.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-bold mb-4">§ 14 Schlussbestimmungen</h2>
            <p className="mb-3">
              (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts. Bei Verbrauchern gilt diese Rechtswahl nur, soweit hierdurch der durch zwingende Bestimmungen des Rechts des Staates des gewöhnlichen Aufenthalts des Verbrauchers gewährte Schutz nicht entzogen wird.
            </p>
            <p className="mb-3">
              (2) Sofern der Nutzer Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen ist, ist Gerichtsstand der Sitz des Anbieters.
            </p>
            <p>
              (3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.
            </p>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-line">
          <Link href="/" className="text-sm text-neon-gold hover:underline">
            ← Zurück zur Startseite
          </Link>
        </div>
      </main>
    </CalmScope>
  );
}
