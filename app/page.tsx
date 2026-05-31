'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useBranding } from '@/app/lib/branding-context';

type Cycle = 'yearly' | 'monthly';
type Audience = 'hochzeit' | 'geburtstag' | 'firma';
type Stats = {
  djs: number;
  events: number;
  songRequests: number;
  votes: number;
  playedSongs: number;
  minutes: number;
};

const PRO_PRICE_YEARLY_PER_MONTH = '49,99';
const PRO_PRICE_YEARLY_TOTAL = '599,88';
const PRO_PRICE_MONTHLY = '59,99';
const EVENT_PASS_PRICE = '19';

const AUDIENCE_LABELS: Record<Audience, string> = {
  hochzeit: 'Hochzeit',
  geburtstag: 'Geburtstag & Party',
  firma: 'Firmenfeier',
};

// Copy-Varianten je Event-Typ. Reframe nach DJ-Interviews:
// "Du liest den Raum, BeatControl liest mit" (Verstärker, kein Ersatz).
// Kein "raten/hoffen", kein "Spotify", "fremd" nur sparsam & als Stärke.
const COPY: Record<Audience, {
  eyebrow: string;
  heroSub: string;
  painEyebrow: string;
  painH2: React.ReactNode;
  painCards: { label: string; text: string }[];
  transitionH2: string;
  transitionBody: string;
  finalBody: string;
}> = {
  hochzeit: {
    eyebrow: 'Für DJs · Hochzeit',
    heroSub:
      'Deine Gäste voten vom Handy, welche Songs ihnen gut gefallen würden. Der mit den meisten Stimmen steht oben auf deinem Screen, du siehst, was gerade gefragt ist, und entscheidest wie immer selbst.',
    painEyebrow: '22:14 Uhr, die Fläche ist voll',
    painH2: (
      <>
        Der Song läuft aus.<br />Was kommt jetzt?
      </>
    ),
    painCards: [
      {
        label: 'Der Moment kippt schnell',
        text: 'Drei Songs könnten passen. Welcher hält die Leute, welcher leert die Fläche? Im Zweifel greifst du zu dem, der nicht wirklich passt, aber von dem du weißt, dass er schon irgendwie läuft.',
      },
      {
        label: 'Ein Wunsch ist noch keine Mehrheit',
        text: 'Jemand wünscht sich einen Song, den du kaum kennst. Will den der eine Gast, oder die halbe Feier? Einem einzelnen Zettel hörst du das nicht an, und im Zweifel legst du ihn lieber nicht auf.',
      },
      {
        label: 'Einer reicht',
        text: 'Ein Griff daneben und zwanzig Leute setzen sich. An die volle Stunde davor erinnert sich am nächsten Tag keiner. An die fünf Minuten leere Fläche schon.',
      },
    ],
    transitionH2: 'Der Floor redet die ganze Zeit. Jetzt kannst du ihm zuhören.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Hochzeiten ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deiner nächsten Hochzeit dabei.',
  },
  geburtstag: {
    eyebrow: 'Für DJs · Geburtstag & Party',
    heroSub:
      'Deine Gäste voten vom Handy, welche Songs ihnen gut gefallen würden. Der mit den meisten Stimmen steht oben auf deinem Screen, du siehst, was gerade gefragt ist, und entscheidest wie immer selbst.',
    painEyebrow: '23:30 Uhr, die Stimmung wackelt',
    painH2: (
      <>
        Die eine Hälfte will tanzen.<br />Die andere will ihren Song.
      </>
    ),
    painCards: [
      {
        label: 'Geschmäcker, die sich beißen',
        text: 'Die Jüngeren wollen Charts, der Onkel will Rock, das Geburtstagskind heimlich Schlager. Du triffst es für die einen und verlierst die anderen, ohne es zu merken.',
      },
      {
        label: 'Keiner sagt dir was',
        text: 'Auf der Party geht keiner ans Pult. Wenn die Fläche leer wird, denken alle „wird schon wieder", und am Ende heißt es, zwischendurch sei es zäh geworden.',
      },
      {
        label: 'Die Kurve entscheidet',
        text: 'Eine Party lebt vom Schwung. Verlierst du ihn einmal, holst du ihn den ganzen Abend nicht mehr zurück. Genau da darfst du nicht daneben greifen.',
      },
    ],
    transitionH2: 'Der Raum redet die ganze Zeit. Jetzt kannst du ihm zuhören.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Partys ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deinem nächsten Gig dabei.',
  },
  firma: {
    eyebrow: 'Für DJs · Firmenfeier',
    heroSub:
      'Deine Gäste voten vom Handy, welche Songs ihnen gut gefallen würden. Der mit den meisten Stimmen steht oben auf deinem Screen, du siehst, was gerade gefragt ist, und entscheidest wie immer selbst.',
    painEyebrow: '21:00 Uhr, noch sitzen alle',
    painH2: (
      <>
        Sechzig Kollegen.<br />Und du kennst keinen.
      </>
    ),
    painCards: [
      {
        label: 'Null Vorinfo',
        text: 'Keine Wunschliste, kein Briefing, nur ein Saal voller Fremder mit Abteilungs-Insidern, die du nicht kennst. Du startest komplett blind in den Abend.',
      },
      {
        label: 'Erst keiner, dann alle oder keiner',
        text: 'Lange traut sich niemand auf die Fläche. Wenn dann der erste Schwung kommt, hast du genau ein, zwei Songs, um ihn zu halten. Triffst du daneben, sitzen sie wieder.',
      },
      {
        label: 'Der Chef schaut zu',
        text: 'Hier entscheidet sich, ob du nächstes Jahr wieder gebucht wirst. Eine zähe Firmenfeier merkt sich die Person, die den Scheck unterschreibt.',
      },
    ],
    transitionH2: 'Der Saal redet die ganze Zeit. Jetzt kannst du ihm zuhören.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Ohne Briefing, ohne Wunschliste weißt du auf einen Blick, was diese fremde Crowd trägt. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Firmenfeiern ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deinem nächsten Gig dabei.',
  },
};

function track(event_type: string, tier_clicked?: string) {
  fetch('/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type, tier_clicked: tier_clicked ?? null, fingerprint: null }),
  }).catch(() => {});
}

export default function LandingPage() {
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const isWhiteLabel = !!branding.subdomain;

  const [cycle, setCycle] = useState<Cycle>('yearly');
  const [audience, setAudience] = useState<Audience>('hochzeit');
  const [audienceOpen, setAudienceOpen] = useState(false);
  const pricingTracked = useRef(false);
  const c = COPY[audience];

  // Mock-Daten für die iPad-Vorschau des echten DJ-Live-Views
  const mockEventTitle =
    audience === 'hochzeit' ? 'Hochzeit Müller' : audience === 'geburtstag' ? 'Sandras 40er' : 'Sommerfest GmbH';
  const mockSlug =
    audience === 'hochzeit' ? 'hochzeit-mueller' : audience === 'geburtstag' ? 'sandras-40er' : 'sommerfest-gmbh';
  const mockSongs = [
    { title: "Can't Stop the Feeling", artist: 'Justin Timberlake', genre: 'Pop', votes: 12 },
    { title: 'Shut Up and Dance', artist: 'Walk the Moon', genre: 'Rock', votes: 9 },
    { title: 'Uptown Funk', artist: 'Bruno Mars', genre: 'Funk', votes: 7 },
    { title: 'Levitating', artist: 'Dua Lipa', genre: 'Pop', votes: 5 },
  ];

  // Social-Proof-Kennzahlen, live aus der DB (/api/stats), niemals erfunden.
  const [stats, setStats] = useState<Stats | null>(null);
  useEffect(() => {
    fetch('/api/stats')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setStats(d))
      .catch(() => {});
  }, []);

  // Kartendefinition: Wert (live), Schwelle (darunter wird die Karte ausgeblendet),
  // Label + Untertitel psychologisch getunt (konkrete Zahl, emotionale Einheit).
  const proofCards = stats
    ? ([
        { value: stats.djs, min: 3, label: 'DJs vertrauen BeatControl', sub: 'im echten Live-Einsatz' },
        { value: stats.events, min: 5, label: 'Veranstaltungen begleitet', sub: 'Hochzeiten, Partys & Firmenfeiern' },
        { value: stats.songRequests, min: 50, label: 'Songwünsche aus dem Publikum', sub: 'jeder einzelne direkt aus dem Raum' },
        { value: stats.minutes, min: 200, label: 'Minuten Tanzfläche', sub: 'gemeinsam mit den Gästen gefüllt' },
      ] as const).filter((s) => s.value >= s.min)
    : [];

  useEffect(() => {
    track('page_view');
  }, []);

  function pickAudience(next: Audience) {
    setAudience(next);
    setAudienceOpen(false);
    track('audience_switch', next);
  }

  const setupPricingObserver = useCallback((el: HTMLElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !pricingTracked.current) {
          pricingTracked.current = true;
          track('pricing_scroll');
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(el);
  }, []);

  function trackCta(tier: string) {
    track('cta_click', tier);
  }

  const proPrice = cycle === 'yearly' ? PRO_PRICE_YEARLY_PER_MONTH : PRO_PRICE_MONTHLY;
  const proHint =
    cycle === 'yearly'
      ? `jährlich abgerechnet (€${PRO_PRICE_YEARLY_TOTAL}/Jahr)`
      : 'monatlich kündbar';
  const proFootnote =
    cycle === 'yearly'
      ? '30 Tage Geld-zurück-Garantie'
      : '30 Tage Geld-zurück-Garantie · monatlich kündbar';

  return (
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">

      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          {branding.brandingLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.brandingLogoUrl} alt={brandName} className="h-8 w-auto object-contain" />
          ) : (
            <span className="font-serif text-xl font-bold tracking-tight">{brandName}</span>
          )}

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Event-Typ-Umschalter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setAudienceOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={audienceOpen}
                className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-[#e8d9b8] text-[#2a2520] hover:border-[#c9a961] transition-colors"
              >
                <span className="text-[#8a7a6e] hidden sm:inline">Für DJs ·</span>
                <span className="font-medium">{AUDIENCE_LABELS[audience]}</span>
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform text-[#c9a961] ${audienceOpen ? 'rotate-180' : ''}`}>
                  <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {audienceOpen && (
                <ul
                  role="listbox"
                  className="absolute right-0 z-30 mt-2 w-52 bg-white border border-[#e8d9b8] rounded-xl shadow-lg overflow-hidden py-1"
                >
                  {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
                    <li key={a} role="option" aria-selected={a === audience}>
                      <button
                        type="button"
                        onClick={() => pickAudience(a)}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          a === audience ? 'bg-[#f4ede0] text-[#2a2520] font-semibold' : 'text-[#8a7a6e] hover:bg-[#faf6f0]'
                        }`}
                      >
                        {AUDIENCE_LABELS[a]}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Link
              href="/auth/signin"
              className="text-sm px-4 py-1.5 rounded-full border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-white transition-colors whitespace-nowrap"
            >
              DJ-Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28">
        <div className="grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
            Dein Gespür für die Tanzfläche.<br />Von den Gästen bestätigt.
          </h1>
          <p className="text-[#8a7a6e] text-lg leading-relaxed mb-8">
            {c.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/start"
              onClick={() => trackCta('free')}
              className="px-7 py-3.5 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm text-center"
            >
              Kostenlos ausprobieren
            </Link>
          </div>
          <p className="text-xs text-[#8a7a6e] mt-4 leading-relaxed">
            Von DJs für DJs gebaut · läuft neben Rekordbox & Serato · kein Download nötig
          </p>
        </div>

        {/* iPad-Mockup, exakte Nachbildung des echten DJ-Live-Views (dj/[slug]) */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[480px] aspect-[4/3] rounded-[1.9rem] bg-[#1d1a16] p-[11px] shadow-2xl ring-1 ring-black/20">
            {/* Front-Kamera im Bezel */}
            <div className="absolute top-[5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0a0907] ring-1 ring-white/10" />
            {/* Screen */}
            <div className="h-full w-full overflow-hidden rounded-[1.1rem] bg-cream flex flex-col">

              {/* Header, wie im echten DJ-View */}
              <div className="shrink-0 bg-ivory border-b border-champagne px-2.5 py-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 flex items-center justify-center rounded-md border border-champagne text-muted">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5"><path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="h-5 w-5 flex items-center justify-center rounded-md border border-gold text-gold bg-gold/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" /><path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" /><path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" /><path d="M13 13h2v2h-2zm4 0h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2v-2zm2 6h2v2h-2zm0-4h2v2h-2z" /></svg>
                  </div>
                  <p className="font-serif text-[10px] font-semibold text-ink truncate">{mockEventTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[6px] uppercase tracking-widest text-muted/70 border border-champagne rounded-full px-1.5 py-px">Pro</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" title="Live" />
                </div>
              </div>

              {/* Body, QR-Sidebar + Songliste */}
              <div className="flex-1 flex overflow-hidden">

                {/* QR-Sidebar */}
                <div className="w-[31%] shrink-0 border-r border-gold/30 flex flex-col items-center justify-center gap-1 px-2 py-2">
                  <p className="text-gold text-[9px] leading-none">♪</p>
                  <p className="font-serif text-[10px] font-semibold text-ink leading-tight text-center">Musikwünsche</p>
                  <p className="text-muted text-[6px] -mt-0.5 mb-0.5">Scanne mich!</p>
                  <div className="bg-white rounded-md p-1 border border-champagne shadow-[0_2px_8px_rgba(201,169,97,0.18)]">
                    <QRCodeSVG value={`https://beatcontrol.io/${mockSlug}`} size={42} fgColor="#2a2520" bgColor="#ffffff" level="M" />
                  </div>
                  <p className="text-muted/60 text-[5px] font-mono break-all text-center leading-tight max-w-[90%]">beatcontrol.io/{mockSlug}</p>
                </div>

                {/* Songliste */}
                <div className="flex-1 overflow-hidden px-2 py-2 flex flex-col gap-1.5">

                  {/* Gerankte Song-Cards */}
                  {mockSongs.map((s, i) => (
                    <div key={s.title} className="bg-ivory rounded-lg p-1.5 flex items-center gap-1.5 border border-champagne shadow-sm">
                      <span className="font-serif italic text-[15px] text-gold/70 leading-none w-3.5 text-center shrink-0 tabular-nums" aria-hidden="true">{i + 1}</span>
                      <div className="w-6 h-6 rounded bg-champagne/70 flex items-center justify-center shrink-0">
                        <span className="text-muted text-[8px]">♪</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-ink text-[7px] truncate flex-1 min-w-0">{s.title}</p>
                          <span className="shrink-0 px-1 py-px bg-gold/15 text-gold text-[5px] font-semibold rounded-full leading-none">{s.genre}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-px">
                          <p className="text-muted text-[6px] truncate min-w-0">{s.artist}</p>
                          <span className="inline-flex items-center gap-0.5 shrink-0 px-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[5px] font-semibold tabular-nums leading-none">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-1.5 h-1.5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" /></svg>
                            {s.votes}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 px-1.5 py-1 rounded-md bg-ink text-cream text-[5px] font-semibold leading-none">✓ Gespielt</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Social Proof, Live-Kennzahlen aus der DB, direkt in der Hero-Section. Blendet sich aus, solange die Zahlen zu klein sind. */}
        {proofCards.length >= 2 && (
          <div className="mt-16 md:mt-20 pt-10 border-t border-[#e8d9b8]">
            <div className={`grid gap-8 sm:gap-6 ${proofCards.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : proofCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
              {proofCards.map((s) => (
                <div key={s.label} className="text-center">
                  <p className="font-serif text-4xl md:text-5xl font-bold text-[#2a2520] tabular-nums leading-none mb-2">
                    {s.value.toLocaleString('de-DE')}
                  </p>
                  <p className="text-sm font-semibold text-[#2a2520] leading-snug">{s.label}</p>
                  <p className="text-xs text-[#8a7a6e] mt-1 leading-snug">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Pilot-Saison Strip, ein Job: 2 Pilot-DJs gewinnen */}
      <section className="bg-[#f4ede0] border-y border-[#e8d9b8] py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c9a961] mb-1">
              Pilot-Saison 2026
            </p>
            <p className="font-serif text-xl md:text-2xl font-semibold text-[#2a2520]">
              Wir suchen 2 DJs für diese Saison.
            </p>
            <p className="text-xs text-[#8a7a6e] mt-1">
              Pro gratis für die ganze Saison, dafür dein ehrliches Feedback nach der Hochzeit.
            </p>
          </div>
          <Link
            href="/pilot"
            className="shrink-0 px-5 py-2.5 rounded-full border border-[#c9a961] text-[#c9a961] text-sm font-semibold hover:bg-[#c9a961] hover:text-white transition-colors whitespace-nowrap"
          >
            Pilot werden
          </Link>
        </div>
      </section>

      {/* Pain section */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6 text-center">
          {c.painEyebrow}
        </p>
        <h2 className="font-serif text-4xl font-bold text-center leading-tight mb-16">
          {c.painH2}
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {c.painCards.map(({ label, text }) => (
            <div key={label} className="border-t-2 border-[#e8d9b8] pt-6">
              <h3 className="font-semibold text-sm mb-3">{label}</h3>
              <p className="text-sm text-[#8a7a6e] leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Transition */}
      <section className="bg-[#2a2520] text-[#faf6f0] py-20 text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-6">
            {c.transitionH2}
          </h2>
          <p className="text-[#8a7a6e] text-lg leading-relaxed">
            {c.transitionBody}
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <h2 className="font-serif text-3xl font-bold text-center mb-16">In drei Schritten zum sicheren Song</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {[
            {
              step: '01',
              title: 'QR-Code hinstellen',
              desc: 'Event anlegen dauert zwei Minuten. QR-Code auf die Tische oder auf den Beamer. Ab da voten deine Gäste vom eigenen Handy. Keine App, kein Download, niemand kommt ans Pult.',
            },
            {
              step: '02',
              title: 'Der Saal stimmt ab',
              desc: 'Jede Stimme schiebt einen Song nach oben. Oben steht immer der Track, den gerade die meisten hören wollen. Keine Vermutung, sondern echte Stimmen aus dem Raum.',
            },
            {
              step: '03',
              title: 'Du greifst zu',
              desc: 'Ein Blick aufs iPad im Übergang, Song in Rekordbox oder Serato laden, auflegen. Passt er gerade nicht? Weg damit, ohne ein Wort. Du behältst das letzte Wort wie immer.',
            },
          ].map(({ step, title, desc }) => (
            <div key={step}>
              <p className="font-serif text-6xl font-bold text-[#e8d9b8] mb-5 leading-none">{step}</p>
              <h3 className="font-semibold mb-3">{title}</h3>
              <p className="text-sm text-[#8a7a6e] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Control objection */}
      <section className="bg-[#f4ede0] border-y border-[#e8d9b8] py-20">
        <div className="max-w-4xl mx-auto px-4 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-[#c9a961] text-xs font-semibold uppercase tracking-widest mb-4">
              Die häufigste Frage
            </p>
            <h2 className="font-serif text-3xl font-bold leading-tight mb-6">
              &ldquo;Übernehmen dann nicht die Gäste mein Set?&rdquo;
            </h2>
            <p className="text-[#8a7a6e] leading-relaxed mb-4">
              Nein. BeatControl sagt dir, was die Leute wollen. Spielen tust immer noch du.
            </p>
            <p className="text-[#8a7a6e] leading-relaxed">
              Passt ein Wunsch nicht in deinen Aufbau, ignorierst du ihn. Niemand kommt ans Pult, niemand sieht, wer was vorgeschlagen hat. Es ist kein Jukebox-Modus, bei dem die Gäste auf Play drücken. Es ist ein Spickzettel, den nur du liest.
            </p>
          </div>
          <div className="flex flex-col gap-6 pt-1">
            {[
              {
                title: 'Songs entfernen',
                desc: 'Songs, die nicht in den Abend passen, entfernst du mit einem Klick. Kein Grund, keine Erklärung gegenüber dem Gast.',
              },
              {
                title: 'Du spielst in deiner Software',
                desc: 'BeatControl zeigt dir, was gewünscht wird. Den Song suchst du in Rekordbox, Serato oder deiner DJ-Software und spielst ihn selbst.',
              },
              {
                title: 'Wünsche sind anonym',
                desc: 'Alle sehen die Wunschliste und wie viele Votes ein Song hat. Wer was vorgeschlagen hat, bleibt anonym. Kein sozialer Druck, keine Konfrontation.',
              },
              {
                title: 'Gespielt heißt gespielt',
                desc: 'Du markierst einen Song in BeatControl als gespielt. Alle Gäste sehen das sofort. Du brauchst nichts zu erklären.',
              },
            ].map(({ title, desc }) => (
              <div key={title} className="flex gap-4">
                <div className="w-px bg-[#c9a961] self-stretch flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm mb-1">{title}</p>
                  <p className="text-sm text-[#8a7a6e] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Von DJs für DJs, Herkunft statt erfundenem Testimonial */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6">
          Von DJs für DJs
        </p>
        <div className="w-8 h-px bg-[#c9a961] mx-auto mb-8" />
        <h2 className="font-serif text-2xl md:text-3xl leading-snug text-[#2a2520] mb-6">
          Gebaut von einem, der selbst am Pult steht.
        </h2>
        <p className="text-[#8a7a6e] text-lg leading-relaxed max-w-2xl mx-auto">
          BeatControl entsteht nicht am Schreibtisch, sondern auf echten Hochzeiten. Jede Funktion kommt aus dem, was am Pult wirklich gebraucht wird, und wird mit DJs zusammen getestet. Was im Einsatz nicht hilft, fliegt wieder raus.
        </p>
        <div className="w-8 h-px bg-[#c9a961] mx-auto mt-8" />
      </section>

      {/* Pricing */}
      <section ref={setupPricingObserver} className="bg-[#f4ede0] py-20" id="pricing">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold text-center mb-3">
            Dein Netz unter der nächsten Entscheidung.
          </h2>
          <p className="text-[#8a7a6e] text-center mb-3 max-w-xl mx-auto">
            Free zum Ausprobieren. Pro Hochzeit für Gelegenheits-Gigs. Pro-Abo für aktive DJs. <Link href="/pricing" className="text-[#c9a961] underline">Studio</Link> für Akademien.
          </p>
          <p className="text-center mb-12 max-w-xl mx-auto">
            <Link href="/pricing" className="text-xs text-[#c9a961] hover:underline">Alle 4 Tarife im Detail vergleichen →</Link>
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <div className="bg-white rounded-2xl p-7 border border-[#e8d9b8] shadow-sm flex flex-col">
              <p className="font-semibold text-sm mb-1">Free</p>
              <p className="font-serif text-4xl font-bold mb-1">€0</p>
              <p className="text-xs text-[#8a7a6e] mb-6">für immer kostenlos</p>
              <ul className="flex flex-col gap-3 text-sm text-[#2a2520] mb-8 flex-1">
                {[
                  '1 aktives Event',
                  'Bis zu 30 Songwünsche',
                  'QR-Code für Gäste',
                  'BeatControl-Branding',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-[#c9a961] text-base leading-none mt-px">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/start"
                onClick={() => trackCta('free')}
                className="w-full py-2.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
              >
                Kostenlos ausprobieren
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#2a2520] text-[#faf6f0] rounded-2xl p-7 shadow-lg flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c9a961] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                Für aktive DJs
              </div>
              <p className="font-semibold text-sm mb-3 text-[#e8d9b8]">Pro</p>

              {/* Cycle toggle, inside the Pro card */}
              <div className="inline-flex self-start items-center bg-white/5 border border-white/10 rounded-full p-0.5 mb-4 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCycle('yearly')}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                    cycle === 'yearly' ? 'bg-[#c9a961] text-white' : 'text-[#e8d9b8]/70 hover:text-[#e8d9b8]'
                  }`}
                >
                  Jährlich −25%
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                    cycle === 'monthly' ? 'bg-[#c9a961] text-white' : 'text-[#e8d9b8]/70 hover:text-[#e8d9b8]'
                  }`}
                >
                  Monatlich
                </button>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <p className="font-serif text-4xl font-bold">€{proPrice}</p>
                <p className="text-sm text-[#8a7a6e]">/Monat</p>
              </div>
              <p className="text-xs text-[#8a7a6e] mb-6">{proHint}</p>
              <ul className="flex flex-col gap-3 text-sm text-[#e8d9b8] mb-6 flex-1">
                {[
                  'Unbegrenzte Events',
                  'Unbegrenzte Songwünsche',
                  'Live-Genre-Analyse',
                  'Gast-Karten als Download',
                  'Export der Musikwünsche zur Nachbereitung',
                  'Songs entfernen wenn sie nicht passen',
                  'Dein Branding mit persönlichem Namen und Logo',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-[#c9a961] text-base leading-none mt-px">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-[#8a7a6e] mb-3 text-center">
                {proFootnote}
              </p>
              <Link
                href={`/auth/signin?plan=${cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly'}`}
                onClick={() => trackCta(cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly')}
                className="w-full py-2.5 rounded-full bg-[#c9a961] text-white text-sm font-semibold hover:bg-[#b8953a] transition-colors text-center"
              >
                Pro starten
              </Link>
            </div>

            {/* Pro Hochzeit (Pay-per-Use) */}
            <div className="bg-white rounded-2xl p-7 border border-[#e8d9b8] shadow-sm flex flex-col">
              <p className="font-semibold text-sm mb-1">Pro Hochzeit</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="font-serif text-4xl font-bold">€{EVENT_PASS_PRICE}</p>
                <p className="text-sm text-[#8a7a6e]">/Hochzeit</p>
              </div>
              <p className="text-xs text-[#8a7a6e] mb-6">einmalig</p>
              <ul className="flex flex-col gap-3 text-sm text-[#2a2520] mb-8 flex-1">
                {[
                  '1 Hochzeit, rund um deinen Termin',
                  'Unbegrenzte Songwünsche',
                  'Songs entfernen wenn sie nicht passen',
                  'Dein Branding inklusive',
                  'Export der Musikwünsche zur Nachbereitung',
                  'Kein Abo, keine Bindung',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span className="text-[#c9a961] text-base leading-none mt-px">·</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signin?plan=event_pass"
                onClick={() => trackCta('event_pass')}
                className="w-full py-2.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
              >
                Einmalig buchen
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">
          Du bist in guter Gesellschaft.
        </h2>
        <p className="text-[#8a7a6e] text-lg mb-10 leading-relaxed">
          {c.finalBody}
        </p>
        <Link
          href="/start"
          onClick={() => trackCta('pro')}
          className="inline-block px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold hover:bg-[#b8953a] transition-colors shadow-sm text-sm"
        >
          Jetzt kostenlos ausprobieren
        </Link>
        <p className="text-xs text-[#8a7a6e] mt-4">Free für immer · keine Kreditkarte nötig.</p>
      </section>

      {/* Footer */}
      <footer className="bg-[#2a2520] text-[#8a7a6e] py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-[#faf6f0]">{brandName}</span>
          <p className="text-xs text-center">
            © 2026 {brandName} · Für Hochzeits-DJs.
            {isWhiteLabel && (
              <>
                <br />
                <span className="text-[10px] opacity-60">Powered by BeatControl</span>
              </>
            )}
          </p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/impressum" className="hover:text-[#c9a961] transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-[#c9a961] transition-colors">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-[#c9a961] transition-colors">
              AGB
            </Link>
            <Link href="/auth/signin" className="hover:text-[#c9a961] transition-colors">
              DJ-Login
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
