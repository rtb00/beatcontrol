import { describe, it, expect, beforeEach } from 'vitest';
import { getFingerprint } from './fingerprint';

describe('getFingerprint', () => {
  beforeEach(() => {
    process.env.BEATCONTROL_HASH_PEPPER = 'test-pepper-fixed';
  });

  it('produces a deterministic SHA-256 hash (64 hex chars)', () => {
    const hash = getFingerprint('guest-abc', 'event-slug');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('returns the same hash for the same inputs', () => {
    const a = getFingerprint('guest-abc', 'event-slug');
    const b = getFingerprint('guest-abc', 'event-slug');
    expect(a).toBe(b);
  });

  it('differs across events (event-scoped tracking impossible)', () => {
    const a = getFingerprint('guest-abc', 'event-one');
    const b = getFingerprint('guest-abc', 'event-two');
    expect(a).not.toBe(b);
  });

  it('differs across pepper changes (server-side secret rotation)', () => {
    process.env.BEATCONTROL_HASH_PEPPER = 'pepper-A';
    const a = getFingerprint('guest-abc', 'event-slug');
    process.env.BEATCONTROL_HASH_PEPPER = 'pepper-B';
    const b = getFingerprint('guest-abc', 'event-slug');
    expect(a).not.toBe(b);
  });

  it('differs across guest ids (separates different guests)', () => {
    const a = getFingerprint('guest-1', 'evt');
    const b = getFingerprint('guest-2', 'evt');
    expect(a).not.toBe(b);
  });

  it('is not reversible: hash output reveals nothing of the guest id', () => {
    const hash = getFingerprint('guest-abc', 'evt');
    expect(hash).not.toContain('guest-abc');
  });
});
