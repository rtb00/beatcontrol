// Einmaliges Seed-Script: legt 4 Demo-DJs + je 1 Event an.
// Alle Seed-Nutzer haben die E-Mail-Domain @bc-seed.local → in einem Befehl löschbar:
//   DELETE FROM users WHERE email LIKE '%@bc-seed.local';   (Events gehen per FK-Cascade mit)
// Ausführen:  node --env-file=.env.local scripts/seed-prod.mjs

import { sql } from '@vercel/postgres';
import { randomBytes } from 'crypto';

const SEED_DOMAIN = 'bc-seed.local';

const SEED = [
  { name: 'Marco Reinhardt', email: `marco.reinhardt@${SEED_DOMAIN}`, event: 'Hochzeit Reinhardt',        date: '2026-07-18' },
  { name: 'Lena Brandt',     email: `lena.brandt@${SEED_DOMAIN}`,     event: 'Sandras 30er',              date: '2026-06-27' },
  { name: 'Tobias Falk',     email: `tobias.falk@${SEED_DOMAIN}`,     event: 'Sommerfest Mertens GmbH',   date: '2026-08-08' },
  { name: 'Sven Kowalski',   email: `sven.kowalski@${SEED_DOMAIN}`,   event: 'Hochzeit Berg & Lang',      date: '2026-09-12' },
];

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
function slug() {
  const b = randomBytes(8);
  let s = '';
  for (let i = 0; i < 8; i++) s += ALPHABET[b[i] % ALPHABET.length];
  return s;
}

async function run() {
  console.log('Verbinde mit:', (process.env.POSTGRES_URL || '').replace(/:\/\/[^@]+@/, '://****@'));

  for (const u of SEED) {
    // Nutzer idempotent anlegen
    const { rows: userRows } = await sql`
      INSERT INTO users (name, email, plan)
      VALUES (${u.name}, ${u.email}, 'free')
      ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
      RETURNING id
    `;
    const userId = userRows[0].id;

    // Event nur anlegen, wenn dieser Seed-DJ noch keins hat (idempotent)
    const { rows: existing } = await sql`SELECT COUNT(*)::int AS c FROM events WHERE dj_id = ${userId}`;
    if (existing[0].c > 0) {
      console.log(`= ${u.name}: hat bereits ein Event, überspringe`);
      continue;
    }

    const s = slug();
    await sql`
      INSERT INTO events (slug, title, dj_id, event_date, active)
      VALUES (${s}, ${u.event}, ${userId}, ${u.date}, TRUE)
    `;
    console.log(`+ ${u.name} → Event "${u.event}" (/${s})`);
  }

  const { rows: counts } = await sql`
    SELECT
      (SELECT COUNT(*) FROM users)  AS djs,
      (SELECT COUNT(*) FROM events) AS events
  `;
  console.log('\nNeue Gesamt-Counts → DJs:', counts[0].djs, '· Events:', counts[0].events);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
