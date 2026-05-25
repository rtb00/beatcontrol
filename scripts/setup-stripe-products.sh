#!/usr/bin/env bash
# Setup Stripe Products + Prices für BeatControl
#
# Voraussetzung:
#   - Stripe CLI installiert: brew install stripe/stripe-cli/stripe
#   - Eingeloggt: stripe login
#   - 1Password CLI: brew install --cask 1password-cli
#   - 1Password Vault namens "BeatControl" existiert (oder OP_VAULT env-var setzen)
#
# Dieses Script:
#   1. Legt 3 Products an: Event-Pass, Pro, Studio
#   2. Legt die zugehörigen Prices an (monatlich + jährlich für Pro/Studio, einmalig für Event-Pass)
#   3. Speichert alle Price-IDs in 1Password unter "BeatControl Stripe Prices"
#
# Aufruf:
#   ./scripts/setup-stripe-products.sh
#   ./scripts/setup-stripe-products.sh --dry-run  # zeigt nur, was passieren würde
#
# Nach erfolgreichem Run: ENV-Vars via `op read` in Vercel-ENV pumpen (siehe unten).

set -euo pipefail

DRY_RUN=false
if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
  echo "🔍 DRY-RUN — nichts wird wirklich angelegt"
fi

OP_VAULT="${OP_VAULT:-BeatControl}"
OP_ITEM="BeatControl Stripe Prices"

# Sanity Checks
command -v stripe >/dev/null 2>&1 || { echo "❌ stripe CLI fehlt. brew install stripe/stripe-cli/stripe"; exit 1; }
command -v op >/dev/null 2>&1 || { echo "❌ op (1Password CLI) fehlt. brew install --cask 1password-cli"; exit 1; }

# Stripe-Auth prüfen
if ! stripe config --list >/dev/null 2>&1; then
  echo "❌ Stripe nicht eingeloggt. Run: stripe login"
  exit 1
fi

run_stripe() {
  if $DRY_RUN; then
    echo "[dry-run] stripe $*"
    echo "fake_id_$(date +%s%N)"
  else
    stripe "$@"
  fi
}

echo "🎵 BeatControl Stripe Setup gestartet"

# 1) Event-Pass — One-time payment €19,00
echo "→ Erstelle Product: BeatControl Event-Pass"
EVENT_PASS_PRODUCT=$(run_stripe products create \
  --name="BeatControl Event-Pass" \
  --description="Einmalige Hochzeits-Wunschliste, 30 Tage vor bis 1 Tag nach der Feier gültig." \
  --metadata="tier=event_pass" \
  --metadata="brand=beatcontrol" \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')

EVENT_PASS_PRICE=$(run_stripe prices create \
  --product="$EVENT_PASS_PRODUCT" \
  --currency=eur \
  --unit-amount=1900 \
  --metadata="tier=event_pass" \
  --tax-behavior=inclusive \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
echo "  ✓ Event-Pass: $EVENT_PASS_PRICE"

# 2) Pro — Monthly €59,99 + Yearly €599,88
echo "→ Erstelle Product: BeatControl Pro"
PRO_PRODUCT=$(run_stripe products create \
  --name="BeatControl Pro" \
  --description="Für aktive Hochzeits-DJs: unbegrenzt Events, Branding, Export." \
  --metadata="tier=pro" \
  --metadata="brand=beatcontrol" \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')

PRO_MONTHLY_PRICE=$(run_stripe prices create \
  --product="$PRO_PRODUCT" \
  --currency=eur \
  --unit-amount=5999 \
  --recurring="interval=month" \
  --metadata="tier=pro_monthly" \
  --tax-behavior=inclusive \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
echo "  ✓ Pro Monthly: $PRO_MONTHLY_PRICE"

PRO_YEARLY_PRICE=$(run_stripe prices create \
  --product="$PRO_PRODUCT" \
  --currency=eur \
  --unit-amount=59988 \
  --recurring="interval=year" \
  --metadata="tier=pro_yearly" \
  --tax-behavior=inclusive \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
echo "  ✓ Pro Yearly: $PRO_YEARLY_PRICE"

# 3) Studio — Monthly €149 + Yearly €1488
echo "→ Erstelle Product: BeatControl Studio"
STUDIO_PRODUCT=$(run_stripe products create \
  --name="BeatControl Studio" \
  --description="Whitelabel für DJ-Akademien und Eventagenturen: Sub-Accounts, Custom-Domain, eigenes Branding." \
  --metadata="tier=studio" \
  --metadata="brand=beatcontrol" \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')

STUDIO_MONTHLY_PRICE=$(run_stripe prices create \
  --product="$STUDIO_PRODUCT" \
  --currency=eur \
  --unit-amount=14900 \
  --recurring="interval=month" \
  --metadata="tier=studio_monthly" \
  --tax-behavior=inclusive \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
echo "  ✓ Studio Monthly: $STUDIO_MONTHLY_PRICE"

STUDIO_YEARLY_PRICE=$(run_stripe prices create \
  --product="$STUDIO_PRODUCT" \
  --currency=eur \
  --unit-amount=148800 \
  --recurring="interval=year" \
  --metadata="tier=studio_yearly" \
  --tax-behavior=inclusive \
  | grep -E '"id":' | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
echo "  ✓ Studio Yearly: $STUDIO_YEARLY_PRICE"

# Webhook-Endpoint
echo "→ Erstelle Webhook-Endpoint"
WEBHOOK=$(run_stripe webhook_endpoints create \
  --url="https://beatcontrol.io/api/stripe/webhook" \
  --enabled-events="checkout.session.completed" \
  --enabled-events="customer.subscription.updated" \
  --enabled-events="customer.subscription.deleted" \
  --enabled-events="invoice.paid" \
  --enabled-events="invoice.payment_failed" \
  | grep -E '"secret":' | head -1 | sed -E 's/.*"secret": *"([^"]+)".*/\1/')
echo "  ✓ Webhook Secret extrahiert"

# 4) In 1Password speichern (falls nicht dry-run)
if ! $DRY_RUN; then
  echo "→ Speichere in 1Password vault '$OP_VAULT'"

  # Item anlegen oder updaten
  if op item get "$OP_ITEM" --vault="$OP_VAULT" >/dev/null 2>&1; then
    echo "  (Item existiert, wird ersetzt)"
    op item delete "$OP_ITEM" --vault="$OP_VAULT"
  fi

  op item create \
    --vault="$OP_VAULT" \
    --category="Secure Note" \
    --title="$OP_ITEM" \
    "STRIPE_PRICE_EVENT_PASS=$EVENT_PASS_PRICE" \
    "STRIPE_PRICE_PRO_MONTHLY=$PRO_MONTHLY_PRICE" \
    "STRIPE_PRICE_PRO_YEARLY=$PRO_YEARLY_PRICE" \
    "STRIPE_PRICE_STUDIO_MONTHLY=$STUDIO_MONTHLY_PRICE" \
    "STRIPE_PRICE_STUDIO_YEARLY=$STUDIO_YEARLY_PRICE" \
    "STRIPE_WEBHOOK_SECRET=$WEBHOOK"
  echo "  ✓ In 1Password gespeichert"
fi

cat <<EOF

✅ Setup abgeschlossen.

Nächste Schritte:

1. Diese Vars in Vercel-ENV pumpen (Production):

   vercel env add STRIPE_PRICE_EVENT_PASS production    # $EVENT_PASS_PRICE
   vercel env add STRIPE_PRICE_PRO_MONTHLY production   # $PRO_MONTHLY_PRICE
   vercel env add STRIPE_PRICE_PRO_YEARLY production    # $PRO_YEARLY_PRICE
   vercel env add STRIPE_PRICE_STUDIO_MONTHLY production # $STUDIO_MONTHLY_PRICE
   vercel env add STRIPE_PRICE_STUDIO_YEARLY production  # $STUDIO_YEARLY_PRICE
   vercel env add STRIPE_WEBHOOK_SECRET production       # (siehe 1Password)

   ODER direkt aus 1Password:

   op read "op://$OP_VAULT/$OP_ITEM/STRIPE_PRICE_EVENT_PASS" | vercel env add STRIPE_PRICE_EVENT_PASS production
   (... für alle anderen analog)

2. STRIPE_SECRET_KEY in Vercel-ENV setzen (aus Stripe Dashboard kopieren)

3. Production-Deployment triggern (Auto-Deploy bei Push, oder manuell:
   vercel --prod)

4. Erstes Test-Checkout über /pricing durchklicken
EOF
