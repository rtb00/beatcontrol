'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// ── Funnel: anonymer Nutzer richtet sein Event ein, beantwortet feature-deckende
// Fragen und wird auf die Nutzung „heiß gemacht". Antworten + Event landen in
// localStorage; nach der Anmeldung legt das DJ-Dashboard das Event vorbefüllt an.

type EventType = 'hochzeit' | 'geburtstag' | 'firma';

const PENDING_KEY = 'bc_pending_event';

type IconName = 'sparkles' | 'gift' | 'building' | 'megaphone' | 'note' | 'spotify' | 'heart' | 'check' | 'pencil';

const EVENT_TYPES: { id: EventType; icon: IconName; label: string; sub: string }[] = [
  { id: 'hochzeit', icon: 'sparkles', label: 'Hochzeit', sub: 'Der große Tag' },
  { id: 'geburtstag', icon: 'gift', label: 'Geburtstag & Party', sub: 'Von 18 bis 80 auf der Fläche' },
  { id: 'firma', icon: 'building', label: 'Firmenfeier', sub: 'Sommerfest, Weihnachtsfeier & Co.' },
];

const PAINS: { id: string; icon: IconName; label: string }[] = [
  { id: 'einzelwunsch', icon: 'heart', label: 'Nicht wissen: will den Wunsch nur einer, oder die halbe Feier?' },
  { id: 'zettel', icon: 'note', label: 'Wunschzettel, Zurufe und WhatsApp am Pult sortieren' },
  { id: 'pult', icon: 'megaphone', label: 'Gäste, die ständig ans Pult kommen' },
  { id: 'leer', icon: 'note', label: 'Die Fläche leert sich und keiner sagt dir, woran es liegt' },
];

const METHODS: { id: string; icon: IconName; label: string; jab: string }[] = [
  { id: 'spotify', icon: 'spotify', label: 'Spotify-Playlist als Vorbereitung', jab: 'Die Vorbereitung passt. Was die Leute im Moment hören wollen, verrät dir die Playlist aber nicht.' },
  { id: 'karten', icon: 'note', label: 'Musikwunschkarten auf der Feier', jab: 'Schöne Idee. Nur siehst du den Karten nicht an, welcher Wunsch viele begeistert und welcher nur einen.' },
  { id: 'gefuehl', icon: 'heart', label: 'Reines Bauchgefühl', jab: 'Dein Bauchgefühl ist gut, mit echten Stimmen wird es unschlagbar.' },
  { id: 'garnicht', icon: 'note', label: 'Gar nicht, ich ziehe meine Sets durch', jab: 'Funktioniert oft. Bis die fremde Crowd nicht so will wie geplant.' },
];

// Reihenfolge der Fragen-Schritte (Intro = 0, Finish am Ende liegen außerhalb des Balkens).
const QUESTION_STEPS = 5;

function track(event_type: string, tier_clicked?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, tier_clicked: tier_clicked ?? null, fingerprint: null }),
  }).catch(() => {});
}

export default function StartFunnel() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const [type, setType] = useState<EventType | null>(null);
  const [pains, setPains] = useState<string[]>([]);
  const [painsOther, setPainsOther] = useState('');
  const [method, setMethod] = useState<string | null>(null);
  const [methodOther, setMethodOther] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    track('funnel_start');
  }, []);

  // Browser-Zurück soll einen Funnel-Schritt zurückgehen (mit den bereits
  // eingegebenen Daten), statt die Seite zu verlassen. Jeder Schritt vorwärts
  // legt einen eigenen History-Eintrag an; popstate synchronisiert `step` zurück.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Next.js' App Router legt eigene Navigationsdaten in history.state ab —
    // die bestehenden Felder müssen erhalten bleiben, sonst greift beim
    // Zurückgehen Next's Fallback auf einen harten Seiten-Reload statt eines
    // weichen popstate.
    window.history.replaceState({ ...window.history.state, step: 0 }, '');
    function onPopState(e: PopStateEvent) {
      const s = e.state && typeof e.state.step === 'number' ? e.state.step : 0;
      setStep(s);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const ev = title.trim() || 'dein Event';

  function next() {
    setStep((s) => {
      const ns = s + 1;
      if (typeof window !== 'undefined') {
        window.history.pushState({ ...window.history.state, step: ns }, '');
      }
      return ns;
    });
    track('funnel_step', String(step + 1));
  }
  function back() {
    if (typeof window !== 'undefined') {
      window.history.back();
    } else {
      setStep((s) => Math.max(0, s - 1));
    }
  }

  function togglePain(id: string) {
    setPains((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
  }

  function finish() {
    const payload = { type, title: title.trim(), date, pains, painsOther: painsOther.trim() || null, method, methodOther: methodOther.trim() || null, ts: Date.now() };
    try {
      localStorage.setItem(PENDING_KEY, JSON.stringify(payload));
    } catch {
      /* localStorage kann blockiert sein, Funnel läuft trotzdem weiter */
    }
    track('funnel_complete', type ?? undefined);
    router.push('/auth/register');
  }

  const progress = step >= 1 && step <= QUESTION_STEPS ? (step / QUESTION_STEPS) * 100 : null;

  return (
    <div className="min-h-[100dvh] bg-[#faf6f0] text-[#2a2520] font-sans flex flex-col">
      {/* Top bar */}
      <header className="shrink-0 border-b border-[#e8d9b8] bg-[#faf6f0]/90 backdrop-blur">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">BeatControl</Link>
          {step > 0 ? (
            <button onClick={back} className="text-sm text-[#8a7a6e] hover:text-[#c9a961] transition-colors">
              ← Zurück
            </button>
          ) : (
            <Link href="/" className="text-sm text-[#8a7a6e] hover:text-[#c9a961] transition-colors">
              Abbrechen
            </Link>
          )}
        </div>
        {progress !== null && (
          <div className="h-1 w-full bg-[#e8d9b8]/50">
            <div className="h-full bg-[#c9a961] transition-all duration-500 ease-out" style={{ width: `${progress}%` }} />
          </div>
        )}
      </header>

      <main className="flex-1 flex flex-col">
        <div className="w-full max-w-2xl mx-auto px-4 py-10 sm:py-14 flex-1 flex flex-col">

          {/* Step 0, Namens-Erfassung (Commitment-Anker statt reiner Intro) */}
          {step === 0 && (
            <div className="m-auto w-full max-w-md text-center animate-fade-up">
              <p className="text-[#c9a961] text-3xl mb-4">♪</p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold leading-tight mb-4">
                Wie heißt deine nächste Feier?
              </h1>
              <p className="text-[#8a7a6e] text-lg leading-relaxed mb-8">
                Gib ihr einen Namen, und wir richten in einer Minute alles ein, damit die Tanzfläche an dem Abend nicht leer bleibt.
              </p>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) next(); }}
                autoFocus
                placeholder="z. B. Hochzeit Müller"
                className="w-full px-5 py-4 rounded-2xl border border-[#e8d9b8] bg-white text-[#2a2520] text-center placeholder:text-[#8a7a6e]/50 focus:outline-none focus:border-[#c9a961] transition-colors mb-4"
              />
              <button
                onClick={next}
                disabled={!title.trim()}
                className="w-full px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Los geht&apos;s
              </button>
              <p className="text-xs text-[#8a7a6e] mt-5">Kein Download, keine Kreditkarte. Dauert keine Minute.</p>
            </div>
          )}

          {/* Step 1, Event-Typ (single) */}
          {step === 1 && (
            <div className="animate-fade-up flex flex-col flex-1">
              <StepHeader eyebrow="Schritt 1" title={`Was für ein Event ist „${ev}"?`} />
              <div className="flex flex-col gap-3 mb-8">
                {EVENT_TYPES.map((t) => (
                  <SelectCard
                    key={t.id}
                    selected={type === t.id}
                    onClick={() => { setType(t.id); setTimeout(next, 180); }}
                  >
                    <FunnelIcon name={t.icon} className="w-6 h-6 mr-3 shrink-0 text-[#c9a961]" />
                    <span className="min-w-0">
                      <span className="block font-semibold">{t.label}</span>
                      <span className="block text-sm text-[#8a7a6e]">{t.sub}</span>
                    </span>
                  </SelectCard>
                ))}
              </div>
            </div>
          )}

          {/* Step 2, Pains (multi) */}
          {step === 2 && (
            <div className="animate-fade-up flex flex-col flex-1">
              <StepHeader
                eyebrow="Schritt 2"
                title={`Was könnte „${ev}" kippen lassen?`}
                sub="Mehrfachauswahl, sei ruhig ehrlich. Genau hier entscheidet sich der Abend."
              />
              <div className="flex flex-col gap-3 mb-3">
                {PAINS.map((p) => (
                  <SelectCard key={p.id} selected={pains.includes(p.id)} onClick={() => togglePain(p.id)} multi>
                    <FunnelIcon name={p.icon} className="w-5 h-5 mr-3 shrink-0 text-[#c9a961]" />
                    <span className="min-w-0">{p.label}</span>
                  </SelectCard>
                ))}
              </div>
              <div className="relative mb-8">
                <FunnelIcon name="pencil" className="w-5 h-5 text-[#c9a961] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={painsOther}
                  onChange={(e) => setPainsOther(e.target.value)}
                  placeholder="Sonstiges …"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-[#e8d9b8] bg-white text-[#2a2520] placeholder:text-[#8a7a6e]/60 focus:outline-none focus:border-[#c9a961] transition-colors"
                />
              </div>
              <StepFooter onNext={next} disabled={false} label={pains.length || painsOther.trim() ? 'Weiter' : 'Kenne ich alles nicht, weiter'} />
            </div>
          )}

          {/* Step 3, Aktuelle Methode (single) */}
          {step === 3 && (
            <div className="animate-fade-up flex flex-col flex-1">
              <StepHeader eyebrow="Schritt 3" title={`Wie sammelst du für „${ev}" die Wünsche?`} />
              <div className="flex flex-col gap-3 mb-3">
                {METHODS.map((m) => (
                  <SelectCard
                    key={m.id}
                    selected={method === m.id}
                    onClick={() => { setMethod(m.id); setMethodOther(''); }}
                  >
                    <FunnelIcon name={m.icon} className="w-5 h-5 mr-3 shrink-0 text-[#c9a961]" />
                    <span className="min-w-0">{m.label}</span>
                  </SelectCard>
                ))}
              </div>
              <div className="relative mb-6">
                <FunnelIcon name="pencil" className="w-5 h-5 text-[#c9a961] absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={methodOther}
                  onChange={(e) => { setMethodOther(e.target.value); if (e.target.value) setMethod(null); }}
                  placeholder="Sonstiges …"
                  className="w-full pl-12 pr-5 py-4 rounded-2xl border border-[#e8d9b8] bg-white text-[#2a2520] placeholder:text-[#8a7a6e]/60 focus:outline-none focus:border-[#c9a961] transition-colors"
                />
              </div>
              {method && (
                <div className="rounded-2xl bg-[#2a2520] text-[#faf6f0] px-5 py-4 mb-8 animate-fade-in">
                  <p className="text-sm leading-relaxed">
                    {METHODS.find((m) => m.id === method)?.jab}
                  </p>
                </div>
              )}
              <StepFooter onNext={next} disabled={!method && !methodOther.trim()} label="Weiter" />
            </div>
          )}

          {/* Step 4, Reveal / Erklär-Screen */}
          {step === 4 && (
            <div className="animate-fade-up flex flex-col flex-1">
              <StepHeader
                eyebrow="So dreht BeatControl das um"
                title={`So sicherst du „${ev}" ab:`}
              />
              <div className="flex flex-col gap-4 mb-8">
                <RevealRow
                  big="QR"
                  title="Gäste voten still vom Handy"
                  text="Ein QR-Code auf dem Tisch, kein Download. Jede Stimme schiebt einen Song nach oben."
                />
                <RevealRow
                  big="#1"
                  title="Der Favorit steht oben, mit Stimmenzahl"
                  text="Du siehst sofort, ob ein Wunsch von einem kommt oder von der halben Feier. Schluss mit Raten."
                />
                <RevealRow
                  big="✓"
                  title="Gespielt wird trotzdem in deiner Software"
                  text="Du spielst in Rekordbox oder Serato wie immer. Passt ein Wunsch nicht, ist er mit einem Tipp weg."
                />
              </div>
              <StepFooter onNext={next} disabled={false} label="Klingt gut, mein Event einrichten" />
            </div>
          )}

          {/* Step 5, nur noch das Datum (Name kam schon in Step 0) */}
          {step === 5 && (
            <div className="animate-fade-up flex flex-col flex-1">
              <StepHeader
                eyebrow="Fast geschafft"
                title={`Wann steigt „${ev}"?`}
                sub="Nur noch das Datum, dann ist alles eingerichtet. Ändern kannst du es später jederzeit."
              />
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-1.5">Datum der Veranstaltung</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-[#e8d9b8] bg-white text-[#2a2520] focus:outline-none focus:border-[#c9a961] transition-colors"
                />
              </div>
              <StepFooter onNext={next} disabled={!date} label="Mein Event ist startklar →" />
            </div>
          )}

          {/* Step 6, Finish / Hype + CTA */}
          {step === 6 && (
            <div className="m-auto text-center animate-fade-up">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#c9a961]/15 border border-[#c9a961]/40 mb-6">
                <FunnelIcon name="check" className="w-8 h-8 text-[#c9a961]" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a961] mb-3">
                Dein Event ist angelegt
              </p>
              <h1 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4">
                „{title.trim() || 'Dein Event'}" wartet auf dich.
              </h1>
              <p className="text-[#8a7a6e] text-lg leading-relaxed mb-8 max-w-md mx-auto">
                QR-Code, Live-Voting und dein DJ-Screen sind eingerichtet. Sichere dir dein Event kostenlos, dann liegt es startklar in deinem Dashboard.
              </p>

              <div className="rounded-2xl border border-[#e8d9b8] bg-white/60 px-6 py-5 mb-8 text-left max-w-md mx-auto">
                <ul className="flex flex-col gap-2.5 text-sm">
                  {[
                    'Live-Voting per QR, kein Download für deine Gäste',
                    'Favorit mit Stimmenzahl auf deinem Screen',
                    'Läuft neben Rekordbox & Serato',
                    'Free für immer, keine Kreditkarte',
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <span className="text-[#c9a961] mt-px">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={finish}
                className="px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm"
              >
                Event kostenlos sichern
              </button>
              <p className="text-xs text-[#8a7a6e] mt-4">
                Pilot-Saison 2026, gerade kostenlos. Anmeldung in 20 Sekunden.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ── UI-Bausteine ────────────────────────────────────────────────────────────

function StepHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-7">
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a961] mb-3">{eyebrow}</p>
      <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight">{title}</h2>
      {sub && <p className="text-[#8a7a6e] text-sm mt-2">{sub}</p>}
    </div>
  );
}

function SelectCard({
  children, selected, onClick, multi = false,
}: {
  children: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  multi?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center text-left px-5 py-4 rounded-2xl border transition-all active:scale-[0.99] ${
        selected
          ? 'border-[#c9a961] bg-[#c9a961]/10 ring-1 ring-[#c9a961]'
          : 'border-[#e8d9b8] bg-white hover:border-[#c9a961]/60'
      }`}
    >
      <span className="flex-1 flex items-center min-w-0">{children}</span>
      <span
        className={`shrink-0 ml-3 w-5 h-5 flex items-center justify-center border transition-colors ${
          multi ? 'rounded-md' : 'rounded-full'
        } ${selected ? 'bg-[#c9a961] border-[#c9a961] text-white' : 'border-[#c9a961]/40 text-transparent'}`}
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
          <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 011.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
        </svg>
      </span>
    </button>
  );
}

function StepFooter({ onNext, disabled, label }: { onNext: () => void; disabled: boolean; label: string }) {
  return (
    <div className="mt-auto">
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="w-full py-3.5 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {label}
      </button>
    </div>
  );
}

function RevealRow({ big, title, text }: { big: string; title: string; text: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="shrink-0 w-12 h-12 rounded-2xl bg-[#c9a961]/15 border border-[#c9a961]/30 flex items-center justify-center font-serif font-bold text-[#c9a961]">
        {big}
      </span>
      <div>
        <p className="font-semibold mb-0.5">{title}</p>
        <p className="text-sm text-[#8a7a6e] leading-relaxed">{text}</p>
      </div>
    </div>
  );
}

// SVG-Icons (keine Emojis). Heroicons-Stil, plus Spotify-Markenlogo.
function FunnelIcon({ name, className }: { name: IconName; className?: string }) {
  const props = { className, viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true } as const;
  switch (name) {
    case 'sparkles':
      return (
        <svg {...props}>
          <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 008.28 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5zM16.5 15a.75.75 0 01.712.513l.394 1.183c.15.447.5.799.948.948l1.183.395a.75.75 0 010 1.422l-1.183.395a1.5 1.5 0 00-.948.948l-.395 1.183a.75.75 0 01-1.422 0l-.395-1.183a1.5 1.5 0 00-.948-.948l-1.183-.395a.75.75 0 010-1.422l1.183-.395c.447-.15.799-.5.948-.948l.395-1.183A.75.75 0 0116.5 15z" clipRule="evenodd" />
        </svg>
      );
    case 'gift':
      return (
        <svg {...props}>
          <path d="M9.375 3a1.875 1.875 0 000 3.75h1.875v4.5H3.375A1.875 1.875 0 011.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0112 2.753a3.375 3.375 0 015.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 10-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3zM11.25 12.75H3v6.75a2.25 2.25 0 002.25 2.25h6v-9zM12.75 12.75v9h6.75a2.25 2.25 0 002.25-2.25v-6.75h-9z" />
        </svg>
      );
    case 'building':
      return (
        <svg {...props}>
          <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zM9 6a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm-.75 3.75A.75.75 0 019 9h1.5a.75.75 0 010 1.5H9a.75.75 0 01-.75-.75zM9 12a.75.75 0 000 1.5h1.5a.75.75 0 000-1.5H9zm3.75-5.25A.75.75 0 0113.5 6H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM13.5 9a.75.75 0 000 1.5H15A.75.75 0 0015 9h-1.5zm-.75 3.75a.75.75 0 01.75-.75H15a.75.75 0 010 1.5h-1.5a.75.75 0 01-.75-.75zM9 19.5v-2.25a.75.75 0 01.75-.75h4.5a.75.75 0 01.75.75v2.25a.75.75 0 01-.75.75h-4.5A.75.75 0 019 19.5z" clipRule="evenodd" />
        </svg>
      );
    case 'megaphone':
      return (
        <svg {...props}>
          <path d="M16.881 4.346A23.112 23.112 0 018.25 6H7.5a5.25 5.25 0 00-.88 10.427 21.593 21.593 0 001.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.592.772-2.468a17.116 17.116 0 01-.628-1.607c1.918.258 3.76.75 5.5 1.446A23.22 23.22 0 0018 11.25c0-2.413-.367-4.74-1.05-6.929a.997.997 0 00-.069-.075zM18.26 3.74a23.22 23.22 0 011.24 7.51 23.22 23.22 0 01-1.24 7.51c-.055.161-.111.322-.17.482a.75.75 0 101.409.516 24.555 24.555 0 001.415-6.43 2.992 2.992 0 00.836-2.078c0-.806-.319-1.54-.836-2.078a24.65 24.65 0 00-1.415-6.43.75.75 0 10-1.409.516c.059.16.115.321.17.483z" />
        </svg>
      );
    case 'note':
      return (
        <svg {...props}>
          <path d="M19.952 1.651a.75.75 0 01.298.599V16.303a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.403-4.909l2.311-.66a1.5 1.5 0 001.088-1.442V6.994l-9 2.572v9.737a3 3 0 01-2.176 2.884l-1.32.377a2.553 2.553 0 11-1.402-4.909l2.31-.66a1.5 1.5 0 001.088-1.442V5.25a.75.75 0 01.544-.721l10.5-3a.75.75 0 01.658.122z" />
        </svg>
      );
    case 'heart':
      return (
        <svg {...props}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case 'spotify':
      return (
        <svg {...props}>
          <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.56.3z" />
        </svg>
      );
    case 'check':
      return (
        <svg {...props}>
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
        </svg>
      );
    case 'pencil':
      return (
        <svg {...props}>
          <path d="M21.731 2.269a2.625 2.625 0 00-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 000-3.712zM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 00-1.32 2.214l-.8 2.685a.75.75 0 00.933.933l2.685-.8a5.25 5.25 0 002.214-1.32L19.513 8.2z" />
        </svg>
      );
    default:
      return null;
  }
}
