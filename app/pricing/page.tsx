'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
    <div className="min-h-screen bg-[#faf6f0] text-[#2a2520] font-sans">
      <nav className="sticky top-0 z-40 bg-[#faf6f0]/90 backdrop-blur border-b border-[#e8d9b8]">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="font-serif text-xl font-bold tracking-tight">
            BeatControl
          </Link>
          <div className="flex items-center gap-3">
            {me ? (
              <Link
                href="/dj"
                className="text-sm px-4 py-1.5 rounded-full border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/auth/signin?callbackUrl=/pricing"
                className="text-sm px-4 py-1.5 rounded-full border border-[#c9a961] text-[#c9a961] hover:bg-[#c9a961] hover:text-white transition-colors"
              >
                DJ-Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-4 py-16 md:py-20">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-center mb-3">
          Dein Netz unter der nächsten Entscheidung.
        </h1>
        <p className="text-[#8a7a6e] text-center mb-6 max-w-2xl mx-auto">
          Free zum Ausprobieren. Pro Hochzeit für Gelegenheits-Gigs. Pro-Abo für aktive DJs.
          Studio für Akademien und Eventagenturen.
        </p>
        <p className="text-center text-xs text-[#c9a961] uppercase tracking-widest mb-12">
          Pilot-Saison 2026 · 30 Tage Geld-zurück auf Pro
        </p>

        {error && (
          <div className="max-w-xl mx-auto mb-8 px-5 py-3 rounded-2xl bg-red-50 text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Free */}
          <div className="bg-white rounded-2xl p-6 border border-[#e8d9b8] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">Free</p>
              {me?.plan === 'free' && (
                <span className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold">
                  Aktuell
                </span>
              )}
            </div>
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
            {me ? (
              <button
                disabled
                className="w-full py-2.5 rounded-full border border-[#2a2520]/10 text-sm font-medium text-[#8a7a6e] cursor-default"
              >
                {me.plan === 'free' ? 'Dein aktueller Plan' : 'Kostenlos verfügbar'}
              </button>
            ) : (
              <Link
                href="/auth/signin?callbackUrl=/dj"
                className="w-full py-2.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors text-center"
              >
                Kostenlos anmelden
              </Link>
            )}
          </div>

          {/* Pro Hochzeit (Pay-per-Use) */}
          <div id="event-pass" className="bg-white rounded-2xl p-6 border border-[#e8d9b8] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">Pro Hochzeit</p>
              {isCurrentEventPass && (
                <span className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold">
                  Aktuell
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="font-serif text-4xl font-bold">€{EVENT_PASS_PRICE}</p>
              <p className="text-sm text-[#8a7a6e]">/Hochzeit</p>
            </div>
            <p className="text-xs text-[#8a7a6e] mb-6">einmalig · die Kosten gibst du ans Brautpaar weiter</p>
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
            <button
              onClick={() => startCheckout('event_pass')}
              disabled={busy !== null || loadingMe}
              className="w-full py-2.5 rounded-full border border-[#2a2520]/20 text-sm font-medium hover:border-[#c9a961] transition-colors disabled:opacity-60"
            >
              {busy === 'event_pass' ? 'Lädt…' : 'Einmalig buchen'}
            </button>
          </div>

          {/* Pro */}
          <div className="bg-[#2a2520] text-[#faf6f0] rounded-2xl p-6 shadow-lg flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#c9a961] text-white text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              Meist gewählt
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm text-[#e8d9b8]">Pro</p>
              {isCurrentPro && (
                <span className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold">
                  Aktuell
                </span>
              )}
            </div>

            <div className="inline-flex self-start items-center bg-white/5 border border-white/10 rounded-full p-0.5 mb-4 text-[11px]">
              <button
                type="button"
                onClick={() => setCycle('yearly')}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  cycle === 'yearly' ? 'bg-[#c9a961] text-white' : 'text-[#e8d9b8]/70 hover:text-[#e8d9b8]'
                }`}
              >
                Jährlich −17%
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
                'Dein Branding mit Namen und Logo',
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
            {isCurrentPro ? (
              <button
                onClick={openPortal}
                disabled={busy !== null}
                className="w-full py-2.5 rounded-full bg-[#c9a961] text-white text-sm font-semibold hover:bg-[#b8953a] transition-colors disabled:opacity-60"
              >
                Abo verwalten
              </button>
            ) : (
              <button
                onClick={() => startCheckout(proTier)}
                disabled={busy !== null || loadingMe}
                className="w-full py-2.5 rounded-full bg-[#c9a961] text-white text-sm font-semibold hover:bg-[#b8953a] transition-colors disabled:opacity-60"
              >
                {busy === proTier ? 'Lädt…' : 'Pro starten'}
              </button>
            )}
          </div>

          {/* Studio */}
          <div className="bg-white rounded-2xl p-6 border-2 border-[#c9a961] shadow-md flex flex-col relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#2a2520] text-[#e8d9b8] text-xs font-semibold px-4 py-1 rounded-full whitespace-nowrap">
              Für Akademien
            </div>
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">Studio</p>
              {isCurrentStudio && (
                <span className="text-[10px] uppercase tracking-widest text-[#c9a961] font-semibold">
                  Aktuell
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <p className="font-serif text-4xl font-bold">€{studioPrice}</p>
              <p className="text-sm text-[#8a7a6e]">/Monat</p>
            </div>
            <p className="text-xs text-[#8a7a6e] mb-6">{studioHint}</p>
            <ul className="flex flex-col gap-3 text-sm text-[#2a2520] mb-8 flex-1">
              {[
                'Alles aus Pro',
                'Sub-Accounts für deine DJs',
                'Eigene Subdomain (kunde.beatcontrol.io)',
                'Custom-Domain möglich',
                'Komplett dein Branding (Whitelabel)',
                'Persönliches Onboarding',
              ].map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="text-[#c9a961] text-base leading-none mt-px">·</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            {isCurrentStudio ? (
              <button
                onClick={openPortal}
                disabled={busy !== null}
                className="w-full py-2.5 rounded-full bg-[#2a2520] text-[#e8d9b8] text-sm font-semibold hover:bg-[#1a1510] transition-colors disabled:opacity-60"
              >
                Abo verwalten
              </button>
            ) : (
              <a
                href="mailto:hallo@beatcontrol.io?subject=Studio-Anfrage%20BeatControl&body=Hallo%2C%0A%0Aich%20bin%20interessiert%20am%20Studio-Tier%20und%20m%C3%B6chte%20gerne%20ein%20pers%C3%B6nliches%20Onboarding-Gespr%C3%A4ch.%0A%0AMein%20Use-Case%3A%20%5BAkademie%20%2F%20Eventagentur%20%2F%20...%5D%0AAnzahl%20Sub-DJs%3A%20%5B...%5D%0A%0AViele%20Gr%C3%BC%C3%9Fe%0A%5BName%5D"
                className="w-full py-2.5 rounded-full bg-[#2a2520] text-[#e8d9b8] text-sm font-semibold hover:bg-[#1a1510] transition-colors text-center inline-block"
              >
                Studio anfragen
              </a>
            )}
          </div>
        </div>

        <p className="text-xs text-[#8a7a6e] text-center mt-12 max-w-xl mx-auto">
          Alle Preise inkl. MwSt. Zahlung über Stripe. Du kannst jederzeit über das Kunden-Portal kündigen oder Rechnungen einsehen.
        </p>
      </section>

      <footer className="bg-[#2a2520] text-[#8a7a6e] py-10 mt-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-serif text-lg font-bold text-[#faf6f0]">BeatControl</span>
          <p className="text-xs text-center">© 2026 BeatControl · Für Hochzeits-DJs und Brautpaare.</p>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/impressum" className="hover:text-[#c9a961] transition-colors">Impressum</Link>
            <Link href="/datenschutz" className="hover:text-[#c9a961] transition-colors">Datenschutz</Link>
            <Link href="/agb" className="hover:text-[#c9a961] transition-colors">AGB</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf6f0]" />}>
      <PricingPageInner />
    </Suspense>
  );
}
