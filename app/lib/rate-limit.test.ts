import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { isRateLimited } from './rate-limit';

// isRateLimited hält seinen Zustand in einer modulweiten Map. Jeder Test
// braucht deshalb einen eigenen, garantiert unbenutzten Schlüssel, sonst
// stören sich die Testfälle gegenseitig.
function eindeutigerSchluessel(prefix: string): string {
  return `${prefix}:${Math.random().toString(36).slice(2)}`;
}

describe('isRateLimited', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('lässt bis zur Grenze alle Aufrufe durch, blockiert erst den 61. Aufruf im selben Fenster', () => {
    const key = eindeutigerSchluessel('songs');
    const limit = 60;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i++) {
      expect(isRateLimited(key, limit, windowMs)).toBe(false);
    }
    // 61. Aufruf im selben Fenster: eine ganze Hochzeitsgesellschaft hinter
    // einem gemeinsamen NAT teilt sich diesen einen Zähler.
    expect(isRateLimited(key, limit, windowMs)).toBe(true);
  });

  it('gibt nach Ablauf des Zeitfensters wieder frei', () => {
    const key = eindeutigerSchluessel('songs');
    const limit = 60;
    const windowMs = 60_000;

    for (let i = 0; i < limit; i++) {
      isRateLimited(key, limit, windowMs);
    }
    expect(isRateLimited(key, limit, windowMs)).toBe(true);

    vi.advanceTimersByTime(windowMs + 1);

    expect(isRateLimited(key, limit, windowMs)).toBe(false);
  });

  it('führt getrennte Zähler für verschiedene Schlüssel (z.B. verschiedene Slugs/IPs)', () => {
    const keyA = eindeutigerSchluessel('songs:event-a');
    const keyB = eindeutigerSchluessel('songs:event-b');
    const limit = 2;
    const windowMs = 60_000;

    expect(isRateLimited(keyA, limit, windowMs)).toBe(false);
    expect(isRateLimited(keyA, limit, windowMs)).toBe(false);
    expect(isRateLimited(keyA, limit, windowMs)).toBe(true);

    // keyB ist von keyA vollständig unbeeinflusst
    expect(isRateLimited(keyB, limit, windowMs)).toBe(false);
  });
});
