# Phase 4 — Requests + Orders (MySQL)

This phase adds real MySQL-backed admin Requests and Orders pages matching the supplied Heartstring Notes admin references.

## New Prisma models
- `PoetryRequest`
- `CardOrder`

## New admin routes
- `/admin/requests`
- `/admin/orders`
- `/admin/orders/:orderId`

## New API routes
- `GET /api/admin/requests`
- `PATCH /api/admin/requests/:requestId/status`
- `GET /api/admin/orders`
- `GET /api/admin/orders/:orderId`
- `PATCH /api/admin/orders/:orderId/status`
- `PATCH /api/admin/orders/:orderId/reviewed`

## Apply MySQL changes
From the `server` directory:

```bat
npx prisma generate
npx prisma migrate dev --name add_requests_orders
npm run prisma:seed
npm run dev
```

Then start the frontend from the project root:

```bat
npm run dev
```

Open:
- http://localhost:5173/admin/requests
- http://localhost:5173/admin/orders

The seed adds one neutral demo physical-card order so the Orders table can be verified immediately. It does not add a poetry request, so the Requests page initially shows the same empty-state pattern as the supplied admin screenshot.
