import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '../.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=\s]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/\\n$/, '').trim();
}

const OWNER_EMAIL = 'nibor.bauer1@googlemail.com';

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const { rows: users } = await pool.query(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [OWNER_EMAIL]
  );
  if (users.length === 0) {
    throw new Error(`User with email ${OWNER_EMAIL} not found.`);
  }
  const userId = users[0].id;
  console.log(`Owner user id: ${userId}`);

  const { rows: orphans } = await pool.query(
    `SELECT id, slug, title FROM events WHERE dj_id IS NULL`
  );
  console.log(`Found ${orphans.length} orphan event(s):`);
  for (const e of orphans) console.log(`  - [${e.id}] ${e.slug} — ${e.title}`);

  if (orphans.length > 0) {
    const { rowCount } = await pool.query(
      `UPDATE events SET dj_id = $1 WHERE dj_id IS NULL`,
      [userId]
    );
    console.log(`Backfilled ${rowCount} event(s).`);
  }

  await pool.query(`ALTER TABLE events ALTER COLUMN dj_id SET NOT NULL`);
  console.log('events.dj_id is now NOT NULL.');

  await pool.query(`ALTER TABLE events DROP COLUMN IF EXISTS dj_password`);
  console.log('events.dj_password column dropped.');

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
