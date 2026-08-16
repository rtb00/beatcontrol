// scripts/backfill-demo-cover.mjs
//
// Trägt Coverbilder und Deezer-Kennungen für Songs nach, die per Seed-Skript
// ohne diese Angaben angelegt wurden. Ohne Cover wirkt gerade die Demo-Feier
// karg, die als Verkaufsasset an Leads geht.
//
// Aufruf: node scripts/backfill-demo-cover.mjs [slug]

import { Client } from 'pg';
import { readFileSync } from 'fs';

try {
  const env = readFileSync('.env.local', 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const SLUG = process.argv[2] || 'demo-gig-2800da';
const CONNECTION_STRING = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED;
if (!CONNECTION_STRING) {
  console.error('❌ POSTGRES_URL_NON_POOLING fehlt in .env.local');
  process.exit(1);
}

const c = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
await c.connect();

const { rows } = await c.query(
  `SELECT s.id, s.title, s.artist FROM songs s
   JOIN events e ON e.id = s.event_id
   WHERE e.slug = $1 AND s.album_art_url IS NULL`,
  [SLUG]
);
console.log(`\n${rows.length} Songs ohne Cover in "${SLUG}"`);

let gefunden = 0;
for (const s of rows) {
  const suche = encodeURIComponent(`${s.artist} ${s.title}`);
  try {
    const res = await fetch(`https://api.deezer.com/search?q=${suche}&limit=1`);
    const daten = await res.json();
    const treffer = daten?.data?.[0];
    if (treffer?.album?.cover_medium) {
      await c.query(`UPDATE songs SET album_art_url = $2, deezer_id = $3 WHERE id = $1`, [
        s.id,
        treffer.album.cover_medium,
        String(treffer.id),
      ]);
      gefunden++;
    }
  } catch {
    /* einzelne Treffer dürfen fehlen, der Rest läuft weiter */
  }
  // Deezer drosselt bei zu vielen Anfragen am Stück
  await new Promise((r) => setTimeout(r, 220));
}

console.log(`  ✓ ${gefunden} Cover nachgetragen, ${rows.length - gefunden} ohne Treffer\n`);
await c.end();
