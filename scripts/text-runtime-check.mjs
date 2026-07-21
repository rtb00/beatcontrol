#!/usr/bin/env node
// scripts/text-runtime-check.mjs
//
// Ergänzendes Regressions-Gate zu text-baseline.mjs: fetcht die server-gerenderte
// HTML-Ausgabe der öffentlichen, DB-unabhängigen Routen von einem laufenden
// `next start`/`next dev`-Server, reduziert sie auf reinen sichtbaren Text und
// vergleicht Vorher/Nachher. Kein Playwright/Browser nötig — deckt den
// tatsächlich ausgelieferten Zustand ab (Ergänzung, nicht Ersatz für die
// AST-Prüfung in text-baseline.mjs, die auch inaktive Ternary-Zweige erfasst).
//
// Aufruf (Server muss laufen, Default http://localhost:3000):
//   node scripts/text-runtime-check.mjs baseline
//   node scripts/text-runtime-check.mjs check
//
// /start ist ein Multi-Step-Funnel; ohne Browser-Interaktion ist per Fetch nur
// Schritt 0 erreichbar — die übrigen Schritte deckt ausschließlich die
// AST-Prüfung ab (das ist beabsichtigt, siehe Migrationsplan Abschnitt B).

import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASELINE_PATH = resolve(__dirname, '.text-runtime-baseline.json');
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';

const ROUTES = [
  '/',
  '/pricing',
  '/vibo-alternative',
  '/brautpaar',
  '/pilot',
  '/start',
  '/impressum',
  '/agb',
  '/datenschutz',
  '/auth/signin',
  '/auth/register',
  // Multi-segment path, doesn't match any route (incl. the [slug] catch-single-
  // segment guest page) — actually triggers app/not-found.tsx.
  '/this/route/does/not/exist',
];

function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&rsquo;/g, '’')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchRoute(route) {
  const res = await fetch(`${BASE_URL}${route}`);
  const html = await res.text();
  return { status: res.status, text: htmlToText(html) };
}

async function buildSnapshot() {
  const snapshot = {};
  for (const route of ROUTES) {
    try {
      snapshot[route] = await fetchRoute(route);
    } catch (err) {
      console.error(`✗ Fehler beim Abruf von ${route}: ${err.message}`);
      process.exitCode = 1;
    }
  }
  return snapshot;
}

async function main() {
  const mode = process.argv[2];

  if (mode === 'baseline') {
    const snapshot = await buildSnapshot();
    writeFileSync(BASELINE_PATH, JSON.stringify(snapshot, null, 2) + '\n', 'utf-8');
    console.log(`✓ Runtime-Baseline geschrieben: ${BASELINE_PATH} (${ROUTES.length} Routen)`);
    return;
  }

  if (mode === 'check') {
    if (!existsSync(BASELINE_PATH)) {
      console.error('✗ Keine Runtime-Baseline gefunden — zuerst `node scripts/text-runtime-check.mjs baseline` ausführen (Server muss laufen).');
      process.exit(1);
    }
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf-8'));
    const current = await buildSnapshot();

    let hasDiff = false;
    for (const route of ROUTES) {
      const before = baseline[route];
      const after = current[route];
      if (!before || !after) continue;
      if (before.text !== after.text) {
        hasDiff = true;
        console.error(`\n✗ Text-Abweichung auf ${route}:`);
        console.error(`  vorher: ${before.text.slice(0, 400)}`);
        console.error(`  nachher: ${after.text.slice(0, 400)}`);
      }
    }

    if (hasDiff) {
      console.error('\n✗ Runtime-Regressions-Check fehlgeschlagen.');
      process.exit(1);
    }
    console.log(`✓ Kein Text-Diff über ${ROUTES.length} Routen (Runtime-Check).`);
    return;
  }

  console.error('Nutzung: node scripts/text-runtime-check.mjs <baseline|check>  (BASE_URL env var optional, Default http://localhost:3000)');
  process.exit(1);
}

main();
