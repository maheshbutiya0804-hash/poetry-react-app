# Laurentine Admin / Personalization Fixes

Implemented on top of `laurentine-card-personalization-v1`.

1. Personalized PDF footer no longer paints a cream rectangle over the card; footer text sits directly on the original card background.
2. Admin Subscriptions → Subscriber List → View Details opens the latest relevant Stripe Dashboard record in a new tab.
3. Successful Stripe subscription payments are persisted immediately from checkout confirmation / checkout webhook using the Stripe invoice id, while `invoice.paid` safely upserts the same transaction. This makes Recent Transactions reliable without duplicates.
4. Server-side pagination added for Cards, Users, Subscriptions, Recent Transactions, Requests, Challenges, Orders, Notification Jobs, Community posts, and Bulk PDF import items. Taxonomy tables also have pagination UI.
5. Admin logout remains connected to the real auth logout flow and is pinned to the bottom of the desktop sidebar.

No new Prisma migration or environment variable is required for these fixes.
