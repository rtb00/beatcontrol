import { test, expect, type Page } from '@playwright/test';

// End-to-End-Tests für den /start-Funnel (2 Screens):
// Screen 1: Name + Datum  →  Screen 2: Event-Vorschau  →  /auth/register.
// Läuft in beiden Projekten (desktop 1440x900, mobile Pixel 7).

const TITLE = 'Hochzeit Testmann';
const DATE = '2026-09-12';
const DATE_FORMATTED = '12. September 2026';

function dateInput(page: Page) {
  return page.getByLabel('Datum der Feier');
}

test.describe('/start Funnel', () => {
  test('Screen 1 zeigt Titel, Namensfeld und Datum-Hinweis', async ({ page }) => {
    await page.goto('/start');
    await expect(page.getByRole('heading', { name: 'Wie heißt deine nächste Feier?' })).toBeVisible();
    await expect(page.getByPlaceholder('z. B. Hochzeit Müller')).toBeVisible();
    await expect(page.getByText('Datum eintragen')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Event anlegen' })).toBeDisabled();
  });

  test('Klick auf das Datumsfeld öffnet den Kalender (showPicker)', async ({ page }) => {
    // showPicker() stubben: Flag setzen statt natives UI öffnen — das native
    // Kalender-Popup lebt außerhalb des DOM und ist nicht direkt testbar.
    await page.addInitScript(() => {
      (window as unknown as { __pickerOpened: boolean }).__pickerOpened = false;
      HTMLInputElement.prototype.showPicker = function () {
        (window as unknown as { __pickerOpened: boolean }).__pickerOpened = true;
      };
    });
    await page.goto('/start');

    await dateInput(page).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __pickerOpened: boolean }).__pickerOpened))
      .toBe(true);

    // Bei Fokus muss das Overlay verschwinden, damit Tastatureingabe sichtbar ist.
    await expect(dateInput(page)).toBeFocused();
    await expect(page.getByText('Datum eintragen')).toBeHidden();
  });

  test('kompletter Flow: Name + Datum → Vorschau → Registrierung', async ({ page }) => {
    await page.goto('/start');

    await page.getByPlaceholder('z. B. Hochzeit Müller').fill(TITLE);
    await dateInput(page).fill(DATE);
    await expect(page.getByText('Datum eintragen')).toBeHidden();

    const submit = page.getByRole('button', { name: 'Event anlegen' });
    await expect(submit).toBeEnabled();
    await submit.click();

    // Screen 2: Vorschau-Karte mit Titel, formatiertem Datum und Verlust-Hinweis
    await expect(page.getByText('Dein Event ist startklar')).toBeVisible();
    await expect(page.getByRole('heading', { name: TITLE })).toBeVisible();
    await expect(page.getByText(DATE_FORMATTED)).toBeVisible();
    await expect(page.getByText('Startklar', { exact: true })).toBeVisible();
    await expect(page.getByText('Noch ist dein Event nicht gespeichert.', { exact: false })).toBeVisible();

    await page.getByRole('button', { name: 'Event kostenlos sichern' }).click();
    await page.waitForURL('**/auth/register');

    // Das Event muss als Pending-Payload für das Dashboard hinterlegt sein.
    const pending = await page.evaluate(() => localStorage.getItem('bc_pending_event'));
    expect(pending).not.toBeNull();
    const payload = JSON.parse(pending as string);
    expect(payload.title).toBe(TITLE);
    expect(payload.date).toBe(DATE);
  });

  test('Browser-Zurück führt von der Vorschau zurück zu Screen 1 mit erhaltenen Eingaben', async ({ page }) => {
    await page.goto('/start');
    await page.getByPlaceholder('z. B. Hochzeit Müller').fill(TITLE);
    await dateInput(page).fill(DATE);
    await page.getByRole('button', { name: 'Event anlegen' }).click();
    await expect(page.getByText('Dein Event ist startklar')).toBeVisible();

    await page.goBack();

    await expect(page.getByRole('heading', { name: 'Wie heißt deine nächste Feier?' })).toBeVisible();
    await expect(page.getByPlaceholder('z. B. Hochzeit Müller')).toHaveValue(TITLE);
    await expect(dateInput(page)).toHaveValue(DATE);
  });

  test('visuell: Screen 1', async ({ page }) => {
    await page.goto('/start');
    await expect(page.getByRole('heading', { name: 'Wie heißt deine nächste Feier?' })).toBeVisible();
    await expect(page).toHaveScreenshot('start-screen-1.png', { fullPage: true });
  });

  test('visuell: Screen 2 mit ausgefüllter Vorschau', async ({ page }) => {
    await page.goto('/start');
    await page.getByPlaceholder('z. B. Hochzeit Müller').fill(TITLE);
    await dateInput(page).fill(DATE);
    await page.getByRole('button', { name: 'Event anlegen' }).click();
    await expect(page.getByText('Dein Event ist startklar')).toBeVisible();
    await expect(page).toHaveScreenshot('start-screen-2.png', { fullPage: true });
  });
});
