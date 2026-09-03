# Subscriber Challenges Frontend

This build adds `/challenges` to the signed-in site navigation after Library.

## Database update
From the `server` folder run:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development, use `npx prisma migrate dev` instead of `migrate deploy` if desired.

The migration adds per-user challenge notification preferences:
- `challengeEmailEnabled`
- `challengeSmsEnabled`

Both default to `true` for existing and new users.

## Behavior
- `/challenges` requires authentication.
- The API also requires an active, non-expired subscription.
- The current month's PUBLISHED Admin Challenge is displayed automatically.
- If none is published, the supplied "No current challenge yet" UI is shown.
- Challenge Email/SMS toggles persist per user.
- Challenge reminder/release SMS respects both Admin automatic SMS controls and the user's Challenge SMS preference.
