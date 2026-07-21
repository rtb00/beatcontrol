import { NextRequest, NextResponse } from 'next/server';
import { initDB, sql } from '@/app/lib/db';
import { auth } from '@/auth';
import { getStripe, isStripeConfigured, STRIPE_PRICE_IDS, type StripeTier } from '@/app/lib/stripe';

export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  }

  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const tier = body.tier as StripeTier;
  const eventDate = typeof body.event_date === 'string' ? body.event_date : null;
  if (!tier || !(tier in STRIPE_PRICE_IDS)) {
    return NextResponse.json({ error: 'invalid tier' }, { status: 400 });
  }
  // Server-side validation of the client-supplied event date for the pay-per-use
  // pass: must be a real date and not absurdly far in the future. Never trust the client.
  if (eventDate && tier === 'event_pass') {
    const parsed = new Date(eventDate);
    const maxAhead = new Date();
    maxAhead.setFullYear(maxAhead.getFullYear() + 1);
    if (Number.isNaN(parsed.getTime()) || parsed > maxAhead) {
      return NextResponse.json({ error: 'invalid event_date' }, { status: 400 });
    }
  }
  const priceId = STRIPE_PRICE_IDS[tier];
  if (!priceId) {
    return NextResponse.json({ error: 'price not configured for tier' }, { status: 503 });
  }

  await initDB();

  const stripe = getStripe();
  const userId = session.user.id;

  // Lazy-create stripe customer
  const { rows } = await sql`
    SELECT stripe_customer_id, name FROM users WHERE id = ${userId}
  `;
  let customerId = rows[0]?.stripe_customer_id as string | null;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      name: rows[0]?.name ?? session.user.name ?? undefined,
      metadata: { user_id: userId },
    });
    customerId = customer.id;
    await sql`
      UPDATE users SET stripe_customer_id = ${customerId} WHERE id = ${userId}
    `;
  }

  const origin = req.headers.get('origin') ?? new URL(req.url).origin;

  const isSubscription =
    tier === 'pro_monthly' ||
    tier === 'pro_yearly' ||
    tier === 'studio_monthly' ||
    tier === 'studio_yearly';

  const checkout = await stripe.checkout.sessions.create({
    mode: isSubscription ? 'subscription' : 'payment',
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    automatic_tax: { enabled: true },
    customer_update: { address: 'auto', name: 'auto' },
    billing_address_collection: 'required',
    allow_promotion_codes: true,
    // Bei 0-€-Checkouts (100%-Promo-Code, z.B. Pilot-Testzugänge) keine
    // Kartendaten verlangen. Nach Ablauf des Coupons scheitert die nächste
    // Abrechnung mangels Zahlungsmethode und das Abo läuft aus, statt den
    // Tester unerwartet zu belasten. Bei bezahlten Checkouts verlangt Stripe
    // weiterhin normal die Zahlungsmethode.
    payment_method_collection: 'if_required',
    success_url: `${origin}/dj?checkout=success`,
    cancel_url: `${origin}/pricing`,
    client_reference_id: userId,
    metadata: { user_id: userId, tier, event_date: eventDate ?? '' },
    ...(isSubscription
      ? { subscription_data: { metadata: { user_id: userId, tier } } }
      : { payment_intent_data: { metadata: { user_id: userId, tier, event_date: eventDate ?? '' } } }),
  });

  return NextResponse.json({ url: checkout.url });
}
