# Subscriber Poetry Requests API

This build connects the subscriber poetry request form to the backend.

## Deployment

From `server/` run the normal Prisma deployment steps used by this project so the new nullable fields are added to `poetryrequest`:

```bash
npx prisma generate
npx prisma migrate deploy
```

For a local development database, `npx prisma migrate dev` can be used instead of `migrate deploy`.

## Access rule

Both `GET /poetry-requests` and `POST /poetry-requests` require:

- an authenticated user session; and
- a subscription whose status is `ACTIVE` and whose `currentPeriodEnd` is either null or in the future.

The API returns HTTP 403 when subscription access is not active.
