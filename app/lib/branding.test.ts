import { describe, it, expect } from 'vitest';
import { validateSubdomain, extractSubdomain } from './branding';

describe('validateSubdomain', () => {
  it('akzeptiert gültige Subdomains', () => {
    expect(validateSubdomain('mikehoffmann')).toEqual({ ok: true, value: 'mikehoffmann' });
    expect(validateSubdomain('dj-bar')).toEqual({ ok: true, value: 'dj-bar' });
    expect(validateSubdomain('studio42')).toEqual({ ok: true, value: 'studio42' });
  });

  it('normalisiert auf lowercase', () => {
    expect(validateSubdomain('MikeHoffmann')).toEqual({ ok: true, value: 'mikehoffmann' });
    expect(validateSubdomain('  ANNIKA  ')).toEqual({ ok: true, value: 'annika' });
  });

  it('lehnt zu kurze Subdomains ab', () => {
    expect(validateSubdomain('ab').ok).toBe(false);
    expect(validateSubdomain('').ok).toBe(false);
  });

  it('lehnt zu lange Subdomains ab', () => {
    const tooLong = 'a'.repeat(31);
    expect(validateSubdomain(tooLong).ok).toBe(false);
  });

  it('lehnt ungültige Zeichen ab', () => {
    expect(validateSubdomain('mike_hoffmann').ok).toBe(false); // underscore
    expect(validateSubdomain('mike.hoffmann').ok).toBe(false); // dot
    expect(validateSubdomain('mike hoffmann').ok).toBe(false); // space
    expect(validateSubdomain('müller').ok).toBe(false);        // umlaut
    expect(validateSubdomain('mike!').ok).toBe(false);          // exclamation
  });

  it('lehnt Start/Ende mit Bindestrich ab', () => {
    expect(validateSubdomain('-mike').ok).toBe(false);
    expect(validateSubdomain('mike-').ok).toBe(false);
  });

  it('lehnt doppelte Bindestriche ab', () => {
    expect(validateSubdomain('mike--hoffmann').ok).toBe(false);
  });

  it('lehnt reservierte Subdomains ab', () => {
    const reserved = ['www', 'api', 'app', 'admin', 'mail', 'dj', 'auth', 'login', 'pricing', 'studio'];
    for (const r of reserved) {
      expect(validateSubdomain(r).ok).toBe(false);
    }
  });
});

describe('extractSubdomain', () => {
  it('returns null for null/undefined/empty', () => {
    expect(extractSubdomain(null)).toBeNull();
    expect(extractSubdomain(undefined)).toBeNull();
    expect(extractSubdomain('')).toBeNull();
  });

  it('returns null for platform hosts', () => {
    expect(extractSubdomain('beatcontrol.io')).toBeNull();
    expect(extractSubdomain('www.beatcontrol.io')).toBeNull();
    expect(extractSubdomain('beatcontrol.io')).toBeNull();
    expect(extractSubdomain('www.beatcontrol.io')).toBeNull();
    expect(extractSubdomain('localhost')).toBeNull();
    expect(extractSubdomain('127.0.0.1')).toBeNull();
  });

  it('returns null for vercel preview URLs', () => {
    expect(extractSubdomain('beatcontrol-foobar-rtb00.vercel.app')).toBeNull();
    expect(extractSubdomain('my-preview-1234.vercel.app')).toBeNull();
  });

  it('extracts subdomain from beatcontrol.io', () => {
    expect(extractSubdomain('mikehoffmann.beatcontrol.io')).toBe('mikehoffmann');
    expect(extractSubdomain('annika.beatcontrol.io')).toBe('annika');
    expect(extractSubdomain('dj-mike.beatcontrol.io')).toBe('dj-mike');
  });

  it('extracts subdomain from beatcontrol.io', () => {
    expect(extractSubdomain('demo.beatcontrol.io')).toBe('demo');
  });

  it('handles port suffixes', () => {
    expect(extractSubdomain('mike.beatcontrol.io:3000')).toBe('mike');
    expect(extractSubdomain('localhost:3000')).toBeNull();
  });

  it('lowercases hostnames', () => {
    expect(extractSubdomain('MIKEHOFFMANN.beatcontrol.io')).toBe('mikehoffmann');
  });

  it('rejects malformed subdomain shapes', () => {
    expect(extractSubdomain('-mike.beatcontrol.io')).toBeNull();
    expect(extractSubdomain('mike-.beatcontrol.io')).toBeNull();
  });
});
