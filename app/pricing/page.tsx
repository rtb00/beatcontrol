'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Badge, NavBar, buttonVariants } from '@/app/components/ui';

type Cycle = 'yearly' | 'monthly';
type StripeTier = 'pro_monthly' | 'pro_yearly' | 'event_pass' | 'studio_monthly' | 'studio_yearly';

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

// Zeilen so einheitlich wie möglich als reine Haken; nur die zwei Mengen-Zeilen
// oben tragen Zahlen-Werte. Details (z.B. was Branding umfasst) stehen im
// Zeilen-Label, nicht in den Zellen.
const FEATURE_GROUPS: FeatureGroup[] = [
  {
    title: 'Events & Songwünsche',
    rows: [
      { label: 'Aktive Events', free: '1', eventPass: '1 Hochzeit', pro: 'Unbegrenzt', team: 'Unbegrenzt' },
      { label: 'Songwünsche', free: 'Bis zu 30', eventPass: 'Unbegrenzt', pro: 'Unbegrenzt', team: 'Unbegrenzt' },
      { label: 'QR-Code für Gäste', free: true, eventPass: true, pro: true, team: true },
      { label: 'Export der Musikwünsche zur Nachbereitung', free: false, eventPass: true, pro: true, team: true },
      { label: 'Gast-Karten als Download', free: false, eventPass: true, pro: true, team: true },
    ],
  },
  {
    title: 'Branding',
    rows: [
      { label: 'Eigenes Branding mit Logo und DJ-Namen', free: false, eventPass: true, pro: true, team: true },
      { label: 'Komplett dein Branding (Whitelabel)', free: false, eventPass: false, pro: false, team: true },
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
      { label: 'Für immer kostenlos', free: true, eventPass: false, pro: false, team: false },
      { label: 'Einmalzahlung, kein Abo', free: false, eventPass: true, pro: false, team: false },
      { label: 'Monatlich kündbar', free: false, eventPass: false, pro: true, team: true },
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
      <span className="text-fg-muted" aria-hidden="true">–</span>
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

  // Der Jährlich/Monatlich-Umschalter wurde bewusst entfernt (Tabelle zeigt
  // keine Preise mehr) — cycle bestimmt nur noch, welches Stripe-Produkt der
  // Pro-CTA startet, gesteuert über den ?cycle=-URL-Parameter.
  const [cycle] = useState<Cycle>(initialCycle);
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
    if (!me) {
      // Nicht eingeloggt: direkt weiter zur Anmeldung mit Plan-Vorwahl,
      // statt die Vergleichstabelle als Zwischenstopp zu zeigen.
      setAutoStarted(true);
      router.push(`/auth/signin?plan=${planParam}`);
      return;
    }
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

  const proTier: StripeTier = cycle === 'yearly' ? 'pro_yearly' : 'pro_monthly';
  const isCurrentPro = me?.plan === 'pro';
  const isCurrentEventPass = me?.plan === 'event_pass';
  const isCurrentStudio = me?.plan === 'studio';

  // Mit ?plan= kommt der Nutzer von einem direkten Kauf-CTA: statt der
  // Vergleichstabelle als verwirrendem Zwischenstopp sofort einen
  // Lade-Zustand zeigen, bis Stripe (bzw. die Anmeldung) übernimmt.
  // Nur bei Fehler oder bereits aktivem Plan fällt er auf die Tabelle zurück.
  const alreadyOnPlan =
    !!me &&
    (((planParam === 'pro_yearly' || planParam === 'pro_monthly') && me.plan === 'pro') ||
      ((planParam === 'studio_yearly' || planParam === 'studio_monthly') && me.plan === 'studio'));
  const checkoutPending = !!planParam && !error && !alreadyOnPlan;

  if (checkoutPending) {
    return (
      <div className="min-h-screen bg-rave-gradient text-fg font-sans flex flex-col items-center justify-center gap-5 px-4">
        <span
          className="h-10 w-10 rounded-full border-4 border-line border-t-turquoise animate-spin"
          aria-hidden="true"
        />
        <p className="text-fg-muted text-center">Einen Moment, dein Checkout wird geöffnet …</p>
      </div>
    );
  }

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
          30 Tage Geld-zurück auf Pro
        </p>

        {error && (
          <div className="max-w-xl mx-auto mb-8 px-5 py-3 rounded-2xl bg-danger-bg text-danger text-sm text-center border border-danger/40">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl border border-line shadow-lg shadow-black/30">
          <table className="w-full min-w-[760px] text-sm border-collapse">
            <thead>
              <tr className="bg-panel-elevated">
                <th className="bg-panel-elevated w-[220px] min-w-[220px]" />
                <th className="px-5 py-6 text-left align-bottom border-l border-line">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="font-display font-bold text-lg text-fg">Free</span>
                    {me?.plan === 'free' && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  {me ? (
                    <button
                      disabled
                      className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full' })}
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
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="font-display font-bold text-lg text-fg">Je Hochzeit</span>
                    {isCurrentEventPass && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  <button
                    onClick={() => startCheckout('event_pass')}
                    disabled={busy !== null || loadingMe}
                    className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full disabled:opacity-60' })}
                  >
                    {busy === 'event_pass' ? 'Lädt…' : 'Einmalig buchen'}
                  </button>
                </th>
                <th className="px-5 py-6 text-left align-bottom border-l border-turquoise/40 bg-turquoise/5">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="font-display font-bold text-lg text-fg">Pro</span>
                    {isCurrentPro && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
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
                </th>
                <th className="px-5 py-6 text-left align-bottom border-l border-neon-gold/40">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <span className="font-display font-bold text-lg text-fg">Team</span>
                    {isCurrentStudio && (
                      <Badge color="gold" className="!px-2 !py-0.5">Aktuell</Badge>
                    )}
                  </div>
                  {isCurrentStudio ? (
                    <button
                      onClick={openPortal}
                      disabled={busy !== null}
                      className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full disabled:opacity-60' })}
                    >
                      Abo verwalten
                    </button>
                  ) : (
                    <a
                      href="mailto:nibor.bauer1+beatcontrol@gmail.com?subject=Team-Anfrage%20BeatControl&body=Hallo%2C%0A%0Aich%20bin%20interessiert%20am%20Team-Tier%20und%20m%C3%B6chte%20gerne%20ein%20pers%C3%B6nliches%20Onboarding-Gespr%C3%A4ch.%0A%0AMein%20Use-Case%3A%20%5BDJ-Kollektiv%20%2F%20Eventagentur%20%2F%20...%5D%0AAnzahl%20Sub-DJs%3A%20%5B...%5D%0A%0AViele%20Gr%C3%BC%C3%9Fe%0A%5BName%5D"
                      className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'w-full' })}
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
                  <td colSpan={5} className="bg-panel px-5 pt-6 pb-2 text-[11px] font-mono uppercase tracking-widest text-fg-muted">
                    {group.title}
                  </td>
                </tr>,
                ...group.rows.map((row) => (
                  <tr key={row.label} className="border-t border-line">
                    <td className="bg-panel px-5 py-3 text-fg-muted whitespace-nowrap min-w-[220px]">{row.label}</td>
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
