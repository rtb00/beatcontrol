// Einmalskript: legt die neuen Pro-Preise (29 €/Monat, 249 €/Jahr) auf dem
// bestehenden Pro-Produkt an. Alte Preise bleiben erhalten (Stripe-Preise sind
// unveränderlich), es werden nur die Env-Variablen auf die neuen IDs umgestellt.
import Stripe from 'stripe';
import { readFileSync } from 'node:fs';

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
const key = env.match(/^STRIPE_SECRET_KEY=(.+)$/m)?.[1]?.trim();
if (!key) throw new Error('STRIPE_SECRET_KEY nicht gefunden');

const stripe = new Stripe(key);
const PRODUCT = 'prod_UaJ0k5y7gcZwLi';

const monthly = await stripe.prices.create({
  product: PRODUCT,
  currency: 'eur',
  unit_amount: 2900,
  recurring: { interval: 'month' },
  nickname: 'Pro monatlich 29',
});
const yearly = await stripe.prices.create({
  product: PRODUCT,
  currency: 'eur',
  unit_amount: 24900,
  recurring: { interval: 'year' },
  nickname: 'Pro jaehrlich 249',
});
console.log('STRIPE_PRICE_PRO_MONTHLY=' + monthly.id);
console.log('STRIPE_PRICE_PRO_YEARLY=' + yearly.id);
