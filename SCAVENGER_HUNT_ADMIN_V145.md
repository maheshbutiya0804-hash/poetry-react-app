# Scavenger Hunt Admin v1.45

- Adds dedicated Admin -> Scavenger Hunt navigation and management page.
- Admin can add, edit, delete, activate/deactivate, reorder, and optionally upload an image for hiding-location suggestions.
- Adds public `GET /scavenger-locations`; `/scavenger-hunt` now reads active locations from the database in display order.
- Seeds the client's supplied hiding-location ideas in the migration.
- Monthly Challenges remain separate and keep their existing participation tracking.

## Database migration
Run after deployment:

    npx prisma migrate deploy
    npx prisma generate

Migration: `20260903115000_scavenger_locations`

This migration creates the new `scavengerlocation` table and does not delete existing challenge, card, user, subscription, or participation data.

## v1.45 upload reliability fix
- Scavenger location images are persisted from Multer memory storage into `storage/scavenger`.
- Public image assets are served from `/uploads/scavenger`.
- Only JPEG, PNG, and WebP files are accepted.
- Replacing an image cleans up the old file when the extension changes.
- Deleting a scavenger location also deletes its stored image.
- Status updates now require an actual boolean value.
