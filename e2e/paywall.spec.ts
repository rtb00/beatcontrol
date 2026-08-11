import { test, expect } from '@playwright/test';
import {
  register,
  createEvent,
  seedSongs,
  fetchSongs,
  readableTitles,
  cleanup,
  testEmail,
  getMe,
  sendCheckoutCompleted,
  webhooksAvailable,
} from './helpers';

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

    // view=owner ohne Login muss exakt auf die persönliche Gästeauswahl
    // zurückfallen, nicht auf die "drei beliebtesten" Auswahl des echten
    // Besitzers. Sonst könnte jeder Fremde die personalisierte Bezahlschranke
    // umgehen, indem er einfach view=owner anhängt und die für den Besitzer
    // bestimmte Auswahl sieht.
    const alsFremderGast = await fetchSongs(fremdSeite.request, ev.slug, 'guest');
    const alsFremderOwner = await fetchSongs(fremdSeite.request, ev.slug, 'owner');
    expect(readableTitles(alsFremderOwner).sort()).toEqual(readableTitles(alsFremderGast).sort());

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

  test('Songlimit ist ersatzlos entfernt: viele Gäste dürfen unbegrenzt wünschen', async ({ page, browser }) => {
    await register(page, testEmail('kein-limit'));
    const ev = await createEvent(page.request, 'Viele Wuensche');

    // Sechs Gäste zu je drei Wünschen: mehr als das frühere 30er-Limit wäre
    // nach wenigen Gästen erreicht gewesen. Alle müssen durchgehen.
    const angelegt = await seedSongs(browser, ev.slug, 6);
    expect(angelegt, 'kein Gesamt-Songlimit mehr, jeder Wunsch geht durch').toBe(18);

    const res = await fetchSongs(page.request, ev.slug, 'owner');
    expect(res.total).toBe(18);

    await cleanup(page.request, ev.slug);
  });

  test('Spam-Schutz bleibt bei drei offenen Wünschen je Gast, "gespielt" gibt einen Slot frei', async ({
    page,
    browser,
  }) => {
    await register(page, testEmail('spam'));
    const ev = await createEvent(page.request, 'Spam-Schutz');

    const ctx = await browser.newContext();
    const gast = await ctx.newPage();
    const songIds: number[] = [];
    for (let i = 1; i <= 3; i++) {
      const res = await gast.request.post(`/api/events/${ev.slug}/songs`, {
        data: { title: `Spam ${i}`, artist: 'A' },
      });
      expect(res.status()).toBe(201);
      songIds.push((await res.json()).songId);
    }

    // Der vierte offene Wunsch desselben Gastes wird abgewiesen.
    const vierter = await gast.request.post(`/api/events/${ev.slug}/songs`, {
      data: { title: 'Spam 4', artist: 'A' },
    });
    expect(vierter.status()).toBe(429);

    // Sobald einer der drei als gespielt markiert ist, wird der Slot wieder frei.
    await page.request.post(`/api/events/${ev.slug}/songs/toggle-played`, {
      data: { songId: songIds[0] },
    });
    const nachAbspielen = await gast.request.post(`/api/events/${ev.slug}/songs`, {
      data: { title: 'Spam 5', artist: 'A' },
    });
    expect(nachAbspielen.status(), '"gespielt" gibt einen Wunsch-Slot frei').toBe(201);

    await ctx.close();
    await cleanup(page.request, ev.slug);
  });

  test('Guthaben löst sofort ein, auch beim allerersten Event', async ({ page }) => {
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('sofort-guthaben'));
    const me = await getMe(page.request);
    expect(me.eventCredits).toBe(0);

    const webhook = await sendCheckoutCompleted(page.request, me.id, { tier: 'credit_pack_5' });
    expect(webhook.ok, `Webhook-Antwort: ${webhook.status}`).toBe(true);

    await expect
      .poll(async () => (await getMe(page.request)).eventCredits, { timeout: 15_000 })
      .toBe(5);

    // Das allererste Event löst das Guthaben ein, obwohl das Free-Limit (1)
    // noch gar nicht erreicht war. Ohne den Fix bliebe die Feier trotz
    // Guthaben verschwommen, bis ein zweites Event angelegt wird.
    const created = await (
      await page.request.post('/api/events', { data: { title: 'Erstes Event', event_date: '2027-09-04' } })
    ).json();
    expect(created.credit_redeemed, 'Guthaben löst schon am ersten Event ein').toBe(true);

    await cleanup(page.request, created.slug);
  });

  test('paralleles Anlegen mit genau einem verbleibenden Guthaben: nie negativ, genau ein Gewinner', async ({
    page,
  }) => {
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('rennen'));
    const me = await getMe(page.request);

    await sendCheckoutCompleted(page.request, me.id, { tier: 'credit_pack_5' });
    await expect.poll(async () => (await getMe(page.request)).eventCredits, { timeout: 15_000 }).toBe(5);

    // Vier Events nacheinander anlegen verbraucht vier der fünf Guthaben
    // (jedes Event löst sofort ein, solange Guthaben da ist), ein Guthaben
    // bleibt übrig.
    const angelegteSlugs: string[] = [];
    for (let i = 0; i < 4; i++) {
      const res = await page.request.post('/api/events', {
        data: { title: `Vorab ${i}`, event_date: '2027-09-04' },
      });
      const data = await res.json();
      angelegteSlugs.push(data.slug);
    }
    expect((await getMe(page.request)).eventCredits).toBe(1);

    // Zwei gleichzeitige Anfragen um das letzte Guthaben.
    const [a, b] = await Promise.all([
      page.request.post('/api/events', { data: { title: 'Rennen A', event_date: '2027-09-04' } }),
      page.request.post('/api/events', { data: { title: 'Rennen B', event_date: '2027-09-04' } }),
    ]);
    const statuses = [a.status(), b.status()].sort();
    expect(statuses, 'genau einer gewinnt das letzte Guthaben, der andere bekommt 402').toEqual([201, 402]);

    const gewinner = a.status() === 201 ? a : b;
    const gewinnerDaten = await gewinner.json();
    expect(gewinnerDaten.credit_redeemed).toBe(true);
    angelegteSlugs.push(gewinnerDaten.slug);

    const nachher = await getMe(page.request);
    expect(nachher.eventCredits, 'Guthaben darf nie negativ werden').toBe(0);

    for (const slug of angelegteSlugs) await cleanup(page.request, slug);
  });

  test('ohne Guthaben ist beim zweiten aktiven Event Schluss: 402 mit korrektem Limit', async ({ page }) => {
    await register(page, testEmail('limit-402'));
    const erstes = await (
      await page.request.post('/api/events', { data: { title: 'Erstes', event_date: '2027-09-04' } })
    ).json();

    const zweites = await page.request.post('/api/events', {
      data: { title: 'Zweites', event_date: '2027-09-04' },
    });
    expect(zweites.status()).toBe(402);
    const fehler = await zweites.json();
    expect(fehler.error).toBe('plan_limit');
    expect(fehler.current).toBe(1);
    expect(fehler.max).toBe(1);

    await cleanup(page.request, erstes.slug);
  });

  test('signierter Webhook mit slug schaltet die Feier frei, ohne dass der DJ selbst bezahlt', async ({
    page,
    browser,
  }) => {
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('webhook-slug'));
    const me = await getMe(page.request);
    const ev = await createEvent(page.request, 'Webhook-Freischaltung');
    await seedSongs(browser, ev.slug, 4);

    const vorher = await fetchSongs(page.request, ev.slug, 'owner');
    expect(vorher.unlocked).toBe(false);

    const webhook = await sendCheckoutCompleted(page.request, me.id, { tier: 'couple_pass', slug: ev.slug });
    expect(webhook.ok).toBe(true);

    await expect
      .poll(async () => (await fetchSongs(page.request, ev.slug, 'owner')).unlocked, { timeout: 15_000 })
      .toBe(true);

    const alsDj = await fetchSongs(page.request, ev.slug, 'dj', ev.dj_token);
    expect(alsDj.unlocked, 'auch der DJ-Screen sieht die Freischaltung').toBe(true);
    expect(alsDj.hidden_count).toBe(0);

    await cleanup(page.request, ev.slug);
  });
});
