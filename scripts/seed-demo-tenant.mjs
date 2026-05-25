// scripts/seed-demo-tenant.mjs
//
// Seedet einen Demo-Studio-Tenant + Beispiel-Hochzeit mit 20 Songs.
// Zweck: Whitelabel-Demos für potenzielle Studio-Customer (z.B. Mike Hoffmann).
//
// Voraussetzung:
//   - .env.local mit POSTGRES_URL_NON_POOLING (vorhanden via Vercel-Postgres-Integration)
//   - Studio-User wird angelegt mit subdomain={argv[2] || 'demo'}
//
// Aufruf:
//   node scripts/seed-demo-tenant.mjs <subdomain> <brandingName> [brandingLogoUrl]
//
// Beispiele:
//   node scripts/seed-demo-tenant.mjs demo "Demo Studio"
//   node scripts/seed-demo-tenant.mjs mikehoffmann "DJ Mike Hoffmann" "https://djmikehoffmann.de/logo.png"
//
// Re-running mit gleicher subdomain: idempotent (löscht erst, dann neu).

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

const SUBDOMAIN = (process.argv[2] || 'demo').toLowerCase();
const BRAND_NAME = process.argv[3] || 'Demo Studio';
const LOGO_URL = process.argv[4] || null;

if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(SUBDOMAIN) || SUBDOMAIN.length < 3) {
  console.error('❌ Ungültige subdomain. 3+ Zeichen, a-z/0-9/-, kein Start/Ende mit -');
  process.exit(1);
}

const CONNECTION_STRING = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED;
if (!CONNECTION_STRING) {
  console.error('❌ POSTGRES_URL_NON_POOLING fehlt in .env.local');
  process.exit(1);
}

const SAMPLE_SONGS = [
  { title: 'September',                       artist: 'Earth, Wind & Fire',   votes: 14 },
  { title: 'I Wanna Dance with Somebody',     artist: 'Whitney Houston',      votes: 12 },
  { title: 'Mr. Brightside',                  artist: 'The Killers',          votes: 11 },
  { title: 'Tanz der Moleküle',               artist: 'Mia.',                 votes: 10 },
  { title: 'Marry You',                       artist: 'Bruno Mars',           votes: 9 },
  { title: 'Sweet Caroline',                  artist: 'Neil Diamond',         votes: 9 },
  { title: '99 Luftballons',                  artist: 'Nena',                 votes: 8 },
  { title: 'Don’t Stop Believin’',  artist: 'Journey',              votes: 8 },
  { title: 'Atemlos durch die Nacht',         artist: 'Helene Fischer',       votes: 7 },
  { title: 'Bohemian Rhapsody',               artist: 'Queen',                votes: 7 },
  { title: 'Take On Me',                      artist: 'a-ha',                 votes: 6 },
  { title: 'Levitating',                      artist: 'Dua Lipa',             votes: 6 },
  { title: 'Cordula Grün',                    artist: 'Josh.',                votes: 5 },
  { title: 'Uptown Funk',                     artist: 'Mark Ronson',          votes: 5 },
  { title: 'YMCA',                            artist: 'Village People',       votes: 5 },
  { title: 'Mit dir',                         artist: 'CRO',                  votes: 4 },
  { title: 'Africa',                          artist: 'Toto',                 votes: 4 },
  { title: 'Auf uns',                         artist: 'Andreas Bourani',      votes: 3 },
  { title: 'Dancing Queen',                   artist: 'ABBA',                 votes: 3, played: true },
  { title: 'I Will Survive',                  artist: 'Gloria Gaynor',        votes: 2, played: true },
];

const c = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log(`\n🌱 BeatControl Demo-Seed: subdomain="${SUBDOMAIN}", brandingName="${BRAND_NAME}"`);

// 0) Ensure subdomain column exists (DB-Migration läuft sonst erst bei erster API-Anfrage)
await c.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS subdomain TEXT`);
await c.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_subdomain ON users(LOWER(subdomain)) WHERE subdomain IS NOT NULL`);

// 1) User anlegen oder updaten
const email = `demo+${SUBDOMAIN}@beatcontrol.io`;
const { rows: existingUser } = await c.query(
  `SELECT id FROM users WHERE LOWER(subdomain) = $1`,
  [SUBDOMAIN]
);

let userId;
if (existingUser.length > 0) {
  userId = existingUser[0].id;
  await c.query(
    `UPDATE users SET branding_name = $2, branding_logo_url = $3, plan = 'studio'
     WHERE id = $1`,
    [userId, BRAND_NAME, LOGO_URL]
  );
  // Alte Demo-Events löschen für Idempotenz
  await c.query(`DELETE FROM events WHERE dj_id = $1 AND slug LIKE 'demo-%'`, [userId]);
  console.log(`  ✓ Studio-User existierte, gecleant für Re-Seed`);
} else {
  const { rows } = await c.query(
    `INSERT INTO users (email, name, plan, subdomain, branding_name, branding_logo_url)
     VALUES ($1, $2, 'studio', $3, $4, $5)
     RETURNING id`,
    [email, BRAND_NAME, SUBDOMAIN, BRAND_NAME, LOGO_URL]
  );
  userId = rows[0].id;
  console.log(`  ✓ Studio-User angelegt: ${email}`);
}

// 2) Event anlegen
const slug = `demo-hochzeit-${Math.random().toString(36).slice(2, 8)}`;
const { rows: eventRows } = await c.query(
  `INSERT INTO events (slug, title, subtitle, dj_id, event_date, active)
   VALUES ($1, $2, $3, $4, $5, true)
   RETURNING id`,
  [slug, 'Hochzeit Sarah & Thomas', 'Schloss Sonnenburg · 14. Juni 2026', userId, '2026-06-14']
);
const eventId = eventRows[0].id;
console.log(`  ✓ Event "Hochzeit Sarah & Thomas" angelegt (/${slug})`);

// 3) Songs + Votes anlegen
for (const [idx, s] of SAMPLE_SONGS.entries()) {
  const submitterHash = `demo_submitter_${idx}_${Math.random().toString(36).slice(2, 10)}`;
  const { rows: songRows } = await c.query(
    `INSERT INTO songs (event_id, title, artist, played, submitter_ip)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [eventId, s.title, s.artist, s.played ?? false, submitterHash]
  );
  const songId = songRows[0].id;

  // Submitter zählt automatisch als 1. Vote → wir fügen votes-1 weitere voter hinzu
  await c.query(
    `INSERT INTO votes (song_id, voter_ip) VALUES ($1, $2)`,
    [songId, submitterHash]
  );
  for (let v = 1; v < s.votes; v++) {
    const voterHash = `demo_voter_${idx}_${v}_${Math.random().toString(36).slice(2, 8)}`;
    await c.query(
      `INSERT INTO votes (song_id, voter_ip) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [songId, voterHash]
    );
  }
}
console.log(`  ✓ ${SAMPLE_SONGS.length} Songs mit ${SAMPLE_SONGS.reduce((a, s) => a + s.votes, 0)} Votes`);

await c.end();

console.log(`\n✅ Seed komplett.`);
console.log(`\n   Demo-URL (sobald DNS live):`);
console.log(`   → https://${SUBDOMAIN}.beatcontrol.io/${slug}    (Gast-View)`);
console.log(`   → https://${SUBDOMAIN}.beatcontrol.io/dj         (DJ-Dashboard)`);
console.log(`\n   Lokal jetzt verfügbar:`);
console.log(`   → http://localhost:3000/${slug}               (Gast-View, ohne Subdomain-Branding)`);
console.log(`\n   Login als Demo-User:`);
console.log(`   → Email: ${email}`);
console.log(`   → (Passwort muss separat gesetzt werden, oder via OAuth)\n`);
