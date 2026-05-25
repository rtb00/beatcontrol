#!/usr/bin/env node
// scripts/check-deployment.mjs
//
// Health-Check vor Pitch-Calls oder Live-Hochzeiten.
// Prüft DB-Schema, ENV-Vars, Stripe-Konfiguration und macht einen Smoke-Test.
//
// Aufruf:
//   node scripts/check-deployment.mjs               (gegen .env.local / localhost)
//   node scripts/check-deployment.mjs --prod        (gegen beatcontrol.io)

import { Client } from 'pg';
import { readFileSync } from 'fs';

// Load .env.local
try {
  const env = readFileSync('.env.local', 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const PROD = process.argv.includes('--prod');
const BASE_URL = PROD ? 'https://beatcontrol.io' : 'http://localhost:3000';

let pass = 0;
let warn = 0;
let fail = 0;

function check(label, status, detail) {
  const sym = status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : '❌';
  console.log(`  ${sym} ${label}${detail ? ': ' + detail : ''}`);
  if (status === 'pass') pass++;
  else if (status === 'warn') warn++;
  else fail++;
}

console.log(`\n🔍 BeatControl Deployment-Check (${PROD ? 'PRODUCTION' : 'lokal'})\n`);

// --- ENV-VARS ---
console.log('📋 Environment-Variablen');
const required = {
  POSTGRES_URL_NON_POOLING: 'Datenbank-Connection',
  AUTH_SECRET: 'next-auth Secret',
};
const recommended = {
  BEATCONTROL_HASH_PEPPER: 'DSGVO IP-Hash Salt',
  STRIPE_SECRET_KEY: 'Stripe API Key',
  STRIPE_WEBHOOK_SECRET: 'Stripe Webhook',
  STRIPE_PRICE_EVENT_PASS: 'Stripe Event-Pass Price',
  STRIPE_PRICE_PRO_MONTHLY: 'Stripe Pro Monthly',
  STRIPE_PRICE_PRO_YEARLY: 'Stripe Pro Yearly',
  STRIPE_PRICE_STUDIO_MONTHLY: 'Stripe Studio Monthly',
  GROQ_API_KEY: 'AI Genre Detection',
};

for (const [k, label] of Object.entries(required)) {
  if (process.env[k]) check(`${label} (${k})`, 'pass');
  else check(`${label} (${k})`, 'fail', 'fehlt');
}
for (const [k, label] of Object.entries(recommended)) {
  if (process.env[k]) check(`${label} (${k})`, 'pass');
  else check(`${label} (${k})`, 'warn', 'nicht gesetzt');
}

// --- DB-SCHEMA ---
console.log('\n🗄  Datenbank-Schema');
const cs = process.env.POSTGRES_URL_NON_POOLING;
if (!cs) {
  check('DB-Connection', 'fail', 'kein POSTGRES_URL_NON_POOLING');
} else {
  const c = new Client({ connectionString: cs, ssl: { rejectUnauthorized: false } });
  try {
    await c.connect();
    check('DB-Connection', 'pass');

    const expected = {
      users: ['id', 'email', 'plan', 'subdomain', 'branding_name', 'branding_logo_url', 'stripe_customer_id'],
      events: ['id', 'slug', 'title', 'dj_id', 'event_date', 'active'],
      songs: ['id', 'event_id', 'title', 'artist', 'submitter_ip', 'played'],
      votes: ['id', 'song_id', 'voter_ip'],
    };
    for (const [table, cols] of Object.entries(expected)) {
      const { rows } = await c.query(
        `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
        [table]
      );
      const have = new Set(rows.map((r) => r.column_name));
      const missing = cols.filter((c) => !have.has(c));
      if (missing.length === 0) check(`Tabelle ${table}`, 'pass', `${rows.length} Spalten`);
      else check(`Tabelle ${table}`, 'fail', `fehlende Spalten: ${missing.join(', ')}`);
    }

    const { rows: idx } = await c.query(
      `SELECT indexname FROM pg_indexes WHERE indexname = 'idx_users_subdomain'`
    );
    if (idx.length > 0) check('Subdomain-Unique-Index', 'pass');
    else check('Subdomain-Unique-Index', 'warn', 'nicht gesetzt (wird beim ersten API-Call angelegt)');

    const { rows: stats } = await c.query(
      `SELECT
         (SELECT COUNT(*)::int FROM users) AS users,
         (SELECT COUNT(*)::int FROM events) AS events,
         (SELECT COUNT(*)::int FROM songs) AS songs,
         (SELECT COUNT(*)::int FROM votes) AS votes,
         (SELECT COUNT(*)::int FROM users WHERE plan = 'studio') AS studios`
    );
    console.log(`\n  📊 ${stats[0].users} User · ${stats[0].events} Events · ${stats[0].songs} Songs · ${stats[0].votes} Votes · ${stats[0].studios} Studio-Tier`);

    await c.end();
  } catch (err) {
    check('DB-Connection', 'fail', err.message);
  }
}

// --- HTTP SMOKE-TEST ---
console.log(`\n🌐 HTTP-Smoke-Test (${BASE_URL})`);
const endpoints = ['/', '/pricing', '/brautpaar', '/about', '/pilot', '/vibo-alternative', '/api/health', '/robots.txt', '/sitemap.xml'];
for (const path of endpoints) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'HEAD' }).catch(() => null);
    if (!res) {
      check(`GET ${path}`, PROD ? 'fail' : 'warn', 'unreachable');
      continue;
    }
    if (res.status === 200) check(`GET ${path}`, 'pass');
    else check(`GET ${path}`, 'warn', `HTTP ${res.status}`);
  } catch (err) {
    check(`GET ${path}`, 'warn', err.message);
  }
}

// --- BRAND-CHECK ---
console.log('\n🎨 Brand-Konsistenz');
try {
  const res = await fetch(BASE_URL).catch(() => null);
  if (res && res.ok) {
    const html = await res.text();
    if (html.includes('BeatControl')) check('Brand "BeatControl" im HTML', 'pass');
    else check('Brand "BeatControl" im HTML', 'fail', 'nicht gefunden');
    if (html.includes('MusicWish')) check('Alte Brand "MusicWish" entfernt', 'fail', 'noch im HTML');
    else check('Alte Brand "MusicWish" entfernt', 'pass');
  } else {
    check('Brand-Check', 'warn', 'Page nicht erreichbar');
  }
} catch {
  check('Brand-Check', 'warn', 'Fetch-Fehler');
}

// --- SUMMARY ---
console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`  ✅ ${pass} Pass   ⚠️  ${warn} Warn   ❌ ${fail} Fail\n`);

if (fail > 0) {
  console.log('❌ Deployment NICHT bereit. Behebe Fails zuerst.\n');
  process.exit(1);
} else if (warn > 0) {
  console.log('⚠️  Deployment funktioniert, aber empfohlene Items fehlen.');
  console.log('   Für Mike-Pitch: alle Warnungen beheben.\n');
  process.exit(0);
} else {
  console.log('🚀 Deployment ist Mike-Pitch-ready.\n');
  process.exit(0);
}
