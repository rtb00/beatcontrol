import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

// Load .env.local
const __dir = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dir, '../.env.local');
for (const line of readFileSync(envPath, 'utf8').split('\n')) {
  const m = line.match(/^([^#=\s]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m) process.env[m[1]] = m[2].replace(/\\n$/, '').trim();
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL_UNPOOLED, ssl: { rejectUnauthorized: false } });

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) { console.error('GROQ_API_KEY missing'); process.exit(1); }

async function getGenreAndSuggestions(title, artist) {
  const fallback = { genre: 'Unbekannt', suggestions: [] };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: 'Du bist ein Musik-Experte und DJ. Antworte NUR mit einem JSON-Objekt. Keine Erklärungen.' },
          { role: 'user', content: `Für den Song "${title}" von "${artist}": 1) Bestimme das Genre (ein Wort, z.B. Pop, Rock, Hip-Hop, Schlager, EDM, R&B, Latin, Jazz, Klassik). 2) Schlage 3 Songs vor die gut danach passen würden (Titel - Artist Format). Antwort als JSON: {"genre": "...", "suggestions": ["Song1 - Artist1", "Song2 - Artist2", "Song3 - Artist3"]}` },
        ],
        temperature: 0.3,
        max_tokens: 200,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) { console.warn(`  Groq HTTP ${res.status}`); return fallback; }
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start === -1 || end === -1) return fallback;
    const parsed = JSON.parse(content.slice(start, end + 1));
    return {
      genre: typeof parsed.genre === 'string' && parsed.genre.trim() ? parsed.genre.trim() : 'Unbekannt',
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions.filter(s => typeof s === 'string').slice(0, 3) : [],
    };
  } catch (e) {
    console.warn(`  Error: ${e.message}`);
    return fallback;
  }
}

async function main() {
  const { rows: songs } = await pool.query(
    `SELECT id, title, artist FROM songs WHERE genre IS NULL ORDER BY created_at ASC`
  );

  console.log(`Found ${songs.length} song(s) to backfill.\n`);
  if (songs.length === 0) { await pool.end(); return; }

  let ok = 0, failed = 0;
  for (const song of songs) {
    console.log(`[${ok + failed + 1}/${songs.length}] "${song.title}" — ${song.artist}`);
    const { genre, suggestions } = await getGenreAndSuggestions(song.title, song.artist);
    console.log(`  → genre: ${genre}  suggestions: ${JSON.stringify(suggestions)}`);

    if (genre !== 'Unbekannt' || suggestions.length > 0) {
      await pool.query(
        `UPDATE songs SET genre = $1, suggestions = $2 WHERE id = $3`,
        [genre, JSON.stringify(suggestions), song.id]
      );
      ok++;
    } else {
      // Still write Unbekannt so we don't retry endlessly
      await pool.query(`UPDATE songs SET genre = $1, suggestions = $2 WHERE id = $3`, [genre, '[]', song.id]);
      failed++;
    }

    // 1200ms pause between calls to stay within Groq free-tier rate limits
    if (ok + failed < songs.length) await new Promise(r => setTimeout(r, 1200));
  }

  console.log(`\nDone. ${ok} enriched, ${failed} fallback.`);
  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });
