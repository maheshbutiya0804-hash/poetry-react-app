# Twilio SMS integration

Laurentine's Admin → Notifications page can send SMS through Twilio Programmable Messaging.

## Server environment

Add these values to `server/.env` (never to the frontend `.env`):

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-secret-auth-token
TWILIO_PHONE_NUMBER=+14155550123
```

Restart the API after changing environment variables.

## Phone number format

Recipient numbers need a country code (E.164), for example `+14155550134` or `+919876543210`.
Spaces, parentheses, dots and dashes are removed automatically, but Laurentine does not guess a missing country code.

## Testing

1. Start the backend.
2. Open Admin → Notifications.
3. Choose `SMS` and `Single User`.
4. Select a user with a phone number, or enter a test number including country code.
5. Enter a short message and click `Send Notification`.
6. The notification history updates to `SENT` when Twilio accepts at least one SMS. `sentCount` and `failedCount` are recorded for broadcasts.

If the Twilio account is still in trial mode, Twilio account restrictions can limit which recipients are eligible for test messages.
