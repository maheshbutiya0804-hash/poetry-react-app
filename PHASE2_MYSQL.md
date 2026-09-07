# Admin Phase 2 — MySQL migration

This revision adds database-backed Users and Subscriptions & Payments admin screens.

From `server/` run:

```bat
npx prisma generate
npx prisma migrate dev --name add_users_subscriptions
npm run prisma:seed
npm run dev
```

The migration creates:

- `User`
- `Subscription`
- `PaymentTransaction`

The seed adds neutral local demo records (`admin@heartstringnotes.local` and `member@heartstringnotes.local`) so the new admin pages have data to render. Remove those records when real authentication is connected.

Admin pages:

- `http://localhost:5173/admin/users`
- `http://localhost:5173/admin/subscriptions`

Backend endpoints:

- `GET /api/admin/users`
- `PATCH /api/admin/users/:userId/status`
- `GET /api/admin/subscriptions`

These admin APIs are still development-only and must be protected before production deployment.
