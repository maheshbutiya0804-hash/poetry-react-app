# Heartstring Notes Admin — Phase 3 (MySQL)

This phase adds the real User Details screen and the Challenges management/create workflow shown in the supplied Heartstring Notes admin references.

## New routes

- `/admin/users/:userId`
- `/admin/challenges`
- `/admin/challenges/create`

## Database changes

- `Subscription.cancelAtPeriodEnd`
- `Challenge`
- `ChallengeReminder`

Run from `server/`:

```bash
npx prisma generate
npx prisma migrate dev --name add_challenges_and_user_detail
npm run dev
```

The challenge create API supports JPG/PNG/WebP artwork up to the existing Multer limit and saves artwork under `server/storage/challenges/<id>/`.

## New API routes

- `GET /api/admin/users/:userId`
- `GET /api/admin/challenges`
- `GET /api/admin/challenges/:challengeId`
- `POST /api/admin/challenges`
- `PATCH /api/admin/challenges/:challengeId/status`
- `DELETE /api/admin/challenges/:challengeId`

Admin authentication is still the next security milestone. Do not expose `/api/admin/*` publicly until authentication/authorization middleware is added.
