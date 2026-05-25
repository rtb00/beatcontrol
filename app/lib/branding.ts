// Reserved subdomains that cannot be claimed by Studio tenants.
// Anything that conflicts with marketing, auth, infra, or future internal services.
const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'app', 'admin', 'mail', 'webmail', 'smtp', 'imap', 'pop',
  'dj', 'guest', 'guests', 'static', 'assets', 'cdn', 'media',
  'help', 'support', 'blog', 'docs', 'status', 'about', 'press', 'careers',
  'pricing', 'auth', 'login', 'signin', 'signup', 'register', 'logout',
  'account', 'settings', 'profile', 'billing', 'checkout',
  'home', 'dashboard', 'console', 'studio', 'agency',
  'impressum', 'datenschutz', 'agb', 'privacy', 'terms', 'legal',
  'demo', 'test', 'staging', 'preview', 'dev', 'local',
]);

export type SubdomainValidation =
  | { ok: true; value: string }
  | { ok: false; reason: string };

export function validateSubdomain(input: string): SubdomainValidation {
  const value = input.trim().toLowerCase();

  if (value.length < 3) {
    return { ok: false, reason: 'Subdomain muss mindestens 3 Zeichen lang sein.' };
  }
  if (value.length > 30) {
    return { ok: false, reason: 'Subdomain darf maximal 30 Zeichen lang sein.' };
  }
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(value)) {
    return {
      ok: false,
      reason: 'Nur Kleinbuchstaben, Ziffern und Bindestriche. Start und Ende müssen Buchstabe/Ziffer sein.',
    };
  }
  if (value.includes('--')) {
    return { ok: false, reason: 'Doppelte Bindestriche sind nicht erlaubt.' };
  }
  if (RESERVED_SUBDOMAINS.has(value)) {
    return { ok: false, reason: 'Diese Subdomain ist reserviert. Bitte wähle eine andere.' };
  }

  return { ok: true, value };
}

export interface TenantBranding {
  userId: string;
  brandingName: string | null;
  brandingLogoUrl: string | null;
  subdomain: string | null;
}

// Hostnames that always render the default BeatControl brand, never a tenant.
const PLATFORM_HOSTS = new Set([
  'beatcontrol.io',
  'www.beatcontrol.io',
  'localhost',
]);

// Returns the tenant subdomain if the host is a tenant subdomain, otherwise null.
// Returns null for: localhost, vercel preview URLs, www, marketing apex domains.
export function extractSubdomain(host: string | null | undefined): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0].toLowerCase();

  if (PLATFORM_HOSTS.has(hostname)) return null;
  if (hostname.endsWith('.vercel.app')) return null;
  if (hostname === '127.0.0.1') return null;

  for (const platform of ['.beatcontrol.io']) {
    if (hostname.endsWith(platform)) {
      const sub = hostname.slice(0, -platform.length);
      // www subdomain is treated as the apex marketing site
      if (sub === 'www' || sub === '') return null;
      // Defense in depth: only allow valid subdomain shape
      if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(sub)) return null;
      return sub;
    }
  }

  // Custom domains will be resolved against a separate table in Phase 4.
  return null;
}
