import { test, expect } from '@playwright/test';
import { register, createEvent, cleanup, testEmail, collectConsoleErrors } from './helpers';

// Der Weg, an dem der erste echte Nutzer tatsächlich scheiterte: er fand nach
// der Anmeldung den Gästelink nicht. Diese Specs sichern genau diesen Weg und
// die Regressionen, die ihn schon einmal kaputt gemacht haben (verschwundenes
// "Event schließen", ein Willkommens-Fenster, das die Kachel verdeckt).
test.describe('DJ-Dashboard: der Weg zum Gästelink', () => {
  test.describe.configure({ mode: 'serial', timeout: 120_000 });
  test.beforeEach(({}, testInfo) => {
    testInfo.skip(testInfo.project.name !== 'desktop', 'API-nahe Prüfungen, ein Projekt genügt');
  });

  test('nach der Anmeldung kein Willkommens-Fenster: die Event-Kachel ist sofort erreichbar', async ({ page }) => {
    const fehler = collectConsoleErrors(page);
    await register(page, testEmail('kein-onboarding'));

    // Kein Modal verdeckt das Dashboard.
    await expect(page.locator('[role=dialog]')).toHaveCount(0);
    // Der Haupt-Handlungsknopf ist ohne weitere Interaktion erreichbar.
    await expect(page.getByRole('button', { name: /Neues Event/ })).toBeVisible({ timeout: 15_000 });

    expect(fehler, `Konsolenfehler ohne PostHog-Schlüssel: ${fehler.join(' | ')}`).toEqual([]);
  });

  test('die Kachel zeigt den Weg zum Gästelink und führt zum Live-Screen mit QR-Code', async ({ page }) => {
    const fehler = collectConsoleErrors(page);
    await register(page, testEmail('kachel'));
    const ev = await createEvent(page.request, 'Kachel-Feier');

    await page.goto('/dj');
    // Genau ein Event auf einem frischen Konto: der Text ist eindeutig, keine
    // Kachel-Eingrenzung nötig.
    await expect(page.getByRole('heading', { name: 'Kachel-Feier' })).toBeVisible();
    await expect(page.getByText('QR-Code und Gästelink')).toBeVisible();

    // Die ganze Kachel ist klickbar (ein über sie gelegter Link); der
    // eigentliche Navigationsanker ist der Titel-Link.
    await page.getByRole('link', { name: 'Kachel-Feier' }).click();
    await expect(page).toHaveURL(new RegExp(`/dj/${ev.slug}`));

    // Der Live-Screen zeigt tatsächlich QR-Code und Gästelink, nicht nur den
    // Verweis darauf.
    await expect(page.getByText('Scanne mich!')).toBeVisible();
    await expect(page.getByText(`/${ev.slug}`, { exact: false })).toBeVisible();
    await expect(page.getByRole('button', { name: /Gäste-Karte herunterladen/ })).toBeVisible();

    await cleanup(page.request, ev.slug);
    expect(fehler, `Konsolenfehler: ${fehler.join(' | ')}`).toEqual([]);
  });

  test('"Event schließen" ist erreichbar und schließt die Feier wirklich', async ({ page }) => {
    await register(page, testEmail('schliessen'));
    const ev = await createEvent(page.request, 'Zu schliessende Feier');

    await page.goto(`/dj/${ev.slug}`);
    page.once('dialog', (d) => d.accept());
    await page.getByRole('button', { name: /Event schließen/ }).click();

    // Wirkt tatsächlich: der Server trägt die Feier als inaktiv ein.
    await expect
      .poll(async () => (await (await page.request.get(`/api/events/${ev.slug}`)).json()).active, {
        timeout: 15_000,
      })
      .toBe(false);

    // Und die Übersicht zeigt es sichtbar an.
    await page.goto('/dj');
    await expect(page.getByRole('heading', { name: 'Zu schliessende Feier' })).toBeVisible();
    await expect(page.getByText('INAKTIV')).toBeVisible();
  });

  test('vom Funnel bis zum verschickbaren Gästelink in einem Durchlauf', async ({ page }) => {
    const fehler = collectConsoleErrors(page);
    const email = testEmail('funnel-bis-gaestelink');
    const titel = `E2E Durchlauf ${Date.now()}`;

    await page.goto('/start');
    await page.fill('input[type=text]', titel);
    await page.fill('input[type=email]', email);
    await page.getByRole('button', { name: 'Event anlegen' }).click();
    await expect(page.getByText('Dein Event ist startklar')).toBeVisible();

    await page.locator('[role=button][aria-busy]').click();
    await page.waitForURL('**/auth/register', { timeout: 15_000 });

    await page.fill('input[name=password]', 'Test1234!e2e');
    await page.fill('input[name=confirm]', 'Test1234!e2e');
    for (const box of await page.locator('input[type=checkbox]').all()) await box.check();
    await page.click('button[type=submit]');

    await page.waitForURL(/\/dj/, { timeout: 20_000 });
    await expect(page.getByRole('heading', { name: titel })).toBeVisible({ timeout: 15_000 });

    await page.getByRole('link', { name: titel }).click();
    await page.waitForURL(/\/dj\/.+/, { timeout: 15_000 });
    await expect(page.getByText('Scanne mich!')).toBeVisible();
    await expect(page.getByRole('button', { name: /Gäste-Karte herunterladen/ })).toBeVisible();

    const slug = page.url().split('/dj/')[1].split('?')[0];
    await cleanup(page.request, slug);

    expect(fehler, `Konsolenfehler über den ganzen Weg: ${fehler.join(' | ')}`).toEqual([]);
  });

  test('Funnel-Nutzer mit bereits aktivem Event bekommt die Paywall statt eines stillen Fehlers', async ({ page }) => {
    await register(page, testEmail('doppel-onboarding'));
    const ev = await createEvent(page.request, 'Schon aktives Event');

    // Ein liegen gebliebener Funnel-Eintrag, wie ihn /start hinterlässt, wenn
    // die Registrierung nicht direkt aus dem Funnel kam.
    await page.addInitScript(
      ([title]) => {
        localStorage.setItem(
          'bc_pending_event',
          JSON.stringify({ title, date: '2027-10-10', email: 'x@example.com' })
        );
      },
      ['Zweites Funnel-Event']
    );
    await page.goto('/dj');

    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/Free-Event ist belegt/)).toBeVisible();

    await cleanup(page.request, ev.slug);
  });
});
