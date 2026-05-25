import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  _stripe = new Stripe(key, {
    apiVersion: '2026-04-22.dahlia',
    appInfo: { name: 'BeatControl', version: '0.1.0', url: 'https://beatcontrol.io' },
  });
  return _stripe;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export const STRIPE_PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRICE_PRO_MONTHLY ?? '',
  pro_yearly: process.env.STRIPE_PRICE_PRO_YEARLY ?? '',
  event_pass: process.env.STRIPE_PRICE_EVENT_PASS ?? '',
  studio_monthly: process.env.STRIPE_PRICE_STUDIO_MONTHLY ?? '',
  studio_yearly: process.env.STRIPE_PRICE_STUDIO_YEARLY ?? '',
} as const;

export type StripeTier = keyof typeof STRIPE_PRICE_IDS;
