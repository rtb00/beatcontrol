'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/app/components/ui';

// ── Brautpaar-Variante des /start-Funnels (gleiche 2 Screens, Ihr-Form):
// 1) Name + Datum der Feier, 2) sichtbare Listen-Vorschau mit Zugang-CTA.
// Bewusst OHNE plan-Parameter zum Register: erst ausprobieren, der 49-€-Kauf
// kommt später im Produkt. Payload-Form identisch zu /start, damit /dj die
// Liste nach dem Register automatisch anlegt.

const PENDING_KEY = 'bc_pending_event';

function track(event_type: string, tier_clicked?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, tier_clicked: tier_clicked ?? null, fingerprint: null }),
  }).catch(() => {});
}

function fmtDate(d: string): string {
  if (!d) return '';
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return d;
  }
}

export default function BrautpaarStartFunnel() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  // Vorbelegung ein Jahr voraus: Hochzeiten werden lange im Voraus geplant,
  // und ein gefülltes Feld ist schneller korrigiert als eines, das bei null steht.
  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().slice(0, 10);
  });
  const [email, setEmail] = useState('');
  const dateRef = useRef<HTMLInputElement>(null);

  // Desktop-Browser öffnen den Kalender nur über das (per appearance-none
  // entfernte) Icon — showPicker() öffnet ihn direkt; wo es fehlt (ältere
  // Safari), bleibt die Tastatureingabe über den Fokus nutzbar.
  function openDatePicker() {
    try {
      dateRef.current?.showPicker?.();
    } catch {
      /* showPicker verlangt eine User-Geste, sonst NotAllowedError */
    }
  }

  useEffect(() => {
    track('funnel_start', 'brautpaar');
  }, []);

  // Browser-Zurück soll zum Eingabe-Screen zurückführen statt die Seite zu
  // verlassen. Next.js' App Router legt eigene Navigationsdaten in
  // history.state ab — die bestehenden Felder müssen erhalten bleiben.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.history.replaceState({ ...window.history.state, step: 0 }, '');
    function onPopState(e: PopStateEvent) {
      const s = e.state && typeof e.state.step === 'number' ? e.state.step : 0;
      setStep(s);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const canSubmit = !!title.trim() && !!date && emailValid;

  function create() {
    if (!canSubmit) return;
    if (typeof window !== 'undefined') {
      window.history.pushState({ ...window.history.state, step: 1 }, '');
    }
    fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), selected_tier: 'brautpaar' }),
    }).catch(() => {});
    setStep(1);
    track('funnel_step', 'brautpaar-1');
  }

  function back() {
    if (typeof window !== 'undefined') {
      window.history.back();
    } else {
      setStep(0);
    }
  }

  function finish() {
    const payload = {
      type: null,
      title: title.trim(),
      date,
      email: email.trim(),
      pains: [],
      painsOther: null,
      method: null,
      methodOther: null,
      ts: Date.now(),
    };
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
    } catch {
      /* localStorage kann blockiert sein, Funnel läuft trotzdem weiter */
    }
    track('funnel_complete', 'brautpaar');
    router.push('/auth/register');
  }

  return (
    <div className="min-h-[100dvh] bg-rave-gradient text-fg font-sans flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 border-b border-line bg-base/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/brautpaar" className="font-display text-xl font-bold uppercase tracking-tight text-glow-gold">BeatControl</Link>
          {step > 0 ? (
            <button onClick={back} className="text-sm text-fg-muted hover:text-turquoise transition-colors">
              ← Zurück
            </button>
          ) : (
            <Link href="/brautpaar" className="text-sm text-fg-muted hover:text-turquoise transition-colors">
              Abbrechen
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-2xl mx-auto px-4 py-10 sm:py-14 flex-1 flex flex-col">

          {/* Screen 1: Name + Datum */}
          {step === 0 && (
            <div className="m-auto w-full max-w-md text-center animate-fade-up">
              <p className="text-neon-gold text-3xl mb-4">♪</p>
              <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight mb-8 text-glow-gold">
                Eure Feier
              </h1>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                placeholder="z. B. Anna und Ben"
                className="w-full h-14 px-5 rounded-2xl border border-line bg-panel text-fg text-center placeholder:text-fg-muted/60 focus:outline-none focus:border-neon-gold transition-colors mb-3"
              />
              {/* Nativer date-Input: appearance-none + min-w-0 verhindert den
                  WebKit-Overflow des internen Kalender-Widgets auf Mobile;
                  das Overlay ersetzt den fehlenden Placeholder, solange kein
                  Datum gewählt ist (pointer-events-none lässt Taps durch,
                  peer-focus blendet es aus, damit der Fokus sichtbar bleibt). */}
              <div className="relative h-14 mb-4">
                <input
                  ref={dateRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={openDatePicker}
                  aria-label="Datum der Feier"
                  className="peer absolute inset-0 block w-full h-full min-w-0 appearance-none px-5 rounded-2xl border border-line bg-panel text-fg text-center focus:outline-none focus:border-neon-gold transition-colors [&::-webkit-date-and-time-value]:text-center [&::-webkit-date-and-time-value]:h-full [&::-webkit-date-and-time-value]:leading-[3.5rem]"
                />
                {!date && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0.5 rounded-2xl bg-panel flex items-center justify-center text-fg-muted/60 peer-focus:hidden"
                  >
                    Wann feiert ihr?
                  </span>
                )}
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="E-Mail-Adresse"
                className="w-full h-14 px-5 rounded-2xl border border-line bg-panel text-fg text-center placeholder:text-fg-muted/60 focus:outline-none focus:border-neon-gold transition-colors mb-4"
              />
              <Button
                onClick={create}
                disabled={!canSubmit}
                variant="primary"
                tone="party"
                size="lg"
                className="w-full"
              >
                Musikwunschliste anlegen
              </Button>
              <p className="text-xs text-fg-muted mt-5">Kostenlos, keine Kreditkarte. Dauert keine Minute.</p>
            </div>
          )}

          {/* Screen 2: Listen-Vorschau + Zugang-CTA (Belohnungs-Framing statt Verlust-Hinweis) */}
          {step === 1 && (
            <div className="m-auto w-full max-w-md text-center animate-fade-up">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-neon-gold mb-8">
                Eure Musikwunschliste ist startklar
              </p>

              {/* Vorschau-Karte im Dashboard-Stil, damit die Liste "echt" wirkt */}
              <Card tone="party" className="mb-6 text-left glow-gold">
                <h1 className="font-display text-2xl font-black uppercase leading-tight break-words mb-3">
                  {title.trim() || 'Eure Feier'}
                </h1>
                <p className="text-sm text-fg-muted mb-4">{fmtDate(date)}</p>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-base/40 px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0 text-neon-gold" aria-hidden="true">
                    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" /><path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" /><path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" /><path d="M13 13h2v2h-2zm4 0h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2v-2zm2 6h2v2h-2zm0-4h2v2h-2z" />
                  </svg>
                  <p className="text-sm text-fg-muted text-left">Der QR-Code für eure Gäste liegt bereit</p>
                </div>
              </Card>

              <Button onClick={finish} variant="primary" tone="party" size="lg" className="w-full">
                Kostenlosen Zugang anlegen
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
