import { defineConfig, devices } from '@playwright/test';

// E2E-/Visual-Tests laufen gegen einen eigenen Dev-Server auf Port 3100,
// damit ein parallel laufender `npm run dev` auf 3000 nicht stört.
const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      // Animationen (animate-fade-up) einfrieren, kleine Font-Rendering-
      // Schwankungen tolerieren, sonst flaked der visuelle Vergleich.
      animations: 'disabled',
      maxDiffPixelRatio: 0.02,
    },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
