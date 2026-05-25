import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';
import { getStripe, isStripeConfigured } from '@/app/lib/stripe';
import { validateSubdomain } from '@/app/lib/branding';
import { getEffectivePlan } from '@/app/lib/plans';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await initDB();

  const body = await req.json().catch(() => ({}));
  const { name, brandingName, brandingLogoUrl, subdomain } = body as {
    name?: string | null;
    brandingName?: string | null;
    brandingLogoUrl?: string | null;
    subdomain?: string | null;
  };

  if (name !== undefined) {
    const trimmed = typeof name === 'string' ? name.trim() : '';
    if (trimmed.length > 100) {
      return NextResponse.json({ error: 'name too long' }, { status: 400 });
    }
    await sql`UPDATE users SET name = ${trimmed || null} WHERE id = ${userId}`;
  }

  if (brandingName !== undefined) {
    const trimmed = typeof brandingName === 'string' ? brandingName.trim() : '';
    if (trimmed.length > 80) {
      return NextResponse.json({ error: 'brandingName too long' }, { status: 400 });
    }
    await sql`UPDATE users SET branding_name = ${trimmed || null} WHERE id = ${userId}`;
  }

  if (brandingLogoUrl !== undefined) {
    const trimmed = typeof brandingLogoUrl === 'string' ? brandingLogoUrl.trim() : '';
    if (trimmed && !/^https?:\/\//i.test(trimmed)) {
      return NextResponse.json({ error: 'brandingLogoUrl must be http(s) URL' }, { status: 400 });
    }
    if (trimmed.length > 500) {
      return NextResponse.json({ error: 'brandingLogoUrl too long' }, { status: 400 });
    }
    await sql`UPDATE users SET branding_logo_url = ${trimmed || null} WHERE id = ${userId}`;
  }

  if (subdomain !== undefined) {
    const trimmed = typeof subdomain === 'string' ? subdomain.trim() : '';
    if (trimmed === '') {
      await sql`UPDATE users SET subdomain = NULL WHERE id = ${userId}`;
    } else {
      const { rows: userRows } = await sql`
        SELECT plan, plan_status, current_period_end FROM users WHERE id = ${userId}
      `;
      const effective = getEffectivePlan({
        plan: userRows[0]?.plan,
        plan_status: userRows[0]?.plan_status,
        current_period_end: userRows[0]?.current_period_end,
      });
      if (effective !== 'studio') {
        return NextResponse.json(
          { error: 'Subdomain ist nur im Studio-Tarif verfügbar.' },
          { status: 402 }
        );
      }
      const v = validateSubdomain(trimmed);
      if (!v.ok) {
        return NextResponse.json({ error: v.reason }, { status: 400 });
      }
      const { rows: dupe } = await sql`
        SELECT id FROM users WHERE LOWER(subdomain) = ${v.value} AND id != ${userId}
      `;
      if (dupe.length > 0) {
        return NextResponse.json(
          { error: 'Diese Subdomain ist bereits vergeben.' },
          { status: 409 }
        );
      }
      await sql`UPDATE users SET subdomain = ${v.value} WHERE id = ${userId}`;
    }
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  await initDB();

  // Look up Stripe customer first so we can clean up after the row is gone.
  const { rows } = await sql`
    SELECT stripe_customer_id FROM users WHERE id = ${userId}
  `;
  const stripeCustomerId = rows[0]?.stripe_customer_id as string | null | undefined;

  // Cascades take care of events → songs → votes, plus auth tables.
  await sql`DELETE FROM users WHERE id = ${userId}`;

  if (stripeCustomerId && isStripeConfigured()) {
    try {
      await getStripe().customers.del(stripeCustomerId);
    } catch (err) {
      // Best-effort; user data is already gone on our side.
      console.error('[account] stripe customer delete failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
