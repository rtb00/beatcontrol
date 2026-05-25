'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { useBranding } from '@/app/lib/branding-context';

type Cycle = 'yearly' | 'monthly';
type Audience = 'hochzeit' | 'geburtstag' | 'firma';

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
      'Deine Gäste voten still vom Handy — der Favorit steht mit Stimmenzahl oben auf deinem Screen. Du siehst schwarz auf weiß, was die Fläche trägt, und behältst das letzte Wort.',
    painEyebrow: '22:14 Uhr, die Fläche ist voll',
    painH2: (
      <>
        Der Song läuft aus.<br />Was kommt jetzt?
      </>
    ),
    painCards: [
      {
        label: 'Der Moment kippt schnell',
        text: 'Drei Songs könnten passen. Welcher hält die Fläche, welcher leert sie? Im Zweifel nimmst du das Sichere, das du heute Abend schon zweimal gespielt hast.',
      },
      {
        label: 'Du liest, aber im Halbdunkeln',
        text: 'Achtzig Gäste, drei Generationen. Der Song, bei dem die Tante strahlt, schickt die Trauzeugen an die Bar. Du gewinnst die eine Hälfte und verlierst die andere.',
      },
      {
        label: 'Einer reicht',
        text: 'Ein Griff daneben und zwanzig Leute setzen sich. An die volle Stunde davor erinnert sich am nächsten Tag keiner. An die fünf Minuten leere Fläche schon.',
      },
    ],
    transitionH2: 'Der Floor redet die ganze Zeit. Jetzt hörst du ihn.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'Eine leere Fläche kostet dich die Weiterempfehlung, und die nächste Buchung gleich mit. Probier es bei deiner nächsten Hochzeit. Bringt es dir nichts, hast du nichts verloren.',
  },
  geburtstag: {
    eyebrow: 'Für DJs · Geburtstag & Party',
    heroSub:
      'Deine Gäste voten still vom Handy — der Favorit steht mit Stimmenzahl oben auf deinem Screen. Du siehst schwarz auf weiß, was die Fläche trägt, und behältst das letzte Wort.',
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
        text: 'Auf der Party geht keiner ans Pult. Wenn die Fläche leer wird, denken alle „wird schon wieder" — und am Ende heißt es, zwischendurch sei es zäh geworden.',
      },
      {
        label: 'Die Kurve entscheidet',
        text: 'Eine Party lebt vom Schwung. Verlierst du ihn einmal, holst du ihn den ganzen Abend nicht mehr zurück. Genau da darfst du nicht daneben greifen.',
      },
    ],
    transitionH2: 'Der Raum redet die ganze Zeit. Jetzt hörst du ihn.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Du liest den Raum wie immer, nur mit einem Sinn mehr. Ob du zugreifst, entscheidest du.',
    finalBody:
      'Eine Party, die kippt, spricht sich rum, und die nächste Anfrage bleibt aus. Probier es bei deinem nächsten Gig. Bringt es dir nichts, hast du nichts verloren.',
  },
  firma: {
    eyebrow: 'Für DJs · Firmenfeier',
    heroSub:
      'Deine Gäste voten still vom Handy — der Favorit steht mit Stimmenzahl oben auf deinem Screen. Du siehst schwarz auf weiß, was die Fläche trägt, und behältst das letzte Wort.',
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
    transitionH2: 'Der Saal redet die ganze Zeit. Jetzt hörst du ihn.',
    transitionBody:
      'Deine Gäste voten für die Songs, die sie hören wollen, und der Favorit steht oben in deiner Liste. Ohne Briefing, ohne Wunschliste weißt du auf einen Blick, was diese fremde Crowd trägt. Ob du zugreifst, entscheidest du.',
    finalBody:
      'Eine zähe Firmenfeier kostet dich den Folgeauftrag fürs nächste Jahr. Probier es bei deinem nächsten Gig. Bringt es dir nichts, hast du nichts verloren.',
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
      <section className="max-w-6xl mx-auto px-4 py-20 md:py-28 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold leading-[1.1] mb-6">
            Dein Gespür für die Tanzfläche.<br />Von den Gästen bestätigt.
          </h1>
          <p className="text-[#8a7a6e] text-lg leading-relaxed mb-8">
            {c.heroSub}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/auth/signin"
              onClick={() => trackCta('free')}
              className="px-7 py-3.5 rounded-full bg-[#c9a961] text-white font-semibold text-sm hover:bg-[#b8953a] transition-colors shadow-sm text-center"
            >
              Kostenlos anmelden
            </Link>
            <Link
              href="/auth/signin?plan=pro_yearly"
              onClick={() => trackCta('pro_yearly')}
              className="px-7 py-3.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
            >
              Pro starten
            </Link>
          </div>
          <p className="text-xs text-[#8a7a6e] mt-4 leading-relaxed">
            Von Hochzeits-DJ Daniel im Echtbetrieb gespielt · von DJs mitentwickelt · kein Download für deine Gäste
          </p>
        </div>

        {/* Phone mockup */}
        <div className="flex justify-center">
          <div className="relative w-[230px] h-[440px] bg-[#2a2520] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border-[5px] border-[#2a2520]">
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-[#3a342e] rounded-full" />
            <div className="flex-1 bg-[#faf6f0] mt-8 px-3 py-4 flex flex-col gap-2 overflow-hidden">
              <p className="font-serif text-[11px] font-semibold text-center text-[#2a2520] mb-0.5">
                {audience === 'hochzeit' ? 'Hochzeit Müller' : audience === 'geburtstag' ? 'Sandras 40er' : 'Sommerfest GmbH'} · live
              </p>
              <p className="text-[8px] uppercase tracking-widest text-[#c9a961] font-semibold mb-0.5">
                Nächster sicherer Song
              </p>
              {[
                { title: "Can't Stop the Feeling", artist: 'Justin Timberlake', votes: 12, top: true },
                { title: 'Shut Up and Dance', artist: 'Walk the Moon', votes: 9, top: false },
                { title: 'Uptown Funk', artist: 'Bruno Mars', votes: 7, top: false },
                { title: 'Levitating', artist: 'Dua Lipa', votes: 5, top: false },
              ].map((s) => (
                <div
                  key={s.title}
                  className={`rounded-xl p-2 flex items-center gap-2 shadow-sm ${
                    s.top ? 'bg-[#c9a961]/15 ring-1 ring-[#c9a961]' : 'bg-white'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 ${s.top ? 'bg-[#c9a961]' : 'bg-[#e8d9b8]'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-semibold truncate">{s.title}</p>
                    <p className="text-[8px] text-[#8a7a6e] truncate">{s.artist}</p>
                  </div>
                  <span className="text-[9px] font-bold text-[#c9a961]">+{s.votes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pilot-Saison Strip — ein Job: 2 Pilot-DJs gewinnen */}
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
              Pro gratis für die ganze Saison — dafür dein ehrliches Feedback nach der Hochzeit.
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

      {/* Reference Case — Hochzeit Platen / DJ Daniel Lemke */}
      <section className="max-w-3xl mx-auto px-4 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#c9a961] mb-6">
          Aus der Pilot-Saison
        </p>
        <div className="w-8 h-px bg-[#c9a961] mx-auto mb-8" />
        <blockquote className="font-serif text-2xl md:text-3xl leading-relaxed text-[#2a2520] mb-8">
          &ldquo;Wenn ich im Übergang unter Druck stehe, schaue ich auf die Liste und weiß: dieser Song ist durch die Votes abgesichert. Ich muss nicht mehr raten, ich kann mich drauf verlassen.&rdquo;
        </blockquote>
        <cite className="text-sm text-[#8a7a6e] not-italic block">
          Daniel · Hochzeits-DJ · Pilot-Saison 2026
        </cite>
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
                href="/auth/signin"
                onClick={() => trackCta('free')}
                className="w-full py-2.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
              >
                Kostenlos anmelden
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-[#2a2520] text-[#faf6f0] rounded-2xl p-7 shadow-lg flex flex-col relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c9a961] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
                Für aktive DJs
              </div>
              <p className="font-semibold text-sm mb-3 text-[#e8d9b8]">Pro</p>

              {/* Cycle toggle — inside the Pro card */}
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
              <p className="text-xs text-[#8a7a6e] mb-6">einmalig · die Kosten gibst du einfach ans Brautpaar weiter</p>
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
          Dein nächstes Set. Mit einem Sinn mehr.
        </h2>
        <p className="text-[#8a7a6e] text-lg mb-10 leading-relaxed">
          {c.finalBody}
        </p>
        <Link
          href="/auth/signin"
          onClick={() => trackCta('pro')}
          className="inline-block px-8 py-4 rounded-full bg-[#c9a961] text-white font-semibold hover:bg-[#b8953a] transition-colors shadow-sm text-sm"
        >
          Jetzt kostenlos anmelden
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
