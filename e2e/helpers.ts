import type { Page, APIRequestContext, Browser } from '@playwright/test';

// Gemeinsame Bausteine für die E2E-Tests. Alle Testkonten tragen das Präfix
// e2e., damit sie in der Datenbank als Testmüll erkennbar bleiben.

export function testEmail(tag: string): string {
  return `e2e.${tag}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
}

export const TEST_PASSWORD = 'Test1234!e2e';

/** Registriert ein frisches Konto und wartet, bis der Zielbereich erreicht ist. */
export async function register(page: Page, email: string): Promise<void> {
  await page.goto('/auth/register');
  await page.fill('input[name=email]', email);
  await page.fill('input[name=password]', TEST_PASSWORD);
  await page.fill('input[name=confirm]', TEST_PASSWORD);
  for (const box of await page.locator('input[type=checkbox]').all()) await box.check();
  await page.click('button[type=submit]');
  await page.waitForURL((u) => /\/(dj|feier|pricing)/.test(u.toString()), { timeout: 30_000 });
}

export interface TestEvent {
  slug: string;
  title: string;
  dj_token?: string;
}

/** Legt ein Event über die API an und liefert slug samt DJ-Token. */
export async function createEvent(request: APIRequestContext, title = 'E2E Feier'): Promise<TestEvent> {
  const created = await (
    await request.post('/api/events', { data: { title, event_date: '2027-09-04' } })
  ).json();
  const info = await (await request.get(`/api/events/${created.slug}`)).json();
  return { slug: created.slug, title, dj_token: info.dj_token };
}

/**
 * Trägt Songs ein, verteilt auf mehrere frische Browser-Kontexte. Nötig, weil
 * ein Gast nur drei Wünsche eintragen darf: mehr Songs brauchen mehr Gäste.
 */
export async function seedSongs(browser: Browser, slug: string, guests: number): Promise<number> {
  let count = 0;
  for (let g = 0; g < guests; g++) {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    for (let i = 1; i <= 3; i++) {
      const res = await page.request.post(`/api/events/${slug}/songs`, {
        data: { title: `Wunsch ${g}-${i}`, artist: `Kuenstler ${g}${i}` },
      });
      if (res.ok()) count++;
    }
    await ctx.close();
  }
  return count;
}

export interface SongsResponse {
  songs: Array<{
    id: number;
    title: string;
    artist: string;
    vote_count: number | null;
    hidden: boolean;
    is_mine: boolean;
  }>;
  unlocked: boolean;
  total: number;
  hidden_count: number;
}

export async function fetchSongs(
  request: APIRequestContext,
  slug: string,
  view?: string,
  djToken?: string
): Promise<SongsResponse> {
  const params = new URLSearchParams();
  if (view) params.set('view', view);
  if (djToken) params.set('dj', djToken);
  const query = params.toString();
  const raw = await (await request.get(`/api/events/${slug}/songs${query ? `?${query}` : ''}`)).json();
  return Array.isArray(raw)
    ? { songs: raw, unlocked: false, total: raw.length, hidden_count: 0 }
    : raw;
}

/** Titel, die tatsächlich lesbar zurückkamen (versteckte sind serverseitig leer). */
export function readableTitles(res: SongsResponse): string[] {
  return res.songs.filter((s) => s.title && s.title.length > 0).map((s) => s.title);
}

/** Deaktiviert das Testevent wieder, damit die Datenbank nicht zuwächst. */
export async function cleanup(request: APIRequestContext, slug: string): Promise<void> {
  await request.patch(`/api/events/${slug}`, { data: { active: false } }).catch(() => {});
}
