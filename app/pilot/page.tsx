'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';
import { Button, Input, NavBar } from '@/app/components/ui';

export default function PilotLanding() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">
      <NavBar>
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          {brandName}
        </Link>
      </NavBar>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="font-mono text-xs font-semibold uppercase tracking-widest text-neon-gold mb-5">
          Pilot-Saison Mai–Juli 2026
        </p>
        <h1 className="font-display text-5xl md:text-6xl font-black uppercase leading-[1.05] mb-8 text-glow-gold">
          Wir suchen <span className="text-turquoise">2 Hochzeits-DJs</span>,<br />
          die das Ding ehrlich testen
        </h1>
        <p className="text-fg-muted text-lg leading-relaxed mb-10">
          BeatControl ist neu, aber nicht Theorie. Es lief 2026 zum ersten Mal live auf einer echten Hochzeit neben dem Pult, und der DJ hat sich im Übergang darauf verlassen, welchen Song er als Nächstes nimmt. Bevor wir öffentlich gehen, wollen wir das auf zwei weiteren echten Hochzeiten sehen.
          <br /><br />
          Du bist Hochzeits-DJ in DACH und hast diesen Sommer eine Hochzeit, bei der du im Übergang nicht mehr raten willst, was als Nächstes zieht? Komm an Bord.
        </p>
      </section>

      <section className="bg-panel py-16 border-y border-line">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-2xl md:text-3xl font-black uppercase mb-10 text-center">
            Was du bekommst
          </h2>
          <div className="grid sm:grid-cols-2 gap-8">
            {[
              {
                t: 'Saison-Pro kostenlos',
                d: 'BeatControl Pro für die komplette Saison 2026 ohne Kosten. Unbegrenzt Events, alle Features, dein Branding. Wert ca. €600.',
              },
              {
                t: 'Persönliches Onboarding',
                d: '30-Min-Call mit Robin (Founder, selbst DJ) vor deiner ersten Hochzeit. QR-Code-Setup, iPad-Konfig, Notfall-Plan.',
              },
              {
                t: 'Tech-Standby live',
                d: 'Während deiner Hochzeit ist Robin per WhatsApp/Telefon erreichbar. Wenn was schiefgeht, ist sofort jemand da.',
              },
              {
                t: 'Sichtbarkeit für dich',
                d: 'Du bekommst eine Reference-Card auf der BeatControl-Landing-Page. Aftermovie-Snippet inklusive Credit für dich.',
              },
            ].map(({ t, d }) => (
              <div key={t}>
                <p className="font-semibold text-base mb-2">{t}</p>
                <p className="text-sm text-fg-muted leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="font-display text-2xl md:text-3xl font-black uppercase mb-10 text-center">
          Was wir von dir brauchen
        </h2>
        <ol className="space-y-6 text-fg">
          {[
            'Du hast eine echte Hochzeit zwischen Mai und Juli 2026 gebucht (DACH, dein eigener Setup).',
            'Du nutzt BeatControl live auf der Hochzeit, als Ergänzung zu deinem normalen Workflow, nicht als Ersatz.',
            'Nach der Hochzeit: ein kurzes O-Ton-Zitat vom Brautpaar (max 2 Sätze, gerne Audio per WhatsApp).',
            'Wenn dein Videograf Aftermovie macht: ein 15–30-Sek-Schnipsel mit Tool-Bezug (QR-Code-Display oder iPad-Shot).',
            'Ein ehrliches 20-Minuten-Feedback-Gespräch eine Woche nach der Hochzeit.',
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="font-display text-2xl font-black text-neon-gold shrink-0 leading-none w-8">{i + 1}.</span>
              <p className="text-sm leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="bewerben" className="bg-base-alt py-20 border-t border-line">
        <div className="max-w-2xl mx-auto px-4">
          {submitted ? (
            <div className="text-center">
              <p className="text-neon-gold text-4xl mb-4">♪</p>
              <h2 className="font-display text-3xl font-black uppercase mb-4">Danke, wir melden uns</h2>
              <p className="text-fg-muted leading-relaxed">
                Wir antworten innerhalb von 48 Stunden, meistens schneller. Wenn du nichts hörst, kannst du uns auch direkt eine{' '}
                <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-turquoise underline">Mail schicken</a>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl md:text-4xl font-black uppercase leading-tight mb-6 text-center text-glow-gold">
                Klingt nach dir?
              </h2>
              <p className="text-fg-muted leading-relaxed mb-10 text-center">
                Schreib uns kurz. Wir melden uns in 48 Stunden. Wer früher schreibt, hat bessere Karten (nur 2 Plätze).
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const subject = encodeURIComponent('Pilot-DJ-Bewerbung BeatControl');
                  const body = encodeURIComponent(
                    `Name: ${fd.get('name')}\n` +
                    `Insta/Web: ${fd.get('insta')}\n` +
                    `Hochzeitsdatum: ${fd.get('date')}\n` +
                    `Stadt: ${fd.get('city')}\n` +
                    `Über mich: ${fd.get('note')}\n`
                  );
                  window.location.href = `mailto:nibor.bauer1+beatcontrol@gmail.com?subject=${subject}&body=${body}`;
                  setSubmitted(true);
                }}
                className="space-y-4"
              >
                {[
                  { name: 'name', label: 'Dein Name', type: 'text', required: true },
                  { name: 'insta', label: 'Insta-Handle oder Website', type: 'text', required: false },
                  { name: 'date', label: 'Geplantes Hochzeitsdatum (ungefähr)', type: 'text', required: true },
                  { name: 'city', label: 'Stadt / Region', type: 'text', required: true },
                ].map(({ name, label, type, required }) => (
                  <div key={name}>
                    <label htmlFor={name} className="block text-xs text-fg-muted mb-1.5">
                      {label}{required && ' *'}
                    </label>
                    <Input id={name} name={name} type={type} required={required} />
                  </div>
                ))}
                <div>
                  <label htmlFor="note" className="block text-xs text-fg-muted mb-1.5">
                    Erzähl uns kurz über dich (optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-line bg-panel text-fg placeholder:text-fg-muted focus:outline-none focus:border-turquoise transition-colors resize-none"
                    placeholder="Wie viele Hochzeiten machst du pro Saison? Was begeistert dich an dem Beruf?"
                  />
                </div>
                <Button type="submit" variant="primary" size="lg" className="w-full mt-4">
                  Bewerbung senden
                </Button>
                <p className="text-xs text-fg-muted text-center mt-3">
                  Wir öffnen damit deinen Mail-Client. Alternativ kannst du uns direkt eine{' '}
                  <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-turquoise underline">Mail schicken</a>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="bg-base text-fg-muted py-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-bold text-fg">{brandName}</span>
          <p className="text-xs text-center">© 2026 {brandName} · Für Hochzeiten und die, die sie machen.</p>
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
