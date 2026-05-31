'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import PaywallModal, { PaywallLimit } from '@/app/components/PaywallModal';
import { useBranding } from '@/app/lib/branding-context';

const ONBOARDING_KEY = 'beatcontrol-onboarding-seen';
const PENDING_EVENT_KEY = 'bc_pending_event';

interface Event {
  id: number;
  slug: string;
  title: string;
  active: boolean;
  created_at: string;
  event_date: string | null;
  song_count: number;
}

interface Me {
  plan: 'free' | 'pro' | 'event_pass' | 'studio';
  planStatus: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean | null;
  limits: { maxEvents: number | null; maxSongs: number | null; export: boolean };
}

function fmtFullDate(d: string | null) {
  if (!d) return null;
  return new Date(d).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function DJDashboard() {
  const { data: session } = useSession();
  const branding = useBranding();
  const brandName = branding.brandingName ?? 'BeatControl';
  const params = useSearchParams();
  const router = useRouter();
  const checkoutResult = params.get('checkout');
  const [checkoutBanner, setCheckoutBanner] = useState<'success' | null>(
    checkoutResult === 'success' ? 'success' : null
  );

  useEffect(() => {
    if (checkoutResult === 'success') {
      // Clean up URL so a refresh doesn't re-show the banner
      router.replace('/dj', { scroll: false });
    }
  }, [checkoutResult, router]);

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<{ title: string }>({ title: '' });

  const [exportingSlug, setExportingSlug] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [funnelPrefill, setFunnelPrefill] = useState(false);

  const [paywall, setPaywall] = useState<{ open: boolean; type: PaywallLimit; current?: number; max?: number }>({
    open: false,
    type: 'events',
  });

  useEffect(() => {
    loadEvents();
    loadMe();
    if (typeof window === 'undefined') return;

    // Event aus dem Funnel (/start) vorbefüllen, falls vorhanden.
    const pending = localStorage.getItem(PENDING_EVENT_KEY);
    if (pending) {
      try {
        const data = JSON.parse(pending) as { title?: string; date?: string };
        if (data.title) setFormTitle(data.title);
        if (data.date) setFormDate(data.date);
        setShowForm(true);
        setFunnelPrefill(true);
      } catch {
        /* defektes JSON ignorieren */
      }
      localStorage.removeItem(PENDING_EVENT_KEY);
      return; // Onboarding-Overlay diesmal überspringen — der Funnel war das Onboarding.
    }

    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
  }, []);

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_KEY, '1');
    setShowOnboarding(false);
  }

  async function loadEvents() {
    setLoading(true);
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        setEvents(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function loadMe() {
    try {
      const res = await fetch('/api/me');
      if (res.ok) setMe(await res.json());
    } catch {
      // ignore
    }
  }

  function activeEventCount() {
    return events.filter((e) => e.active).length;
  }

  function handleNewEventClick() {
    if (me && me.limits.maxEvents !== null && activeEventCount() >= me.limits.maxEvents) {
      setPaywall({ open: true, type: 'events', current: activeEventCount(), max: me.limits.maxEvents });
      return;
    }
    setShowForm((v) => !v);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Titel ist erforderlich.');
      return;
    }
    if (!formDate) {
      setFormError('Event-Datum ist erforderlich.');
      return;
    }

    setCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formTitle.trim(), event_date: formDate }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402 && data.error === 'plan_limit') {
        setShowForm(false);
        setPaywall({ open: true, type: 'events', current: data.current, max: data.max });
        return;
      }
      if (!res.ok) {
        setFormError(data.error ?? 'Fehler beim Erstellen.');
        return;
      }
      setFormTitle('');
      setFormDate('');
      setShowForm(false);
      loadEvents();
    } catch {
      setFormError('Verbindungsfehler.');
    } finally {
      setCreating(false);
    }
  }

  async function handleToggleActive(event: Event) {
    if (!event.active && me && me.limits.maxEvents !== null && activeEventCount() >= me.limits.maxEvents) {
      setPaywall({ open: true, type: 'events', current: activeEventCount(), max: me.limits.maxEvents });
      return;
    }
    await fetch(`/api/events/${event.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !event.active }),
    });
    loadEvents();
  }

  async function handleExport(event: Event) {
    if (!me?.limits.export) {
      setPaywall({ open: true, type: 'export' });
      return;
    }
    setExportingSlug(event.slug);
    try {
      const res = await fetch(`/api/events/${event.slug}/export`);
      if (res.status === 402) {
        setPaywall({ open: true, type: 'export' });
        return;
      }
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wunschliste-${event.slug}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportingSlug(null);
    }
  }

  async function handleEdit(event: Event, data: { title: string }) {
    await fetch(`/api/events/${event.slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: data.title }),
    });
    setEditingId(null);
    loadEvents();
  }

  function fmtDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const isPastDue = me?.plan === 'pro' && me.planStatus === 'past_due';
  const isCancelAtEnd = me?.plan === 'pro' && me.cancelAtPeriodEnd === true;
  const periodEnd = fmtFullDate(me?.currentPeriodEnd ?? null);

  return (
    <div className="min-h-screen bg-cream">
      {/* Top bar with account link */}
      <div className="px-4 pt-4 max-w-2xl mx-auto flex items-center justify-end">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-muted border border-champagne rounded-2xl px-3 py-1.5 hover:border-ink hover:text-ink transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
          </svg>
          <span className="max-w-[180px] truncate">
            {session?.user?.name || session?.user?.email || 'Konto'}
          </span>
        </Link>
      </div>

      {/* Header */}
      <div className="text-center pt-6 pb-6 px-4">
        <p className="text-gold text-3xl mb-1">♪</p>
        <h1 className="font-serif text-4xl font-semibold text-ink">DJ-Dashboard</h1>
        {me && (
          <p className="text-muted mt-1 text-xs uppercase tracking-widest">
            {me.plan === 'studio' ? 'Studio' : me.plan === 'pro' ? 'Pro' : me.plan === 'event_pass' ? 'Event-Pass' : 'Free'}
          </p>
        )}
      </div>

      {/* Checkout-Success Banner */}
      {checkoutBanner === 'success' && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <div className="rounded-2xl bg-gold/10 border border-gold/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-ink text-sm mb-1">Zahlung erfolgreich · willkommen bei {brandName} 🎉</p>
              <p className="text-xs text-muted leading-relaxed">
                Dein Konto ist freigeschaltet. Jetzt das erste Event anlegen — Gäste bekommen einen QR-Code, du siehst die Songs live auf dem iPad.
              </p>
            </div>
            <button
              onClick={() => setCheckoutBanner(null)}
              className="text-xs text-muted hover:text-ink px-3 py-1 rounded-full border border-champagne whitespace-nowrap"
            >
              Schließen
            </button>
          </div>
        </div>
      )}

      {/* Banners */}
      {(isPastDue || isCancelAtEnd) && (
        <div className="max-w-2xl mx-auto px-4 mb-4 space-y-2">
          {isPastDue && (
            <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-red-800 leading-snug flex-1">
                <span className="font-semibold">Zahlung fehlgeschlagen.</span>{' '}
                Bitte aktualisiere deine Zahlungsmethode, sonst endet dein Pro-Plan in Kürze.
              </p>
              <Link
                href="/account"
                className="shrink-0 px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors text-center"
              >
                Zahlungsmethode aktualisieren
              </Link>
            </div>
          )}
          {isCancelAtEnd && (
            <div className="rounded-2xl border border-yellow-300 bg-yellow-50 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-yellow-900 leading-snug flex-1">
                <span className="font-semibold">Pro endet {periodEnd ? `am ${periodEnd}` : 'am Periodenende'}.</span>{' '}
                Bis dahin behältst du alle Pro-Funktionen.
              </p>
              <Link
                href="/account"
                className="shrink-0 px-4 py-2 rounded-xl border border-yellow-700/40 text-yellow-900 text-xs font-semibold hover:bg-yellow-100 transition-colors text-center"
              >
                Kündigung zurückziehen
              </Link>
            </div>
          )}
        </div>
      )}

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/30 backdrop-blur-md animate-fade-in">
          <div className="bg-cream rounded-3xl border border-champagne shadow-xl max-w-lg w-full p-8 sm:p-10 animate-fade-up">
            <p className="text-gold text-2xl text-center mb-2">♪</p>
            <h2 className="font-serif text-3xl font-semibold text-ink text-center mb-6">
              Willkommen bei {brandName}
            </h2>
            <ul className="space-y-4 text-ink/90 text-sm sm:text-base leading-relaxed mb-8">
              <li className="flex gap-3">
                <span className="text-gold shrink-0">·</span>
                <span>Du legst ein Event an und bekommst einen QR-Code für deine Gäste.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold shrink-0">·</span>
                <span>Gäste scannen den Code und tragen ihre Songwünsche ein.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold shrink-0">·</span>
                <span>Die Wünsche erscheinen live auf deinem iPad, sortiert nach Beliebtheit.</span>
              </li>
              <li className="flex gap-3">
                <span className="text-gold shrink-0">·</span>
                <span>Du behältst die volle Kontrolle und entscheidest, was gespielt wird.</span>
              </li>
            </ul>
            <button
              onClick={dismissOnboarding}
              className="w-full py-3 bg-gold text-cream rounded-2xl font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Los geht&apos;s
            </button>
          </div>
        </div>
      )}

      <PaywallModal
        isOpen={paywall.open}
        onClose={() => setPaywall((p) => ({ ...p, open: false }))}
        limitType={paywall.type}
        current={paywall.current}
        max={paywall.max}
      />

      <div className="px-4 max-w-2xl mx-auto pb-16">
        {/* Toolbar */}
        <div className="mb-4 flex justify-end items-center gap-2">
          {me && me.plan === 'free' && (
            <Link
              href="/pricing"
              className="hidden sm:inline-block px-4 py-2 text-sm text-gold border border-gold rounded-2xl hover:bg-gold hover:text-cream transition-all"
            >
              Upgrade
            </Link>
          )}
          <button
            onClick={handleNewEventClick}
            className="min-w-0 px-4 sm:px-5 py-2.5 bg-gold text-cream rounded-2xl font-semibold hover:opacity-90 active:scale-95 transition-all truncate"
          >
            <span className="sm:hidden">+ Neues Event</span>
            <span className="hidden sm:inline">+ Neues Event erstellen</span>
          </button>
        </div>

        {/* Funnel-Prefill-Banner */}
        {funnelPrefill && showForm && (
          <div className="mb-3 rounded-2xl bg-gold/10 border border-gold/40 px-5 py-3 animate-fade-in">
            <p className="text-sm text-ink leading-snug">
              <span className="font-semibold">Dein Event aus dem Schnellstart ist fast fertig 🎉</span>{' '}
              Prüf kurz Name und Datum — dann auf „Event erstellen", und der QR-Code steht.
            </p>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-ivory rounded-3xl p-5 border border-champagne shadow-sm space-y-3 animate-fade-up"
          >
            <input
              type="text"
              placeholder="Titel *"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink placeholder:text-muted/50 focus:outline-none focus:border-gold transition-colors"
            />
            <div>
              <label className="block text-xs text-muted mb-1 px-1">Event-Datum *</label>
              <input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            {formError && (
              <p className="text-red-600 text-sm text-center">{formError}</p>
            )}
            <button
              type="submit"
              disabled={creating}
              className="w-full py-3 bg-ink text-cream rounded-2xl font-semibold hover:opacity-90 active:scale-95 disabled:opacity-50 transition-all"
            >
              {creating ? 'Erstelle…' : 'Event erstellen'}
            </button>
          </form>
        )}

        {/* Event list */}
        {loading ? (
          <p className="text-center text-muted py-12">Lädt…</p>
        ) : events.length === 0 ? (
          <p className="text-center text-muted py-12">Noch keine Events. Erstelle dein erstes!</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className={`bg-ivory rounded-3xl p-5 border border-champagne shadow-sm transition-opacity ${
                  event.active ? '' : 'opacity-50'
                }`}
              >
                {editingId === event.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editData.title}
                      onChange={(e) => setEditData({ title: e.target.value })}
                      className="w-full px-4 py-3 rounded-2xl border border-champagne bg-cream text-ink focus:outline-none focus:border-gold transition-colors"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(event, editData)}
                        className="px-4 py-2 bg-ink text-cream rounded-xl text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-cream text-muted rounded-xl text-sm border border-champagne hover:border-ink hover:text-ink transition-all"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/dj/${event.slug}`}
                      className="min-w-0 flex-1 group"
                    >
                      <h2 className="font-serif text-xl font-semibold text-ink truncate group-hover:text-gold transition-colors">
                        {event.title}
                      </h2>
                      <p className="text-muted/60 text-xs font-mono mt-0.5">/{event.slug}</p>
                      <p className="text-muted text-xs mt-0.5">
                        {event.song_count} Songs
                        {event.event_date && <> · {fmtDate(event.event_date)}</>}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleActive(event)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                          event.active
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-cream text-muted border border-champagne hover:border-ink hover:text-ink'
                        }`}
                      >
                        {event.active ? 'Aktiv' : 'Inaktiv'}
                      </button>
                      <button
                        onClick={() => handleExport(event)}
                        disabled={exportingSlug === event.slug}
                        aria-label={me?.limits.export ? 'Wunschliste als CSV exportieren' : 'CSV-Export (Pro)'}
                        title={me?.limits.export ? 'CSV exportieren' : 'CSV-Export ist Pro-Feature'}
                        className="inline-flex items-center gap-1 h-7 px-2.5 rounded-xl text-xs font-semibold bg-cream text-muted border border-champagne hover:border-gold hover:text-gold transition-all active:scale-95 disabled:opacity-50"
                      >
                        {exportingSlug === event.slug ? (
                          <span>…</span>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                            </svg>
                            <span>CSV</span>
                            {!me?.limits.export && <span className="text-gold">·Pro</span>}
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(event.id);
                          setEditData({ title: event.title });
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-cream text-muted border border-champagne hover:border-ink hover:text-ink transition-all active:scale-95"
                      >
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
