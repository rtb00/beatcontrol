import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';
import { getEffectivePlan, getPlanLimits } from '@/app/lib/plans';

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  await initDB();

  const { rows } = await sql`
    SELECT
      e.id, e.slug, e.title, e.active, e.event_date, e.created_at,
      u.plan AS owner_plan,
      u.plan_status AS owner_plan_status,
      u.current_period_end AS owner_current_period_end,
      u.branding_name AS owner_branding_name,
      u.branding_logo_url AS owner_branding_logo_url
    FROM events e
    LEFT JOIN users u ON u.id = e.dj_id
    WHERE e.slug = ${params.slug}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const row = rows[0];

  let brandingName: string | null = null;
  let brandingLogoUrl: string | null = null;
  if (row.owner_plan) {
    const plan = getEffectivePlan({
      plan: row.owner_plan,
      plan_status: row.owner_plan_status,
      current_period_end: row.owner_current_period_end,
    });
    if (getPlanLimits(plan).branding) {
      brandingName = row.owner_branding_name ?? null;
      brandingLogoUrl = row.owner_branding_logo_url ?? null;
    }
  }

  return NextResponse.json({
    id: row.id,
    slug: row.slug,
    title: row.title,
    active: row.active,
    event_date: row.event_date,
    created_at: row.created_at,
    branding_name: brandingName,
    branding_logo_url: brandingLogoUrl,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await initDB();

  const body = await req.json();
  const { active, title, event_date } = body as {
    active?: boolean;
    title?: string;
    event_date?: string | null;
  };

  let normalizedDate: string | null | undefined = undefined;
  if (event_date === null) {
    normalizedDate = null;
  } else if (typeof event_date === 'string') {
    const d = new Date(event_date);
    if (Number.isNaN(d.getTime())) {
      return NextResponse.json({ error: 'invalid event_date' }, { status: 400 });
    }
    normalizedDate = event_date.slice(0, 10);
  }

  const { rows } = await sql`
    UPDATE events
    SET
      active     = COALESCE(${active ?? null}, active),
      title      = COALESCE(${title?.trim() ?? null}, title),
      event_date = CASE
        WHEN ${normalizedDate === undefined ? '__keep__' : 'set'} = 'set'
        THEN ${normalizedDate ?? null}::date
        ELSE event_date
      END
    WHERE slug = ${params.slug}
      AND dj_id = ${session.user.id}
    RETURNING id, slug, title, active, event_date, created_at
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  return NextResponse.json(rows[0]);
}
