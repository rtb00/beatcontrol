// Sehr einfache In-Memory-Ratenbegrenzung pro Prozess. Kein Ersatz für einen
// verteilten Store (bei mehreren Serverless-Instanzen zählt jede für sich),
// aber zusammen mit dem httpOnly-Gäste-Cookie macht sie automatisiertes
// Durchprobieren vieler Kennungen spürbar teurer statt kostenlos. Einträge
// verfallen von selbst, damit die Map nicht unbegrenzt wächst.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function isRateLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count += 1;
  if (entry.count > limit) return true;
  return false;
}
