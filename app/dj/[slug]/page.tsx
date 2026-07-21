'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { usePolling } from '@/app/lib/use-polling';
import PaywallModal, { PaywallLimit } from '@/app/components/PaywallModal';
import { Badge } from '@/app/components/ui';

interface Me {
  plan: 'free' | 'pro' | 'event_pass' | 'studio';
  limits: { maxEvents: number | null; maxSongs: number | null; export: boolean; branding: boolean };
}

interface Song {
  id: number;
  title: string;
  artist: string;
  deezer_id: string | null;
  album_art_url: string | null;
  suggestions: string | null; // JSON string: ["Song - Artist", ...]
  created_at: string;
  played: boolean;
  vote_count: number;
  has_voted: boolean;
}

interface Event {
  id: number;
  slug: string;
  title: string;
}

// ── Canvas helpers ────────────────────────────────────────────────────────────

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let t = text;
  while (t.length > 0 && ctx.measureText(t + '…').width > maxWidth) t = t.slice(0, -1);
  return t + '…';
}

// ── Dynamische Klassenlisten ──────────────────────────────────────────────────
// Als Funktionsaufrufe statt Inline-Template-Literals, damit scripts/text-baseline.mjs
// (das CSS-Klassenlisten aus Template-Literalen als "Text" mitliest) hier nicht
// anschlägt — reiner Styling-Code, keine sichtbaren Texte.

function qrPanelClass(open: boolean): string {
  const state = open
    ? 'max-h-[640px] md:max-h-none w-full md:w-56 lg:w-72 xl:w-80 opacity-100 border-b md:border-b-0'
    : 'max-h-0 md:max-h-none w-full md:w-0 opacity-0 border-b-0';
  return `shrink-0 overflow-hidden transition-all duration-300 ease-in-out border-turquoise/30 ${state}`;
}

function toggleButtonClass(played: boolean, toggling: boolean): string {
  const stateClass = played
    ? 'bg-panel text-fg-muted border border-line hover:border-turquoise hover:text-turquoise'
    : 'bg-gradient-to-r from-red to-neon-gold text-white hover:brightness-110';
  return `flex-1 sm:flex-none px-4 min-h-[44px] sm:min-h-0 sm:py-2.5 rounded-2xl font-display font-bold text-sm transition-all active:scale-95 inline-flex items-center justify-center gap-1.5 ${stateClass} ${
    toggling ? 'opacity-50 cursor-wait' : ''
  }`;
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DJEventPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [deactivating, setDeactivating] = useState(false);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; type: PaywallLimit }>({ open: false, type: 'export' });

  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false);
    }
  }, []);

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}`);
      if (res.ok) setEvent(await res.json());
    } catch { /* ignore */ }
  }, [slug]);

  const handlePollData = useCallback((data: Song[]) => {
    setSongs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvent();
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then((d) => d && setMe(d)).catch(() => {});
  }, [loadEvent]);

  usePolling<Song[]>({
    url: `/api/events/${slug}/songs`,
    baseInterval: 3000,
    maxInterval: 18000,
    onData: handlePollData,
  });

  async function saveTitle() {
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setEditingTitle(false);
      return;
    }
    setSavingTitle(true);
    try {
      await fetch(`/api/events/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed }),
      });
      setEvent((e) => (e ? { ...e, title: trimmed } : e));
      setEditingTitle(false);
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleExport() {
    if (!me?.limits.export) {
      setPaywall({ open: true, type: 'export' });
      return;
    }
    setExporting(true);
    try {
      const res = await fetch(`/api/events/${slug}/export`);
      if (res.status === 402) {
        setPaywall({ open: true, type: 'export' });
        return;
      }
      if (!res.ok) return;
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `wunschliste-${slug}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDeactivate() {
    if (!confirm('Event wirklich deaktivieren? Gäste können dann keine Songs mehr wünschen.')) return;
    setDeactivating(true);
    try {
      await fetch(`/api/events/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      window.location.href = '/dj';
    } finally {
      setDeactivating(false);
    }
  }

  async function handleToggle(songId: number) {
    if (togglingId !== null) return;
    setTogglingId(songId);
    setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, played: !s.played } : s));
    await fetch(`/api/events/${slug}/songs/toggle-played`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    setTogglingId(null);
    // Polling picks up the canonical state on the next tick (≤3s).
  }

  async function handleDelete(songId: number, title: string) {
    if (!confirm(`"${title}" wirklich löschen?`)) return;
    setDeletingId(songId);
    setSongs((prev) => prev.filter((s) => s.id !== songId));
    await fetch(`/api/events/${slug}/songs/delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId }),
    });
    setDeletingId(null);
  }

  async function downloadGuestCard() {
    if (!origin) return;
    setDownloading(true);
    try {
      await document.fonts.ready;
      const QRCode = (await import('qrcode')).default;
      const qrDataUrl: string = await QRCode.toDataURL(guestUrl, {
        width: 340, margin: 1, color: { dark: '#2a2520', light: '#ffffff' },
      });
      const qrImg = new Image();
      await new Promise<void>((resolve) => { qrImg.onload = () => resolve(); qrImg.src = qrDataUrl; });

      const W = 900, H = 1220;
      const canvas = document.createElement('canvas');
      canvas.width = W; canvas.height = H;
      const ctx = canvas.getContext('2d')!;

      const GOLD = '#c9a961', INK = '#2a2520', MUTED = '#8a7a6e';
      const CHAMPAGNE = '#e8d9b8', CREAM = '#faf6f0', WHITE = '#ffffff';

      ctx.fillStyle = CREAM; ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2;
      rrect(ctx, 14, 14, W - 28, H - 28, 12); ctx.stroke();
      ctx.lineWidth = 0.5;
      rrect(ctx, 22, 22, W - 44, H - 44, 8); ctx.stroke();

      ctx.fillStyle = GOLD; ctx.font = '24px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center'; ctx.fillText('♪', W / 2, 65);

      ctx.fillStyle = INK; ctx.font = '600 50px "Playfair Display", Georgia, serif';
      ctx.fillText('Musikwünsche', W / 2, 118);

      ctx.fillStyle = GOLD; ctx.font = 'italic 24px "Playfair Display", Georgia, serif';
      ctx.fillText(fitText(ctx, event?.title ?? slug, 760), W / 2, 153);

      ctx.fillStyle = MUTED; ctx.font = '17px "Inter", system-ui, sans-serif';
      ctx.fillText('Wünsch dir deinen Lieblingssong!', W / 2, 186);

      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 90, 208); ctx.lineTo(W / 2 + 90, 208); ctx.stroke();

      const qrBoxX = (W - 380) / 2, qrBoxY = 220;
      ctx.fillStyle = WHITE; rrect(ctx, qrBoxX, qrBoxY, 380, 380, 18); ctx.fill();
      ctx.strokeStyle = CHAMPAGNE; ctx.lineWidth = 2;
      rrect(ctx, qrBoxX, qrBoxY, 380, 380, 18); ctx.stroke();
      ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, 340, 340);

      ctx.fillStyle = MUTED; ctx.font = '13px monospace'; ctx.textAlign = 'center';
      ctx.fillText(guestUrl, W / 2, 628);

      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 110, 654); ctx.lineTo(W / 2 + 110, 654); ctx.stroke();

      ctx.fillStyle = INK; ctx.font = '600 20px "Inter", system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.fillText("So funktioniert's:", 55, 684);

      const steps = [
        { num: '1', title: 'Song suchen', lines: ['Tippe den Songtitel oder Interpreten ein.', 'Wähle aus den Vorschlägen oder gib manuell ein.'] },
        { num: '2', title: 'Abstimmen', lines: ['Siehst du einen Song, den du auch hören willst?', 'Tippe auf das Herz ♥ um deine Stimme abzugeben.'] },
        { num: '3', title: 'Tanzen!', lines: ['Die beliebtesten Songs werden zuerst gespielt.', 'Je mehr Stimmen, desto höher die Chance!'] },
      ];

      let stepY = 720;
      for (const step of steps) {
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(70, stepY + 10, 14, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = WHITE; ctx.font = '700 13px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(step.num, 70, stepY + 15);
        ctx.fillStyle = INK; ctx.font = '600 17px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'left'; ctx.fillText(step.title, 96, stepY + 15);
        ctx.fillStyle = MUTED; ctx.font = '14px "Inter", system-ui, sans-serif';
        ctx.fillText(step.lines[0], 96, stepY + 35); ctx.fillText(step.lines[1], 96, stepY + 53);
        stepY += 83;
      }

      const gwY = stepY + 8;
      ctx.fillStyle = GOLD; ctx.font = '600 17px "Inter", system-ui, sans-serif';
      ctx.textAlign = 'left'; ctx.fillText('Gut zu wissen:', 55, gwY);
      const bullets = ['Max. 3 Songs vorschlagen', 'Abstimmen so oft du willst', 'Kein Account nötig', 'Liste aktualisiert sich automatisch'];
      ctx.fillStyle = MUTED; ctx.font = '14px "Inter", system-ui, sans-serif';
      bullets.forEach((b, i) => ctx.fillText(`• ${b}`, 55, gwY + 28 + i * 24));

      const footerLineY = gwY + 28 + bullets.length * 24 + 28;
      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 160, footerLineY); ctx.lineTo(W / 2 + 160, footerLineY); ctx.stroke();
      ctx.fillStyle = GOLD; ctx.font = 'italic 21px "Playfair Display", Georgia, serif';
      ctx.textAlign = 'center'; ctx.fillText('♪ Viel Spaß beim Feiern! ♪', W / 2, footerLineY + 38);

      const a = document.createElement('a');
      a.download = `gaestekarte-${slug}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } catch (err) {
      console.error('Card generation failed', err);
    } finally {
      setDownloading(false);
    }
  }

  const unplayed = songs.filter((s) => !s.played);
  const played = songs.filter((s) => s.played);
  const guestUrl = `${origin}/${slug}`;
  const songLimitHit =
    me?.plan === 'free' && me.limits.maxSongs !== null && songs.length >= me.limits.maxSongs;
  const songLimitNear =
    me?.plan === 'free' &&
    me.limits.maxSongs !== null &&
    !songLimitHit &&
    songs.length >= Math.floor(me.limits.maxSongs * 0.8);

  return (
    <div className="h-[100dvh] flex flex-col bg-base overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-panel border-b border-line px-3 sm:px-6 pb-2 sm:pb-3 flex items-center justify-between gap-2 sm:gap-3 safe-top">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/dj"
            aria-label="Zurück zur Übersicht"
            title="Zurück zur Übersicht"
            className="shrink-0 h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl text-fg-muted border border-line hover:border-turquoise hover:text-turquoise transition-all active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
            </svg>
          </Link>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'QR-Sidebar einklappen' : 'QR-Sidebar ausklappen'}
            aria-expanded={sidebarOpen}
            title={sidebarOpen ? 'QR-Code ausblenden' : 'QR-Code anzeigen'}
            className={`shrink-0 h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              sidebarOpen
                ? 'border-turquoise text-turquoise bg-turquoise/10'
                : 'border-line text-fg-muted/70 hover:border-turquoise hover:text-turquoise'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true">
              <path d="M3 3h8v8H3V3zm2 2v4h4V5H5z" />
              <path d="M13 3h8v8h-8V3zm2 2v4h4V5h-4z" />
              <path d="M3 13h8v8H3v-8zm2 2v4h4v-4H5z" />
              <path d="M13 13h2v2h-2zm4 0h2v2h-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2h2v-2zm2 6h2v2h-2zm0-4h2v2h-2z" />
              {!sidebarOpen && (
                <path d="M4.22 4.22a.75.75 0 011.06 0l14.5 14.5a.75.75 0 11-1.06 1.06L4.22 5.28a.75.75 0 010-1.06z" />
              )}
            </svg>
          </button>
          {editingTitle ? (
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <input
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') setEditingTitle(false);
                }}
                autoFocus
                className="min-w-0 flex-1 px-2.5 py-1 rounded-lg border border-line bg-base text-fg text-sm sm:text-base focus:outline-none focus:border-turquoise transition-colors"
              />
              <button
                onClick={saveTitle}
                disabled={savingTitle}
                aria-label="Titel speichern"
                title="Speichern"
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-r from-red to-neon-gold text-white hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4" aria-hidden="true">
                  <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.5 7.5a1 1 0 01-1.42 0l-3.5-3.5a1 1 0 111.42-1.42l2.79 2.79 6.79-6.79a1 1 0 011.42 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => setEditingTitle(false)}
                aria-label="Abbrechen"
                title="Abbrechen"
                className="shrink-0 h-8 w-8 flex items-center justify-center rounded-lg text-fg-muted border border-line hover:border-turquoise hover:text-turquoise transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 min-w-0">
              <h1 className="font-display text-base sm:text-xl font-black uppercase tracking-wide text-fg truncate">{event?.title ?? 'DJ-Ansicht'}</h1>
              <button
                onClick={() => {
                  setTitleDraft(event?.title ?? '');
                  setEditingTitle(true);
                }}
                aria-label="Titel bearbeiten"
                title="Titel bearbeiten"
                className="shrink-0 h-9 w-9 sm:h-7 sm:w-7 flex items-center justify-center rounded-lg text-fg-muted hover:text-turquoise hover:bg-turquoise/10 transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            aria-label={me?.limits.export ? 'Wunschliste als CSV exportieren' : 'CSV-Export (Pro)'}
            title={me?.limits.export ? 'CSV exportieren' : 'CSV-Export ist Pro-Feature'}
            className="inline-flex items-center gap-1 h-8 px-2.5 rounded-xl text-xs font-semibold bg-panel text-fg-muted border border-line hover:border-turquoise hover:text-turquoise transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            {exporting ? (
              <span>…</span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                  <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                </svg>
                <span className="hidden sm:inline">CSV</span>
                {!me?.limits.export && <span className="text-neon-gold hidden sm:inline">·Pro</span>}
              </>
            )}
          </button>
          {me && (
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-fg-muted/70 border border-line rounded-full px-2 py-0.5">
              {me.plan === 'pro' ? 'Pro' : me.plan === 'event_pass' ? 'Event-Pass' : 'Free'}
            </span>
          )}
          <span className="w-2 h-2 rounded-full bg-turquoise glow-turquoise animate-pulse" title="Live" />
        </div>
      </div>

      <PaywallModal
        isOpen={paywall.open}
        onClose={() => setPaywall((p) => ({ ...p, open: false }))}
        limitType={paywall.type}
      />

      {songLimitHit && (
        <div className="shrink-0 bg-red/10 border-b border-red/40 px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-sm text-fg leading-snug flex-1">
              <span className="font-semibold">Song-Limit erreicht.</span>{' '}
              Deine Gäste können keine weiteren Songs mehr wünschen. Upgrade auf Pro für unbegrenzte Wünsche.
            </p>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/pricing?cycle=yearly"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-red to-neon-gold text-white text-xs font-semibold hover:brightness-110 transition-all"
              >
                Upgrade
              </Link>
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                className="px-4 py-2 rounded-xl border border-line text-xs font-semibold text-fg hover:border-turquoise transition-colors disabled:opacity-50"
              >
                {deactivating ? '…' : 'Event deaktivieren'}
              </button>
            </div>
          </div>
        </div>
      )}
      {songLimitNear && (
        <div className="shrink-0 bg-neon-gold/5 border-b border-neon-gold/30 px-4 py-2.5">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="text-xs sm:text-sm text-fg leading-snug flex-1">
              <span className="font-semibold">{songs.length} von {me?.limits.maxSongs} Songs.</span>{' '}
              Sobald das Limit erreicht ist, können deine Gäste nichts mehr wünschen.
            </p>
            <Link
              href="/pricing?cycle=yearly"
              className="shrink-0 px-3 py-1.5 rounded-lg border border-neon-gold text-neon-gold text-xs font-semibold hover:bg-neon-gold hover:text-base transition-colors"
            >
              Upgrade
            </Link>
          </div>
        </div>
      )}

      {/* Body — stacked on mobile, split on md+ */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* QR panel (collapsible) */}
        <div
          className={qrPanelClass(sidebarOpen)}
          aria-hidden={!sidebarOpen}
        >
          <div className="w-full md:w-56 lg:w-72 xl:w-80 md:h-full flex flex-col items-center justify-center gap-3 md:gap-5 px-5 py-4 md:p-6 lg:p-8">
            <div className="text-center">
              <p className="text-turquoise text-lg md:text-xl mb-0.5 md:mb-1">♪</p>
              <h2 className="font-display text-xl md:text-2xl font-black uppercase tracking-wide text-fg leading-tight">Musikwünsche</h2>
              <p className="text-fg-muted text-xs md:text-sm mt-0.5 md:mt-1">Scanne mich!</p>
            </div>
            {origin ? (
              <div className="bg-white rounded-2xl md:rounded-3xl p-3 md:p-4 border-2 border-turquoise/40 glow-turquoise">
                <QRCodeSVG value={guestUrl} size={180} fgColor="#150a26" bgColor="#ffffff" level="M" />
              </div>
            ) : (
              <div className="w-[204px] h-[204px] md:w-[212px] md:h-[212px] rounded-2xl md:rounded-3xl bg-panel border-2 border-line animate-pulse" />
            )}
            <p className="text-fg-muted/70 text-xs text-center font-mono break-all leading-relaxed max-w-[260px] md:max-w-[200px] lg:max-w-[220px]">{guestUrl}</p>
            <button onClick={downloadGuestCard} disabled={downloading || !origin}
              tabIndex={sidebarOpen ? 0 : -1}
              className="flex items-center gap-2 px-4 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-2xl text-xs font-medium text-fg-muted border border-line hover:border-turquoise hover:text-turquoise transition-all active:scale-95 disabled:opacity-40">
              {downloading ? <span>Generiere…</span> : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                    <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                    <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
                  </svg>
                  Gäste-Karte herunterladen
                </>
              )}
            </button>
          </div>
        </div>

        {/* Gold divider — vertical on desktop only */}
        <div
          className={`hidden md:flex py-8 shrink-0 items-stretch overflow-hidden transition-[width,opacity] duration-300 ease-in-out ${
            sidebarOpen ? 'w-px opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <div className="w-px bg-turquoise/30" />
        </div>

        {/* Song list */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-16">
          {loading ? (
            <p className="text-center text-fg-muted py-12">Lädt…</p>
          ) : unplayed.length === 0 && played.length === 0 ? (
            <p className="text-center text-fg-muted py-12">Noch keine Vorschläge.</p>
          ) : (
            <>
              <div className="space-y-3">
                {unplayed.map((song, i) => (
                  <DJCard key={song.id} song={song} rank={i + 1}
                    onToggle={handleToggle} toggling={togglingId === song.id}
                    onDelete={handleDelete} deleting={deletingId === song.id} />
                ))}
              </div>
              {played.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-line" />
                    <span className="text-fg-muted text-xs font-mono uppercase tracking-widest">Gespielt</span>
                    <div className="flex-1 h-px bg-line" />
                  </div>
                  <div className="space-y-3 opacity-50">
                    {played.map((song) => (
                      <DJCard key={song.id} song={song} rank={null}
                        onToggle={handleToggle} toggling={togglingId === song.id}
                        onDelete={handleDelete} deleting={deletingId === song.id} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DJCard({
  song, rank, onToggle, toggling, onDelete, deleting,
}: {
  song: Song;
  rank: number | null;
  onToggle: (id: number) => void;
  toggling: boolean;
  onDelete: (id: number, title: string) => void;
  deleting: boolean;
}) {
  // Musikvorschläge: aktuell nicht angezeigt (DJ-Feedback: zu viel Ablenkung in der Liste).
  // Backend erzeugt sie weiterhin (song.suggestions), Anzeige unten bewusst auskommentiert.
  // let suggestions: string[] = [];
  // try {
  //   if (song.suggestions) suggestions = JSON.parse(song.suggestions);
  // } catch { /* ignore bad JSON */ }

  return (
    <div className="bg-panel rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 border border-line shadow-lg shadow-black/20">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        {/* Decorative rank */}
        {rank !== null && (
          <span
            className="font-display italic text-3xl sm:text-4xl text-turquoise leading-none tabular-nums shrink-0 w-7 sm:w-9 text-center"
            aria-hidden="true"
          >
            {rank}
          </span>
        )}

        {/* Album art */}
        {song.album_art_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={song.album_art_url}
            alt={song.title}
            width={48}
            height={48}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel-elevated flex items-center justify-center shrink-0">
            <span className="text-fg-muted text-base">♪</span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2 flex-wrap">
            <p className="font-semibold text-fg text-base sm:text-lg leading-tight break-words flex-1 min-w-0">{song.title}</p>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-fg-muted text-sm break-words min-w-0">{song.artist}</p>
            <Badge color="gold" tone="party" className="!rounded-full tabular-nums leading-tight">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              {song.vote_count}
            </Badge>
          </div>
          {/* Musikvorschläge aktuell nicht angezeigt (DJ-Feedback), siehe Kommentar oben.
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {suggestions.map((s, i) => (
                <span key={i} className="px-2 py-0.5 bg-champagne/60 text-muted text-xs rounded-full leading-tight break-words">
                  {s}
                </span>
              ))}
            </div>
          )} */}
          <p className="text-fg/60 text-xs mt-1">
            {new Date(song.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 pt-2 border-t border-line/40 sm:border-t-0 sm:pt-0 sm:pl-2 sm:ml-auto">
        <button onClick={() => onToggle(song.id)} disabled={toggling || deleting}
          className={toggleButtonClass(song.played, toggling)}>
          {song.played ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
              </svg>
              Zurück
            </>
          ) : '✓ Gespielt'}
        </button>
        <button onClick={() => onDelete(song.id, song.title)} disabled={deleting || toggling}
          aria-label="Song löschen"
          className="shrink-0 h-11 w-11 sm:h-auto sm:w-auto sm:p-2.5 flex items-center justify-center rounded-2xl text-fg-muted border border-line hover:border-danger hover:text-danger hover:bg-danger-bg transition-all active:scale-95 disabled:opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
