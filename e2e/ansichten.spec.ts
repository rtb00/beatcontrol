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
  sendSubscriptionActive,
  sendPaymentFailed,
  webhooksAvailable,
  TEST_PASSWORD,
} from './helpers';

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
    await expect(dj.getByText(/freischalten/i).first()).toBeVisible({ timeout: 15_000 });

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

  test('das DJ-Token verlässt den Server nur Richtung Besitzer, nicht an einen eingeloggten Fremden', async ({
    page,
    browser,
  }) => {
    await register(page, testEmail('token-inhaber'));
    const ev = await createEvent(page.request, 'Token-Schutz');

    const fremdKontext = await browser.newContext();
    const fremdSeite = await fremdKontext.newPage();
    await register(fremdSeite, testEmail('token-fremder'));

    const alsFremder = await (await fremdSeite.request.get(`/api/events/${ev.slug}`)).json();
    expect(alsFremder.dj_token, 'ein fremdes, eingeloggtes Konto bekommt kein Token').toBeUndefined();

    const alsBesitzer = await (await page.request.get(`/api/events/${ev.slug}`)).json();
    expect(alsBesitzer.dj_token, 'der Besitzer selbst bekommt sein Token').toBe(ev.dj_token);

    await fremdKontext.close();
    await cleanup(page.request, ev.slug);
  });

  test('ein zweiter Gast, der denselben Song wünscht, löst automatisch einen Like aus statt eines Fehlers', async ({
    page,
    browser,
  }) => {
    await register(page, testEmail('duplikat'));
    const ev = await createEvent(page.request, 'Doppelter Wunsch');

    const gast1 = await browser.newContext();
    const seite1 = await gast1.newPage();
    const erster = await seite1.request.post(`/api/events/${ev.slug}/songs`, {
      data: { title: 'Beliebter Song', artist: 'Star', deezerId: 'dz-e2e-42' },
    });
    expect(erster.status()).toBe(201);
    const songId = (await erster.json()).songId;

    const gast2 = await browser.newContext();
    const seite2 = await gast2.newPage();
    const zweiter = await seite2.request.post(`/api/events/${ev.slug}/songs`, {
      data: { title: 'Beliebter Song', artist: 'Star', deezerId: 'dz-e2e-42' },
    });
    expect(zweiter.status()).toBe(200);
    const zweiteAntwort = await zweiter.json();
    expect(zweiteAntwort.duplicate).toBe(true);
    expect(zweiteAntwort.songId).toBe(songId);

    // Beide Wünsche zählen als Like auf denselben Song, nicht als zwei Songs.
    const stand = await fetchSongs(page.request, ev.slug, 'owner');
    expect(stand.total).toBe(1);
    const song = stand.songs.find((s) => s.id === songId);
    expect(song?.vote_count).toBe(2);

    await gast1.close();
    await gast2.close();
    await cleanup(page.request, ev.slug);
  });

  test('erster Gast einer Feier ohne fremde Songs: alle drei eigenen Wünsche bleiben sichtbar', async ({
    page,
    browser,
  }) => {
    await register(page, testEmail('erster-gast'));
    const ev = await createEvent(page.request, 'Erster Gast');

    const ctx = await browser.newContext();
    const gast = await ctx.newPage();
    for (let i = 1; i <= 3; i++) {
      const res = await gast.request.post(`/api/events/${ev.slug}/songs`, {
        data: { title: `Nur ich ${i}`, artist: 'Solo' },
      });
      expect(res.status()).toBe(201);
    }

    // Derselbe Gast fragt seine eigene Gästesicht ab: keine fremden Songs
    // vorhanden, der Auffüll-Zweig darf trotzdem nichts verstecken.
    const alsGast = await fetchSongs(gast.request, ev.slug, 'guest');
    expect(alsGast.hidden_count, 'ohne fremde Songs bleibt beim ersten Gast alles offen').toBe(0);
    expect(readableTitles(alsGast)).toHaveLength(3);

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
    // ein Event gutgeschrieben bekam. Das Guthaben löste früher erst am
    // Event-Limit ein, sodass er trotz Geschenk verdeckte Zeilen sah.
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('guthaben'));
    const me = await getMe(page.request);

    // Ausgangslage ohne Guthaben: eine Feier mit vielen Wünschen ist gesperrt.
    const ohne = await createEvent(page.request, 'Ohne Guthaben');
    await seedSongs(browser, ohne.slug, 4);
    const gesperrt = await fetchSongs(page.request, ohne.slug, 'owner');
    expect(gesperrt.unlocked, 'ohne Guthaben bleibt die Feier gesperrt').toBe(false);
    expect(gesperrt.hidden_count).toBeGreaterThan(0);

    // Guthaben über den echten Webhook gutschreiben, nicht über eine Abkürzung.
    await sendCheckoutCompleted(page.request, me.id, { tier: 'credit_pack_5' });
    await expect
      .poll(async () => (await getMe(page.request)).eventCredits, { timeout: 15_000 })
      .toBeGreaterThan(0);

    // Die nächste Feier muss das Guthaben sofort einlösen, obwohl das
    // Event-Limit noch gar nicht erreicht ist.
    const mit = await createEvent(page.request, 'Mit Guthaben');
    await seedSongs(browser, mit.slug, 4);
    const offen = await fetchSongs(page.request, mit.slug, 'owner');
    expect(offen.unlocked, 'Guthaben schaltet die Feier frei').toBe(true);
    expect(offen.hidden_count, 'freigeschaltet heißt: nichts verdeckt').toBe(0);
    expect(readableTitles(offen)).toHaveLength(offen.total);

    await cleanup(page.request, ohne.slug);
    await cleanup(page.request, mit.slug);
  });

  test('Zahlung schlägt fehl und die Kulanzzeit ist abgelaufen: eine vorher offene Feier wird wieder gesperrt', async ({
    page,
    browser,
  }) => {
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('past-due'));
    const me = await getMe(page.request);
    const customerId = `cus_e2e_pastdue_${Date.now()}`;

    // Erst einen Kunden anlegen (wie es ein echter Kauf tut), dann eine aktive
    // Subscription mit einem Abrechnungsende, das schon zehn Tage zurückliegt
    // — solange plan_status noch "active" ist, bleibt der Plan trotzdem pro.
    await sendCheckoutCompleted(page.request, me.id, { tier: 'credit_pack_5' }, customerId);
    const zehnTageZurueck = Math.floor((Date.now() - 10 * 24 * 60 * 60 * 1000) / 1000);
    await sendSubscriptionActive(page.request, me.id, customerId, zehnTageZurueck);
    await expect.poll(async () => (await getMe(page.request)).plan, { timeout: 15_000 }).toBe('pro');

    const ev = await createEvent(page.request, 'Past-Due-Feier');
    await seedSongs(browser, ev.slug, 4);
    const waehrendPro = await fetchSongs(page.request, ev.slug, 'owner');
    expect(waehrendPro.unlocked, 'als aktiver Pro-Kunde ist die Feier offen').toBe(true);

    // Jetzt schlägt die Zahlung fehl: plan_status wird past_due, und die
    // Kulanzzeit (3 Tage über das Periodenende hinaus) ist längst vorbei.
    await sendPaymentFailed(page.request, customerId);
    await expect
      .poll(async () => (await fetchSongs(page.request, ev.slug, 'owner')).unlocked, { timeout: 15_000 })
      .toBe(false);

    await cleanup(page.request, ev.slug);
  });

  test('DJ ohne Konto registriert sich über den Live-Screen-Link und bekommt ein Event geschenkt', async ({
    page,
    browser,
  }) => {
    test.skip(!webhooksAvailable(), 'kein STRIPE_WEBHOOK_SECRET in .env.local gefunden');
    await register(page, testEmail('brautpaar'));
    const ev = await createEvent(page.request, 'Zweiter Kaufweg');

    const djKontext = await browser.newContext();
    const djSeite = await djKontext.newPage();
    await djSeite.goto(`/dj/${ev.slug}?dj=${ev.dj_token}`);
    await expect(djSeite.getByRole('button', { name: /Alle Wünsche sehen/ })).toBeVisible({ timeout: 15_000 });

    await djSeite.getByRole('button', { name: /Alle Wünsche sehen/ }).click();
    await djSeite.waitForURL(/\/auth\/register\?.*slug=.*dj=/, { timeout: 15_000 });
    const url = new URL(djSeite.url());
    expect(url.searchParams.get('slug')).toBe(ev.slug);
    expect(url.searchParams.get('dj')).toBe(ev.dj_token);

    // Ab hier würde die echte Registrierung automatisch in den Stripe-Checkout
    // laufen. Das lenken wir auf eine harmlose eigene Seite um, damit der Test
    // nicht auf checkout.stripe.com landet — genau dieser Aufruf beweist aber,
    // dass der Kaufweg ausgelöst wird.
    await djSeite.route('**/api/stripe/checkout', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ url: '/dj?checkout=success' }) })
    );

    await djSeite.fill('input[name=password]', TEST_PASSWORD);
    await djSeite.fill('input[name=confirm]', TEST_PASSWORD);
    for (const box of await djSeite.locator('input[type=checkbox]').all()) await box.check();
    await djSeite.click('button[type=submit]');
    await djSeite.waitForURL(/checkout=success/, { timeout: 15_000 });

    const djMe = await getMe(djSeite.request);
    // Der Dankeschön-Anreiz für die Registrierung über den DJ-Link.
    const webhook = await sendCheckoutCompleted(djSeite.request, djMe.id, {
      tier: 'couple_pass',
      slug: ev.slug,
      gift_credit: '1',
    });
    expect(webhook.ok).toBe(true);
    await expect.poll(async () => (await getMe(djSeite.request)).eventCredits, { timeout: 15_000 }).toBe(1);

    await djKontext.close();
    await cleanup(page.request, ev.slug);
  });
});
