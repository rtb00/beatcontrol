import { getEffectivePlan, type Plan, type UserPlanShape } from './plans';

// Wie viele fremde Wünsche ein unbezahltes Event offen zeigt.
export const FREE_VISIBLE_SONGS = 3;

/**
 * Ein Event ist freigeschaltet, wenn der Besitzer einen bezahlten Tarif hat
 * oder das Event per Guthaben eingelöst wurde. Diese Regel steht bewusst an
 * genau einer Stelle, damit Gästeseite, Paar-Ansicht und API nie auseinanderlaufen.
 */
export function isUnlocked(
  plan: Plan | UserPlanShape | null | undefined,
  creditRedeemed: boolean
): boolean {
  if (creditRedeemed === true) return true;
  if (!plan) return false;
  const effective = typeof plan === 'string' ? plan : getEffectivePlan(plan);
  return effective !== 'free';
}
