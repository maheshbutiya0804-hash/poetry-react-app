# Laurentine subscription + library + physical orders v3

## Added
- Stripe webhook signature verification and subscription synchronization.
- Stripe Checkout returns to the card detail page and shows the Subscription Active modal after server confirmation.
- Subscription status, next billing date, Stripe customer/subscription IDs, and payment transactions are stored in MySQL.
- Stripe Billing Portal endpoint used by Profile > Manage.
- Saved Library database model and API, with subscriber-only save and subscriber-only original PDF view/download.
- Physical card order checkout page ($7.99/card + system printing fee; shipping quoted later).
- Physical orders are stored in `cardorder` and automatically appear in Admin > Orders.
- Admin order detail can set the shipping quote and then continue fulfillment status updates.

## Railway / Stripe setup
1. Keep `STRIPE_SECRET_KEY`, `STRIPE_MONTHLY_PRICE_ID`, `FRONTEND_URL`, and `STORAGE_ROOT`.
2. Add `STRIPE_WEBHOOK_SECRET=whsec_...` to the API service.
3. In Stripe Test mode create a webhook endpoint:
   `https://api.laurentine.co/billing/stripe-webhook`
4. Subscribe it to:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.paid
   - invoice.payment_failed
5. Enable/configure Stripe Customer Portal in test mode if Profile > Manage should open the portal.

## Railway commands
Build:
`npm install && npx prisma generate`

Pre-deploy:
`npx prisma migrate deploy`

The migration `20260814164500_subscription_library_physical_orders` creates `savedcard` and adds Stripe/order fields.
