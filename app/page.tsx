'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import { useBranding } from '@/app/lib/branding-context';
import { Card, Badge, NavBar, Reveal, ConfettiCanvas, Accordion, buttonVariants } from '@/app/components/ui';

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
      'Deine Gäste schicken Musikwünsche vom Handy und voten für ihre Favoriten. Du siehst live, was wirklich zieht.',
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
    transitionH2: 'Der Floor redet. Jetzt kannst du ihm zuhören',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Hochzeiten ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deiner nächsten Hochzeit dabei.',
  },
  geburtstag: {
    eyebrow: 'Für DJs · Geburtstag & Party',
    heroSub:
      'Deine Gäste schicken Musikwünsche vom Handy und voten für ihre Favoriten. Du siehst live, was wirklich zieht.',
    painEyebrow: '23:30 Uhr, die Stimmung wackelt',
    painH2: (
      <>
        Die eine Hälfte will tanzen.<br />Die andere will ihren Song
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
    transitionH2: 'Der Raum redet. Jetzt kannst du ihm zuhören',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Partys ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deinem nächsten Gig dabei.',
  },
  firma: {
    eyebrow: 'Für DJs · Firmenfeier',
    heroSub:
      'Deine Gäste schicken Musikwünsche vom Handy und voten für ihre Favoriten. Du siehst live, was wirklich zieht.',
    painEyebrow: '21:00 Uhr, noch sitzen alle',
    painH2: (
      <>
        Sechzig Kollegen.<br />Und du kennst keinen
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
    transitionH2: 'Der Saal redet. Jetzt kannst du ihm zuhören',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Ohne Briefing, ohne Wunschliste weißt du auf einen Blick, was diese fremde Crowd trägt. Ob du zugreifst, entscheidest du.',
    finalBody:
      'DJs setzen BeatControl längst auf echten Firmenfeiern ein und sehen mit einem Blick, welcher Song die Leute hält. Starte kostenlos und sei bei deinem nächsten Gig dabei.',
  },
};

// Je Audience sind die 3 Pain-Cards konzeptionell gleich sortiert: 0 = welcher
// Song ist der richtige (Unsicherheit), 1 = keiner gibt dir Signal, 2 = die
// Konsequenz wenn's schiefgeht. Icons folgen dieser Reihenfolge, nicht dem Text.
const PAIN_ICON_PATHS: ReactNode[] = [
  <>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
    <path d="M9.5 9a2.5 2.5 0 014.9.8c0 1.7-2.4 2-2.4 3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
  </>,
  <>
    <path d="M9 17a3 3 0 006 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 17h12l-1.5-2.5V10a4.5 4.5 0 00-4-4.47V4a1 1 0 10-2 0v1.53A4.5 4.5 0 007.5 10v4.5L6 17z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </>,
  <>
    <path d="M12 4l9 16H3l9-16z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="12" y1="10" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="12" cy="17" r="0.8" fill="currentColor" stroke="none" />
  </>,
];

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
    { title: "Can't Stop the Feeling", artist: 'Justin Timberlake', votes: 12, art: 'https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/68/19/43/68194388-efa7-3afe-8a15-a4c3eebef1f6/886445915211.jpg/200x200bb.jpg' },
    { title: 'Shut Up and Dance', artist: 'Walk the Moon', votes: 9, art: 'https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/bf/b6/76/bfb67621-b78d-3924-6d29-4f367697a674/886445045758.jpg/200x200bb.jpg' },
    { title: 'Uptown Funk', artist: 'Bruno Mars', votes: 7, art: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/7e/30/c5/7e30c572-aa47-5f7b-c6fd-42d50cd2c56d/886444959797.jpg/200x200bb.jpg' },
    { title: 'Levitating', artist: 'Dua Lipa', votes: 5, art: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/6c/11/d6/6c11d681-aa3a-d59e-4c2e-f77e181026ab/190295092665.jpg/200x200bb.jpg' },
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
        { value: stats.events, min: 1, label: 'Veranstaltungen begleitet', sub: 'Hochzeiten, Partys & Firmenfeiern' },
        { value: stats.songRequests, min: 10, label: 'Songwünsche aus dem Publikum', sub: 'jeder einzelne direkt aus dem Raum' },
        { value: stats.minutes, min: 10, label: 'Minuten gespielter Songs', sub: 'live auf der Tanzfläche' },
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
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">

      {/* Navbar */}
      <NavBar tone="party">
        {branding.brandingLogoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={branding.brandingLogoUrl} alt={brandName} className="h-8 w-auto object-contain" />
        ) : (
          <span className="font-display text-xl font-bold tracking-tight uppercase">{brandName}</span>
        )}

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Event-Typ-Umschalter */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setAudienceOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={audienceOpen}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-line text-fg hover:border-neon-gold transition-colors"
            >
              <span className="text-fg-muted hidden sm:inline">Für DJs ·</span>
              <span className="font-medium">{AUDIENCE_LABELS[audience]}</span>
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className={`transition-transform text-[#c9a961] ${audienceOpen ? 'rotate-180' : ''}`}>
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            {audienceOpen && (
              <ul
                role="listbox"
                className="absolute right-0 z-30 mt-2 w-52 bg-panel-elevated border border-line rounded-xl shadow-lg overflow-hidden py-1"
              >
                {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
                  <li key={a} role="option" aria-selected={a === audience}>
                    <button
                      type="button"
                      onClick={() => pickAudience(a)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        a === audience ? 'bg-panel text-fg font-semibold' : 'text-fg-muted hover:bg-panel'
                      }`}
                    >
                      {AUDIENCE_LABELS[a]}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link href="/auth/signin" className={buttonVariants({ variant: 'ghost', size: 'sm', className: 'whitespace-nowrap' })}>
            DJ-Login
          </Link>
        </div>
      </NavBar>

      {/* Hero */}
      <section className="relative overflow-hidden max-w-6xl mx-auto px-4 py-20 md:py-28">
        <ConfettiCanvas className="absolute inset-0 z-0" />
        <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-display font-bold uppercase leading-[1.05] mb-4 text-4xl sm:text-5xl md:text-6xl">
            <span className="block text-fg">Dein Gespür für die <span className="text-glow-gold">Tanzfläche</span>.</span>
            <span className="block text-fg mt-1 text-xl sm:text-2xl md:text-3xl">Von den Gästen <span className="text-glow-gold">bestätigt</span>.</span>
          </h1>
          <p className="text-fg-muted text-lg leading-relaxed mb-8">
            {c.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/start"
              onClick={() => trackCta('free')}
              className={buttonVariants({ variant: 'primary', size: 'lg' })}
            >
              Kostenlos ausprobieren
            </Link>
          </div>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 mt-6 text-xs text-fg-muted">
            {[
              'Von DJs für DJs gebaut',
              'läuft neben Rekordbox & Serato',
              'kein Download, Voting dauert 10 Sekunden',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-neon-gold" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* iPad-Mockup, exakte Nachbildung des echten DJ-Live-Views (dj/[slug]) */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[480px]">
            {/* Ambient Glow hinter dem Geraet, nicht auf der Kante selbst (sonst wirkt der Rand verwaschen) */}
            <div className="absolute -inset-8 bg-magenta/25 blur-3xl rounded-full" aria-hidden="true" />
            <div className="relative aspect-[4/3] rounded-[1.2rem] bg-black p-1 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.85)] ring-1 ring-white/10 rotate-1">
              {/* Screen */}
              <div className="relative h-full w-full overflow-hidden rounded-[0.85rem] bg-panel flex flex-col ring-1 ring-black/60">
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-3.5 bg-black rounded-b-xl z-20" aria-hidden="true" />
                {/* Glas-Reflexion oben, fuer den premium Eindruck */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white/[0.08] to-transparent z-10" />

              {/* Header, wie im echten DJ-View */}
              <div className="shrink-0 bg-panel-elevated border-b border-line px-2.5 py-1.5 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <div className="h-5 w-5 flex items-center justify-center rounded-md border border-line text-fg-muted">
                    <svg viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5"><path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" /></svg>
                  </div>
                  <div className="h-5 w-5 flex items-center justify-center rounded-md border border-neon-gold text-neon-gold bg-neon-gold/10">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-2.5 h-2.5"><path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" /><path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" /><path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" /><path d="M13 13h2v2h-2zm4 0h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2v-2zm2 6h2v2h-2zm0-4h2v2h-2z" /></svg>
                  </div>
                  <p className="font-display text-[10px] font-semibold text-fg truncate">{mockEventTitle}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[6px] uppercase tracking-widest text-fg-muted/70 border border-line rounded-full px-1.5 py-px">Pro</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-gold animate-pulse" title="Live" />
                </div>
              </div>

              {/* Body, QR-Sidebar + Songliste */}
              <div className="flex-1 flex overflow-hidden">

                {/* QR-Sidebar */}
                <div className="w-[31%] shrink-0 border-r border-neon-gold/30 flex flex-col items-center justify-center gap-1 px-2 py-2">
                  <p className="text-neon-gold text-[9px] leading-none">♪</p>
                  <p className="font-display text-[10px] font-semibold text-fg leading-tight text-center">Musikwünsche</p>
                  <p className="text-fg-muted text-[6px] -mt-0.5 mb-0.5">Scanne mich!</p>
                  <div className="bg-white rounded-md p-1 border border-line shadow-[0_2px_8px_rgba(255,206,84,0.18)]">
                    <QRCodeSVG value={`https://beatcontrol.io/${mockSlug}`} size={42} fgColor="#150a26" bgColor="#ffffff" level="M" />
                  </div>
                  <p className="text-fg-muted/60 text-[5px] font-mono break-all text-center leading-tight max-w-[90%]">beatcontrol.io/{mockSlug}</p>
                </div>

                {/* Songliste */}
                <div className="flex-1 overflow-hidden px-2 py-2 flex flex-col gap-1.5">

                  {/* Gerankte Song-Cards */}
                  {mockSongs.map((s, i) => (
                    <div key={s.title} className="bg-panel-elevated rounded-lg p-1.5 flex items-center gap-1.5 border border-line shadow-sm">
                      <span className="font-display italic text-[15px] text-neon-gold/70 leading-none w-3.5 text-center shrink-0 tabular-nums" aria-hidden="true">{i + 1}</span>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.art} alt={s.title} className="w-6 h-6 rounded object-cover shrink-0 bg-line/70" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-fg text-[7px] truncate flex-1 min-w-0">{s.title}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-px">
                          <p className="text-fg-muted text-[6px] truncate min-w-0">{s.artist}</p>
                          <span className="inline-flex items-center gap-0.5 shrink-0 px-1 rounded-full bg-neon-gold/10 border border-neon-gold/25 text-neon-gold text-[5px] font-semibold tabular-nums leading-none">
                            <svg viewBox="0 0 20 20" fill="currentColor" className="w-1.5 h-1.5"><path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" /></svg>
                            {s.votes}
                          </span>
                        </div>
                      </div>
                      <div className="shrink-0 px-1.5 py-1 rounded-md bg-gradient-to-r from-magenta to-neon-gold text-white text-[5px] font-semibold leading-none">✓ Gespielt</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
        </div>

        {/* Social Proof, Live-Kennzahlen aus der DB, direkt in der Hero-Section. Blendet sich aus, solange die Zahlen zu klein sind. */}
        {proofCards.length >= 2 && (
          <div className="mt-16 md:mt-20 pt-10 border-t border-line">
            <div className={`grid gap-8 sm:gap-6 ${proofCards.length >= 4 ? 'grid-cols-2 lg:grid-cols-4' : proofCards.length === 3 ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-2'}`}>
              {proofCards.map((s, i) => (
                <Card
                  key={s.label}
                  tone="party"
                  className="text-center"
                >
                  <p className="font-display text-4xl md:text-5xl font-bold text-neon-gold tabular-nums leading-none mb-2 text-glow-gold">
                    {s.value.toLocaleString('de-DE')}
                  </p>
                  <p className="text-sm font-semibold text-fg leading-snug">{s.label}</p>
                  <p className="text-xs text-fg-muted mt-1 leading-snug">{s.sub}</p>
                </Card>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Pilot-Saison Strip, ein Job: 2 Pilot-DJs gewinnen */}
      <section className="bg-panel border-y border-line py-6">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-[11px] font-mono font-semibold uppercase tracking-widest text-neon-gold mb-1">
              Pilot-Saison 2026
            </p>
            <p className="font-display text-xl md:text-2xl font-semibold text-fg">
              Wir suchen 2 DJs für diese Saison.
            </p>
            <p className="text-xs text-fg-muted mt-1">
              Pro gratis für die ganze Saison, dafür dein ehrliches Feedback nach der Hochzeit.
            </p>
          </div>
          <Link href="/pilot" className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'shrink-0 whitespace-nowrap' })}>
            Pilot werden
          </Link>
        </div>
      </section>

      {/* Pain section */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <Reveal>
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-neon-gold mb-6 text-center">
          {c.painEyebrow}
        </p>
        <h2 className="font-display text-4xl font-bold uppercase text-center leading-tight mb-16">
          {c.painH2}
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {c.painCards.map(({ label, text }, i) => (
            <Card key={label} tone="party">
              <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 mb-4 text-neon-gold" aria-hidden="true">
                {PAIN_ICON_PATHS[i]}
              </svg>
              <h3 className="font-display font-bold uppercase text-sm mb-3 text-neon-gold">{label}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{text}</p>
            </Card>
          ))}
        </div>
        </Reveal>
      </section>

      {/* Transition */}
      <section className="bg-base text-fg py-20 text-center">
        <Reveal className="max-w-2xl mx-auto px-4">
          <h2 className="font-display text-3xl md:text-4xl font-bold uppercase leading-tight mb-6 text-glow-gold">
            {c.transitionH2}
          </h2>
          <p className="text-fg-muted text-lg leading-relaxed">
            {c.transitionBody}
          </p>
        </Reveal>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 py-24">
        <Reveal>
        <h2 className="font-display text-3xl font-bold uppercase text-center mb-16">In drei Schritten zum sicheren Song</h2>
        </Reveal>
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
              desc: 'Voten dauert 10 Sekunden, ganz ohne App. Jede Stimme schiebt einen Song nach oben, oben steht immer der Track, den gerade die meisten hören wollen. Keine Vermutung, sondern echte Stimmen aus dem Raum.',
            },
            {
              step: '03',
              title: 'Du greifst zu',
              desc: 'Ein Blick aufs iPad im Übergang, Song in Rekordbox oder Serato laden, auflegen. Passt er gerade nicht? Weg damit, ohne ein Wort. Du behältst das letzte Wort wie immer.',
            },
          ].map(({ step, title, desc }, i) => (
            <Reveal key={step} delay={i * 120}>
              <p className="font-display text-6xl font-bold text-neon-gold/30 mb-5 leading-none">{step}</p>
              <h3 className="font-display font-bold uppercase mb-3 text-fg">{title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed">{desc}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Von DJs für DJs, Herkunft statt erfundenem Testimonial */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <Reveal>
        <p className="text-xs font-mono font-semibold uppercase tracking-widest text-neon-gold mb-6">
          Von DJs für DJs
        </p>
        <div className="w-8 h-px bg-neon-gold mx-auto mb-8" />
        <h2 className="font-display text-2xl md:text-3xl font-bold uppercase leading-snug text-fg mb-6">
          Gebaut von DJs für DJs
        </h2>
        <p className="text-fg-muted text-lg leading-relaxed max-w-2xl mx-auto">
          BeatControl entsteht nicht am Schreibtisch, sondern auf echten Hochzeiten. Jede Funktion kommt aus dem, was am Pult wirklich gebraucht wird, und wird mit DJs zusammen getestet. Was im Einsatz nicht hilft, fliegt wieder raus.
        </p>
        <div className="w-8 h-px bg-neon-gold mx-auto mt-8" />
        </Reveal>
      </section>

      {/* Pricing */}
      <section ref={setupPricingObserver} className="bg-panel py-20" id="pricing">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="font-display text-3xl font-bold uppercase text-center mb-3 text-glow-gold">
            Für jeden Gig der passende Tarif
          </h2>
          <p className="text-fg-muted text-center mb-3 max-w-xl mx-auto">
            Free zum Ausprobieren. Pro Hochzeit für Gelegenheits-Gigs. Pro-Abo für aktive DJs. <Link href="/pricing" className="text-neon-gold underline">Studio</Link> für Akademien.
          </p>
          <p className="text-center mb-12 max-w-xl mx-auto">
            <Link href="/pricing" className="text-xs text-neon-gold hover:underline">Alle 4 Tarife im Detail vergleichen →</Link>
          </p>

          <div className="grid md:grid-cols-3 gap-6">

            {/* Free */}
            <Card tone="party" className="flex flex-col">
              <p className="font-semibold text-sm mb-1 text-fg">Free</p>
              <p className="font-display text-4xl font-bold mb-1 text-fg">€0</p>
              <p className="text-xs text-fg-muted mb-6">für immer kostenlos</p>
              <ul className="flex flex-col gap-3 text-sm text-fg mb-8 flex-1">
                {[
                  '1 aktives Event',
                  'Bis zu 30 Songwünsche',
                  'QR-Code für Gäste',
                  'BeatControl-Branding',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-neon-gold mt-0.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/start"
                onClick={() => trackCta('free')}
                className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
              >
                Kostenlos ausprobieren
              </Link>
            </Card>

            {/* Pro */}
            <Card tone="party" elevated className="flex flex-col relative glow-magenta">
              <Badge color="magenta" className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                Für aktive DJs
              </Badge>
              <p className="font-semibold text-sm mb-3 text-fg-muted">Pro</p>

              {/* Cycle toggle, inside the Pro card */}
              <div className="inline-flex self-start items-center bg-base/40 border border-line rounded-full p-0.5 mb-4 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCycle('yearly')}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                    cycle === 'yearly' ? 'font-display bg-neon-gold text-base' : 'font-display text-fg-muted hover:text-fg'
                  }`}
                >
                  Jährlich −25%
                </button>
                <button
                  type="button"
                  onClick={() => setCycle('monthly')}
                  className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                    cycle === 'monthly' ? 'font-display bg-neon-gold text-base' : 'font-display text-fg-muted hover:text-fg'
                  }`}
                >
                  Monatlich
                </button>
              </div>

              <div className="flex items-baseline gap-1 mb-1">
                <p className="font-display text-4xl font-bold text-fg">€{proPrice}</p>
                <p className="text-sm text-fg-muted">/Monat</p>
              </div>
              <p className="text-xs text-fg-muted mb-6">{proHint}</p>
              <ul className="flex flex-col gap-3 text-sm text-fg mb-6 flex-1">
                {[
                  'Unbegrenzte Events',
                  'Unbegrenzte Songwünsche',
                  'Gast-Karten als Download',
                  'Export der Musikwünsche zur Nachbereitung',
                  'Songs entfernen wenn sie nicht passen',
                  'Dein Branding mit persönlichem Namen und Logo',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-neon-gold mt-0.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[11px] text-fg-muted mb-3 text-center">
                {proFootnote}
              </p>
              <Link
                href={`/auth/signin?plan=${cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly'}`}
                onClick={() => trackCta(cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly')}
                className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full' })}
              >
                Pro starten
              </Link>
            </Card>

            {/* Pro Hochzeit (Pay-per-Use) */}
            <Card tone="party" className="flex flex-col">
              <p className="font-semibold text-sm mb-1 text-fg">Pro Hochzeit</p>
              <div className="flex items-baseline gap-1 mb-1">
                <p className="font-display text-4xl font-bold text-fg">€{EVENT_PASS_PRICE}</p>
                <p className="text-sm text-fg-muted">/Hochzeit</p>
              </div>
              <p className="text-xs text-fg-muted mb-6">einmalig</p>
              <ul className="flex flex-col gap-3 text-sm text-fg mb-8 flex-1">
                {[
                  '1 Hochzeit, rund um deinen Termin',
                  'Unbegrenzte Songwünsche',
                  'Songs entfernen wenn sie nicht passen',
                  'Dein Branding inklusive',
                  'Export der Musikwünsche zur Nachbereitung',
                  'Kein Abo, keine Bindung',
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-neon-gold mt-0.5" aria-hidden="true">
                      <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/auth/signin?plan=event_pass"
                onClick={() => trackCta('event_pass')}
                className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
              >
                Einmalig buchen
              </Link>
            </Card>
          </div>

        </div>
      </section>

      {/* Einwände, kompakt als Einwand→Entkräftung-Karten statt generischer Vertikallinien */}
      <section className="bg-panel border-y border-line py-20">
        <Reveal className="max-w-4xl mx-auto px-4">
          <p className="text-neon-gold text-xs font-mono font-semibold uppercase tracking-widest mb-4 text-center">
            Die häufigsten Einwände
          </p>
          <h2 className="font-display text-3xl font-bold uppercase leading-tight mb-4 text-center">
            Kurz und ehrlich beantwortet
          </h2>
          <p className="text-fg-muted leading-relaxed mb-12 text-center max-w-xl mx-auto">
            Ein Song, der wirklich zieht, füllt die Fläche. Volle Fläche heißt zufriedene Gäste, und zufriedene Gäste empfehlen dich weiter.
          </p>
          <Accordion
            items={[
              {
                question: '„Übernehmen die Gäste mein Set?"',
                answer: 'Nein. Du entscheidest. BeatControl zeigt dir nur, was die Leute wollen. Gespielt wird, was du auflegst, genau wie immer.',
              },
              {
                question: '„Was, wenn ein Wunsch nicht passt?"',
                answer: 'Mit einem Klick weg. Songs, die nicht in den Abend passen, entfernst du sofort. Kein Grund, keine Erklärung gegenüber dem Gast.',
              },
              {
                question: '„Muss ich in neuer Software spielen?"',
                answer: 'Nein, deine gewohnte. Du spielst weiter in Rekordbox, Serato oder deiner DJ-Software. BeatControl zeigt dir nur, was gewünscht wird.',
              },
              {
                question: '„Sehen Gäste, wer was wollte?"',
                answer: 'Alles anonym. Alle sehen die Wunschliste und die Stimmen, aber nie, wer vorgeschlagen hat. Kein sozialer Druck.',
              },
              {
                question: '„Hängen dann alle nur am Handy?"',
                answer: 'Voten dauert 10 Sekunden. Kein Scrollen, keine App, kein Account. Kurz antippen, Handy wieder weg, dann wird getanzt.',
              },
              {
                question: '„Noch ein Gerät neben Licht & Software?"',
                answer: 'Läuft im Browser, auf deinem Laptop. Ein Tab neben Rekordbox oder Serato. Kein Zusatzgerät, kein neues Kabel am Pult.',
              },
            ]}
          />
        </Reveal>
      </section>

      {/* Final CTA */}
      <section className="max-w-2xl mx-auto px-4 py-24 text-center">
        <Reveal>
        <h2 className="font-display text-3xl md:text-4xl font-bold uppercase mb-4 text-glow-gold">
          Du bist in guter Gesellschaft
        </h2>
        <p className="text-fg-muted text-lg mb-10 leading-relaxed">
          {c.finalBody}
        </p>
        <Link
          href="/start"
          onClick={() => trackCta('pro')}
          className={buttonVariants({ variant: 'primary', size: 'lg', tilt: true })}
        >
          Jetzt kostenlos ausprobieren
        </Link>
        <p className="text-xs text-fg-muted mt-4">Free für immer · keine Kreditkarte nötig.</p>
        </Reveal>
      </section>

      {/* Footer */}
      <footer className="bg-base text-fg-muted py-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-bold uppercase text-fg">{brandName}</span>
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
            <Link href="/impressum" className="hover:text-neon-gold transition-colors">
              Impressum
            </Link>
            <Link href="/datenschutz" className="hover:text-neon-gold transition-colors">
              Datenschutz
            </Link>
            <Link href="/agb" className="hover:text-neon-gold transition-colors">
              AGB
            </Link>
            <Link href="/auth/signin" className="hover:text-neon-gold transition-colors">
              DJ-Login
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
