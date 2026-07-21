'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Card } from '@/app/components/ui';

// ── Funnel, radikal auf 2 Screens reduziert (Cognitive-Walkthrough-Redesign):
// 1) Name + Datum, 2) sichtbare Event-Vorschau mit Verlust-Hinweis + Sichern-CTA.
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
  const [date, setDate] = useState('');

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

  const canSubmit = !!title.trim() && !!date;

  function create() {
    if (!canSubmit) return;
    if (typeof window !== 'undefined') {
      window.history.pushState({ ...window.history.state, step: 1 }, '');
    }
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

  function finish() {
    const payload = {
      type: null,
      title: title.trim(),
      date,
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
                Wie heißt deine nächste Feier?
              </h1>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                placeholder="z. B. Hochzeit Müller"
                className="w-full px-5 py-4 rounded-2xl border border-line bg-panel text-fg text-center placeholder:text-fg-muted/60 focus:outline-none focus:border-turquoise transition-colors mb-3"
              />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Datum der Feier"
                className="w-full px-5 py-4 rounded-2xl border border-line bg-panel text-fg text-center focus:outline-none focus:border-turquoise transition-colors mb-4"
              />
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
              <p className="text-xs text-fg-muted mt-5">Kostenlos, keine Kreditkarte. Dauert keine Minute.</p>
            </div>
          )}

          {/* Screen 2: Event-Vorschau + Sichern (Verlust-Hinweis statt Feature-Liste) */}
          {step === 1 && (
            <div className="m-auto w-full max-w-md text-center animate-fade-up">
              <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-turquoise mb-4">
                Dein Event ist startklar
              </p>

              {/* Vorschau-Karte im Dashboard-Stil, damit das Event "echt" wirkt */}
              <Card tone="party" className="mb-6 text-left glow-turquoise">
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
              </Card>

              <p className="text-fg-muted leading-relaxed mb-8">
                Noch ist dein Event nicht gespeichert. Wenn du die Seite jetzt schließt, geht es verloren. Sichere es kostenlos, dann liegt es dauerhaft in deinem Dashboard.
              </p>

              <Button onClick={finish} variant="primary" tone="party" size="lg" className="w-full">
                Event kostenlos sichern
              </Button>
              <p className="text-xs text-fg-muted mt-4">
                Anmeldung in 20 Sekunden. Keine Kreditkarte.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
