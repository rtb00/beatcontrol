import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';

export async function POST(req: NextRequest) {
  await initDB();
  const body = await req.json().catch(() => ({}));
  const { event_type, pricing_variant, tier_clicked, fingerprint } = body;

  if (!event_type) {
    return NextResponse.json({ error: 'event_type required' }, { status: 400 });
  }

  await sql`
    INSERT INTO analytics (event_type, pricing_variant, tier_clicked, fingerprint)
    VALUES (
      ${event_type},
      ${pricing_variant ?? null},
      ${tier_clicked ?? null},
      ${fingerprint ?? null}
    )
  `;

  return NextResponse.json({ ok: true });
}
