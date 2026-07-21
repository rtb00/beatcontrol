'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Badge, NavBar, buttonVariants } from '@/app/components/ui';

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
          Dein Netz unter der nächsten Entscheidung.
        </h1>
        <p className="text-fg-muted text-center mb-6 max-w-2xl mx-auto">
          Free zum Ausprobieren. Pro Hochzeit für Gelegenheits-Gigs. Pro-Abo für aktive DJs.
          Studio für Akademien und Eventagenturen.
        </p>
        <p className="text-center text-xs font-mono text-red uppercase tracking-widest mb-12">
          Pilot-Saison 2026 · 30 Tage Geld-zurück auf Pro
        </p>

        {error && (
          <div className="max-w-xl mx-auto mb-8 px-5 py-3 rounded-2xl bg-danger-bg text-danger text-sm text-center border border-danger/40">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free */}
          <Card tone="party" className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm text-fg">Free</p>
              {me?.plan === 'free' && (
                <Badge color="gold" className="!px-2 !py-0.5">
                  Aktuell
                </Badge>
              )}
            </div>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-red mt-0.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {me ? (
              <button
                disabled
                className="w-full py-2.5 rounded-full border border-line text-sm font-medium text-fg-muted cursor-default"
              >
                {me.plan === 'free' ? 'Dein aktueller Plan' : 'Kostenlos verfügbar'}
              </button>
            ) : (
              <Link
                href="/auth/signin?callbackUrl=/dj"
                className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full' })}
              >
                Kostenlos anmelden
              </Link>
            )}
          </Card>

          {/* Pro Hochzeit (Pay-per-Use) */}
          <Card tone="party" id="event-pass" className="flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm text-fg">Pro Hochzeit</p>
              {isCurrentEventPass && (
                <Badge color="gold" className="!px-2 !py-0.5">
                  Aktuell
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="font-display text-4xl font-bold text-fg">€{EVENT_PASS_PRICE}</p>
              <p className="text-sm text-fg-muted">/Hochzeit</p>
            </div>
            <p className="text-xs text-fg-muted mb-6">einmalig · die Kosten gibst du ans Brautpaar weiter</p>
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
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-red mt-0.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <button
              onClick={() => startCheckout('event_pass')}
              disabled={busy !== null || loadingMe}
              className={buttonVariants({ variant: 'secondary', size: 'md', className: 'w-full disabled:opacity-60' })}
            >
              {busy === 'event_pass' ? 'Lädt…' : 'Einmalig buchen'}
            </button>
          </Card>

          {/* Pro */}
          <Card tone="party" elevated className="flex flex-col relative glow-red">
            <Badge color="red" className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              Meist gewählt
            </Badge>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-fg-muted">Pro</p>
              {isCurrentPro && (
                <Badge color="gold" className="!px-2 !py-0.5">
                  Aktuell
                </Badge>
              )}
            </div>

            <div className="inline-flex self-start items-center bg-base/40 border border-line rounded-full p-0.5 mb-4 text-[11px]">
              <button
                type="button"
                onClick={() => setCycle('yearly')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  cycle === 'yearly' ? 'font-display bg-red text-white' : 'font-display text-fg-muted hover:text-fg'
                }`}
              >
                Jährlich −17%
              </button>
              <button
                type="button"
                onClick={() => setCycle('monthly')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  cycle === 'monthly' ? 'font-display bg-red text-white' : 'font-display text-fg-muted hover:text-fg'
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
                'Dein Branding mit Namen und Logo',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-red mt-0.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-fg-muted mb-3 text-center">
              {proFootnote}
            </p>
            {isCurrentPro ? (
              <button
                onClick={openPortal}
                disabled={busy !== null}
                className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full disabled:opacity-60' })}
              >
                Abo verwalten
              </button>
            ) : (
              <button
                onClick={() => startCheckout(proTier)}
                disabled={busy !== null || loadingMe}
                className={buttonVariants({ variant: 'primary', size: 'md', className: 'w-full disabled:opacity-60' })}
              >
                {busy === proTier ? 'Lädt…' : 'Pro starten'}
              </button>
            )}
          </Card>

          {/* Studio */}
          <Card tone="party" className="border-2 border-neon-gold flex flex-col relative">
            <Badge color="neutral" className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
              Für Akademien
            </Badge>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-fg">Studio</p>
              {isCurrentStudio && (
                <Badge color="gold" className="!px-2 !py-0.5">
                  Aktuell
                </Badge>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="font-display text-4xl font-bold text-fg">€{studioPrice}</p>
              <p className="text-sm text-fg-muted">/Monat</p>
            </div>
            <p className="text-xs text-fg-muted mb-6">{studioHint}</p>
            <ul className="flex flex-col gap-3 text-sm text-fg mb-8 flex-1">
              {[
                'Alles aus Pro',
                'Sub-Accounts für deine DJs',
                'Eigene Subdomain (kunde.beatcontrol.io)',
                'Custom-Domain möglich',
                'Komplett dein Branding (Whitelabel)',
                'Persönliches Onboarding',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0 text-neon-gold mt-0.5" aria-hidden="true">
                    <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                  </svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {isCurrentStudio ? (
              <button
                onClick={openPortal}
                disabled={busy !== null}
                className="w-full py-2.5 rounded-full bg-panel-elevated text-fg text-sm font-semibold border border-neon-gold hover:brightness-110 transition-all disabled:opacity-60"
              >
                Abo verwalten
              </button>
            ) : (
              <a
                href="mailto:nibor.bauer1+beatcontrol@gmail.com?subject=Studio-Anfrage%20BeatControl&body=Hallo%2C%0A%0Aich%20bin%20interessiert%20am%20Studio-Tier%20und%20m%C3%B6chte%20gerne%20ein%20pers%C3%B6nliches%20Onboarding-Gespr%C3%A4ch.%0A%0AMein%20Use-Case%3A%20%5BAkademie%20%2F%20Eventagentur%20%2F%20...%5D%0AAnzahl%20Sub-DJs%3A%20%5B...%5D%0A%0AViele%20Gr%C3%BC%C3%9Fe%0A%5BName%5D"
                className="w-full py-2.5 rounded-full bg-panel-elevated text-fg text-sm font-semibold border border-neon-gold hover:brightness-110 transition-all text-center inline-block"
              >
                Studio anfragen
              </a>
            )}
          </Card>
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
            <Link href="/impressum" className="hover:text-red transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-red transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-red transition-colors">AGB</Link>
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
