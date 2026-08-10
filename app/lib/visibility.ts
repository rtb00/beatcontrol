import { createHash } from 'crypto';
import { getEffectivePlan, type Plan, type UserPlanShape } from './plans';

// Wie viele Songs insgesamt ein Gast bei einer nicht freigeschalteten Feier
// mindestens sieht (ein eigener plus zwei fremde).
export const FREE_VISIBLE_SONGS = 3;
// Wie viele fremde Wünsche darin höchstens stecken.
export const FREE_VISIBLE_FOREIGN_SONGS = 2;

/**
 * Eine Feier ist freigeschaltet, wenn unlocked_at gesetzt ist (Paar oder DJ
 * haben bezahlt), das Event per Guthaben eingelöst wurde, oder der effektive
 * Tarif des Besitzers nicht 'free' ist. Der Zustand gilt für Gästeseite,
 * Paar-Seite und DJ-Screen gleichzeitig. Diese Regel steht bewusst an genau
 * dieser einen Stelle, damit die drei Ansichten nie auseinanderlaufen.
 */
export function isUnlocked(
  plan: Plan | UserPlanShape | null | undefined,
  creditRedeemed: boolean,
  unlockedAt?: Date | string | null
): boolean {
  if (unlockedAt) return true;
  if (creditRedeemed === true) return true;
  if (!plan) return false;
  const effective = typeof plan === 'string' ? plan : getEffectivePlan(plan);
  return effective !== 'free';
}

/**
 * Stabiler Hash aus Gästekennung und Song-Id. Ersetzt Math.random(): derselbe
 * Gast bekommt bei jedem Aufruf denselben Hash pro Song, verschiedene Gäste
 * bekommen (praktisch immer) verschiedene Hashes, also verschiedene Auswahlen.
 */
export function selectionHash(fingerprint: string, songId: number): string {
  return createHash('sha256').update(`${fingerprint}:${songId}`).digest('hex');
}

/**
 * Wählt aus den fremden Songs die für diesen Gast sichtbaren aus: die Songs
 * mit dem kleinsten Hash gewinnen. Deterministisch, kein Zufall zur Laufzeit.
 */
export function pickForeignForGuest<T extends { id: number }>(
  foreign: T[],
  fingerprint: string,
  count: number
): T[] {
  return [...foreign]
    .sort((a, b) => {
      const ha = selectionHash(fingerprint, a.id);
      const hb = selectionHash(fingerprint, b.id);
      if (ha !== hb) return ha < hb ? -1 : 1;
      return a.id - b.id;
    })
    .slice(0, count);
}

export interface RedactableSong {
  id: number;
  title: string;
  artist: string;
  deezer_id: string | null;
  album_art_url: string | null;
  suggestions: string | null;
  vote_count: number;
  has_voted: boolean | null;
}

/**
 * Leert Titel, Interpret, Cover und Vorschläge serverseitig für alle Songs,
 * die nicht in visibleIds stehen. Die Like-Zahl bleibt erhalten (sie ist bei
 * allen Songs sichtbar), has_voted wird bei versteckten Songs immer false.
 */
export function redactHiddenSongs<T extends RedactableSong>(
  songs: T[],
  visibleIds: Set<number>
): (T & { hidden: boolean })[] {
  return songs.map((s) => {
    if (visibleIds.has(s.id)) return { ...s, hidden: false };
    return {
      ...s,
      title: '',
      artist: '',
      deezer_id: null,
      album_art_url: null,
      suggestions: null,
      has_voted: false,
      hidden: true,
    };
  });
}
