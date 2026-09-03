# Laurentine Automatic SMS Setup

## Database
After deploying this version, run from `server/`:

```bash
npx prisma generate
npx prisma migrate deploy
```

For local development, use `npx prisma migrate dev` instead of `migrate deploy` when appropriate.

## Environment
Keep the existing Twilio values and add a long random scheduler secret:

```env
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...
SMS_CRON_SECRET=replace-with-a-long-random-secret
```

## Admin controls
Admin → Settings → Automatic SMS Controls contains:

- Automatic SMS (master switch)
- Poetry request received
- Poetry request completed
- Card order updates
- Challenge reminders
- Subscription notifications

Manual SMS sent from Admin → Notifications is intentionally independent of the automatic SMS master switch.

## Challenge reminder scheduler
Challenge SMS reminders need one daily scheduler call. Configure the hosting provider / cron service to POST once per day to:

`/internal/challenge-reminders/run`

with request header:

`x-cron-secret: <SMS_CRON_SECRET>`

The endpoint only processes published challenges for the current month and today's configured reminder day. `lastSmsSentAt` prevents the same reminder from being processed repeatedly on the same day.
