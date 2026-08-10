'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePolling } from '@/app/lib/use-polling';
import { Button, Card, Input } from '@/app/components/ui';

interface Event {
  id: number;
  slug: string;
  title: string;
  active: boolean;
  branding_name: string | null;
  branding_logo_url: string | null;
  whitelabel?: boolean;
}

interface Song {
  id: number;
  title: string;
  artist: string;
  deezer_id: string | null;
  album_art_url: string | null;
  is_mine: boolean;
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

interface SearchResult {
  deezerId: string;
  title: string;
  artist: string;
  albumArt: string;
}

export default function GuestPage() {
  const { slug } = useParams<{ slug: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [songs, setSongs] = useState<Song[]>([]);
  const [unlocked, setUnlocked] = useState(true);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [manualMode, setManualMode] = useState(false);
  const [manualTitle, setManualTitle] = useState('');
  const [manualArtist, setManualArtist] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [votingId, setVotingId] = useState<number | null>(null);
  const [retractingId, setRetractingId] = useState<number | null>(null);

  const clientIdRef = useRef('');
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let id = localStorage.getItem('dj-guest-id');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('dj-guest-id', id);
    }
    clientIdRef.current = id;
  }, []);

  function clientHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return { 'x-client-id': clientIdRef.current, ...extra };
  }

  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${slug}`);
      if (res.status === 404) { setNotFound(true); return; }
      if (res.ok) setEvent(await res.json());
    } catch { /* ignore */ }
  }, [slug]);

  const handlePollData = useCallback((data: SongsResponse) => {
    // Versteckte Wünsche haben eine echte, scharfe Like-Zahl (siehe
    // redactHiddenSongs in app/lib/visibility.ts) — nur Titel, Interpret und
    // Cover werden serverseitig geleert. Die Normalisierung auf 0 fängt nur
    // den theoretischen Fall ab, dass vote_count einmal fehlt.
    setSongs((data.songs ?? []).map((s) => ({ ...s, vote_count: s.vote_count ?? 0 })));
    setUnlocked(data.unlocked !== false);
    setLoading(false);
  }, []);

  useEffect(() => { loadEvent(); }, [loadEvent]);

  usePolling<SongsResponse>({
    url: `/api/events/${slug}/songs?view=guest`,
    baseInterval: 2500,
    maxInterval: 15000,
    headers: () => ({ 'x-client-id': clientIdRef.current }),
    onData: handlePollData,
  });

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (q.length < 2) { setSearchResults([]); setShowDropdown(false); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
          setShowDropdown(data.length > 0);
        }
      } catch { setSearchResults([]); } finally { setSearching(false); }
    }, 300);
  }

  async function submitSong({
    title, artist, deezerId, albumArt,
  }: { title: string; artist: string; deezerId?: string; albumArt?: string }) {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/events/${slug}/songs`, {
        method: 'POST',
        headers: clientHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ title, artist, deezerId, albumArt }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage({ text: data.error ?? 'Ein Fehler ist aufgetreten.', ok: false }); return; }
      setQuery(''); setSearchResults([]); setShowDropdown(false);
      setManualMode(false); setManualTitle(''); setManualArtist('');
      setMessage(data.duplicate
        ? { text: 'Song ist schon in der Liste, deine Stimme wurde gezählt! 👍', ok: true }
        : { text: 'Song vorgeschlagen – du bist dabei! 🎵', ok: true }
      );
      // Polling picks up the new song on the next tick.
    } catch {
      setMessage({ text: 'Verbindungsfehler. Bitte nochmal versuchen.', ok: false });
    } finally { setSubmitting(false); }
  }

  function handleSelectResult(result: SearchResult) {
    setShowDropdown(false); setQuery('');
    submitSong({ title: result.title, artist: result.artist, deezerId: result.deezerId, albumArt: result.albumArt });
  }

  async function handleVote(song: Song) {
    if (votingId !== null) return;
    setVotingId(song.id);
    setSongs((prev) => {
      const next = prev.map((s) => s.id === song.id
        ? { ...s, vote_count: song.has_voted ? s.vote_count - 1 : s.vote_count + 1, has_voted: !song.has_voted }
        : s
      );
      // Solange das Event nicht freigeschaltet ist, bleibt die Reihenfolge
      // bewusst chronologisch. Eine Sortierung nach Likes wäre eine Rangfolge.
      if (!unlocked) return next;
      return next.sort((a, b) => Number(a.played) - Number(b.played) || b.vote_count - a.vote_count);
    });
    await fetch(
      song.has_voted ? `/api/events/${slug}/songs/unvote` : `/api/events/${slug}/songs/vote`,
      { method: 'POST', headers: clientHeaders({ 'Content-Type': 'application/json' }), body: JSON.stringify({ songId: song.id }) }
    );
    setVotingId(null);
  }

  async function handleRetract(song: Song) {
    const voteWord = song.vote_count === 1 ? 'Stimme' : 'Stimmen';
    if (!confirm(`"${song.title}" hat ${song.vote_count} ${voteWord}. Wirklich zurücknehmen?`)) return;
    setRetractingId(song.id);
    try {
      const res = await fetch(`/api/events/${slug}/songs/retract`, {
        method: 'POST',
        headers: clientHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ songId: song.id }),
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== song.id));
        setMessage({ text: 'Song zurückgenommen. Dein Slot ist wieder frei.', ok: true });
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage({ text: data.error ?? 'Fehler beim Zurücknehmen.', ok: false });
      }
    } catch {
      setMessage({ text: 'Verbindungsfehler.', ok: false });
    } finally {
      setRetractingId(null);
    }
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-rave-gradient flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-turquoise text-glow-turquoise text-5xl mb-4">♪</p>
          <h1 className="font-display text-3xl font-extrabold uppercase text-fg mb-2">Event nicht gefunden</h1>
          <p className="text-fg-muted">Bitte überprüfe den Link.</p>
        </div>
      </div>
    );
  }

  const unplayed = songs.filter((s) => !s.played && !s.hidden);
  const played = songs.filter((s) => s.played && !s.hidden);
  // Versteckte Songs kommen von der API bereits nach Like-Zahl absteigend
  // sortiert (hinter den sichtbaren). Titel/Interpret sind serverseitig
  // geleert, die Like-Zahl ist echt und bleibt scharf sichtbar.
  const hidden = songs.filter((s) => s.hidden);
  const showBlurred = !unlocked && hidden.length > 0;

  return (
    <div className="min-h-screen bg-rave-gradient">
      {/* Header */}
      <div className="text-center pb-6 px-4 safe-top-pad-10">
        {event?.branding_logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.branding_logo_url}
            alt={event.branding_name ?? 'Logo'}
            className="mx-auto mb-2 h-10 w-auto object-contain"
          />
        ) : (
          <p className="text-turquoise text-glow-turquoise text-3xl mb-1">♪</p>
        )}
        <h1 className="font-display text-4xl font-extrabold uppercase text-fg text-glow-turquoise">{event?.title ?? 'Musikwünsche'}</h1>
        {event?.branding_name && (
          <p className="font-mono text-fg-muted text-xs uppercase tracking-widest mt-1.5">
            {event.branding_name}
          </p>
        )}
      </div>

      {/* Flash message */}
      {message && (
        <div className={`mx-4 mb-4 rounded-2xl px-4 py-3 text-center text-sm font-medium animate-fade-up max-w-lg mx-auto ${
          message.ok ? 'bg-success-bg text-success border border-success/40' : 'bg-danger-bg text-danger border border-danger/40'
        }`}>
          {message.text}
        </div>
      )}

      {/* Input card */}
      <div className="px-4 max-w-lg mx-auto mb-8">
        <Card tone="party">
          {manualMode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-fg-muted text-xs uppercase tracking-widest">Manuell eingeben</span>
                <button type="button" onClick={() => { setManualMode(false); setManualTitle(''); setManualArtist(''); }} className="text-turquoise text-sm hover:underline">
                  ← Suche
                </button>
              </div>
              <Input type="text" placeholder="Songtitel" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} maxLength={200}
                className="text-lg py-4" />
              <Input type="text" placeholder="Künstler / Band" value={manualArtist} onChange={(e) => setManualArtist(e.target.value)} maxLength={200}
                className="text-lg py-4" />
              <Button
                type="button"
                tone="party"
                size="lg"
                disabled={submitting || !manualTitle.trim() || !manualArtist.trim()}
                onClick={() => submitSong({ title: manualTitle.trim(), artist: manualArtist.trim() })}
                className="w-full"
              >
                {submitting ? 'Wird eingereicht…' : '♪  Vorschlagen'}
              </Button>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <div className="relative">
                <Input type="text" placeholder="Song suchen…" value={query} onChange={handleSearchChange}
                  onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
                  className="text-lg py-4 pr-10" />
                {searching && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-neon-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-panel-elevated border border-line rounded-2xl shadow-lg shadow-black/30 overflow-hidden">
                  {searchResults.map((result) => (
                    <button key={result.deezerId} type="button" onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSelectResult(result)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-panel transition-colors text-left">
                      {result.albumArt && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={result.albumArt} alt={result.title} width={40} height={40} className="rounded-lg shrink-0 object-cover" />
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-fg text-sm truncate">{result.title}</p>
                        <p className="text-fg-muted text-xs truncate">{result.artist}</p>
                      </div>
                    </button>
                  ))}
                  <div className="border-t border-line px-4 py-2">
                    <button type="button" onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setShowDropdown(false); setManualMode(true); }}
                      className="text-fg-muted text-xs hover:text-turquoise transition-colors">
                      Song nicht gefunden? Manuell eingeben →
                    </button>
                  </div>
                </div>
              )}
              {!showDropdown && query.length >= 2 && !searching && (
                <div className="mt-2 text-center">
                  <button type="button" onClick={() => setManualMode(true)} className="text-fg-muted text-sm hover:text-turquoise transition-colors">
                    Song nicht gefunden? Manuell eingeben →
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Song list */}
      <div className="px-4 max-w-lg mx-auto pb-16">
        {loading ? (
          <p className="text-center text-fg-muted py-8">Lädt…</p>
        ) : songs.length === 0 ? (
          <p className="text-center text-fg-muted py-8">Noch keine Vorschläge – sei der Erste! 🎶</p>
        ) : (
          <>
            <h2 className="font-display text-xl font-extrabold uppercase text-fg text-center mb-4">
              Wunschliste
              {unlocked && unplayed.length > 0 && <span className="ml-2 text-neon-gold text-base font-normal normal-case">({unplayed.length})</span>}
            </h2>
            <div className="space-y-2">
              {unplayed.map((song, i) => (
                <SongCard key={song.id} song={song} rank={unlocked ? i + 1 : null} onVote={handleVote} voting={votingId === song.id}
                  onRetract={handleRetract} retracting={retractingId === song.id} />
              ))}
              {showBlurred && hidden.map((song) => (
                <BlurredSongRow key={song.id} song={song} widths={widthsForSong(song.id)} />
              ))}
            </div>
            {showBlurred && (
              <p className="mt-4 text-center text-fg-muted text-sm leading-relaxed">
                Die ganze Liste sehen das Brautpaar und der DJ. Dein Wunsch ist auf jeden Fall dabei.
              </p>
            )}
            {played.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1 h-px bg-line" />
                  <span className="font-mono text-fg-muted text-xs uppercase tracking-widest">Gespielt</span>
                  <div className="flex-1 h-px bg-line" />
                </div>
                <div className="space-y-2 opacity-40">
                  {played.map((song) => (
                    <SongCard key={song.id} song={song} rank={null} onVote={handleVote} voting={false}
                      onRetract={handleRetract} retracting={false} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Viraler Loop: unter den Gästen sind Brautpaare und DJs von morgen.
            Bei Whitelabel (Team) verschwindet der Hinweis komplett. */}
        {event && !event.whitelabel && (
          <footer className="mt-12 text-center">
            <a
              href="/?ref=gast"
              className="text-fg-muted text-xs hover:text-turquoise transition-colors"
            >
              Läuft mit BeatControl, dem Live-Voting für DJs
            </a>
          </footer>
        )}
      </div>
    </div>
  );
}

// Platzhalter für einen Wunsch, den dieser Gast nicht sehen darf. Gleiche
// Zeilenhöhe und gleicher Rhythmus wie eine echte Zeile: Titel und Interpret
// sind weichgezeichnete Balken (für Screenreader ausgeblendet), die Like-Zahl
// daneben ist echt und bleibt scharf lesbar. Die Zeile selbst ist nicht
// anklickbar und nicht fokussierbar (kein Button, kein tabIndex).
// Balkenbreiten sind deterministisch aus der Song-Id abgeleitet, damit sie
// bei jedem Poll gleich bleiben statt zu flackern.
const BLUR_WIDTHS = [
  { title: 'w-4/5', sub: 'w-2/5' },
  { title: 'w-1/2', sub: 'w-1/3' },
  { title: 'w-11/12', sub: 'w-5/12' },
  { title: 'w-3/5', sub: 'w-1/4' },
  { title: 'w-2/3', sub: 'w-1/2' },
];

function widthsForSong(id: number) {
  return BLUR_WIDTHS[id % BLUR_WIDTHS.length];
}

function BlurredSongRow({ song, widths }: { song: Song; widths: { title: string; sub: string } }) {
  return (
    <div className="bg-panel rounded-2xl p-4 flex items-center gap-3 border border-line shadow-lg shadow-black/20 select-none">
      <div aria-hidden="true" className="relative h-10 w-10 shrink-0">
        <div className="h-10 w-10 rounded-xl bg-fg/20 blur-sm opacity-70" />
        {/* Schloss-Symbol: macht auf einen Blick klar, dass dies Absicht ist,
            kein Ladefehler — unabhängig davon, wo in der Liste man gerade ist. */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute inset-0 m-auto h-4 w-4 text-fg-muted"
        >
          <path
            fillRule="evenodd"
            d="M10 1a4 4 0 00-4 4v2H5a1 1 0 00-1 1v8a2 2 0 002 2h8a2 2 0 002-2V8a1 1 0 00-1-1h-1V5a4 4 0 00-4-4zm2 6V5a2 2 0 10-4 0v2h4z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <div aria-hidden="true" className="flex-1 min-w-0 h-11 flex flex-col justify-center gap-2 blur-sm opacity-70">
        <div className={`h-4 rounded-full bg-fg/25 ${widths.title}`} />
        <div className={`h-3 rounded-full bg-fg/10 ${widths.sub}`} />
      </div>
      <span className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-base min-w-[4.5rem] justify-center shrink-0 bg-panel text-fg-muted border border-line">
        ♡&nbsp;{song.vote_count}
      </span>
    </div>
  );
}

function SongCard({
  song, rank, onVote, voting, onRetract, retracting,
}: {
  song: Song;
  rank: number | null;
  onVote: (song: Song) => void;
  voting: boolean;
  onRetract: (song: Song) => void;
  retracting: boolean;
}) {
  return (
    <div className="bg-panel rounded-2xl p-4 flex items-center gap-3 border border-line shadow-lg shadow-black/20 animate-fade-up">
      {song.album_art_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={song.album_art_url} alt={song.title} width={40} height={40} className="rounded-xl shrink-0 object-cover" />
      ) : rank !== null ? (
        <span className="font-display text-turquoise text-xl font-black w-10 text-center shrink-0">{rank}</span>
      ) : (
        <span aria-hidden="true" className="font-display text-turquoise/50 text-xl w-10 text-center shrink-0">♪</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className="font-medium text-fg text-base truncate">{song.title}</p>
        </div>
        <p className="text-fg-muted text-sm truncate">{song.artist}</p>
        {song.is_mine && !song.played && (
          <button
            onClick={() => onRetract(song)}
            disabled={retracting}
            className="text-xs text-fg-muted/85 hover:text-danger transition-colors mt-0.5 disabled:opacity-40"
          >
            {retracting ? 'Wird zurückgenommen…' : 'Zurücknehmen'}
          </button>
        )}
      </div>
      <button
        onClick={() => onVote(song)}
        disabled={voting || song.played}
        aria-label={song.has_voted ? 'Stimme entfernen' : 'Abstimmen'}
        className={`
          flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-base min-w-[4.5rem]
          justify-center transition-all active:scale-90 shrink-0
          ${song.has_voted ? 'bg-turquoise text-base glow-turquoise' : 'bg-panel text-fg-muted border border-line hover:border-turquoise hover:text-turquoise'}
          ${voting ? 'opacity-50 cursor-wait' : ''}
          ${song.played ? 'pointer-events-none' : ''}
        `}
      >
        {song.has_voted ? '♥' : '♡'}&nbsp;{song.vote_count}
      </button>
    </div>
  );
}
