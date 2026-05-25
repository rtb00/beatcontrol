import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL,
  max: 3,
});

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name            TEXT,
      email           TEXT UNIQUE,
      "emailVerified" TIMESTAMPTZ,
      image           TEXT,
      password        TEXT
    )
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT`);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown; name?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ungültige Anfrage' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Bitte eine gültige Email-Adresse angeben.' }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Passwort muss mindestens 8 Zeichen lang sein.' }, { status: 400 });
  }

  await ensureUsersTable();

  const { rows: existing } = await pool.query<{ id: string; password: string | null }>(
    `SELECT id, password FROM users WHERE email = $1 LIMIT 1`,
    [email]
  );
  if (existing[0]?.password) {
    return NextResponse.json({ error: 'Diese Email ist bereits registriert.' }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 10);

  if (existing[0]) {
    await pool.query(
      `UPDATE users SET password = $1, name = COALESCE(NULLIF($2, ''), name) WHERE id = $3`,
      [hash, name, existing[0].id]
    );
  } else {
    await pool.query(
      `INSERT INTO users (email, password, name) VALUES ($1, $2, NULLIF($3, ''))`,
      [email, hash, name]
    );
  }

  return NextResponse.json({ ok: true });
}
