import { describe, it, expect, beforeEach } from 'vitest';
import { getFingerprint } from './fingerprint';

function makeReq(headers: Record<string, string>) {
  // Minimal mock that mimics NextRequest's headers.get behaviour.
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as unknown as Parameters<typeof getFingerprint>[0];
}

describe('getFingerprint', () => {
  beforeEach(() => {
    process.env.BEATCONTROL_HASH_PEPPER = 'test-pepper-fixed';
  });

  it('produces a deterministic SHA-256 hash (64 hex chars)', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    const hash = getFingerprint(req, 'event-slug');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same hash for the same inputs', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    const a = getFingerprint(req, 'event-slug');
    const b = getFingerprint(req, 'event-slug');
    expect(a).toBe(b);
  });

  it('differs across events (event-scoped tracking impossible)', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    const a = getFingerprint(req, 'event-one');
    const b = getFingerprint(req, 'event-two');
    expect(a).not.toBe(b);
  });

  it('differs across pepper changes (server-side secret rotation)', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    process.env.BEATCONTROL_HASH_PEPPER = 'pepper-A';
    const a = getFingerprint(req, 'event-slug');
    process.env.BEATCONTROL_HASH_PEPPER = 'pepper-B';
    const b = getFingerprint(req, 'event-slug');
    expect(a).not.toBe(b);
  });

  it('differs across IPs', () => {
    const req1 = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    const req2 = makeReq({ 'x-forwarded-for': '5.6.7.8', 'x-client-id': 'abc' });
    expect(getFingerprint(req1, 'evt')).not.toBe(getFingerprint(req2, 'evt'));
  });

  it('differs across client IDs (separates users behind same NAT)', () => {
    const req1 = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'user-1' });
    const req2 = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'user-2' });
    expect(getFingerprint(req1, 'evt')).not.toBe(getFingerprint(req2, 'evt'));
  });

  it('handles missing x-forwarded-for (falls back to x-real-ip)', () => {
    const req = makeReq({ 'x-real-ip': '9.9.9.9', 'x-client-id': 'abc' });
    expect(getFingerprint(req, 'evt')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('handles missing IP headers entirely (uses "unknown")', () => {
    const req = makeReq({ 'x-client-id': 'abc' });
    expect(getFingerprint(req, 'evt')).toMatch(/^[0-9a-f]{64}$/);
  });

  it('uses first IP in x-forwarded-for chain', () => {
    const reqChain = makeReq({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' });
    const reqSingle = makeReq({ 'x-forwarded-for': '1.1.1.1' });
    expect(getFingerprint(reqChain, 'evt')).toBe(getFingerprint(reqSingle, 'evt'));
  });

  it('is not reversible: hash output reveals nothing of the IP', () => {
    const req = makeReq({ 'x-forwarded-for': '1.2.3.4', 'x-client-id': 'abc' });
    const hash = getFingerprint(req, 'evt');
    expect(hash).not.toContain('1.2.3.4');
    expect(hash).not.toContain('abc');
  });
});
