'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useBranding } from '@/app/lib/branding-context';

interface Me {
  id: string;
  name: string | null;
  email: string;
  plan: 'free' | 'pro' | 'event_pass' | 'studio';
  rawPlan: string;
  planStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  brandingName: string | null;
  brandingLogoUrl: string | null;
  subdomain: string | null;
  limits: {
    maxEvents: number | null;
    maxSongs: number | null;
    branding: boolean;
    export: boolean;
    maxSubAccounts: number | null;
    customDomain: boolean;
  };
}

function fmtDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function AccountPage() {
  const router = useRouter();
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';

  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [brandingName, setBrandingName] = useState('');
  const [brandingLogoUrl, setBrandingLogoUrl] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingSubdomain, setSavingSubdomain] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [brandingMessage, setBrandingMessage] = useState<string | null>(null);
  const [subdomainMessage, setSubdomainMessage] = useState<string | null>(null);

  const [portalBusy, setPortalBusy] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d: Me | null) => {
        if (!d) {
          router.push('/auth/signin?callbackUrl=/account');
          return;
        }
        setMe(d);
        setName(d.name ?? '');
        setBrandingName(d.brandingName ?? '');
        setBrandingLogoUrl(d.brandingLogoUrl ?? '');
        setSubdomain(d.subdomain ?? '');
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMessage(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setProfileMessage(data.error ?? 'Speichern fehlgeschlagen.');
        return;
      }
      setProfileMessage('Gespeichert.');
      setMe((prev) => (prev ? { ...prev, name: name.trim() || null } : prev));
    } finally {
      setSavingProfile(false);
    }
  }

  async function saveBranding(e: React.FormEvent) {
    e.preventDefault();
    setSavingBranding(true);
    setBrandingMessage(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandingName, brandingLogoUrl }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setBrandingMessage(data.error ?? 'Speichern fehlgeschlagen.');
        return;
      }
      setBrandingMessage('Gespeichert.');
      setMe((prev) =>
        prev
          ? {
              ...prev,
              brandingName: brandingName.trim() || null,
              brandingLogoUrl: brandingLogoUrl.trim() || null,
            }
          : prev
      );
    } finally {
      setSavingBranding(false);
    }
  }

  async function saveSubdomain(e: React.FormEvent) {
    e.preventDefault();
    setSavingSubdomain(true);
    setSubdomainMessage(null);
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSubdomainMessage(data.error ?? 'Speichern fehlgeschlagen.');
        return;
      }
      setSubdomainMessage('Subdomain gespeichert. DNS-Setup folgt nach Domain-Lock.');
      setMe((prev) => (prev ? { ...prev, subdomain: subdomain.trim().toLowerCase() || null } : prev));
    } finally {
      setSavingSubdomain(false);
    }
  }

  async function openPortal() {
    setPortalError(null);
    setPortalBusy(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setPortalError(data.error ?? 'Portal konnte nicht geöffnet werden.');
        return;
      }
      window.location.href = data.url;
    } finally {
      setPortalBusy(false);
    }
  }

  async function handleDelete() {
    if (deleteText.trim().toUpperCase() !== 'LÖSCHEN') {
      setDeleteError('Bitte tippe LÖSCHEN ein, um zu bestätigen.');
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setDeleteError(data.error ?? 'Konto konnte nicht gelöscht werden.');
        return;
      }
      await signOut({ callbackUrl: '/' });
    } catch {
      setDeleteError('Verbindungsfehler.');
    } finally {
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-muted">Lädt…</p>
      </div>
    );
  }

  if (!me) return null;

  const isPro = me.plan === 'pro';
  const isStudio = me.plan === 'studio';
  const isEventPass = me.plan === 'event_pass';
  const status = me.planStatus;
  const cancelAtEnd = !!me.cancelAtPeriodEnd;
  const periodEnd = fmtDate(me.currentPeriodEnd);

  return (
    <div className="min-h-screen bg-cream">
      <nav className="sticky top-0 z-30 bg-cream/90 backdrop-blur border-b border-champagne">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/dj" className="text-sm text-muted hover:text-ink transition-colors inline-flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
            </svg>
            Zurück zum Dashboard
          </Link>
          {branding.brandingLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={branding.brandingLogoUrl} alt={brandName} className="h-7 w-auto object-contain" />
          ) : (
            <span className="font-serif text-lg font-bold text-ink">{brandName}</span>
          )}
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-10 pb-20 space-y-8">
        <header>
          <p className="text-gold text-xs font-semibold uppercase tracking-widest mb-2">Konto</p>
          <h1 className="font-serif text-4xl font-bold text-ink">Einstellungen</h1>
        </header>

        {/* Plan banner — past_due */}
        {isPro && status === 'past_due' && (
          <div className="rounded-2xl border border-red-300 bg-red-50 px-5 py-4">
            <p className="font-semibold text-red-800 text-sm mb-1">Zahlung fehlgeschlagen</p>
            <p className="text-red-700 text-sm leading-relaxed">
              Deine letzte Zahlung konnte nicht abgebucht werden. Bitte aktualisiere deine
              Zahlungsmethode, sonst endet dein Pro-Plan in Kürze.
            </p>
            <button
              onClick={openPortal}
              disabled={portalBusy}
              className="mt-3 inline-flex items-center px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {portalBusy ? 'Lädt…' : 'Zahlungsmethode aktualisieren'}
            </button>
          </div>
        )}

        {/* Profile */}
        <section className="bg-ivory rounded-3xl border border-champagne p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Profil</h2>
          <p className="text-muted text-sm mb-6">Wie wir dich in der App ansprechen.</p>

          <form onSubmit={saveProfile} className="space-y-5">
            <div>
              <label className="block text-xs text-muted mb-1.5 px-1">E-Mail</label>
              <input
                type="email"
                value={me.email}
                disabled
                className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted/70 mt-1.5 px-1">
                Die E-Mail kann derzeit nicht geändert werden. Schreib uns, falls nötig.
              </p>
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5 px-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dein Name"
                maxLength={100}
                className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {savingProfile ? 'Speichert…' : 'Speichern'}
              </button>
              {profileMessage && (
                <span className="text-sm text-muted">{profileMessage}</span>
              )}
            </div>
          </form>
        </section>

        {/* Plan */}
        <section className="bg-ivory rounded-3xl border border-champagne p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Plan</h2>
          <p className="text-muted text-sm mb-6">Dein aktuelles Abonnement.</p>

          {portalError && (
            <div className="mb-4 px-4 py-2.5 rounded-xl bg-red-50 text-red-700 text-sm">
              {portalError}
            </div>
          )}

          {/* Free */}
          {me.plan === 'free' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">Free Plan</p>
                <p className="text-muted text-sm mt-1">
                  1 aktives Event · bis zu 30 Songwünsche · BeatControl-Branding.
                </p>
              </div>
              <Link
                href="/pricing?cycle=yearly"
                className="shrink-0 px-5 py-2.5 rounded-2xl bg-gold text-cream text-sm font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Auf Pro upgraden
              </Link>
            </div>
          )}

          {/* Pro — active */}
          {isPro && !cancelAtEnd && status !== 'past_due' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">Pro Plan</p>
                <p className="text-muted text-sm mt-1">
                  {periodEnd
                    ? <>Verlängert sich am {periodEnd}.</>
                    : 'Aktiv.'}
                </p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="shrink-0 px-5 py-2.5 rounded-2xl border border-ink/20 text-ink text-sm font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
              >
                {portalBusy ? 'Lädt…' : 'Plan verwalten'}
              </button>
            </div>
          )}

          {/* Pro — cancel_at_period_end */}
          {isPro && cancelAtEnd && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3">
                <p className="text-yellow-900 text-sm font-medium">
                  Dein Pro-Plan endet {periodEnd ? `am ${periodEnd}` : 'am Ende der laufenden Periode'}.
                </p>
                <p className="text-yellow-900/80 text-xs mt-1">
                  Bis dahin behältst du alle Pro-Funktionen.
                </p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {portalBusy ? 'Lädt…' : 'Kündigung zurückziehen'}
              </button>
            </div>
          )}

          {/* Pro — past_due (compact view, banner above already explains) */}
          {isPro && status === 'past_due' && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">Pro Plan</p>
                <p className="text-red-700 text-sm mt-1">Letzte Zahlung fehlgeschlagen.</p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="shrink-0 px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {portalBusy ? 'Lädt…' : 'Plan verwalten'}
              </button>
            </div>
          )}

          {/* Event-Pass */}
          {isEventPass && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">Event-Pass</p>
                <p className="text-muted text-sm mt-1">
                  {periodEnd ? <>Gültig bis {periodEnd}.</> : 'Gültig.'}
                </p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="shrink-0 px-5 py-2.5 rounded-2xl border border-ink/20 text-ink text-sm font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
              >
                {portalBusy ? 'Lädt…' : 'Rechnung ansehen'}
              </button>
            </div>
          )}

          {/* Studio */}
          {isStudio && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">Studio Plan</p>
                <p className="text-muted text-sm mt-1">
                  Whitelabel, Sub-Accounts und Custom-Domain freigeschaltet.
                  {periodEnd && <> Verlängert sich am {periodEnd}.</>}
                </p>
              </div>
              <button
                onClick={openPortal}
                disabled={portalBusy}
                className="shrink-0 px-5 py-2.5 rounded-2xl border border-ink/20 text-ink text-sm font-semibold hover:border-gold hover:text-gold transition-colors disabled:opacity-60"
              >
                {portalBusy ? 'Lädt…' : 'Plan verwalten'}
              </button>
            </div>
          )}
        </section>

        {/* Branding */}
        <section className="bg-ivory rounded-3xl border border-champagne p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <h2 className="font-serif text-xl font-semibold text-ink">Branding</h2>
            {!me.limits.branding && (
              <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 bg-gold/5 px-2 py-0.5 rounded-full">
                Pro
              </span>
            )}
          </div>
          <p className="text-muted text-sm mb-6">
            Ersetze BeatControl in der Gäste-Ansicht durch deinen eigenen Namen und dein Logo.
          </p>

          <form onSubmit={saveBranding} className="space-y-5">
            <div>
              <label className="block text-xs text-muted mb-1.5 px-1">Name</label>
              <input
                type="text"
                value={brandingName}
                onChange={(e) => setBrandingName(e.target.value)}
                placeholder="z.B. DJ Marcus"
                maxLength={80}
                disabled={!me.limits.branding}
                className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs text-muted mb-1.5 px-1">Logo-URL</label>
              <input
                type="url"
                value={brandingLogoUrl}
                onChange={(e) => setBrandingLogoUrl(e.target.value)}
                placeholder="https://…"
                maxLength={500}
                disabled={!me.limits.branding}
                className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {brandingLogoUrl && /^https?:\/\//i.test(brandingLogoUrl) && (
                <div className="mt-3 flex items-center gap-3">
                  <span className="text-xs text-muted">Vorschau:</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={brandingLogoUrl}
                    alt="Logo Vorschau"
                    className="h-10 w-auto object-contain rounded border border-champagne bg-white p-1"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="submit"
                disabled={savingBranding || !me.limits.branding}
                className="px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
              >
                {savingBranding ? 'Speichert…' : 'Speichern'}
              </button>
              {brandingMessage && (
                <span className="text-sm text-muted">{brandingMessage}</span>
              )}
              {!me.limits.branding && (
                <Link
                  href="/pricing?cycle=yearly"
                  className="text-sm text-gold hover:underline"
                >
                  Auf Pro upgraden, um Branding zu nutzen →
                </Link>
              )}
            </div>
          </form>
        </section>

        {/* Studio: Subdomain & Whitelabel */}
        <section className="bg-ivory rounded-3xl border border-champagne p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
            <h2 className="font-serif text-xl font-semibold text-ink">Studio: Eigene Subdomain</h2>
            {!isStudio && (
              <span className="text-[10px] uppercase tracking-widest text-gold border border-gold/40 bg-gold/5 px-2 py-0.5 rounded-full">
                Studio
              </span>
            )}
          </div>
          <p className="text-muted text-sm mb-6">
            {isStudio
              ? 'Wähle deine eigene URL — z. B. deinakademie.beatcontrol.io. Custom-Domain auf Wunsch (per Mail anfragen).'
              : 'Studio-Tarif gibt deiner Akademie oder Agentur eine eigene Subdomain unter beatcontrol.io, komplettes Whitelabel-Branding und Sub-Accounts für deine DJs.'}
          </p>

          {isStudio ? (
            <form onSubmit={saveSubdomain} className="space-y-5">
              <div>
                <label className="block text-xs text-muted mb-1.5 px-1">Subdomain</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase())}
                    placeholder="deinakademie"
                    maxLength={30}
                    pattern="[a-z0-9-]+"
                    className="flex-1 px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors font-mono text-sm"
                  />
                  <span className="text-muted text-sm whitespace-nowrap">.beatcontrol.io</span>
                </div>
                <p className="text-xs text-muted/70 mt-1.5 px-1">
                  3–30 Zeichen, nur a–z, 0–9 und Bindestrich. Wird live, sobald der DNS aktiv ist.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="submit"
                  disabled={savingSubdomain}
                  className="px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
                >
                  {savingSubdomain ? 'Speichert…' : 'Subdomain speichern'}
                </button>
                {subdomainMessage && (
                  <span className="text-sm text-muted">{subdomainMessage}</span>
                )}
              </div>
              {me.subdomain && (
                <div className="mt-2 px-4 py-3 rounded-2xl bg-cream border border-champagne">
                  <p className="text-xs text-muted mb-1">Deine URL (sobald DNS aktiv):</p>
                  <p className="font-mono text-sm text-ink">https://{me.subdomain}.beatcontrol.io</p>
                </div>
              )}
            </form>
          ) : (
            <Link
              href="mailto:hallo@beatcontrol.io?subject=Studio-Anfrage%20BeatControl"
              className="inline-block px-5 py-2.5 rounded-2xl bg-ink text-cream text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Studio anfragen
            </Link>
          )}
        </section>

        {/* Sign out */}
        <section className="bg-ivory rounded-3xl border border-champagne p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Sitzung</h2>
          <p className="text-muted text-sm mb-6">Auf diesem Gerät abmelden.</p>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="px-5 py-2.5 rounded-2xl border border-ink/20 text-ink text-sm font-semibold hover:border-gold hover:text-gold transition-colors"
          >
            Abmelden
          </button>
        </section>

        {/* Danger zone */}
        <section className="bg-ivory rounded-3xl border border-red-200 p-6 sm:p-8">
          <h2 className="font-serif text-xl font-semibold text-ink mb-1">Konto löschen</h2>
          <p className="text-muted text-sm mb-6">
            Löscht dein Konto, alle Events und alle gesammelten Songwünsche unwiderruflich.
            Ein laufendes Abonnement wird gleichzeitig bei Stripe gekündigt.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 rounded-2xl border border-red-300 text-red-700 text-sm font-semibold hover:bg-red-50 transition-colors"
            >
              Konto löschen
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-ink">
                Tippe <span className="font-mono font-bold">LÖSCHEN</span>, um zu bestätigen.
              </p>
              <input
                type="text"
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                placeholder="LÖSCHEN"
                className="w-full px-4 py-3 rounded-2xl border border-red-300 bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-red-500 transition-colors"
              />
              {deleteError && (
                <p className="text-sm text-red-700">{deleteError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-2xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  {deleting ? 'Lösche…' : 'Endgültig löschen'}
                </button>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteText('');
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="px-5 py-2.5 rounded-2xl border border-ink/20 text-ink text-sm font-semibold hover:border-ink transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
