'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, NavBar, buttonVariants } from '@/app/components/ui';

type Cycle = 'yearly' | 'monthly';
type StripeTier = 'pro_monthly' | 'pro_yearly' | 'event_pass' | 'studio_monthly' | 'studio_yearly';

const PRO_PRICE_YEARLY_PER_MONTH = '49,99';
const PRO_PRICE_YEARLY_TOTAL = '599,88';
const PRO_PRICE_MONTHLY = '59,99';
const EVENT_PASS_PRICE = '19';
const STUDIO_PRICE_MONTHLY = '149';
const STUDIO_PRICE_YEARLY_PER_MONTH = '124';
const STUDIO_PRICE_YEARLY_TOTAL = '1.488';

interface Me {
  plan: 'free' | 'pro' | 'event_pass' | 'studio';
  rawPlan: string;
  email: string;
}

type Cell = string | boolean;
interface FeatureRow {
  label: string;
  free: Cell;
  eventPass: Cell;
  pro: Cell;
  team: Cell;
}
interface FeatureGroup {
  title: string;
  rows: FeatureRow[];
}

const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: 'Events & Songwünsche',
    rows: [
      { label: 'Aktive Events', free: '1', eventPass: '1 Hochzeit', pro: 'Unbegrenzt', team: 'Unbegrenzt' },
      { label: 'Songwünsche', free: 'Bis zu 30', eventPass: 'Unbegrenzt', pro: 'Unbegrenzt', team: 'Unbegrenzt' },
      { label: 'Branding', free: 'BeatControl-Branding', eventPass: 'Dein Branding', pro: 'Dein Branding mit persönlichem Namen und Logo', team: 'Komplett (Whitelabel)' },
      { label: 'QR-Code für Gäste', free: true, eventPass: true, pro: true, team: true },
      { label: 'Export der Musikwünsche zur Nachbereitung', free: false, eventPass: true, pro: true, team: true },
      { label: 'Gast-Karten als Download', free: false, eventPass: false, pro: true, team: true },
    ],
  },
  {
    title: 'Team',
    rows: [
      { label: 'Sub-Accounts für deine DJs', free: false, eventPass: false, pro: false, team: true },
      { label: 'Eigene Subdomain', free: false, eventPass: false, pro: false, team: true },
      { label: 'Custom-Domain möglich', free: false, eventPass: false, pro: false, team: true },
      { label: 'Persönliches Onboarding', free: false, eventPass: false, pro: false, team: true },
    ],
  },
  {
    title: 'Konditionen',
    rows: [
      { label: 'Bindung', free: 'Kein Abo', eventPass: 'Einmalig, keine Bindung', pro: 'Monatlich kündbar', team: 'Monatlich kündbar' },
    ],
  },
];

function FeatureCell({ value }: { value: Cell }) {
  if (typeof value === 'boolean') {
    return value ? (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 mx-auto text-turquoise" aria-hidden="true">
        <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
      </svg>
    ) : (
      <span className="text-fg-muted/40" aria-hidden="true">–</span>
    );
  }
  return <span className="text-fg">{value}</span>;
}

function parsePlan(raw: string | null): StripeTier | null {
  if (
    raw === 'pro_yearly' ||
    raw === 'pro_monthly' ||
    raw === 'event_pass' ||
    raw === 'studio_monthly' ||
    raw === 'studio_yearly'
  ) {
    return raw;
  }
  return null;
}

function PricingPageInner() {
  const params = useSearchParams();
  const router = useRouter();
  const planParam = parsePlan(params.get('plan'));
  const initialCycle: Cycle =
    planParam === 'pro_monthly' || planParam === 'studio_monthly'
      ? 'monthly'
      : planParam === 'pro_yearly' || planParam === 'studio_yearly'
        ? 'yearly'
        : params.get('cycle') === 'monthly'
          ? 'monthly'
          : 'yearly';

  const [cycle, setCycle] = useState<Cycle>(initialCycle);
  const [me, setMe] = useState<Me | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);
  const [busy, setBusy] = useState<StripeTier | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [autoStarted, setAutoStarted] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setMe(d))
      .catch(() => {})
      .finally(() => setLoadingMe(false));
  }, []);

  async function startCheckout(tier: StripeTier) {
    setError(null);
    if (!me) {
      router.push(`/auth/signin?plan=${tier}`);
      return;
    }
    setBusy(tier);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setError('Bezahlung ist noch nicht aktiviert. Wir melden uns, sobald es losgeht.');
        return;
      }
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Checkout konnte nicht gestartet werden.');
        return;
      }
      window.location.href = data.url;
    } catch {
      setError('Verbindungsfehler.');
    } finally {
      setBusy(null);
    }
  }

  useEffect(() => {
    if (autoStarted) return;
    if (loadingMe) return;
    if (!planParam) return;
    if (!me) return;
    const alreadyOnPlan =
      ((planParam === 'pro_yearly' || planParam === 'pro_monthly') && me.plan === 'pro') ||
      ((planParam === 'studio_yearly' || planParam === 'studio_monthly') && me.plan === 'studio');
    if (alreadyOnPlan) return;
    setAutoStarted(true);
    startCheckout(planParam);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMe, me, planParam, autoStarted]);

  async function openPortal() {
    setBusy('pro_monthly');
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setError(data.error ?? 'Portal konnte nicht geöffnet werden.');
        return;
      }
      window.location.href = data.url;
    } finally {
      setBusy(null);
    }
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
  const proTier: StripeTier = cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
  const studioPrice = cycle === 'yearly' ? STUDIO_PRICE_YEARLY_PER_MONTH : STUDIO_PRICE_MONTHLY;
  const studioHint =
    cycle === 'yearly'
      ? `jährlich abgerechnet (€${STUDIO_PRICE_YEARLY_TOTAL}/Jahr)`
      : 'monatlich kündbar';
  const studioTier: StripeTier = cycle === 'yearly' ? 'studio_yearly' : 'studio_monthly';
  const isCurrentPro = me?.plan === 'pro';
  const isCurrentEventPass = me?.plan === 'event_pass';
  const isCurrentStudio = me?.plan === 'studio';

  return (
    <div className="min-h-screen bg-rave-gradient text-fg font-sans">
      <NavBar tone="party">
        <Link href="/" className="font-display text-xl font-bold uppercase tracking-tight">
          BeatControl
        </Link>
        <div className="flex items-center gap-3">
          {me ? (
            <Link href="/dj" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/signin?callbackUrl=/pricing" className={buttonVariants({ variant: 'secondary', size: 'sm' })}>
              DJ-Login
            </Link>
          )}
        </div>
      </NavBar>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h1 className="font-display text-4xl md:text-5xl font-bold uppercase text-center mb-3 text-glow-gold">
          Für jeden Gig der passende Tarif
        </h1>
        <p className="text-fg-muted text-center mb-6 max-w-2xl mx-auto">
          Free zum Ausprobieren. Je Hochzeit für Gelegenheits-Gigs. Pro-Abo für aktive DJs.
          Team für DJ-Kollektive und Eventagenturen.
        </p>
        <p className="text-center text-xs font-mono text-turquoise uppercase tracking-widest mb-12">
          Pilot-Saison 2026 · 30 Tage Geld-zurück auf Pro
        </p>

        {error && (
          <div className="max-w-xl mx-auto mb-8 px-5 py-3 rounded-2xl bg-danger-bg text-danger text-sm text-center border border-danger/40">
            {error}
          </div>
        )}

        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center bg-base/40 border border-line rounded-full p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setCycle('yearly')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
                cycle === 'yearly' ? 'font-display bg-turquoise text-base' : 'font-display text-fg-muted hover:text-fg'
              }`}
            >
              Jährlich −17%
            </button>
            <button
              type="button"
              onClick={() => setCycle('monthly')}
              className={`px-4 py-1.5 rounded-full font-semibold transition-colors ${
                cycle === 'monthly' ? 'font-display bg-turquoise text-base' : 'font-display text-fg-muted hover:text-fg'
              }`}
            >
              Monatlich
            </button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-line shadow-lg shadow-black/30">
          <table className="w-full min-w-[760px] text-sm border-collapse">
            <thead>
              <tr className="bg-panel-elevated">
                <th className="sticky left-0 z-10 bg-panel-elevated w-[260px]" />
                <th className="px-5 py-6 text-left align-bottom border-l border-line">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-fg">Free</span>
                    {me?.plan === 'free' && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  <p className="font-display text-3xl font-bold text-fg mb-1">€0</p>
                  <p className="text-xs text-fg-muted mb-4">für immer kostenlos</p>
                  {me ? (
                    <button
                      disabled
                      className="w-full py-2 rounded-full border border-line text-xs font-medium text-fg-muted cursor-default"
                    >
                      {me.plan === 'free' ? 'Dein aktueller Plan' : 'Kostenlos verfügbar'}
                    </button>
                  ) : (
                    <Link
                      href="/auth/signin?callbackUrl=/dj"
                      className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full' })}
                    >
                      Kostenlos anmelden
                    </Link>
                  )}
                </th>
                <th className="px-5 py-6 text-left align-bottom border-l border-line">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-fg">Je Hochzeit</span>
                    {isCurrentEventPass && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="font-display text-3xl font-bold text-fg">€{EVENT_PASS_PRICE}</p>
                    <p className="text-xs text-fg-muted">/Hochzeit</p>
                  </div>
                  <p className="text-xs text-fg-muted mb-4">einmalig · Kosten gehen ans Brautpaar</p>
                  <button
                    onClick={() => startCheckout('event_pass')}
                    disabled={busy !== null || loadingMe}
                    className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full disabled:opacity-60' })}
                  >
                    {busy === 'event_pass' ? 'Lädt…' : 'Einmalig buchen'}
                  </button>
                </th>
                <th className="px-5 py-6 text-left align-bottom border-l border-turquoise/40 bg-turquoise/5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-fg">Pro</span>
                    {isCurrentPro && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="font-display text-3xl font-bold text-fg">€{proPrice}</p>
                    <p className="text-xs text-fg-muted">/Monat</p>
                  </div>
                  <p className="text-xs text-fg-muted mb-4">{proHint}</p>
                  {isCurrentPro ? (
                    <button
                      onClick={openPortal}
                      disabled={busy !== null}
                      className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full disabled:opacity-60' })}
                    >
                      Abo verwalten
                    </button>
                  ) : (
                    <button
                      onClick={() => startCheckout(proTier)}
                      disabled={busy !== null || loadingMe}
                      className={buttonVariants({ variant: 'primary', size: 'sm', className: 'w-full disabled:opacity-60' })}
                    >
                      {busy === proTier ? 'Lädt…' : 'Pro starten'}
                    </button>
                  )}
                  <p className="text-[10px] text-fg-muted mt-2 text-center">{proFootnote}</p>
                </th>
                <th className="px-5 py-6 text-left align-bottom border-l border-neon-gold/40">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-fg">Team</span>
                    {isCurrentStudio && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-neon-gold mb-1">Für Kollektive</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <p className="font-display text-3xl font-bold text-fg">€{studioPrice}</p>
                    <p className="text-xs text-fg-muted">/Monat</p>
                  </div>
                  <p className="text-xs text-fg-muted mb-4">{studioHint}</p>
                  {isCurrentStudio ? (
                    <button
                      onClick={openPortal}
                      disabled={busy !== null}
                      className="w-full py-2 rounded-full bg-panel-elevated text-fg text-xs font-semibold border border-neon-gold hover:brightness-110 transition-all disabled:opacity-60"
                    >
                      Abo verwalten
                    </button>
                  ) : (
                    <a
                      href="mailto:nibor.bauer1+beatcontrol@gmail.com?subject=Team-Anfrage%20BeatControl&body=Hallo%2C%0A%0Aich%20bin%20interessiert%20am%20Team-Tier%20und%20m%C3%B6chte%20gerne%20ein%20pers%C3%B6nliches%20Onboarding-Gespr%C3%A4ch.%0A%0AMein%20Use-Case%3A%20%5BDJ-Kollektiv%20%2F%20Eventagentur%20%2F%20...%5D%0AAnzahl%20Sub-DJs%3A%20%5B...%5D%0A%0AViele%20Gr%C3%BC%C3%9Fe%0A%5BName%5D"
                      className="w-full py-2 rounded-full bg-panel-elevated text-fg text-xs font-semibold border border-neon-gold hover:brightness-110 transition-all text-center inline-block"
                    >
                      Team anfragen
                    </a>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {FEATURE_GROUPS.flatMap((group) => [
                <tr key={`${group.title}-heading`}>
                  <td colSpan={5} className="sticky left-0 bg-panel px-5 pt-6 pb-2 text-[11px] font-mono uppercase tracking-widest text-fg-muted">
                    {group.title}
                  </td>
                </tr>,
                ...group.rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <td className="sticky left-0 z-10 bg-panel px-5 py-3 text-fg-muted whitespace-nowrap">{row.label}</td>
                    <td className="px-5 py-3 border-l border-line text-center"><FeatureCell value={row.free} /></td>
                    <td className="px-5 py-3 border-l border-line text-center"><FeatureCell value={row.eventPass} /></td>
                    <td className="px-5 py-3 border-l border-turquoise/40 bg-turquoise/5 text-center"><FeatureCell value={row.pro} /></td>
                    <td className="px-5 py-3 border-l border-neon-gold/40 text-center"><FeatureCell value={row.team} /></td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-fg-muted text-center mt-12 max-w-xl mx-auto">
          Alle Preise inkl. MwSt. Zahlung über Stripe. Du kannst jederzeit über das Kunden-Portal kündigen oder Rechnungen einsehen.
        </p>
      </section>

      <footer className="bg-base text-fg-muted py-10 mt-10 border-t border-line">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-display text-lg font-bold uppercase text-fg">BeatControl</span>
          <p className="text-xs text-center">© 2026 BeatControl · Für Hochzeits-DJs und Brautpaare.</p>
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

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-base" />}>
      <PricingPageInner />
    </Suspense>
  );
}
