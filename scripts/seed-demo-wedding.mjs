// scripts/seed-demo-wedding.mjs
//
// Seedet eine realistische Demo-Hochzeit: 72 Songwünsche, ~230 Stimmen,
// ein Teil davon bereits als gespielt markiert (Stand "kurz nach Mitternacht").
// Zweck: Beweis-Asset für warme Leads — der DJ öffnet den DJ-Link ohne Account
// und sieht einen echt wirkenden Live-Screen.
//
// Aufruf:
//   node scripts/seed-demo-wedding.mjs [Titel]
//
// Idempotent: löscht vorhandene Events des Demo-Users mit Prefix 'demo-gig-'.

import { Client } from 'pg';
import { readFileSync } from 'fs';
import { randomBytes } from 'crypto';

try {
  const env = readFileSync('.env.local', 'utf-8');
  for (const line of env.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {}

const TITLE = process.argv[2] || 'Hochzeit Lisa & Michael';
const CONNECTION_STRING = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED;
if (!CONNECTION_STRING) {
  console.error('❌ POSTGRES_URL_NON_POOLING fehlt in .env.local');
  process.exit(1);
}

// 72 Songs. Reihenfolge und Stimmen so verteilt, wie es auf einer echten
// Hochzeit aussieht: ein paar Überflieger, breite Mitte, lange Ein-Stimmen-Liste.
// played=true für alles, was bis kurz nach Mitternacht schon lief.
const SONGS = [
  ['Tage wie diese', 'Die Toten Hosen', 14, true],
  ['September', 'Earth, Wind & Fire', 13, true],
  ['Mr. Brightside', 'The Killers', 12, false],
  ['I Wanna Dance with Somebody', 'Whitney Houston', 11, true],
  ['Auf uns', 'Andreas Bourani', 10, true],
  ['Dancing Queen', 'ABBA', 10, true],
  ['Sweet Caroline', 'Neil Diamond', 9, true],
  ['Tanz der Moleküle', 'Mia.', 8, false],
  ['Uptown Funk', 'Mark Ronson feat. Bruno Mars', 8, true],
  ['Skandal im Sperrbezirk', 'Spider Murphy Gang', 7, true],
  ['Atemlos durch die Nacht', 'Helene Fischer', 7, true],
  ['Don’t Stop Me Now', 'Queen', 7, false],
  ['Wonderwall', 'Oasis', 6, true],
  ['Cordula Grün', 'Josh.', 6, true],
  ['Verdammt ich lieb dich', 'Matthias Reim', 6, true],
  ['Blinding Lights', 'The Weeknd', 5, false],
  ['YMCA', 'Village People', 5, true],
  ['I Will Survive', 'Gloria Gaynor', 5, true],
  ['500 Miles', 'The Proclaimers', 5, true],
  ['Marmor, Stein und Eisen bricht', 'Drafi Deutscher', 4, true],
  ['Africa', 'Toto', 4, false],
  ['Levels', 'Avicii', 4, false],
  ['Ein Stern', 'DJ Ötzi', 4, true],
  ['Barbie Girl', 'Aqua', 4, true],
  ['Astronaut', 'Sido feat. Andreas Bourani', 4, false],
  ['Take On Me', 'a-ha', 3, true],
  ['Living on a Prayer', 'Bon Jovi', 3, true],
  ['Hulapalu', 'Andreas Gabalier', 3, true],
  ['Bad Habits', 'Ed Sheeran', 3, false],
  ['Ein Hoch auf uns', 'Andreas Bourani', 3, true],
  ['Verdammt lang her', 'BAP', 3, false],
  ['Summer of ‘69', 'Bryan Adams', 3, true],
  ['Applaus, Applaus', 'Sportfreunde Stiller', 3, false],
  ['Wannabe', 'Spice Girls', 2, true],
  ['Macarena', 'Los del Río', 2, true],
  ['Griechischer Wein', 'Udo Jürgens', 2, true],
  ['Country Roads', 'John Denver', 2, true],
  ['Perfect', 'Ed Sheeran', 2, true],
  ['Shape of You', 'Ed Sheeran', 2, false],
  ['Bella Ciao', 'Traditional', 2, false],
  ['Ohne dich', 'Münchener Freiheit', 2, false],
  ['Bruttosozialprodukt', 'Geier Sturzflug', 2, true],
  ['Major Tom', 'Peter Schilling', 2, false],
  ['Die immer lacht', 'Stereoact feat. Kerstin Ott', 2, true],
  ['Toxic', 'Britney Spears', 2, false],
  ['Waka Waka', 'Shakira', 2, false],
  ['Danza Kuduro', 'Don Omar', 2, false],
  ['Rhythm Is a Dancer', 'Snap!', 2, true],
  ['Sex on Fire', 'Kings of Leon', 1, false],
  ['Bohemian Rhapsody', 'Queen', 1, true],
  ['Feel It Still', 'Portugal. The Man', 1, false],
  ['Zombie', 'The Cranberries', 1, false],
  ['Highway to Hell', 'AC/DC', 1, false],
  ['Ai Se Eu Te Pego', 'Michel Teló', 1, true],
  ['Hey Ya!', 'OutKast', 1, false],
  ['Crazy in Love', 'Beyoncé', 1, false],
  ['Numb', 'Linkin Park', 1, false],
  ['Cheerleader', 'OMI', 1, false],
  ['Hey Brother', 'Avicii', 1, false],
  ['Ich war noch niemals in New York', 'Udo Jürgens', 1, true],
  ['Über den Wolken', 'Reinhard Mey', 1, false],
  ['Lieblingsmensch', 'Namika', 1, false],
  ['Roller', 'Apache 207', 1, false],
  ['Komet', 'Udo Lindenberg & Apache 207', 1, false],
  ['Pump It', 'Black Eyed Peas', 1, false],
  ['Titanium', 'David Guetta feat. Sia', 1, false],
  ['Wake Me Up', 'Avicii', 1, false],
  ['Nur noch kurz die Welt retten', 'Tim Bendzko', 1, false],
  ['Electric Feel', 'MGMT', 1, false],
  ['Hey Jude', 'The Beatles', 1, true],
  ['Freed from Desire', 'Gala', 1, false],
  ['Last Christmas', 'Wham!', 1, false],
];

const c = new Client({ connectionString: CONNECTION_STRING, ssl: { rejectUnauthorized: false } });
await c.connect();

console.log(`\n🌱 Demo-Hochzeit: "${TITLE}"`);

await c.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS dj_token TEXT`);

const email = 'demo+gig@beatcontrol.io';
const { rows: existing } = await c.query(`SELECT id FROM users WHERE email = $1`, [email]);
let userId;
if (existing.length > 0) {
  userId = existing[0].id;
  await c.query(`UPDATE users SET plan = 'pro' WHERE id = $1`, [userId]);
  await c.query(`DELETE FROM events WHERE dj_id = $1 AND slug LIKE 'demo-gig-%'`, [userId]);
  console.log('  ✓ Demo-User existierte, alte Demo-Events entfernt');
} else {
  const { rows } = await c.query(
    `INSERT INTO users (email, name, plan) VALUES ($1, $2, 'pro') RETURNING id`,
    [email, 'BeatControl Demo']
  );
  userId = rows[0].id;
  console.log(`  ✓ Demo-User angelegt: ${email}`);
}

const slug = `demo-gig-${randomBytes(3).toString('hex')}`;
const djToken = randomBytes(16).toString('hex');
const { rows: eventRows } = await c.query(
  `INSERT INTO events (slug, title, dj_id, event_date, active, dj_token)
   VALUES ($1, $2, $3, $4, true, $5) RETURNING id`,
  [slug, TITLE, userId, '2026-08-01', djToken]
);
const eventId = eventRows[0].id;

// Zeitstempel über den Abend verteilen (19:30 bis 00:40), damit die Liste
// nicht wie ein Import aussieht, sondern wie ein gewachsener Abend.
const start = new Date('2026-08-01T19:30:00+02:00').getTime();
const end = new Date('2026-08-02T00:40:00+02:00').getTime();

let totalVotes = 0;
for (const [idx, [title, artist, votes, played]] of SONGS.entries()) {
  const created = new Date(start + ((end - start) * idx) / SONGS.length);
  const { rows: songRows } = await c.query(
    `INSERT INTO songs (event_id, title, artist, played, submitter_ip, created_at)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [eventId, title, artist, played, `demo_sub_${idx}_${randomBytes(4).toString('hex')}`, created.toISOString()]
  );
  for (let v = 0; v < votes; v++) {
    await c.query(`INSERT INTO votes (song_id, voter_ip) VALUES ($1, $2)`, [
      songRows[0].id,
      `demo_voter_${idx}_${v}_${randomBytes(4).toString('hex')}`,
    ]);
    totalVotes++;
  }
}

const playedCount = SONGS.filter((s) => s[3]).length;
console.log(`  ✓ ${SONGS.length} Songs, ${totalVotes} Stimmen, ${playedCount} bereits gespielt`);
console.log(`\n  Gäste-Link:  https://beatcontrol.io/${slug}`);
console.log(`  DJ-Link:     https://beatcontrol.io/dj/${slug}?dj=${djToken}\n`);

await c.end();
