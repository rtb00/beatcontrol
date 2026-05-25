import { NextRequest } from 'next/server';
import { createHash } from 'crypto';

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}

function getRawFingerprint(req: NextRequest): string {
  const ip = getIp(req);
  const clientId = req.headers.get('x-client-id')?.trim() ?? '';
  return clientId ? `${ip}:${clientId}` : ip;
}

// SHA-256(ip:clientId + eventSlug + pepper). Event-scoped, so anti-spam
// works within an event but cross-event tracking is impossible. The pepper
// in BEATCONTROL_HASH_PEPPER must be set in production; the dev fallback only
// covers local testing.
export function getFingerprint(req: NextRequest, eventSlug: string): string {
  const raw = getRawFingerprint(req);
  const pepper = process.env.BEATCONTROL_HASH_PEPPER ?? 'dev-pepper-do-not-use-in-prod';
  return createHash('sha256').update(`${raw}|${eventSlug}|${pepper}`).digest('hex');
}
