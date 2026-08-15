# Library Gate + Forum + Share Story Phase

## Added
- Subscriber gate on `/library` matching the supplied locked-library reference.
- Active subscribers retain saved-card Library, protected PDF view/download, search, and used/not-used filters.
- `/forum` Shared Moments page with dynamic active collection filters and search.
- `/forum/share` story form with name/anonymous toggle and required saved-card selection.
- Community posts persist to MySQL and are immediately available to the existing Admin > Community moderation screen.
- Each story stores the selected card and collection so the forum can render the attached card preview.

## Access rules
- Forum browsing: authenticated user.
- Library contents: authenticated + ACTIVE non-expired subscription.
- Share Story: authenticated + ACTIVE non-expired subscription + selected card already saved in Library.
- Original PDF access remains protected by the existing subscription-protected PDF route.

## Database migration
Migration: `server/prisma/migrations/20260815093000_community_saved_card_stories/migration.sql`

Adds nullable `collectionId` and `cardId`, plus `isAnonymous`, to `communitypost`.

## Railway
Keep the existing commands:

Build:
`npm install && npx prisma generate`

Pre-deploy:
`npx prisma migrate deploy`

No new Railway environment variables are required for this phase.
