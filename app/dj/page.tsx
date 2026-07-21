'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import PaywallModal, { PaywallLimit } from '@/app/components/PaywallModal';
import { useBranding } from '@/app/lib/branding-context';
import { Button, Card, Badge, Input } from '@/app/components/ui';
import type { BadgeColor } from '@/app/components/ui';

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

function eventCardClass(active: boolean): string {
  return `transition-opacity ${active ? '' : 'opacity-60'}`;
}

function statusBadgeColor(active: boolean): BadgeColor {
  return active ? 'success' : 'neutral';
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

  const [exportingSlug, setExportingSlug] = useState<string | null>(null);

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);
  const [funnelCreated, setFunnelCreated] = useState(false);

  const [paywall, setPaywall] = useState<{ open: boolean; type: PaywallLimit; current?: number; max?: number }>({
    open: false,
    type: 'events',
  });

  useEffect(() => {
    loadEvents();
    loadMe();
    if (typeof window === 'undefined') return;

    // Event aus dem Funnel (/start) direkt anlegen, keine zweite Bestätigung nötig —
    // der Funnel selbst war schon die Bestätigung.
    const pending = localStorage.getItem(PENDING_EVENT_KEY);
    if (pending) {
      localStorage.removeItem(PENDING_EVENT_KEY);
      try {
        const data = JSON.parse(pending) as { title?: string; date?: string };
        if (data.title && data.date) {
          autoCreateFunnelEvent(data.title, data.date);
        } else if (data.title || data.date) {
          // Unvollständige Daten (sollte der Funnel eigentlich nie liefern) —
          // Formular vorbefüllt zur manuellen Korrektur zeigen.
          if (data.title) setFormTitle(data.title);
          if (data.date) setFormDate(data.date);
          setShowForm(true);
        }
      } catch {
        /* defektes JSON ignorieren */
      }
      return; // Onboarding-Overlay diesmal überspringen — der Funnel war das Onboarding.
    }

    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShowOnboarding(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function autoCreateFunnelEvent(title: string, date: string) {
    setAutoCreating(true);
    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), event_date: date }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402 && data.error === 'plan_limit') {
        setPaywall({ open: true, type: 'events', current: data.current, max: data.max });
        return;
      }
      if (!res.ok) {
        // Fallback: Formular vorbefüllt zur manuellen Korrektur zeigen, statt stillzuscheitern.
        setFormTitle(title);
        setFormDate(date);
        setShowForm(true);
        return;
      }
      setFunnelCreated(true);
      loadEvents();
    } catch {
      setFormTitle(title);
      setFormDate(date);
      setShowForm(true);
    } finally {
      setAutoCreating(false);
    }
  }

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

  function fmtDate(d: string | null) {
    if (!d) return null;
    return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const isPastDue = me?.plan === 'pro' && me.planStatus === 'past_due';
  const isCancelAtEnd = me?.plan === 'pro' && me.cancelAtPeriodEnd === true;
  const periodEnd = fmtFullDate(me?.currentPeriodEnd ?? null);

  return (
    <div className="min-h-screen bg-rave-gradient">
      {/* Top bar with account link */}
      <div className="px-4 pt-4 max-w-2xl mx-auto flex items-center justify-end">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm text-fg-muted border border-line rounded-2xl px-3 py-1.5 hover:border-turquoise hover:text-turquoise transition-colors"
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
        <p className="text-turquoise text-3xl mb-1">♪</p>
        <h1 className="font-display text-4xl font-black uppercase tracking-wide text-fg text-glow-turquoise">DJ-Dashboard</h1>
        {me && (
          <p className="text-fg-muted mt-1 text-xs font-mono uppercase tracking-widest">
            {me.plan === 'studio' ? 'Team' : me.plan === 'pro' ? 'Pro' : me.plan === 'event_pass' ? 'Event-Pass' : 'Free'}
          </p>
        )}
      </div>

      {/* Checkout-Success Banner */}
      {checkoutBanner === 'success' && (
        <div className="max-w-2xl mx-auto px-4 mb-4">
          <div className="rounded-2xl bg-turquoise/10 border border-turquoise/40 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-semibold text-fg text-sm mb-1">Zahlung erfolgreich · willkommen bei {brandName} 🎉</p>
              <p className="text-xs text-fg-muted leading-relaxed">
                Dein Konto ist freigeschaltet. Jetzt das erste Event anlegen, Gäste bekommen einen QR-Code, du siehst die Songs live auf dem iPad.
              </p>
            </div>
            <button
              onClick={() => setCheckoutBanner(null)}
              className="text-xs text-fg-muted hover:text-fg px-3 py-1 rounded-full border border-line whitespace-nowrap"
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
            <div className="rounded-2xl border border-danger/40 bg-danger-bg px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-danger leading-snug flex-1">
                <span className="font-semibold">Zahlung fehlgeschlagen.</span>{' '}
                Bitte aktualisiere deine Zahlungsmethode, sonst endet dein Pro-Plan in Kürze.
              </p>
              <Link
                href="/account"
                className="shrink-0 px-4 py-2 rounded-xl bg-danger text-white text-xs font-semibold hover:brightness-110 transition-all text-center"
              >
                Zahlungsmethode aktualisieren
              </Link>
            </div>
          )}
          {isCancelAtEnd && (
            <div className="rounded-2xl border border-neon-gold/40 bg-neon-gold/10 px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
              <p className="text-sm text-fg leading-snug flex-1">
                <span className="font-semibold">Pro endet {periodEnd ? `am ${periodEnd}` : 'am Periodenende'}.</span>{' '}
                Bis dahin behältst du alle Pro-Funktionen.
              </p>
              <Link
                href="/account"
                className="shrink-0 px-4 py-2 rounded-xl border border-neon-gold/40 text-neon-gold text-xs font-semibold hover:bg-neon-gold/10 transition-colors text-center"
              >
                Kündigung zurückziehen
              </Link>
            </div>
          )}
        </div>
      )}

      {showOnboarding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="bg-panel-elevated rounded-3xl border border-line glow-turquoise shadow-xl max-w-lg w-full p-8 sm:p-10 animate-fade-up">
            <p className="text-turquoise text-2xl text-center mb-2">♪</p>
            <h2 className="font-display text-3xl font-black uppercase tracking-wide text-fg text-center mb-6">
              Willkommen bei {brandName}
            </h2>
            <ul className="space-y-4 text-fg/90 text-sm sm:text-base leading-relaxed mb-8">
              <li className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 text-turquoise" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
                <span>Du legst ein Event an und bekommst einen QR-Code für deine Gäste.</span>
              </li>
              <li className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 text-turquoise" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
                <span>Gäste scannen den Code und tragen ihre Songwünsche ein.</span>
              </li>
              <li className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 text-turquoise" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
                <span>Die Wünsche erscheinen live auf deinem iPad, sortiert nach Beliebtheit.</span>
              </li>
            </ul>
            <Button variant="primary" tone="party" onClick={dismissOnboarding} className="w-full">
              Los geht&apos;s
            </Button>
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
              href="/pricing?plan=pro_yearly"
              className="hidden sm:inline-block px-4 py-2 text-sm text-turquoise border border-turquoise rounded-2xl hover:bg-turquoise hover:text-base transition-all"
            >
              Upgrade
            </Link>
          )}
          <Button
            variant="primary"
            tone="party"
            onClick={handleNewEventClick}
            className="min-w-0 truncate"
          >
            <span className="sm:hidden">+ Neues Event</span>
            <span className="hidden sm:inline">+ Neues Event erstellen</span>
          </Button>
        </div>

        {/* Auto-Creation aus dem Funnel */}
        {autoCreating && (
          <div className="mb-3 rounded-2xl bg-neon-gold/10 border border-neon-gold/40 px-5 py-3 animate-fade-in">
            <p className="text-sm text-fg leading-snug">Dein Event wird angelegt …</p>
          </div>
        )}
        {funnelCreated && (
          <div className="mb-3 rounded-2xl bg-turquoise/10 border border-turquoise/40 px-5 py-3 flex items-center justify-between gap-3 animate-fade-in">
            <p className="text-sm text-fg leading-snug">
              <span className="font-semibold">Dein Event ist startklar 🎉</span>{' '}
              QR-Code steht, deine Gäste können direkt loslegen.
            </p>
            <button
              onClick={() => setFunnelCreated(false)}
              className="shrink-0 text-xs text-fg-muted hover:text-fg px-3 py-1 rounded-full border border-line whitespace-nowrap"
            >
              Schließen
            </button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form
            onSubmit={handleCreate}
            className="mb-6 bg-panel rounded-3xl p-5 border border-line shadow-lg shadow-black/30 space-y-3 animate-fade-up"
          >
            <Input
              type="text"
              placeholder="Titel *"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <div>
              <label className="block text-xs text-fg-muted mb-1 px-1">Event-Datum *</label>
              <Input
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
                className="block min-w-0 max-w-full box-border"
              />
            </div>
            {formError && (
              <p className="text-danger text-sm text-center">{formError}</p>
            )}
            <Button variant="primary" tone="party" type="submit" disabled={creating} className="w-full">
              {creating ? 'Erstelle…' : 'Event erstellen'}
            </Button>
          </form>
        )}

        {/* Event list */}
        {loading ? (
          <p className="text-center text-fg-muted py-12">Lädt…</p>
        ) : events.length === 0 ? (
          <p className="text-center text-fg-muted py-12">Noch keine Events. Erstelle dein erstes!</p>
        ) : (
          <div className="space-y-4">
            {events.map((event) => (
              <Card
                key={event.id}
                tone="party"
                className={eventCardClass(event.active)}
              >
                <div className="flex items-center justify-between gap-3">
                  <Link href={`/dj/${event.slug}`} className="min-w-0 flex-1 group">
                    <h2 className="font-display text-xl font-bold text-fg break-words group-hover:text-turquoise transition-colors">
                      {event.title}
                    </h2>
                  </Link>
                  <button
                    onClick={() => handleExport(event)}
                    disabled={exportingSlug === event.slug}
                    aria-label={me?.limits.export ? 'Wunschliste als CSV exportieren' : 'CSV-Export (Pro)'}
                    title={me?.limits.export ? 'CSV exportieren' : 'CSV-Export ist Pro-Feature'}
                    className="shrink-0 h-8 w-8 flex items-center justify-center rounded-xl text-fg-muted border border-line hover:border-turquoise hover:text-turquoise transition-all active:scale-95 disabled:opacity-50"
                  >
                    {exportingSlug === event.slug ? (
                      <span className="text-xs">…</span>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                        <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                        <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2.5 mt-2.5 flex-wrap">
                  <button onClick={() => handleToggleActive(event)} className="active:scale-95 transition-transform">
                    <Badge color={statusBadgeColor(event.active)} tone="party">
                      {event.active ? 'AKTIV' : 'INAKTIV'}
                    </Badge>
                  </button>
                  <span className="text-fg-muted text-xs">
                    {event.song_count} Songs
                    {event.event_date && <> · {fmtDate(event.event_date)}</>}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
