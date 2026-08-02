// Einmalskript: legt das Credit-Pack (5 Hochzeiten für 69 €) im Live-Modus an.
import Stripe from 'stripe';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const key = env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1]?.trim();
if (!key?.startsWith('sk_live_')) throw new Error('Live-Key fehlt in .env.local');

const stripe = new Stripe(key);

const existing = await stripe.products.search({ query: 'name:"BeatControl 5er-Pack" AND active:"true"' });
const product =
  existing.data[0] ??
  (await stripe.products.create({
    name: 'BeatControl 5er-Pack',
    description: 'Guthaben für 5 Hochzeiten. Einlösbar wann du willst, verfällt nicht.',
  }));

const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 });
const price =
  prices.data.find((p) => p.unit_amount === 6900 && p.currency === 'eur' && !p.recurring) ??
  (await stripe.prices.create({
    product: product.id,
    currency: 'eur',
    unit_amount: 6900,
    nickname: '5er-Pack 69',
  }));

console.log('STRIPE_PRICE_CREDIT_PACK_5=' + price.id);
