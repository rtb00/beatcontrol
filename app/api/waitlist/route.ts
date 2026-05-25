import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  const body = await req.json().catch(() => ({}));
  const { email, selected_tier, pricing_variant, utm_source } = body;

  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    return NextResponse.json({ error: 'valid email required' }, { status: 400 });
  }

  await sql`
    INSERT INTO waitlist (email, selected_tier, pricing_variant, utm_source)
    VALUES (
      ${email.trim().toLowerCase()},
      ${selected_tier ?? null},
      ${pricing_variant ?? null},
      ${utm_source ?? null}
    )
  `;

  return NextResponse.json({ ok: true });
}
