import { test, expect, type Page } from '@playwright/test';
import { testEmail } from './helpers';

// Klickpfade durch beide Funnel, in beiden Projekten (Desktop und Handy).
// Screen 1 fragt Name, E-Mail und Datum ab, Screen 2 ist die Vorschaukarte,
// die selbst der Auslöser ist: ein Klick darauf führt zur Registrierung.

const NAME = 'Anna und Ben';

interface FunnelVariante {
  route: string;
  ueberschrift: string;
  knopf: string;
  beitrittstext: string;
  vorschau: string;
}

const VARIANTEN: FunnelVariante[] = [
  {
    route: '/brautpaar/start',
    ueberschrift: 'Eure Feier',
    knopf: 'Musikwunschliste anlegen',
    beitrittstext: 'Eurer Feier als Organisatoren beitreten',
    vorschau: 'Eure Musikwunschliste ist startklar',
  },
  {
    route: '/start',
    ueberschrift: 'Deine Feier',
    knopf: 'Event anlegen',
    beitrittstext: 'Diesem Event als Organisator beitreten',
    vorschau: 'Dein Event ist startklar',
  },
];

async function fuelleScreen1(page: Page, email: string) {
  await page.fill('input[type=text]', NAME);
  await page.fill('input[type=email]', email);
}

for (const v of VARIANTEN) {
  test.describe(`Funnel ${v.route}`, () => {
    test('Screen 1 ist erst mit Name und gültiger E-Mail absendbar', async ({ page }) => {
      await page.goto(v.route);
      await expect(page.getByRole('heading', { name: v.ueberschrift })).toBeVisible();

      const weiter = page.getByRole('button', { name: v.knopf });
      await expect(weiter).toBeDisabled();

      await page.fill('input[type=text]', NAME);
      await expect(weiter, 'ohne E-Mail bleibt gesperrt').toBeDisabled();

      await page.fill('input[type=email]', 'keine-mail');
      await expect(weiter, 'ungültige E-Mail bleibt gesperrt').toBeDisabled();

      await page.fill('input[type=email]', testEmail('funnel'));
      await expect(weiter).toBeEnabled();
    });

    test('Datum ist ein Jahr im Voraus vorbelegt', async ({ page }) => {
      await page.goto(v.route);
      const erwartet = new Date();
      erwartet.setFullYear(erwartet.getFullYear() + 1);
      await expect(page.locator('input[type=date]')).toHaveValue(erwartet.toISOString().slice(0, 10));
    });

    test('alle drei Felder sind gleich breit und bündig', async ({ page }) => {
      await page.goto(v.route);
      const kaesten = [];
      for (const sel of ['input[type=text]', 'input[type=email]', 'input[type=date]']) {
        kaesten.push(await page.locator(sel).boundingBox());
      }
      const breiten = kaesten.map((k) => Math.round(k!.width));
      const linksBuendig = kaesten.map((k) => Math.round(k!.x));
      expect(new Set(breiten).size, `Breiten: ${breiten}`).toBe(1);
      expect(new Set(linksBuendig).size, `Kanten: ${linksBuendig}`).toBe(1);
    });

    test('Karte auf Screen 2 führt über einen Ladezustand zur Registrierung', async ({ page }) => {
      const email = testEmail('karte');
      await page.goto(v.route);
      await fuelleScreen1(page, email);
      await page.getByRole('button', { name: v.knopf }).click();

      await expect(page.getByText(v.vorschau)).toBeVisible();
      await expect(page.getByText(NAME)).toBeVisible();
      await expect(
        page.getByRole('button', { name: /Zugang anlegen/ }),
        'der eigene Knopf ist entfallen, die Karte trägt die Aktion'
      ).toHaveCount(0);

      const karte = page.locator('[role=button][aria-busy]');
      await expect(karte).toHaveCount(1);
      await karte.click();
      await expect(page.getByText(v.beitrittstext)).toBeVisible();
      await expect(karte).toHaveAttribute('aria-busy', 'true');

      await page.waitForURL('**/auth/register', { timeout: 15_000 });
      await expect(page.locator('input[name=email]'), 'E-Mail wandert mit').toHaveValue(email);
      await expect(page.locator('input[name=name]'), 'Namensfeld ist entfallen').toHaveCount(0);
    });

    test('kein waagerechtes Scrollen auf beiden Screens', async ({ page }) => {
      await page.goto(v.route);
      const ueberlauf = () =>
        page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(await ueberlauf()).toBeLessThanOrEqual(0);

      await fuelleScreen1(page, testEmail('overflow'));
      await page.getByRole('button', { name: v.knopf }).click();
      await expect(page.getByText(v.vorschau)).toBeVisible();
      expect(await ueberlauf()).toBeLessThanOrEqual(0);
    });
  });
}
