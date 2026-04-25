'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';

interface Song {
  id: number;
  title: string;
  artist: string;
  deezer_id: string | null;
  album_art_url: string | null;
  genre: string | null;
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
  subtitle: string | null;
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

// ── Main component ────────────────────────────────────────────────────────────

export default function DJEventPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [downloading, setDownloading] = useState(false);

  const [origin, setOrigin] = useState('');

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}`);
      if (res.ok) setEvent(await res.json());
    } catch { /* ignore */ }
  }, [slug]);

  const fetchSongs = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}/songs`);
      if (res.ok) setSongs(await res.json());
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadEvent();
    fetchSongs();
    const interval = setInterval(fetchSongs, 3000);
    return () => clearInterval(interval);
  }, [loadEvent, fetchSongs]);

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
    fetchSongs();
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

  return (
    <div className="h-screen flex flex-col bg-cream overflow-hidden">
      {/* Header */}
      <div className="shrink-0 bg-ivory border-b border-champagne px-6 py-3 flex items-center justify-between">
        <h1 className="font-serif text-xl font-semibold text-ink">{event?.title ?? 'DJ-Ansicht'}</h1>
        <div className="flex items-center gap-4">
          <span className="text-muted text-sm">{unplayed.length} offen · {played.length} gespielt</span>
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" title="Live" />
        </div>
      </div>

      {/* Split body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: QR panel */}
        <div className="w-72 xl:w-80 shrink-0 flex flex-col items-center justify-center gap-5 p-8">
          <div className="text-center">
            <p className="text-gold text-xl mb-1">♪</p>
            <h2 className="font-serif text-2xl font-semibold text-ink leading-tight">Musikwünsche</h2>
            <p className="text-muted text-sm mt-1">Scanne mich!</p>
          </div>
          {origin ? (
            <div className="bg-white rounded-3xl p-4 border-2 border-champagne shadow-[0_4px_20px_rgba(201,169,97,0.18)]">
              <QRCodeSVG value={guestUrl} size={200} fgColor="#2a2520" bgColor="#ffffff" level="M" />
            </div>
          ) : (
            <div className="w-[232px] h-[232px] rounded-3xl bg-ivory border-2 border-champagne animate-pulse" />
          )}
          <p className="text-muted/60 text-xs text-center font-mono break-all leading-relaxed max-w-[220px]">{guestUrl}</p>
          <button onClick={downloadGuestCard} disabled={downloading || !origin}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-medium text-muted border border-champagne hover:border-gold hover:text-gold transition-all active:scale-95 disabled:opacity-40">
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

        {/* Gold divider */}
        <div className="py-8 shrink-0 flex items-stretch">
          <div className="w-px bg-gold/30" />
        </div>

        {/* Right: Song list */}
        <div className="flex-1 overflow-y-auto p-5 xl:p-8 pb-16">
          {loading ? (
            <p className="text-center text-muted py-12">Lädt…</p>
          ) : unplayed.length === 0 && played.length === 0 ? (
            <p className="text-center text-muted py-12">Noch keine Vorschläge.</p>
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
                    <div className="flex-1 h-px bg-champagne" />
                    <span className="text-muted text-xs uppercase tracking-widest">Gespielt</span>
                    <div className="flex-1 h-px bg-champagne" />
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
  let suggestions: string[] = [];
  try {
    if (song.suggestions) suggestions = JSON.parse(song.suggestions);
  } catch { /* ignore bad JSON */ }

  const showGenre = song.genre && song.genre !== 'Unbekannt';
  const aiPending = song.genre === null;

  return (
    <div className="bg-ivory rounded-3xl p-4 flex items-center gap-3 border border-champagne shadow-sm">
      {/* Left: rank + album art or note */}
      <div className="flex items-center gap-1.5 shrink-0">
        {rank !== null && (
          <span className="text-xs font-bold text-champagne w-5 text-right tabular-nums">{rank}</span>
        )}
        {song.album_art_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={song.album_art_url} alt={song.title} width={48} height={48}
            className="w-12 h-12 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-champagne/40 flex items-center justify-center shrink-0">
            <span className="text-muted text-base">♪</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-ink text-lg leading-tight truncate">{song.title}</p>
          {showGenre && (
            <span className="shrink-0 px-2 py-0.5 bg-gold/15 text-gold text-xs font-semibold rounded-full leading-tight">
              {song.genre}
            </span>
          )}
          {aiPending && (
            <span className="text-muted/40 text-xs shrink-0">…</span>
          )}
        </div>
        <p className="text-muted text-sm truncate">{song.artist}</p>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {suggestions.map((s, i) => (
              <span key={i} className="px-2 py-0.5 bg-champagne/60 text-muted text-xs rounded-full leading-tight">
                {s}
              </span>
            ))}
          </div>
        )}
        <p className="text-champagne text-xs mt-0.5">
          {new Date(song.created_at).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-gold font-bold text-xl tabular-nums">♥ {song.vote_count}</span>
        <button onClick={() => onToggle(song.id)} disabled={toggling || deleting}
          className={`px-4 py-2.5 rounded-2xl font-semibold text-sm transition-all active:scale-95
            ${song.played ? 'bg-cream text-muted border border-champagne hover:border-ink hover:text-ink' : 'bg-ink text-cream hover:opacity-90'}
            ${toggling ? 'opacity-50 cursor-wait' : ''}`}>
          {song.played ? '↩ Zurück' : '✓ Gespielt'}
        </button>
        <button onClick={() => onDelete(song.id, song.title)} disabled={deleting || toggling}
          aria-label="Song löschen"
          className="p-2.5 rounded-2xl text-muted border border-champagne hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-30">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.519.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
