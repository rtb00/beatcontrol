import { test, expect, type Page } from '@playwright/test';

// Regressionsschutz für einen Bug: das E-Mail-Feld auf /auth/register wich in
// Größe und Erscheinung von den beiden Passwortfeldern ab, obwohl alle drei
// dieselben Tailwind-Klassen tragen. Ursache: die Seite hatte keine Regel
// gegen die Browser-Ausfüllhilfe. Chrome/WebKit überschreiben Hintergrund-
// und Textfarbe eines Feldes per User-Agent-Regel mit !important, sobald der
// Browser es (auto-)befüllt hat oder befüllen möchte — das betrifft praktisch
// nur type="email"-Felder, weil Passwortfelder von dieser Autofill-Historie
// ausgenommen sind. Echtes Browser-Autofill lässt sich in CI nicht
// zuverlässig auslösen (abhängig von gespeicherten Profildaten/Historie),
// darum prüft dieser Test zwei Dinge, die zusammen die Behebung belegen:
// 1) alle drei Felder sind pixelgleich (Kasten, Innenabstand, Schriftgröße)
//    in leerem und vorbefülltem Zustand — der ursprünglich gemeldete Zustand
//    reproduziert also *keinen* Klassen-Unterschied, wie im Ticket vermerkt.
// 2) die :-webkit-autofill/:autofill-Gegenregel ist tatsächlich im
//    Stylesheet vorhanden und neutralisiert Hintergrund-/Textfarbe auf die
//    dunkle Gestaltung, statt das Chrome/WebKit-Gelb durchzulassen.

interface FieldBox {
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: string;
  padding: string;
  backgroundColor: string;
  borderColor: string;
}

async function measureField(page: Page, name: string): Promise<FieldBox> {
  const loc = page.locator(`input[name=${name}]`);
  const box = await loc.boundingBox();
  if (!box) throw new Error(`Feld ${name} nicht sichtbar`);
  const styles = await loc.evaluate((el) => {
    const cs = getComputedStyle(el);
    return {
      fontSize: cs.fontSize,
      padding: cs.padding,
      backgroundColor: cs.backgroundColor,
      borderColor: cs.borderColor,
    };
  });
  return { ...box, ...styles };
}

function erwarteGleicheBox(a: FieldBox, b: FieldBox, label: string) {
  expect(a.width, `${label}: Breite`).toBeCloseTo(b.width, 0);
  expect(a.height, `${label}: Höhe`).toBeCloseTo(b.height, 0);
  expect(a.x, `${label}: linke Kante`).toBeCloseTo(b.x, 0);
  expect(a.fontSize, `${label}: Schriftgröße`).toBe(b.fontSize);
  expect(a.padding, `${label}: Innenabstand`).toBe(b.padding);
  expect(a.backgroundColor, `${label}: Hintergrundfarbe`).toBe(b.backgroundColor);
  expect(a.borderColor, `${label}: Rahmenfarbe`).toBe(b.borderColor);
}

test.describe('Registrierung: einheitliche Felder', () => {
  test('leeres Formular: Email, Passwort, Passwort bestätigen sind identisch groß und gestaltet', async ({ page }) => {
    await page.goto('/auth/register');
    const email = await measureField(page, 'email');
    const password = await measureField(page, 'password');
    const confirm = await measureField(page, 'confirm');

    erwarteGleicheBox(email, password, 'Email vs. Passwort');
    erwarteGleicheBox(email, confirm, 'Email vs. Passwort bestätigen');
  });

  test('vorbefülltes Formular (aus dem Funnel): Email bleibt gleich groß und dunkel wie die Passwortfelder', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem(
        'bc_pending_event',
        JSON.stringify({ email: 'vorbefuellt@example.com', is_couple: false })
      );
    });
    await page.goto('/auth/register');
    await expect(page.locator('input[name=email]')).toHaveValue('vorbefuellt@example.com');

    const email = await measureField(page, 'email');
    const password = await measureField(page, 'password');
    const confirm = await measureField(page, 'confirm');

    erwarteGleicheBox(email, password, 'Email vs. Passwort (vorbefüllt)');
    erwarteGleicheBox(email, confirm, 'Email vs. Passwort bestätigen (vorbefüllt)');
  });

  test('Gegenregel gegen Browser-Ausfüllhilfe ist im Stylesheet vorhanden', async ({ page }) => {
    await page.goto('/auth/register');
    const hatRegel = await page.evaluate(() => {
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue; // Cross-Origin-Stylesheets ohne Zugriff überspringen
        }
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSStyleRule && rule.selectorText.includes('-webkit-autofill')) {
            const style = rule.style;
            const hatTransition = style.transition.includes('9999s') || style.transitionDuration.includes('9999s');
            const hatTextFill = !!style.getPropertyValue('-webkit-text-fill-color');
            const hatBoxShadow = !!style.boxShadow;
            if (hatTransition && hatTextFill && hatBoxShadow) return true;
          }
        }
      }
      return false;
    });
    expect(hatRegel, 'Regel gegen :-webkit-autofill (Hintergrund/Text/Transition) fehlt').toBe(true);
  });
});
