import { createHash } from 'crypto';

// SHA-256(guestId + eventSlug + pepper). guestId kommt aus einem
// server-vergebenen httpOnly-Cookie (app/lib/guest-id.ts), nicht mehr aus
// einem client-gesetzten Header — der Browser kann diesen Wert weder lesen
// noch frei wählen. Event-scoped, so anti-spam works within an event but
// cross-event tracking is impossible. The pepper in BEATCONTROL_HASH_PEPPER
// must be set in production; the dev fallback only covers local testing.
export function getFingerprint(guestId: string, eventSlug: string): string {
  const pepper = process.env.BEATCONTROL_HASH_PEPPER ?? 'dev-pepper-do-not-use-in-prod';
  return createHash('sha256').update(`${guestId}|${eventSlug}|${pepper}`).digest('hex');
}
