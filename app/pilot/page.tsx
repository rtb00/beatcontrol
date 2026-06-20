'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';

export default function PilotLanding() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';

  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">
            {brandName}
          </Link>
          <Link
            href="/about"
            className="text-sm px-4 py-1.5 rounded-full border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-white transition-colors"
          >
            Über BeatControl
          </Link>
        </div>
      </nav>

      <section className="max-w-3xl mx-auto px-4 pt-20 pb-12 md:pt-28 md:pb-16">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-5">
          Pilot-Saison Mai–Juli 2026
        </p>
        <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.05] mb-8">
          Wir suchen <span className="text-[#c9a961]">2 Hochzeits-DJs</span>,<br />
          die das Ding ehrlich testen.
        </h1>
        <p className="text-[#8a7a6e] text-lg leading-relaxed mb-10">
          BeatControl ist neu, aber nicht Theorie. Es lief 2026 zum ersten Mal live auf einer echten Hochzeit neben dem Pult, und der DJ hat sich im Übergang darauf verlassen, welchen Song er als Nächstes nimmt. Bevor wir öffentlich gehen, wollen wir das auf zwei weiteren echten Hochzeiten sehen.
          <br /><br />
          Du bist Hochzeits-DJ in DACH und hast diesen Sommer eine Hochzeit, bei der du im Übergang nicht mehr raten willst, was als Nächstes zieht? Komm an Bord.
        </p>
      </section>

      <section className="bg-[#f4ede0] py-16 border-y border-[#e8d9b8]">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-serif text-2xl md:text-3xl font-bold mb-10 text-center">
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
                t: 'Co-Branded Visibility',
                d: 'Du bekommst eine Reference-Card auf der BeatControl-Landing-Page. Aftermovie-Snippet inklusive Credit für dich.',
              },
            ].map(({ t, d }) => (
              <div key={t}>
                <p className="font-semibold text-base mb-2">{t}</p>
                <p className="text-sm text-[#8a7a6e] leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="font-serif text-2xl md:text-3xl font-bold mb-10 text-center">
          Was wir von dir brauchen
        </h2>
        <ol className="space-y-6 text-[#2a2520]">
          {[
            'Du hast eine echte Hochzeit zwischen Mai und Juli 2026 gebucht (DACH, dein eigener Setup).',
            'Du nutzt BeatControl live auf der Hochzeit — als Ergänzung zu deinem normalen Workflow, nicht als Ersatz.',
            'Nach der Hochzeit: ein kurzes O-Ton-Zitat vom Brautpaar (max 2 Sätze, gerne Audio per WhatsApp).',
            'Wenn dein Videograf Aftermovie macht: ein 15–30-Sek-Schnipsel mit Tool-Bezug (QR-Code-Display oder iPad-Shot).',
            'Ein ehrliches 20-Minuten-Feedback-Gespräch eine Woche nach der Hochzeit.',
          ].map((step, i) => (
            <li key={i} className="flex gap-4 items-start">
              <span className="font-serif text-2xl font-bold text-[#c9a961] shrink-0 leading-none w-8">{i + 1}.</span>
              <p className="text-sm leading-relaxed pt-1">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="bewerben" className="bg-[#2a2520] text-[#faf6f0] py-20">
        <div className="max-w-2xl mx-auto px-4">
          {submitted ? (
            <div className="text-center">
              <p className="text-[#c9a961] text-4xl mb-4">♪</p>
              <h2 className="font-serif text-3xl font-bold mb-4">Danke, wir melden uns.</h2>
              <p className="text-[#a89786] leading-relaxed">
                Wir antworten innerhalb von 48 Stunden, meistens schneller. Wenn du nichts hörst, kannst du uns auch direkt eine{' '}
                <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-[#c9a961] underline">Mail schicken</a>.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6 text-center">
                Klingt nach dir?
              </h2>
              <p className="text-[#a89786] leading-relaxed mb-10 text-center">
                Schreib uns kurz — wir melden uns in 48 Stunden. Wer früher schreibt, hat bessere Karten (nur 2 Plätze).
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
                    <label htmlFor={name} className="block text-xs text-[#a89786] mb-1.5">
                      {label}{required && ' *'}
                    </label>
                    <input
                      id={name}
                      name={name}
                      type={type}
                      required={required}
                      className="w-full px-4 py-3 rounded-2xl border border-[#3a342e] bg-[#1a1510] text-[#faf6f0] placeholder:text-[#a89786]/50 focus:outline-none focus:border-[#c9a961] transition-colors"
                    />
                  </div>
                ))}
                <div>
                  <label htmlFor="note" className="block text-xs text-[#a89786] mb-1.5">
                    Erzähl uns kurz über dich (optional)
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    className="w-full px-4 py-3 rounded-2xl border border-[#3a342e] bg-[#1a1510] text-[#faf6f0] placeholder:text-[#a89786]/50 focus:outline-none focus:border-[#c9a961] transition-colors resize-none"
                    placeholder="Wie viele Hochzeiten machst du pro Saison? Was begeistert dich an dem Beruf?"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-4 px-7 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors"
                >
                  Bewerbung senden
                </button>
                <p className="text-xs text-[#a89786] text-center mt-3">
                  Wir öffnen damit deinen Mail-Client. Alternativ kannst du uns direkt eine{' '}
                  <a href="mailto:nibor.bauer1+beatcontrol@gmail.com" className="text-[#c9a961] underline">Mail schicken</a>.
                </p>
              </form>
            </>
          )}
        </div>
      </section>

      <footer className="bg-[#1a1510] text-[#8a7a6e] py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-[#faf6f0]">{brandName}</span>
          <p className="text-xs text-center">© 2026 {brandName} · Für Hochzeiten und die, die sie machen.</p>
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
