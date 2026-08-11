import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isUnlocked, pickForeignForGuest, redactHiddenSongs, selectionHash } from './visibility';
import type { UserPlanShape } from './plans';

describe('isUnlocked', () => {
  it('is unlocked when unlocked_at is set, regardless of plan', () => {
    expect(isUnlocked(null, false, new Date())).toBe(true);
    expect(isUnlocked({ plan: 'free' }, false, '2026-01-01T00:00:00.000Z')).toBe(true);
  });

  it('is unlocked when credit_redeemed is true', () => {
    expect(isUnlocked(null, true, null)).toBe(true);
  });

  it('is unlocked when the effective plan is not free', () => {
    expect(isUnlocked('pro', false, null)).toBe(true);
  });

  it('is locked otherwise', () => {
    expect(isUnlocked(null, false, null)).toBe(false);
    expect(isUnlocked({ plan: 'free' }, false, null)).toBe(false);
  });
});

describe('isUnlocked mit realen UserPlanShape-Objekten', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ein aktiver pro-Tarif schaltet frei, ganz ohne unlocked_at oder Guthaben', () => {
    const pro: UserPlanShape = { plan: 'pro', plan_status: 'active' };
    expect(isUnlocked(pro, false, null)).toBe(true);
  });

  it('ein abgelaufener event_pass bleibt gesperrt', () => {
    const now = new Date('2026-03-01T12:00:00.000Z');
    vi.setSystemTime(now);
    const abgelaufen: UserPlanShape = {
      plan: 'event_pass',
      current_period_end: new Date(now.getTime() - 1000).toISOString(),
    };
    expect(isUnlocked(abgelaufen, false, null)).toBe(false);
    // aber unlocked_at oder Guthaben setzen sich trotzdem durch
    expect(isUnlocked(abgelaufen, true, null)).toBe(true);
    expect(isUnlocked(abgelaufen, false, now)).toBe(true);
  });

  it('pro bleibt genau an der 3-Tage-Kulanzgrenze noch freigeschaltet (Grenze inklusiv)', () => {
    const now = new Date('2026-03-01T12:00:00.000Z');
    vi.setSystemTime(now);
    const grace = 3 * 24 * 60 * 60 * 1000;
    // end + grace === now  =>  Bedingung "< now" ist falsch, also noch nicht abgelaufen
    const genauAnDerGrenze: UserPlanShape = {
      plan: 'pro',
      plan_status: 'past_due',
      current_period_end: new Date(now.getTime() - grace).toISOString(),
    };
    expect(isUnlocked(genauAnDerGrenze, false, null)).toBe(true);
  });

  it('pro fällt 1ms nach der 3-Tage-Kulanzgrenze auf free zurück', () => {
    const now = new Date('2026-03-01T12:00:00.000Z');
    vi.setSystemTime(now);
    const grace = 3 * 24 * 60 * 60 * 1000;
    const knappDrueber: UserPlanShape = {
      plan: 'pro',
      plan_status: 'past_due',
      current_period_end: new Date(now.getTime() - grace - 1).toISOString(),
    };
    expect(isUnlocked(knappDrueber, false, null)).toBe(false);
  });
});

describe('pickForeignForGuest (guest song selection)', () => {
  const songs = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

  it('returns the same selection for the same fingerprint on repeat calls', () => {
    const a = pickForeignForGuest(songs, 'guest-fp-1', 2).map((s) => s.id);
    const b = pickForeignForGuest(songs, 'guest-fp-1', 2).map((s) => s.id);
    expect(a).toEqual(b);
  });

  it('returns the requested count', () => {
    const picked = pickForeignForGuest(songs, 'guest-fp-1', 2);
    expect(picked).toHaveLength(2);
  });

  it('gives different fingerprints different selections given enough songs', () => {
    const a = pickForeignForGuest(songs, 'guest-fp-1', 2).map((s) => s.id);
    const b = pickForeignForGuest(songs, 'guest-fp-2', 2).map((s) => s.id);
    expect(a).not.toEqual(b);
  });

  it('never uses Math.random (deterministic across processes via stable hash)', () => {
    const hashesA = songs.map((s) => selectionHash('guest-fp-1', s.id));
    const hashesB = songs.map((s) => selectionHash('guest-fp-1', s.id));
    expect(hashesA).toEqual(hashesB);
  });

  it('picks fewer than requested when there are not enough foreign songs', () => {
    const few = songs.slice(0, 1);
    const picked = pickForeignForGuest(few, 'guest-fp-1', 2);
    expect(picked).toHaveLength(1);
  });

  it('returns nothing for an empty list', () => {
    expect(pickForeignForGuest([], 'guest-fp-1', 2)).toEqual([]);
  });
});

describe('redactHiddenSongs', () => {
  const songs = [
    {
      id: 1,
      title: 'Titel A',
      artist: 'Artist A',
      deezer_id: 'd1',
      album_art_url: 'http://x/1.jpg',
      suggestions: '["x"]',
      vote_count: 5,
      has_voted: true,
    },
    {
      id: 2,
      title: 'Titel B',
      artist: 'Artist B',
      deezer_id: 'd2',
      album_art_url: 'http://x/2.jpg',
      suggestions: '["y"]',
      vote_count: 9,
      has_voted: false,
    },
  ];

  it('never leaks title or artist for a hidden song', () => {
    const [visible, hidden] = redactHiddenSongs(songs, new Set([1]));
    expect(visible.hidden).toBe(false);
    expect(visible.title).toBe('Titel A');

    expect(hidden.hidden).toBe(true);
    expect(hidden.title).toBe('');
    expect(hidden.artist).toBe('');
    expect(hidden.deezer_id).toBeNull();
    expect(hidden.album_art_url).toBeNull();
    expect(hidden.suggestions).toBeNull();
    expect(hidden.has_voted).toBe(false);
  });

  it('keeps the vote count visible even when hidden (like counts are never blurred)', () => {
    const [, hidden] = redactHiddenSongs(songs, new Set([1]));
    expect(hidden.vote_count).toBe(9);
  });

  it('setzt has_voted bei null (realer BOOL_OR-Randfall) auf false, sobald der Song versteckt wird', () => {
    const songsMitNull = [{ ...songs[0], has_voted: null }];
    const [hidden] = redactHiddenSongs(songsMitNull, new Set());
    expect(hidden.hidden).toBe(true);
    expect(hidden.has_voted).toBe(false);
  });

  it('lässt has_voted bei null unangetastet, solange der Song sichtbar bleibt', () => {
    const songsMitNull = [{ ...songs[0], has_voted: null }];
    const [visible] = redactHiddenSongs(songsMitNull, new Set([1]));
    expect(visible.hidden).toBe(false);
    expect(visible.has_voted).toBeNull();
  });
});

describe('selectionHash', () => {
  it('is a 64-char hex sha256', () => {
    expect(selectionHash('fp', 1)).toMatch(/^[0-9a-f]{64}$/);
  });

  it('differs by song id for the same fingerprint', () => {
    expect(selectionHash('fp', 1)).not.toBe(selectionHash('fp', 2));
  });
});
