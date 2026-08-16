'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/app/components/ui';

// ── Funnel, radikal auf 2 Screens reduziert (Cognitive-Walkthrough-Redesign):
// 1) Name + Datum, 2) sichtbare Event-Vorschau mit DJ-Zugang-CTA.
// Die früheren Zwischenfragen (Event-Typ, Pains, Methode, Erklär-Screen) dienten
// nur der Marktforschung, nicht dem Nutzerziel — das Dashboard liest ohnehin nur
// title + date aus. Payload-Form bleibt kompatibel (alte Felder auf null/leer).

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

export default function StartFunnel() {
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
  const [joining, setJoining] = useState(false);
  const dateRef = useRef<HTMLInputElement>(null);

  // Desktop-Browser öffnen den Kalender nur über das (per appearance-none
  // entfernte) Icon — ein Klick irgendwo ins Feld fokussiert sonst nur stumm
  // ein Segment. showPicker() öffnet den Kalender direkt; wo es fehlt
  // (ältere Safari), bleibt die Tastatureingabe über den Fokus nutzbar.
  function openDatePicker() {
    try {
      dateRef.current?.showPicker?.();
    } catch {
      /* showPicker verlangt eine User-Geste, sonst NotAllowedError */
    }
  }

  useEffect(() => {
    track('funnel_start');
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
      body: JSON.stringify({ email: email.trim(), selected_tier: 'dj' }),
    }).catch(() => {});
    setStep(1);
    track('funnel_step', '1');
  }

  function back() {
    if (typeof window !== 'undefined') {
      window.history.back();
    } else {
      setStep(0);
    }
  }

  function join() {
    if (joining) return;
    setJoining(true);
    // Der Ladezustand ist bewusst sichtbar: er benennt, was gerade passiert,
    // bevor die Registrierung erscheint.
    setTimeout(finish, 2000);
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
    track('funnel_complete');
    router.push('/auth/register');
  }

  return (
    <div className="min-h-[100dvh] bg-rave-gradient text-fg font-sans flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 border-b border-line bg-base/80 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold uppercase tracking-tight text-glow-gold">BeatControl</Link>
          {step > 0 ? (
            <button onClick={back} className="text-sm text-fg-muted hover:text-turquoise transition-colors">
              ← Zurück
            </button>
          ) : (
            <Link href="/" className="text-sm text-fg-muted hover:text-turquoise transition-colors">
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
              <p className="text-turquoise text-3xl mb-4">♪</p>
              <h1 className="font-display text-4xl md:text-5xl font-black uppercase leading-tight mb-8 text-glow-turquoise">
                Deine Feier
              </h1>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                placeholder="z. B. Anna und Ben"
                className="w-full h-14 px-5 rounded-2xl border border-line bg-panel text-fg text-center placeholder:text-fg-muted/60 focus:outline-none focus:border-turquoise transition-colors mb-3"
              />
              {/* Nativer date-Input: appearance-none + min-w-0 verhindert den
                  WebKit-Overflow des internen Kalender-Widgets auf Mobile;
                  das Overlay ersetzt den fehlenden Placeholder, solange kein
                  Datum gewählt ist (pointer-events-none lässt Taps durch,
                  peer-focus blendet es aus, damit der Fokus sichtbar bleibt). */}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                inputMode="email"
                autoComplete="email"
                placeholder="Deine E-Mail-Adresse"
                className="w-full h-14 px-5 rounded-2xl border border-line bg-panel text-fg text-center placeholder:text-fg-muted/60 focus:outline-none focus:border-turquoise transition-colors mb-3"
              />
              <div className="relative h-14 mb-4">
                <input
                  ref={dateRef}
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  onClick={openDatePicker}
                  aria-label="Datum der Feier"
                  className="peer absolute inset-0 block w-full h-full min-w-0 appearance-none px-5 rounded-2xl border border-line bg-panel text-fg text-center focus:outline-none focus:border-turquoise transition-colors [&::-webkit-date-and-time-value]:text-center [&::-webkit-date-and-time-value]:h-full [&::-webkit-date-and-time-value]:leading-[3.5rem]"
                />
                {!date && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0.5 rounded-2xl bg-panel flex items-center justify-center text-fg-muted/60 peer-focus:hidden"
                  >
                    Datum eintragen
                  </span>
                )}
              </div>
              <Button
                onClick={create}
                disabled={!canSubmit}
                variant="primary"
                tone="party"
                size="lg"
                className="w-full"
              >
                Event anlegen
              </Button>
            </div>
          )}

          {/* Screen 2: Event-Vorschau + DJ-Zugang-CTA (Belohnungs-Framing statt Verlust-Hinweis) */}
          {step === 1 && (
            <div className="m-auto w-full max-w-md text-center animate-fade-up">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-turquoise mb-4">
                Dein Event ist startklar
              </p>

              {/* Vorschau-Karte im Dashboard-Stil, damit das Event "echt" wirkt */}
              <Card
                tone="party"
                role="button"
                tabIndex={0}
                onClick={join}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); join(); } }}
                aria-busy={joining}
                className="relative mb-6 text-left glow-turquoise cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-turquoise"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h1 className="font-display text-2xl font-black uppercase leading-tight break-words min-w-0">
                    {title.trim() || 'Dein Event'}
                  </h1>
                  <span className="shrink-0 inline-flex items-center gap-1.5 border border-turquoise/40 bg-turquoise/15 text-turquoise rounded-full px-3 py-1 font-display text-xs font-bold uppercase tracking-wide">
                    Startklar
                  </span>
                </div>
                <p className="text-sm text-fg-muted mb-4">{fmtDate(date)}</p>
                <div className="flex items-center gap-3 rounded-2xl border border-line bg-base/40 px-4 py-3">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0 text-turquoise" aria-hidden="true">
                    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" /><path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" /><path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" /><path d="M13 13h2v2h-2zm4 0h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2v-2zm2 6h2v2h-2zm0-4h2v2h-2z" />
                  </svg>
                  <p className="text-sm text-fg-muted text-left">QR-Code und Live-Voting für deine Gäste liegen bereit</p>
                </div>
                {/* Tippfläche sichtbar machen: die ganze Karte löst aus, aber
                    ohne ein Element, das nach Bedienung aussieht, erkennt das
                    niemand. Die Zeile ist kein eigener Knopf, sondern der
                    sichtbare Teil der Karte. */}
                <div className="mt-5 pt-4 border-t border-line flex items-center justify-between gap-3">
                  <span className="font-display text-sm font-bold uppercase tracking-wide text-turquoise">
                    Weiter
                  </span>
                  <svg
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                    className="w-5 h-5 shrink-0 text-turquoise motion-safe:animate-nudge"
                  >
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h9.19L9.47 5.78a.75.75 0 111.06-1.06l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06l3.47-3.47H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>
                {joining && (
                  <div className="absolute inset-0 rounded-3xl bg-base/85 backdrop-blur-sm flex flex-col items-center justify-center gap-4 text-center px-6">
                    <span className="relative flex h-12 w-12" aria-hidden="true">
                      <span className="absolute inset-0 rounded-full border-2 border-turquoise/25" />
                      <span className="absolute inset-0 rounded-full border-2 border-transparent border-t-turquoise animate-spin" />
                      <span className="absolute inset-2 rounded-full bg-turquoise/20 animate-ping" />
                    </span>
                    <p className="font-display text-xs sm:text-sm font-bold uppercase tracking-wide leading-snug text-turquoise max-w-[16rem]">
                      Diesem Event als Organisator beitreten
                    </p>
                  </div>
                )}
              </Card>

              <p className="text-fg-muted leading-relaxed mb-8">
                Leg dir einen kostenlosen DJ-Zugang an, um das Event zu speichern und am Tag des Gigs direkt loszulegen.
              </p>

            </div>
          )}
        </div>
      </main>
    </div>
  );
}
