import Link from 'next/link';

export const metadata = {
  title: 'Datenschutzerklärung · BeatControl',
  description: 'Informationen zur Verarbeitung personenbezogener Daten bei BeatControl nach DSGVO.',
};

export default function DatenschutzPage() {
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
        <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Datenschutzerklärung</h1>
        <p className="text-sm text-[#8a7a6e] mb-12">Stand: April 2026</p>

        <div className="space-y-12 text-[#2a2520] leading-relaxed">

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">1. Verantwortlicher</h2>
            <p className="mb-3">
              Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) sowie sonstiger nationaler Datenschutzgesetze der Mitgliedstaaten und anderer datenschutzrechtlicher Bestimmungen ist:
            </p>
            <p>
              Robin Bauer<br />
              Spotlight Eventtechnik<br />
              [Adresse siehe Impressum]<br />
              E-Mail:{' '}
              <a href="mailto:info@spotlight-eventtechnik.com" className="text-[#c9a961] hover:underline">
                info@spotlight-eventtechnik.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">2. Allgemeines zur Datenverarbeitung</h2>
            <p className="mb-3">
              Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung erfolgt regelmäßig nur nach Einwilligung des Nutzers oder soweit eine Verarbeitung der Daten durch gesetzliche Vorschriften gestattet ist.
            </p>
            <p>
              BeatControl wurde von Grund auf datensparsam entworfen: Wir setzen kein Tracking, keine Werbe-Cookies, kein Google Analytics, keine Third-Party-Analyse-Skripte und keine Profilbildung ein.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">3. Hosting (Vercel)</h2>
            <p className="mb-3">
              Diese Anwendung wird auf der Plattform der Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, USA, gehostet. Vercel verarbeitet in unserem Auftrag technische Verbindungsdaten (z. B. IP-Adresse, Browsertyp, Aufrufzeit, übertragene Datenmenge), um die Auslieferung der Website zu ermöglichen, Sicherheit zu gewährleisten und Angriffe abzuwehren.
            </p>
            <p className="mb-3">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer technisch fehlerfreien und sicheren Bereitstellung).
            </p>
            <p>
              Da Vercel ggf. auch Daten in die USA übermittelt, erfolgt die Übermittlung auf Grundlage der EU-Standardvertragsklauseln (SCCs) gem. Art. 46 Abs. 2 lit. c DSGVO sowie ergänzender technischer und organisatorischer Maßnahmen. Mit Vercel besteht ein Auftragsverarbeitungsvertrag (Data Processing Agreement) gemäß Art. 28 DSGVO.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">4. Datenbank (Neon)</h2>
            <p className="mb-3">
              Zur Speicherung von Account- und Anwendungsdaten setzen wir die Neon Inc. ein (Neon Postgres). Daten werden in einer Datenbankinstanz innerhalb der Europäischen Union gespeichert, sofern wir die EU-Region gewählt haben.
            </p>
            <p>
              Mit Neon besteht ein Auftragsverarbeitungsvertrag nach Art. 28 DSGVO. Bei einer eventuell notwendigen Datenübermittlung in Drittländer erfolgt diese auf Basis der EU-Standardvertragsklauseln.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">5. Server-Logfiles</h2>
            <p className="mb-3">
              Bei jedem Aufruf werden durch unseren Hosting-Provider folgende Daten kurzzeitig in Server-Logs erfasst:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Anonymisierte oder gekürzte IP-Adresse</li>
              <li>Datum und Uhrzeit des Zugriffs</li>
              <li>Aufgerufene URL und HTTP-Statuscode</li>
              <li>Übertragene Datenmenge</li>
              <li>Referrer und User-Agent (Browsertyp/-version, Betriebssystem)</li>
            </ul>
            <p>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO. Diese Daten werden nicht mit anderen personenbezogenen Daten zusammengeführt und nach kurzer Zeit gelöscht oder anonymisiert.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">6. Registrierung und Nutzerkonto</h2>
            <p className="mb-3">
              Für die Nutzung von BeatControl als DJ ist die Anlage eines Accounts erforderlich. Wir verarbeiten dabei je nach Anmeldeart folgende Daten:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>E-Mail-Adresse</li>
              <li>Name (optional)</li>
              <li>Bei Passwort-Login: gehashtes Passwort (kein Klartext)</li>
              <li>Ggf. übermittelte OAuth-Profildaten (siehe Abschnitt 7)</li>
              <li>Account- und Abrechnungsdaten</li>
            </ul>
            <p>
              Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. c DSGVO (gesetzliche Aufbewahrungspflichten). Daten werden gelöscht, sobald sie für die Vertragsdurchführung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">7. Anmeldung mit Google (OAuth 2.0)</h2>
            <p className="mb-3">
              Du kannst dich optional über dein Google-Konto anmelden. Anbieter ist die Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland.
            </p>
            <p className="mb-3">
              Bei der Anmeldung übermittelt Google an uns:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>Deine E-Mail-Adresse</li>
              <li>Deinen bei Google hinterlegten Namen</li>
              <li>Deine Google-Profilbild-URL (sofern vorhanden)</li>
              <li>Eine eindeutige Google-Kennung (sub)</li>
            </ul>
            <p className="mb-3">
              Wir verwenden diese Daten ausschließlich zur Authentifizierung und zur Erstellung deines Accounts. Wir greifen nicht auf weitere Google-Dienste oder dein Google-Drive zu.
            </p>
            <p>
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung / Anbahnung). Weitere Informationen findest du in der{' '}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a961] hover:underline"
              >
                Datenschutzerklärung von Google
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">8. Cookies</h2>
            <p className="mb-3">
              Wir setzen ausschließlich technisch notwendige Cookies ein, die für den Betrieb der Anwendung erforderlich sind:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>
                <strong>Auth-Session-Cookie</strong> (NextAuth.js) — hält dich nach dem Login angemeldet. Wird beim Logout oder Ablauf der Sitzung gelöscht.
              </li>
              <li>
                <strong>CSRF-Cookie</strong> — schützt vor Cross-Site-Request-Forgery-Angriffen.
              </li>
            </ul>
            <p className="mb-3">
              Diese Cookies sind nach § 25 Abs. 2 Nr. 2 TDDDG (TTDSG) einwilligungsfrei zulässig, da sie für die Bereitstellung des Dienstes unbedingt erforderlich sind.
            </p>
            <p>
              <strong>Wir setzen keine Tracking-Cookies, kein Google Analytics, keine Werbe- oder Marketing-Cookies und keine Cookies von Drittanbietern zu Analysezwecken ein.</strong>
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">9. Musikwünsche der Gäste</h2>
            <p className="mb-3">
              Gäste eines Events benötigen für die Abgabe von Musikwünschen keinen Account. Wir speichern den Songtitel, den Künstler und einen Vote-Counter. Es werden keine Klarnamen, keine E-Mail-Adressen und keine Geräte- oder Werbe-IDs der Gäste gespeichert.
            </p>
            <p className="mb-3">
              Zum technischen Betrieb (Spam- und Mehrfachvoting-Schutz innerhalb eines Events) wird eine pseudonyme Kennung verwendet. Diese entsteht durch eine kryptographische Einweg-Hash-Funktion (SHA-256), in die die IP-Adresse, eine im Browser zufällig erzeugte Client-ID, der eindeutige Event-Identifier sowie ein serverseitiger Geheimwert eingehen.
            </p>
            <p>
              Diese Kennung ist nicht auf die IP-Adresse zurückrechenbar und ist für jedes Event eigenständig — eine Wiedererkennung desselben Gerätes über mehrere Events hinweg ist technisch ausgeschlossen. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am Schutz vor Manipulation).
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">10. Zahlungsabwicklung (Stripe)</h2>
            <p className="mb-3">
              Für die Abwicklung kostenpflichtiger Buchungen (Pro-Abonnement, Event-Pass) setzen wir die Stripe Payments Europe, Limited, 1 Grand Canal Street Lower, Grand Canal Dock, Dublin, Irland (für EU-Kunden) ein.
            </p>
            <p className="mb-3">
              Bei Auslösen einer Zahlung werden die folgenden Daten an Stripe übermittelt:
            </p>
            <ul className="list-disc pl-6 space-y-1 mb-3">
              <li>E-Mail-Adresse und Name (sofern hinterlegt)</li>
              <li>Gewählter Tarif und Rechnungsbetrag</li>
              <li>Eine eindeutige Stripe-Kundenkennung, die wir intern speichern</li>
              <li>Bei Bezahlung mit Kreditkarte, SEPA oder anderen Zahlungsmitteln: die zugehörigen Zahlungsinformationen (z. B. Kreditkartennummer, Bankverbindung). Diese werden ausschließlich von Stripe verarbeitet und sind für uns zu keinem Zeitpunkt im Klartext einsehbar.</li>
              <li>IP-Adresse und technische Browser-/Geräteinformationen zum Zweck der Betrugsprävention durch Stripe</li>
            </ul>
            <p className="mb-3">
              Bei abonnementbasierten Tarifen erhält Stripe wiederkehrende Abrechnungsdaten, um automatisierte Zahlungen auszulösen. Über das von Stripe bereitgestellte Kunden-Portal kannst du jederzeit Rechnungen einsehen, deine Zahlungsmethode aktualisieren oder dein Abo kündigen.
            </p>
            <p className="mb-3">
              Sofern wir Stripe Tax einsetzen, ermittelt Stripe für uns die anwendbare Umsatzsteuer auf Basis des Standortes des Kunden und stellt entsprechende Rechnungsdaten bereit.
            </p>
            <p className="mb-3">
              Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an einer sicheren und betrugsfreien Zahlungsabwicklung).
            </p>
            <p className="mb-3">
              Mit Stripe besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO (Stripe Data Processing Agreement). Soweit Daten an Stripe-Konzerngesellschaften außerhalb der EU (insbesondere in den USA) übermittelt werden, geschieht dies auf Basis der EU-Standardvertragsklauseln nach Art. 46 Abs. 2 lit. c DSGVO.
            </p>
            <p>
              Weitere Informationen findest du in der{' '}
              <a
                href="https://stripe.com/de/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c9a961] hover:underline"
              >
                Datenschutzerklärung von Stripe
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">11. Weitergabe von Daten</h2>
            <p>
              Eine Weitergabe deiner personenbezogenen Daten an Dritte findet nicht statt, außer an die in dieser Datenschutzerklärung genannten Auftragsverarbeiter (Vercel, Neon, Google im Rahmen des OAuth-Logins, Stripe für Zahlungsabwicklung) sowie wenn wir dazu gesetzlich verpflichtet sind.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">12. Speicherdauer</h2>
            <p>
              Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungsfristen (z. B. handels- und steuerrechtlich) bestehen. Nach Wegfall des Zwecks oder Ablauf der Frist werden die Daten routinemäßig gelöscht.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">13. Deine Rechte</h2>
            <p className="mb-3">Dir stehen nach DSGVO folgende Rechte zu:</p>
            <ul className="list-disc pl-6 space-y-2 mb-3">
              <li>
                <strong>Auskunft</strong> (Art. 15 DSGVO) — du kannst Auskunft darüber verlangen, ob und welche Daten wir über dich verarbeiten.
              </li>
              <li>
                <strong>Berichtigung</strong> (Art. 16 DSGVO) — unrichtige Daten können auf Verlangen korrigiert werden.
              </li>
              <li>
                <strong>Löschung</strong> (Art. 17 DSGVO) — du kannst die Löschung deiner Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
              </li>
              <li>
                <strong>Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO).
              </li>
              <li>
                <strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO) — Daten in einem strukturierten, gängigen Format.
              </li>
              <li>
                <strong>Widerspruch</strong> (Art. 21 DSGVO) — gegen Verarbeitungen auf Basis berechtigter Interessen.
              </li>
              <li>
                <strong>Widerruf einer Einwilligung</strong> (Art. 7 Abs. 3 DSGVO) — jederzeit mit Wirkung für die Zukunft.
              </li>
              <li>
                <strong>Beschwerde bei einer Aufsichtsbehörde</strong> (Art. 77 DSGVO) — z. B. bei der für deinen Wohnsitz zuständigen Landesdatenschutzbehörde.
              </li>
            </ul>
            <p>
              Zur Ausübung deiner Rechte genügt eine formlose Nachricht an{' '}
              <a href="mailto:info@spotlight-eventtechnik.com" className="text-[#c9a961] hover:underline">
                info@spotlight-eventtechnik.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">14. Datensicherheit</h2>
            <p>
              Wir setzen branchenübliche Schutzmaßnahmen ein, um deine Daten gegen Verlust, Zerstörung, Manipulation und unberechtigten Zugriff zu schützen. Die Übertragung erfolgt über verschlüsselte HTTPS-/TLS-Verbindungen. Passwörter werden ausschließlich in gehashter Form gespeichert.
            </p>
          </section>

          <section>
            <h2 className="font-serif text-2xl font-bold mb-4">15. Änderungen dieser Datenschutzerklärung</h2>
            <p>
              Wir passen diese Datenschutzerklärung an, wenn sich Änderungen an der Verarbeitung oder an der Rechtslage ergeben. Die jeweils aktuelle Fassung ist auf dieser Seite abrufbar.
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
