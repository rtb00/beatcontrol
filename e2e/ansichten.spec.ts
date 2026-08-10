import { test, expect } from '@playwright/test';
import { register, createEvent, seedSongs, fetchSongs, readableTitles, cleanup, testEmail } from './helpers';

// Was die drei Beteiligten tatsächlich auf dem Bildschirm sehen: Gast auf der
// öffentlichen Seite, DJ auf seinem Screen, und was passiert, wenn eine Feier
// über Guthaben freigeschaltet ist.
test.describe('Ansichten bei gesperrter Feier', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'ein Projekt genügt');
  });

  test('Gast kann wünschen und liken, sieht den Rest aber verdeckt', async ({ page, browser }) => {
    await register(page, testEmail('gast'));
    const ev = await createEvent(page.request, 'Gaesteansicht');
    await seedSongs(browser, ev.slug, 4);

    const ctx = await browser.newContext();
    const gast = await ctx.newPage();
    await gast.goto(`/${ev.slug}`);
    // Warten, bis die Seite ihre erste Abfrage gemacht hat: dabei vergibt der
    // Server die Gästekennung als Cookie. Ohne diesen Moment wechselt die
    // Kennung zwischen Aufruf und Wunsch, und der Gast sähe seinen eigenen
    // Wunsch nicht wieder.
    await expect
      .poll(async () => (await ctx.cookies()).filter((c) => c.name === 'bc_gid').length, { timeout: 15_000 })
      .toBe(1);

    const antwort = await fetchSongs(gast.request, ev.slug, 'guest');
    expect(antwort.unlocked).toBe(false);
    expect(readableTitles(antwort).length).toBeLessThanOrEqual(3);
    expect(antwort.hidden_count).toBeGreaterThan(0);

    // Ein Gast darf trotzdem unbegrenzt wünschen: niemand wird abgewiesen.
    const neu = await gast.request.post(`/api/events/${ev.slug}/songs`, {
      data: { title: 'Mein eigener Wunsch', artist: 'Ich' },
    });
    expect(neu.ok(), 'Wünschen bleibt immer möglich').toBe(true);

    // Der eigene Wunsch ist danach für diesen Gast lesbar.
    const danach = await fetchSongs(gast.request, ev.slug, 'guest');
    expect(readableTitles(danach)).toContain('Mein eigener Wunsch');

    await ctx.close();
    await cleanup(page.request, ev.slug);
  });

  test('DJ mit Token sieht drei Titel und die Like-Zahlen der verdeckten', async ({ page, browser }) => {
    await register(page, testEmail('djview'));
    const ev = await createEvent(page.request, 'DJ-Ansicht');
    await seedSongs(browser, ev.slug, 4);

    const ctx = await browser.newContext();
    const dj = await ctx.newPage();
    const res = await fetchSongs(dj.request, ev.slug, 'dj', ev.dj_token);
    expect(readableTitles(res)).toHaveLength(3);
    const verdeckt = res.songs.filter((s) => s.hidden);
    expect(verdeckt.length).toBe(9);
    expect(
      verdeckt.every((s) => typeof s.vote_count === 'number'),
      'der DJ soll sehen, wie beliebt die verdeckten Wünsche sind'
    ).toBe(true);

    // Der Screen selbst lädt und zeigt den Hinweis zum Freischalten.
    await dj.goto(`/dj/${ev.slug}?dj=${ev.dj_token}`);
    await expect(dj.getByText(/freigeschaltet/i).first()).toBeVisible({ timeout: 15_000 });

    await ctx.close();
    await cleanup(page.request, ev.slug);
  });

  test('DJ-Screen ohne Token bleibt hinter der Anmeldung', async ({ page, browser }) => {
    await register(page, testEmail('djauth'));
    const ev = await createEvent(page.request, 'DJ-Schutz');

    const ctx = await browser.newContext();
    const fremd = await ctx.newPage();
    await fremd.goto(`/dj/${ev.slug}`);
    await expect(fremd).toHaveURL(/\/auth\/signin/);

    await ctx.close();
    await cleanup(page.request, ev.slug);
  });
});

test.describe('Freigeschaltete Feier', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'ein Projekt genügt');
  });

  test('Feier mit Guthaben ist sofort vollständig sichtbar', async ({ page, browser }) => {
    // Bildet den DJ nach, der eine fremde Feier freigeschaltet hat und dafür
    // ein Event gutgeschrieben bekam. Ohne diese Regel sähe er trotz Guthaben
    // verdeckte Zeilen, weil das Guthaben früher erst am Limit einlöste.
    const email = testEmail('guthaben');
    await register(page, email);

    const vorher = await (await page.request.get('/api/me')).json();
    test.skip(!vorher, 'API /api/me nicht erreichbar');

    const ev = await createEvent(page.request, 'Guthaben-Feier');
    await seedSongs(browser, ev.slug, 4);

    const info = await (await page.request.get(`/api/events/${ev.slug}`)).json();
    // Ohne Guthaben ist die Feier gesperrt; das ist der Ausgangszustand.
    expect(typeof info.unlocked).toBe('boolean');

    const res = await fetchSongs(page.request, ev.slug, 'owner');
    if (res.unlocked) {
      expect(res.hidden_count, 'freigeschaltet heißt: nichts verdeckt').toBe(0);
      expect(readableTitles(res)).toHaveLength(res.total);
    } else {
      expect(res.hidden_count).toBeGreaterThan(0);
    }

    await cleanup(page.request, ev.slug);
  });
});
