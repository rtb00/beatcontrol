'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePolling } from '@/app/lib/use-polling';
import { Button, Input } from '@/app/components/ui';

// Ab so vielen versteckten Wünschen lohnt sich der Kaufblock. Darunter bleibt
// die Seite ruhig, weil eine halbleere Liste kein Kaufargument ist.
const PURCHASE_THRESHOLD = 10;
// Ab hier wird die Zeit bis zur Feier im Kopf mitgezählt.
const COUNTDOWN_WINDOW_DAYS = 90;
const COUPLE_PRICE = '49 €';
// Zwischenspeicher des Funnels: Name und Tag der Feier, bevor es ein Konto gab.
const PENDING_EVENT_KEY = 'bc_pending_event';

interface EventListItem {
  id: number;
  slug: string;
  title: string;
  active: boolean;
  event_date: string | null;
  created_at: string;
  song_count: number;
}

interface EventDetail {
  id: number;
  slug: string;
  title: string;
  event_date: string | null;
  dj_token?: string;
}

interface Song {
  id: number;
  title: string;
  artist: string;
  created_at: string;
  played: boolean;
  vote_count: number | null;
  hidden: boolean;
}

interface SongsResponse {
  songs: Song[];
  unlocked: boolean;
  total: number;
  hidden_count: number;
}

// ── Formatierung ──────────────────────────────────────────────────────────────

// Datum wird aus dem reinen Tagesanteil gebaut, damit die Zeitzone den Termin
// nicht um einen Tag verschiebt.
function parseEventDate(iso: string | null): Date | null {
  if (!iso) return null;
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return null;
  const date = new Date(y, m - 1, d);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((date.getTime() - today.getTime()) / 86400000);
}

function formatDateLine(iso: string | null): string | null {
  const date = parseEventDate(iso);
  if (!date) return null;
  const written = date.toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const days = daysUntil(date);
  if (days < 0 || days >= COUNTDOWN_WINDOW_DAYS) return written;
  if (days === 0) return `${written}, heute`;
  if (days === 1) return `${written}, noch 1 Tag`;
  return `${written}, noch ${days} Tage`;
}

function statusLine(total: number, unlocked: boolean): string {
  if (total === 0) return 'Alles steht. Jetzt fehlen nur noch eure Gäste';
  if (unlocked) return 'Alles sichtbar. Jetzt fehlt nur noch euer DJ';
  if (total === 1) return '1 Wunsch ist schon da';
  return `${total} Wünsche sind schon da`;
}

// ── Kleine Bausteine ──────────────────────────────────────────────────────────

// Feste Balkenbreiten, damit die verschwommenen Zeilen organisch wirken und
// beim Neuladen nichts flackert.
const BAR_WIDTHS = [
  { title: 'w-4/5', sub: 'w-2/5' },
  { title: 'w-1/2', sub: 'w-1/3' },
  { title: 'w-11/12', sub: 'w-5/12' },
  { title: 'w-3/5', sub: 'w-1/4' },
];

function LikeCount({ count }: { count: number | null }) {
  if (count === null) return null;
  return (
    <span className="flex shrink-0 items-center gap-1.5 text-neon-gold">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001z" />
      </svg>
      <span className="font-display font-bold tabular-nums">{count}</span>
      <span className="sr-only">Likes</span>
    </span>
  );
}

function rowClass(): string {
  return 'flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3 shadow-lg shadow-black/20';
}

// ── Seite ─────────────────────────────────────────────────────────────────────

export default function FeierPage() {
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [event, setEvent] = useState<EventDetail | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [unlocked, setUnlocked] = useState(false);
  const [hiddenCount, setHiddenCount] = useState(0);

  const [origin, setOrigin] = useState('');
  const [justPaid, setJustPaid] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [buying, setBuying] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const [titleDraft, setTitleDraft] = useState('');
  const [dateDraft, setDateDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
    if (new URLSearchParams(window.location.search).get('checkout') === 'success') {
      setJustPaid(true);
      window.history.replaceState({}, '', '/feier');
    }
  }, []);

  // Ein Paar hat genau eine Feier: das erste aktive Event, sonst das neueste.
  const loadEvent = useCallback(async () => {
    try {
      const res = await fetch('/api/events');
      if (!res.ok) return;
      const list = (await res.json()) as EventListItem[];
      const chosen = list.find((e) => e.active) ?? list[0] ?? null;
      if (!chosen) return;
      const detailRes = await fetch(`/api/events/${chosen.slug}`);
      const detail = detailRes.ok ? ((await detailRes.json()) as EventDetail) : null;
      const merged: EventDetail = {
        id: chosen.id,
        slug: chosen.slug,
        title: detail?.title ?? chosen.title,
        event_date: detail?.event_date ?? chosen.event_date,
        dj_token: detail?.dj_token,
      };
      setEvent(merged);
      setTitleDraft(merged.title);
      setDateDraft(merged.event_date ? merged.event_date.slice(0, 10) : '');
    } catch {
      /* Verbindungsfehler: die Seite zeigt dann den ruhigen Leerzustand */
    } finally {
      setLoadingEvent(false);
    }
  }, []);

  // Kommt das Paar frisch aus dem Funnel, liegt die Feier nur im Browser und
  // wird hier angelegt. Der Eintrag wird vor dem Anlegen entfernt, damit ein
  // zweiter Aufruf nicht dieselbe Feier ein zweites Mal anlegt.
  const createPendingEvent = useCallback(async () => {
    let pending: string | null = null;
    try {
      pending = localStorage.getItem(PENDING_EVENT_KEY);
      if (!pending) return;
      localStorage.removeItem(PENDING_EVENT_KEY);
    } catch {
      return; /* localStorage kann blockiert sein */
    }
    let data: { title?: string; date?: string; is_couple?: unknown };
    try {
      data = JSON.parse(pending) as { title?: string; date?: string; is_couple?: unknown };
    } catch {
      return; /* defektes JSON ignorieren */
    }
    // Das Paar-Merkmal am Konto festhalten, damit auch spätere Anmeldungen
    // hier landen. Bei der Anmeldung über Google ist das der einzige Ort,
    // an dem das Merkmal ankommt.
    if (data.is_couple === true) {
      fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCouple: true }),
      }).catch(() => {});
    }
    if (!data.title?.trim() || !data.date) return;
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: data.title.trim(), event_date: data.date }),
      });
    } catch {
      /* Verbindungsfehler: die Seite zeigt dann den ruhigen Leerzustand */
    }
  }, []);

  useEffect(() => {
    let abgebrochen = false;
    (async () => {
      await createPendingEvent();
      if (!abgebrochen) loadEvent();
    })();
    return () => {
      abgebrochen = true;
    };
  }, [createPendingEvent, loadEvent]);

  const handlePollData = useCallback((data: SongsResponse) => {
    setSongs(data.songs ?? []);
    setUnlocked(data.unlocked);
    setHiddenCount(data.hidden_count);
  }, []);

  usePolling<SongsResponse>({
    url: `/api/events/${event?.slug ?? ''}/songs?view=owner`,
    baseInterval: 5000,
    maxInterval: 30000,
    enabled: !!event,
    onData: handlePollData,
  });

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      setNotice('Kopieren hat nicht geklappt. Markiert den Text bitte von Hand');
    }
  }

  async function startCheckout() {
    if (!event) return;
    setNotice(null);
    setBuying(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'couple_pass', event_date: event.event_date }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 503) {
        setNotice('Die Bezahlung ist gerade nicht erreichbar. Bitte versucht es später noch einmal');
        return;
      }
      if (!res.ok || !data.url) {
        setNotice('Die Bezahlung konnte nicht gestartet werden. Bitte versucht es noch einmal');
        return;
      }
      window.location.href = data.url;
    } catch {
      setNotice('Keine Verbindung. Bitte versucht es noch einmal');
    } finally {
      setBuying(false);
    }
  }

  async function removeSong(song: Song) {
    if (!event) return;
    if (!window.confirm(`„${song.title}“ wirklich aus der Liste entfernen?`)) return;
    setRemovingId(song.id);
    try {
      const res = await fetch(`/api/events/${event.slug}/songs/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ songId: song.id }),
      });
      if (res.ok) {
        setSongs((prev) => prev.filter((s) => s.id !== song.id));
      } else {
        setNotice('Der Wunsch konnte nicht entfernt werden. Bitte versucht es noch einmal');
      }
    } catch {
      setNotice('Keine Verbindung. Bitte versucht es noch einmal');
    } finally {
      setRemovingId(null);
    }
  }

  async function saveDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;
    const trimmed = titleDraft.trim();
    if (!trimmed) {
      setNotice('Bitte tragt einen Namen für eure Feier ein');
      return;
    }
    setNotice(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${event.slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: trimmed, event_date: dateDraft ? dateDraft : null }),
      });
      if (!res.ok) {
        setNotice('Das Speichern hat nicht geklappt. Bitte versucht es noch einmal');
        return;
      }
      setEvent((prev) => (prev ? { ...prev, title: trimmed, event_date: dateDraft || null } : prev));
      setSavedAt(true);
      setTimeout(() => setSavedAt(false), 2500);
    } catch {
      setNotice('Keine Verbindung. Bitte versucht es noch einmal');
    } finally {
      setSaving(false);
    }
  }

  if (loadingEvent) {
    return (
      <div className="min-h-screen bg-rave-gradient px-4 py-24 text-center">
        <p className="text-fg-muted">Einen Moment…</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-rave-gradient px-4 py-24">
        <div className="mx-auto w-full max-w-[720px] text-center">
          <p className="mb-3 text-3xl text-neon-gold">♪</p>
          <h1 className="font-display text-3xl font-black uppercase tracking-wide text-fg">Eure Feier</h1>
          <p className="mt-3 text-fg-muted">Hier erscheint eure Feier, sobald ihr sie angelegt habt</p>
          <Link href="/start" className="mt-6 inline-block text-neon-gold hover:underline">
            Feier anlegen
          </Link>
        </div>
      </div>
    );
  }

  const dateLine = formatDateLine(event.event_date);
  const guestLink = origin ? `${origin}/${event.slug}` : `/${event.slug}`;
  const djLink = event.dj_token ? `${origin}/dj/${event.slug}?dj=${event.dj_token}` : null;

  const total = songs.length;
  const visible = songs
    .filter((s) => !s.hidden)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime() || b.id - a.id);
  const blurred = songs
    .filter((s) => s.hidden)
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0) || a.id - b.id);
  const sortedByLikes = [...songs].sort(
    (a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0) || a.id - b.id
  );

  const showPurchase = !unlocked && hiddenCount >= PURCHASE_THRESHOLD;
  const listIsEmpty = total === 0;

  const guestMessage = `Hallo! Für unsere Feier sammeln wir Musikwünsche. Welches Lied wollt ihr hören? Hier eintragen: ${guestLink}`;
  const djMessage = djLink
    ? `Hallo, hier ist die Liste mit den Musikwünschen unserer Gäste, sortiert nach Beliebtheit. Sie aktualisiert sich von allein: ${djLink}`
    : '';

  const shareBlock = (
    <section className={listIsEmpty ? 'mt-10' : 'mt-14'}>
      <h2
        className={
          listIsEmpty
            ? 'font-display text-2xl font-bold text-fg'
            : 'font-display text-lg font-bold text-fg'
        }
      >
        Euren Gästen den Link schicken
      </h2>
      {listIsEmpty && (
        <p className="mt-2 leading-relaxed text-fg-muted">
          So kommen die Wünsche herein: Link verschicken, eure Gäste tragen ein, was sie hören wollen
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(guestMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-neon-gold/50 bg-neon-gold/10 px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-neon-gold transition-all hover:bg-neon-gold/20 active:scale-95"
        >
          Link in WhatsApp schicken
        </a>
        <Button variant="ghost" onClick={() => copy(guestLink, 'guest')}>
          {copied === 'guest' ? 'Kopiert' : 'Link kopieren'}
        </Button>
        <a
          href={`mailto:?subject=${encodeURIComponent(`Musikwünsche für ${event.title}`)}&body=${encodeURIComponent(guestMessage)}`}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-line bg-transparent px-6 py-3 font-display text-sm font-bold uppercase tracking-wide text-fg transition-all hover:bg-panel active:scale-95"
        >
          Per Mail
        </a>
      </div>
      <p className="mt-4 break-all text-sm text-fg-muted">{guestLink}</p>
    </section>
  );

  const listBlock = (
    <section className="mt-10">
      <h2 className="font-display text-2xl font-bold text-fg">Eure Wunschliste</h2>

      {listIsEmpty ? (
        <p className="mt-3 leading-relaxed text-fg-muted">
          Noch ist die Liste leer. Sobald eure Gäste den Link öffnen, füllt sie sich hier von allein
        </p>
      ) : unlocked ? (
        <ul className="mt-4 space-y-2">
          {sortedByLikes.map((song) => (
            <li key={song.id} className={rowClass()}>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-fg">{song.title}</p>
                <p className="truncate text-sm text-fg-muted">{song.artist}</p>
              </div>
              <LikeCount count={song.vote_count} />
              <button
                onClick={() => removeSong(song)}
                disabled={removingId === song.id}
                className="shrink-0 text-xs text-fg-muted/85 transition-colors hover:text-danger disabled:opacity-40"
              >
                {removingId === song.id ? 'Wird entfernt…' : 'Entfernen'}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="mt-4 space-y-2">
            {visible.map((song) => (
              <li key={song.id} className={rowClass()}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-fg">{song.title}</p>
                  <p className="truncate text-sm text-fg-muted">{song.artist}</p>
                </div>
                <LikeCount count={song.vote_count} />
              </li>
            ))}
            {blurred.map((song, i) => (
              <li key={song.id} className={rowClass()}>
                <div className="min-w-0 flex-1 space-y-2" aria-hidden="true">
                  <div
                    className={`h-4 rounded-full bg-fg/25 opacity-70 blur-sm ${BAR_WIDTHS[i % BAR_WIDTHS.length].title}`}
                  />
                  <div
                    className={`h-3 rounded-full bg-fg/10 opacity-70 blur-sm ${BAR_WIDTHS[i % BAR_WIDTHS.length].sub}`}
                  />
                </div>
                <span className="sr-only">Dieser Wunsch ist noch nicht sichtbar</span>
                <LikeCount count={song.vote_count} />
              </li>
            ))}
          </ul>

          {showPurchase ? (
            <div className="mt-6 rounded-3xl border border-neon-gold/40 bg-neon-gold/10 p-6 text-center">
              <p className="font-display text-2xl font-bold text-neon-gold">
                {hiddenCount === 1
                  ? '1 weiterer Wunsch wartet auf euch'
                  : `${hiddenCount} weitere Wünsche warten auf euch`}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                Wie viele Herzen jedes Lied bekommen hat, seht ihr schon. Freigeschaltet seht ihr auch,
                welches Lied dahintersteckt, sortiert nach Beliebtheit
              </p>
              <Button onClick={startCheckout} disabled={buying} className="mt-5 w-full sm:w-auto">
                {buying
                  ? 'Einen Moment…'
                  : `Alle ${total} Wünsche sehen, einmalig ${COUPLE_PRICE}`}
              </Button>
              <p className="mt-3 text-xs text-fg-muted">Kein Abo, kein Vertrag</p>
            </div>
          ) : (
            <p className="mt-5 text-sm leading-relaxed text-fg-muted">
              Eure Liste wächst noch. Schickt den Link an ein paar Gäste mehr, dann füllt sie sich von allein
            </p>
          )}
        </>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-rave-gradient">
      <main className="mx-auto w-full max-w-[720px] px-4 pt-10 pb-16">
        {justPaid && (
          <p className="mb-6 rounded-2xl border border-neon-gold/40 bg-neon-gold/10 px-5 py-3 text-sm text-fg">
            Eure Zahlung ist angekommen. Ihr seht ab jetzt alle Wünsche
          </p>
        )}
        {notice && (
          <p className="mb-6 rounded-2xl border border-danger/40 bg-danger-bg px-5 py-3 text-sm text-danger">
            {notice}
          </p>
        )}

        {/* 1) Kopf */}
        <header className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="font-display text-4xl font-black uppercase tracking-wide text-fg break-words sm:text-5xl">
              {event.title}
            </h1>
            {dateLine && <p className="mt-2 text-fg-muted">{dateLine}</p>}
          </div>
          <a
            href="#eure-angaben"
            aria-label="Eure Angaben ändern"
            title="Eure Angaben ändern"
            className="mt-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line text-fg-muted transition-colors hover:border-neon-gold hover:text-neon-gold"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </a>
        </header>

        {/* 2) Status als schlichter Satz */}
        <p className="mt-6 text-lg leading-relaxed text-fg">{statusLine(total, unlocked)}</p>

        {/* 3) bis 5) Reihenfolge hängt davon ab, ob schon Wünsche da sind */}
        {listIsEmpty ? (
          <>
            {shareBlock}
            {listBlock}
          </>
        ) : (
          <>
            {listBlock}
            {shareBlock}
          </>
        )}

        {/* 6) Der DJ */}
        <section className="mt-14">
          <p className="leading-relaxed text-fg-muted">
            Euer DJ entscheidet weiterhin, was wann läuft. Ihr gebt ihm nur die Liste, auf der steht,
            was eure Gäste wirklich hören wollen
          </p>
          {unlocked && djLink && (
            <div className="mt-4 rounded-3xl border border-line bg-panel p-5">
              <h2 className="font-display text-lg font-bold text-fg">Der Link für euren DJ</h2>
              <p className="mt-2 text-sm text-fg-muted">
                Diese Nachricht könnt ihr eurem DJ so weitergeben
              </p>
              <p className="mt-3 break-words rounded-2xl border border-line bg-panel-elevated p-4 text-sm leading-relaxed text-fg">
                {djMessage}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => copy(djMessage, 'dj-message')}>
                  {copied === 'dj-message' ? 'Kopiert' : 'Nachricht kopieren'}
                </Button>
                <Button variant="ghost" onClick={() => copy(djLink, 'dj-link')}>
                  {copied === 'dj-link' ? 'Kopiert' : 'Nur den Link kopieren'}
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Eure Angaben, Ziel des Stiftsymbols oben */}
        <section id="eure-angaben" className="mt-14 scroll-mt-6">
          <h2 className="font-display text-lg font-bold text-fg">Eure Angaben</h2>
          <form onSubmit={saveDetails} className="mt-4 space-y-3">
            <div>
              <label htmlFor="feier-name" className="mb-1 block px-1 text-xs text-fg-muted">
                Name eurer Feier
              </label>
              <Input
                id="feier-name"
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                maxLength={120}
              />
            </div>
            <div>
              <label htmlFor="feier-datum" className="mb-1 block px-1 text-xs text-fg-muted">
                Tag eurer Feier
              </label>
              <Input
                id="feier-datum"
                type="date"
                value={dateDraft}
                onChange={(e) => setDateDraft(e.target.value)}
                className="block box-border min-w-0 max-w-full"
              />
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" variant="secondary" disabled={saving}>
                {saving ? 'Wird gespeichert…' : 'Speichern'}
              </Button>
              {savedAt && <span className="text-sm text-neon-gold">Gespeichert</span>}
            </div>
          </form>
        </section>
      </main>

      {/* 7) Fußzeile */}
      <footer className="border-t border-line bg-base py-10 text-fg-muted">
        <div className="mx-auto flex w-full max-w-[720px] flex-col items-center justify-between gap-4 px-4 sm:flex-row">
          <span className="font-display text-lg font-bold text-fg">BeatControl</span>
          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs">
            <Link href="/impressum" className="transition-colors hover:text-turquoise">Impressum</Link>
            <Link href="/datenschutz" className="transition-colors hover:text-turquoise">Datenschutz</Link>
            <Link href="/agb" className="transition-colors hover:text-turquoise">AGB</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
