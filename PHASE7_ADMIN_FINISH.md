# Phase 7 – Notifications, Community, Settings

This phase replaces the remaining admin placeholders with MySQL-backed pages matching the supplied Heartstring Notes admin references.

## Added Prisma models
- `NotificationJob`
- `CommunityPost`
- `CommunityResponse`
- `SystemSetting`

## Routes
- `/admin/notifications`
- `/admin/community`
- `/admin/settings`

## Backend APIs
- `GET /api/admin/notifications`
- `POST /api/admin/notifications`
- `PATCH /api/admin/notifications/:jobId/status`
- `GET /api/admin/community`
- `PATCH /api/admin/community/posts/:postId`
- `PATCH /api/admin/community/responses/:responseId`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`

## Important notification note
Notification submissions are persisted as real queue/history records in MySQL. SMTP/email and SMS provider delivery are intentionally not faked; connect the chosen providers in a later phase.

## Apply database changes
From `server`:

```bat
npx prisma generate
npx prisma migrate dev --name add_notifications_community_settings
npm run dev
```
