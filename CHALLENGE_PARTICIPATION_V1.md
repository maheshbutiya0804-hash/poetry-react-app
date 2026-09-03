# Challenge Participation Tracking

This update adds subscriber challenge progress tracking.

## User flow
1. Choose a published Love Note.
2. Choose one Where to Leave It location.
3. Click **I Completed It**.
4. The choice and completion state persist in the database and reload on return.

## Stored per user/challenge
- selected Love Note (`selectedCardId`)
- selected Where to Leave It location (`selectedLocation`)
- status (`STARTED` / `COMPLETED`)
- started/completed timestamps

## Migration
Run in production:

```bash
npx prisma migrate deploy
npx prisma generate
```

Migration: `20260901112000_challenge_participation`
