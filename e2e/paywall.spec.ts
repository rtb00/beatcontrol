import { test, expect } from '@playwright/test';
import { register, createEvent, seedSongs, fetchSongs, readableTitles, cleanup, testEmail } from './helpers';

// Die Bezahlschranke ist die wirtschaftlich wichtigste Regel im Produkt.
// Diese Tests greifen sie aus allen Richtungen an, statt nur den Normalfall
// zu bestätigen. Sie laufen nur im Desktop-Projekt, weil sie auf der API
// arbeiten und vom Ansichtsfenster unabhängig sind.
test.describe('Bezahlschranke', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  test.beforeEach(({}, testInfo) => {
    // Diese Prüfungen arbeiten auf der API und sind vom Ansichtsfenster
    // unabhängig; ein Projekt genügt und spart die Hälfte der Laufzeit.
    testInfo.skip(testInfo.project.name !== 'desktop', 'API-Ebene, ein Projekt genügt');
  });

  test('gesperrte Feier zeigt niemandem mehr als drei Titel', async ({ page, browser }) => {
    await register(page, testEmail('paywall'));
    const ev = await createEvent(page.request, 'Gesperrte Feier');
    const angelegt = await seedSongs(browser, ev.slug, 4);
    expect(angelegt).toBe(12);

    const alsBesitzer = await fetchSongs(page.request, ev.slug, 'owner');
    expect(alsBesitzer.unlocked).toBe(false);
    expect(alsBesitzer.total).toBe(12);
    expect(readableTitles(alsBesitzer)).toHaveLength(3);
    expect(alsBesitzer.hidden_count).toBe(9);

    // Versteckte Zeilen tragen keinen Titel, aber ihre Like-Zahl.
    const versteckt = alsBesitzer.songs.filter((s) => s.hidden);
    expect(versteckt.every((s) => s.title === '' && s.artist === '')).toBe(true);
    expect(versteckt.every((s) => typeof s.vote_count === 'number')).toBe(true);

    // Fremder ohne jede Berechtigung, der die Sichtweise einfach anhängt.
    const fremd = await browser.newContext();
    const fremdSeite = await fremd.newPage();
    for (const view of ['owner', 'dj']) {
      const res = await fetchSongs(fremdSeite.request, ev.slug, view);
      expect(readableTitles(res).length, `view=${view} darf nichts zusätzlich zeigen`).toBeLessThanOrEqual(3);
    }
    // Auch mit erfundenem DJ-Token nicht.
    const mitFalschemToken = await fetchSongs(fremdSeite.request, ev.slug, 'dj', 'falsches-token');
    expect(readableTitles(mitFalschemToken).length).toBeLessThanOrEqual(3);
    await fremd.close();

    await cleanup(page.request, ev.slug);
  });

  test('Neuladen zeigt demselben Gast immer dieselbe Auswahl', async ({ page, browser }) => {
    await register(page, testEmail('stabil'));
    const ev = await createEvent(page.request, 'Stabile Auswahl');
    await seedSongs(browser, ev.slug, 4);

    const gast = await browser.newContext();
    const gastSeite = await gast.newPage();
    const auswahlen = new Set<string>();
    for (let i = 0; i < 5; i++) {
      const res = await fetchSongs(gastSeite.request, ev.slug, 'guest');
      auswahlen.add(readableTitles(res).sort().join('|'));
    }
    expect(auswahlen.size, 'Neuladen darf keine neuen Titel freilegen').toBe(1);
    await gast.close();

    await cleanup(page.request, ev.slug);
  });

  test('verschiedene Gäste sehen verschiedene Songs, damit Likes sich verteilen', async ({ page, browser }) => {
    await register(page, testEmail('verteilung'));
    const ev = await createEvent(page.request, 'Verteilung');
    await seedSongs(browser, ev.slug, 4);

    const auswahlen = new Set<string>();
    for (let i = 0; i < 8; i++) {
      const ctx = await browser.newContext();
      const seite = await ctx.newPage();
      const res = await fetchSongs(seite.request, ev.slug, 'guest');
      auswahlen.add(readableTitles(res).sort().join('|'));
      await ctx.close();
    }
    expect(auswahlen.size, 'sonst sammeln nur wenige Songs alle Likes').toBeGreaterThan(2);

    await cleanup(page.request, ev.slug);
  });

  test('unter vier Wünschen ist alles offen, ab dem vierten wird verdeckt', async ({ page, browser }) => {
    await register(page, testEmail('schwelle'));
    const ev = await createEvent(page.request, 'Schwelle');

    const ctx = await browser.newContext();
    const gast = await ctx.newPage();
    for (let i = 1; i <= 3; i++) {
      await gast.request.post(`/api/events/${ev.slug}/songs`, { data: { title: `Frueh ${i}`, artist: 'A' } });
    }
    let res = await fetchSongs(page.request, ev.slug, 'owner');
    expect(res.total).toBe(3);
    expect(res.hidden_count, 'bei drei Wünschen bleibt alles sichtbar').toBe(0);

    const ctx2 = await browser.newContext();
    const gast2 = await ctx2.newPage();
    await gast2.request.post(`/api/events/${ev.slug}/songs`, { data: { title: 'Der vierte', artist: 'B' } });
    res = await fetchSongs(page.request, ev.slug, 'owner');
    expect(res.total).toBe(4);
    expect(res.hidden_count, 'ab dem vierten Wunsch beginnt die Schranke').toBe(1);

    await ctx.close();
    await ctx2.close();
    await cleanup(page.request, ev.slug);
  });

  test('CSV-Export verrät bei gesperrter Feier keine Titel', async ({ page, browser }) => {
    await register(page, testEmail('export'));
    const ev = await createEvent(page.request, 'Export');
    await seedSongs(browser, ev.slug, 4);

    const res = await page.request.get(`/api/events/${ev.slug}/export`);
    // Der Export ist ein bezahltes Merkmal: 402 ist die erwartete Antwort für
    // den kostenlosen Tarif. Ein Serverfehler wäre dagegen ein Defekt.
    expect([200, 402]).toContain(res.status());
    if (res.status() === 200) {
      expect(await res.text()).not.toContain('Wunsch ');
    }

    await cleanup(page.request, ev.slug);
  });

  test('Statistik liefert Zahlen, aber keine Titel', async ({ page, browser }) => {
    await register(page, testEmail('stats'));
    const ev = await createEvent(page.request, 'Statistik');
    await seedSongs(browser, ev.slug, 4);

    const stats = await (await page.request.get(`/api/events/${ev.slug}/stats`)).json();
    expect(stats.total).toBe(12);
    expect(stats.unlocked).toBe(false);
    expect(JSON.stringify(stats)).not.toContain('Wunsch ');

    // Fremde dürfen die Statistik nicht abrufen.
    const fremd = await browser.newContext();
    const fremdSeite = await fremd.newPage();
    const verweigert = await fremdSeite.request.get(`/api/events/${ev.slug}/stats`);
    expect(verweigert.ok()).toBe(false);
    await fremd.close();

    await cleanup(page.request, ev.slug);
  });
});
