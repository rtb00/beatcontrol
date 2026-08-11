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
  hidden: boolean;
}

interface SongsResponse {
  songs: Song[];
  unlocked: boolean;
  total: number;
  hidden_count: number;
}

interface Event {
  id: number;
  slug: string;
  title: string;
  dj_token?: string;
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
  const [unlocked, setUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  const [exporting, setExporting] = useState(false);
  const [paywall, setPaywall] = useState<{ open: boolean; type: PaywallLimit }>({ open: false, type: 'export' });

  const [origin, setOrigin] = useState('');
  // Guest-DJ-Modus: Live-Screen per geteiltem Link ohne Account bedienen.
  // window.location statt useSearchParams, um keine Suspense-Boundary zu brauchen.
  const [guestToken, setGuestToken] = useState('');
  const [djLinkCopied, setDjLinkCopied] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [coupleTextCopied, setCoupleTextCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    setGuestToken(new URLSearchParams(window.location.search).get('dj') ?? '');
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

  const handlePollData = useCallback((data: SongsResponse) => {
    setSongs(data.songs ?? []);
    setUnlocked(data.unlocked ?? true);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadEvent();
    fetch('/api/me').then((r) => (r.ok ? r.json() : null)).then((d) => d && setMe(d)).catch(() => {});
  }, [loadEvent]);

  // Der Live-Screen fragt die DJ-Sicht ab: solange die Feier nicht freigeschaltet
  // ist, kommen die drei beliebtesten Songs offen, der Rest verschwommen mit
  // scharfen Like-Zahlen zurück.
  usePolling<SongsResponse>({
    url: `/api/events/${slug}/songs?view=dj${guestToken ? `&dj=${encodeURIComponent(guestToken)}` : ''}`,
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

  const [unlocking, setUnlocking] = useState(false);

  async function handleUnlockClick() {
    // Ohne Konto (Zugang per geteiltem dj-Token): erst registrieren, die
    // Registrierung führt danach automatisch in denselben Checkout.
    if (guestToken) {
      window.location.href = `/auth/register?slug=${encodeURIComponent(slug)}&dj=${encodeURIComponent(guestToken)}`;
      return;
    }
    setUnlocking(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'couple_pass', slug, unlock_gift: true }),
      });
      const data = await res.json().catch(() => null);
      if (data?.url) window.location.href = data.url;
      else setUnlocking(false);
    } catch {
      setUnlocking(false);
    }
  }

  const coupleMessage = origin
    ? `Hallo! Bei eurer Feier können eure Gäste schon Songs wünschen: ${origin}/${slug}\nUm alle Wünsche zu sehen, schaltet eure Feier auf BeatControl einmalig für 49 Euro frei.`
    : '';

  // Nach der Feier schließen: Gäste sollen Tage später nicht weiterwünschen.
  // Die Aktion hing früher im Song-Limit-Hinweis, der entfallen ist.
  async function handleDeactivate() {
    if (!confirm('Event wirklich schließen? Deine Gäste können dann keine Songs mehr wünschen.')) return;
    setDeactivating(true);
    try {
      await fetch(`/api/events/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false }),
      });
      await loadEvent();
    } finally {
      setDeactivating(false);
    }
  }

  async function copyCoupleText() {
    if (!coupleMessage) return;
    try {
      await navigator.clipboard.writeText(coupleMessage);
      setCoupleTextCopied(true);
      setTimeout(() => setCoupleTextCopied(false), 2500);
    } catch { /* ignore */ }
  }

  async function handleToggle(songId: number) {
    if (togglingId !== null) return;
    setTogglingId(songId);
    setSongs((prev) => prev.map((s) => s.id === songId ? { ...s, played: !s.played } : s));
    await fetch(`/api/events/${slug}/songs/toggle-played`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ songId, ...(guestToken ? { djToken: guestToken } : {}) }),
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
      body: JSON.stringify({ songId, ...(guestToken ? { djToken: guestToken } : {}) }),
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

      // DIN-Proportion 1:√2 (wie A6/A5), damit die Karte druckfreundlich ist.
      // Layout durchgehend zentriert, Schritte einzeilig, Regeln als eine
      // charmante Zeile statt technischer Bullet-Liste.
      const W = 900, H = 1273;
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

      ctx.textAlign = 'center';
      ctx.fillStyle = GOLD; ctx.font = '26px "Playfair Display", Georgia, serif';
      ctx.fillText('♪', W / 2, 78);

      ctx.fillStyle = INK; ctx.font = '600 52px "Playfair Display", Georgia, serif';
      ctx.fillText('Musikwünsche', W / 2, 136);

      ctx.fillStyle = GOLD; ctx.font = 'italic 26px "Playfair Display", Georgia, serif';
      ctx.fillText(fitText(ctx, event?.title ?? slug, 760), W / 2, 176);

      ctx.fillStyle = MUTED; ctx.font = '18px "Inter", system-ui, sans-serif';
      ctx.fillText('Heute bestimmst du mit, was läuft', W / 2, 212);

      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 90, 240); ctx.lineTo(W / 2 + 90, 240); ctx.stroke();

      const qrBoxX = (W - 380) / 2, qrBoxY = 266;
      ctx.fillStyle = WHITE; rrect(ctx, qrBoxX, qrBoxY, 380, 380, 18); ctx.fill();
      ctx.strokeStyle = CHAMPAGNE; ctx.lineWidth = 2;
      rrect(ctx, qrBoxX, qrBoxY, 380, 380, 18); ctx.stroke();
      ctx.drawImage(qrImg, qrBoxX + 20, qrBoxY + 20, 340, 340);

      ctx.fillStyle = MUTED; ctx.font = '14px monospace';
      ctx.fillText(guestUrl, W / 2, 678);

      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 90, 708); ctx.lineTo(W / 2 + 90, 708); ctx.stroke();

      ctx.fillStyle = INK; ctx.font = '600 23px "Inter", system-ui, sans-serif';
      ctx.fillText("So funktioniert's", W / 2, 758);

      const steps = [
        { num: '1', title: 'Code scannen', desc: 'Einfach die Handykamera draufhalten. Ohne App, ohne Anmeldung.' },
        { num: '2', title: 'Song wünschen', desc: 'Tipp deinen Lieblingssong ein und gib anderen Wünschen ein Herz.' },
        { num: '3', title: 'Tanzen', desc: '' },
      ];

      let stepY = 845;
      for (const step of steps) {
        // Nummern-Kreis + Titel als gemeinsam zentrierte Zeile: Breite messen,
        // damit der Block optisch mittig sitzt.
        ctx.font = '600 20px "Inter", system-ui, sans-serif';
        const titleW = ctx.measureText(step.title).width;
        const x0 = (W - (32 + 12 + titleW)) / 2;
        ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(x0 + 16, stepY - 7, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = WHITE; ctx.font = '700 15px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'center'; ctx.fillText(step.num, x0 + 16, stepY - 1);
        ctx.fillStyle = INK; ctx.font = '600 20px "Inter", system-ui, sans-serif';
        ctx.textAlign = 'left'; ctx.fillText(step.title, x0 + 44, stepY);
        if (step.desc) {
          ctx.fillStyle = MUTED; ctx.font = '15px "Inter", system-ui, sans-serif';
          ctx.textAlign = 'center'; ctx.fillText(step.desc, W / 2, stepY + 34);
        }
        stepY += 105;
      }

      ctx.strokeStyle = GOLD; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W / 2 - 160, stepY - 50); ctx.lineTo(W / 2 + 160, stepY - 50); ctx.stroke();
      ctx.fillStyle = INK; ctx.font = 'italic 22px "Playfair Display", Georgia, serif';
      ctx.fillText('♪ Viel Spaß beim Feiern! ♪', W / 2, stepY - 4);

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
  // Der DJ steht am Pult und will wissen, was die Leute hören wollen. Deshalb
  // benennt das Banner konkret, was ihm fehlt, statt die Sperre zu erklären.
  const hiddenSongs = songs.filter((s) => s.hidden);
  const topHiddenVotes = hiddenSongs.reduce((max, s) => Math.max(max, s.vote_count ?? 0), 0);
  const lockedHeadline =
    topHiddenVotes > 1
      ? `Der beliebteste Wunsch hier hat ${topHiddenVotes} Herzen.`
      : hiddenSongs.length === 1
        ? 'Ein weiterer Wunsch liegt auf dieser Feier.'
        : `${hiddenSongs.length} weitere Wünsche liegen auf dieser Feier.`;

  return (
    <div className="h-[100dvh] flex flex-col bg-base overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-panel border-b border-line px-3 sm:px-6 pb-2 sm:pb-3 flex items-center justify-between gap-2 sm:gap-3 safe-top">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {!guestToken && (
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
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label={sidebarOpen ? 'QR-Sidebar einklappen' : 'QR-Sidebar ausklappen'}
            aria-expanded={sidebarOpen}
            title={sidebarOpen ? 'QR-Code ausblenden' : 'QR-Code anzeigen'}
            className={`shrink-0 h-11 w-11 sm:h-9 sm:w-9 flex items-center justify-center rounded-xl border transition-all active:scale-95 ${
              sidebarOpen
                ? 'border-turquoise text-turquoise bg-turquoise/10'
                : 'border-line text-fg-muted/85 hover:border-turquoise hover:text-turquoise'
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
              {!guestToken && (
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
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {!guestToken && (
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
          )}
          {me && (
            <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest text-fg-muted/85 border border-line rounded-full px-2 py-0.5">
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

      {guestToken && (
        <div className="shrink-0 border-b border-line bg-panel/60 px-4 py-2 text-center">
          <p className="text-xs text-fg-muted">
            Du legst selbst auf? <Link href="/" className="text-turquoise underline underline-offset-2 hover:brightness-110 transition-all">BeatControl für deine eigenen Gigs</Link>
          </p>
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
            <p className="text-fg-muted/85 text-xs text-center font-mono break-all leading-relaxed max-w-[260px] md:max-w-[200px] lg:max-w-[220px]">{guestUrl}</p>
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
            {event?.dj_token && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${origin}/dj/${slug}?dj=${event.dj_token}`).then(() => {
                    setDjLinkCopied(true);
                    setTimeout(() => setDjLinkCopied(false), 2000);
                  }).catch(() => {});
                }}
                tabIndex={sidebarOpen ? 0 : -1}
                className="flex items-center gap-2 px-4 py-2.5 md:py-2 min-h-[44px] md:min-h-0 rounded-2xl text-xs font-medium text-fg-muted border border-line hover:border-neon-gold hover:text-neon-gold transition-all active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
                  <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                  <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                </svg>
                {djLinkCopied ? 'Link kopiert' : 'Songübersicht für den DJ'}
              </button>
            )}
            {!guestToken && (
              <button
                onClick={handleDeactivate}
                disabled={deactivating}
                tabIndex={sidebarOpen ? 0 : -1}
                className="text-xs text-fg-muted/70 hover:text-red transition-colors disabled:opacity-40"
              >
                {deactivating ? 'Wird geschlossen…' : 'Event schließen'}
              </button>
            )}
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
          {!unlocked && !loading && (
            <div className="mb-4 rounded-2xl border border-turquoise/25 bg-panel-elevated/60 px-4 py-3.5 sm:px-5 sm:py-4">
              <p className="text-sm text-fg leading-snug">
                <span className="font-semibold">{lockedHeadline}</span>{' '}
                Welche das sind, siehst du nach dem Freischalten. Dann weißt du den ganzen
                Abend, worauf deine Leute abgehen. Dein nächstes eigenes Event ist gratis dabei.
              </p>
              <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <button
                  onClick={handleUnlockClick}
                  disabled={unlocking}
                  className="px-4 py-2.5 rounded-xl bg-turquoise text-[color:var(--bg-base)] text-sm font-semibold hover:brightness-110 transition-all active:scale-95 disabled:opacity-50"
                >
                  {unlocking ? '…' : 'Alle Wünsche sehen · 49€'}
                </button>
                <button
                  onClick={copyCoupleText}
                  disabled={!origin}
                  className="px-4 py-2.5 rounded-xl border border-line text-sm text-fg-muted hover:border-turquoise hover:text-turquoise transition-all active:scale-95 disabled:opacity-40"
                >
                  {coupleTextCopied ? 'Text kopiert' : 'Das Brautpaar fragen'}
                </button>
              </div>
            </div>
          )}
          {loading ? (
            <p className="text-center text-fg-muted py-12">Lädt…</p>
          ) : unplayed.length === 0 && played.length === 0 ? (
            <p className="text-center text-fg-muted py-12">Noch keine Vorschläge.</p>
          ) : (
            <>
              <div className="space-y-3">
                {unplayed.map((song, i) => (
                  song.hidden ? (
                    <DJHiddenCard key={song.id} song={song} />
                  ) : (
                    <DJCard key={song.id} song={song} rank={i + 1}
                      onToggle={handleToggle} toggling={togglingId === song.id}
                      onDelete={handleDelete} deleting={deletingId === song.id} />
                  )
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
                      song.hidden ? (
                        <DJHiddenCard key={song.id} song={song} />
                      ) : (
                        <DJCard key={song.id} song={song} rank={null}
                          onToggle={handleToggle} toggling={togglingId === song.id}
                          onDelete={handleDelete} deleting={deletingId === song.id} />
                      )
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

// Verstecke Zeile für eine nicht freigeschaltete Feier: Titel/Interpret kommen
// bereits serverseitig leer an, hier nur noch verschwommene Platzhalterbalken
// statt Text. Weder Button noch Link, damit am DJ-Pult nichts versehentlich
// ausgelöst wird. Die Like-Zahl bleibt bewusst scharf lesbar.
function DJHiddenCard({ song }: { song: Song }) {
  return (
    <div
      aria-hidden="true"
      className="bg-panel/70 rounded-2xl sm:rounded-3xl p-3 sm:p-4 flex items-center gap-3 sm:gap-5 border border-line/60 select-none"
    >
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 shrink-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-panel-elevated blur-[3px]" />
          {/* Schloss-Symbol statt reinem Weichzeichner: im Halbdunkel des
              Floors soll auf einen Blick klar sein "gesperrt", nicht "kaputt". */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute inset-0 m-auto h-4 w-4 sm:h-5 sm:w-5 text-fg-muted"
          >
            <path
              fillRule="evenodd"
              d="M10 1a4 4 0 00-4 4v2H5a1 1 0 00-1 1v8a2 2 0 002 2h8a2 2 0 002-2V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm2 6V5a2 2 0 10-4 0v2h4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="h-4 sm:h-[18px] w-2/3 max-w-[240px] rounded-full bg-fg-muted/30 blur-[3px]" />
          <div className="flex items-center gap-2 mt-2">
            <div className="h-3 w-1/3 max-w-[140px] rounded-full bg-fg-muted/20 blur-[3px]" />
            <Badge color="gold" tone="party" className="!rounded-full tabular-nums leading-tight">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3" aria-hidden="true">
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              {song.vote_count}
            </Badge>
          </div>
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
