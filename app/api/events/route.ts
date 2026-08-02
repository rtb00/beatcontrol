import { NextRequest, NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';
import { getEffectivePlan, getPlanLimits } from '@/app/lib/plans';

const SLUG_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789';
const SLUG_LENGTH = 8;

function generateSlug(): string {
  const bytes = randomBytes(SLUG_LENGTH);
  let result = '';
  for (let i = 0; i < SLUG_LENGTH; i++) {
    result += SLUG_ALPHABET[bytes[i] % SLUG_ALPHABET.length];
  }
  return result;
}

async function generateUniqueSlug(): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const slug = generateSlug();
    const { rows } = await sql`SELECT 1 FROM events WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return slug;
  }
  throw new Error('Could not generate unique slug after 5 attempts');
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await initDB();

  const { rows } = await sql`
    SELECT
      e.id,
      e.slug,
      e.title,
      e.active,
      e.event_date,
      e.created_at,
      COUNT(s.id)::int AS song_count
    FROM events e
    LEFT JOIN songs s ON s.event_id = e.id
    WHERE e.dj_id = ${userId}
    GROUP BY e.id
    ORDER BY e.active DESC, e.created_at DESC
  `;

  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await initDB();

  const body = await req.json();
  const { title, event_date } = body as { title: string; event_date?: string };

  if (!title?.trim()) {
    return NextResponse.json({ error: 'title required' }, { status: 400 });
  }

  let normalizedDate: string | null = null;
  if (event_date) {
    const d = new Date(event_date);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'invalid event_date' }, { status: 400 });
    }
    normalizedDate = event_date.slice(0, 10);
  }

  // Plan-Check: aktive Events zählen
  const { rows: ownerRows } = await sql`
    SELECT plan, plan_status, current_period_end, event_credits
    FROM users WHERE id = ${userId}
  `;
  const owner = ownerRows[0] ?? { plan: 'free', plan_status: null, current_period_end: null, event_credits: 0 };
  const plan = getEffectivePlan({
    plan: owner.plan,
    plan_status: owner.plan_status,
    current_period_end: owner.current_period_end,
  });
  const limits = getPlanLimits(plan);
  // Ist das Plan-Limit erreicht, springt gekauftes Event-Guthaben ein: das neue
  // Event wird als credit_redeemed markiert und zählt nicht gegen das Limit.
  let redeemCredit = false;
  if (Number.isFinite(limits.maxEvents)) {
    const { rows: countRows } = await sql`
      SELECT COUNT(*)::int AS cnt FROM events
      WHERE dj_id = ${userId} AND active = TRUE AND credit_redeemed = FALSE
    `;
    const eventCount = countRows[0].cnt as number;
    if (eventCount >= limits.maxEvents) {
      if ((owner.event_credits as number) > 0) {
        redeemCredit = true;
      } else {
        return NextResponse.json(
          { error: 'plan_limit', limit: 'events', current: eventCount, max: limits.maxEvents },
          { status: 402 }
        );
      }
    }
  }

  if (redeemCredit) {
    // Guarded decrement: schlägt bei parallelem Verbrauch fehl statt ins Minus zu laufen.
    const { rows: creditRows } = await sql`
      UPDATE users SET event_credits = event_credits - 1
      WHERE id = ${userId} AND event_credits > 0
      RETURNING event_credits
    `;
    if (creditRows.length === 0) {
      return NextResponse.json(
        { error: 'plan_limit', limit: 'events', current: 0, max: limits.maxEvents },
        { status: 402 }
      );
    }
  }

  const slug = await generateUniqueSlug();

  const { rows } = await sql`
    INSERT INTO events (slug, title, dj_id, event_date, credit_redeemed)
    VALUES (
      ${slug},
      ${title.trim()},
      ${userId},
      ${normalizedDate},
      ${redeemCredit}
    )
    RETURNING id, slug, title, active, event_date, created_at, credit_redeemed
  `;
  return NextResponse.json(rows[0], { status: 201 });
}
