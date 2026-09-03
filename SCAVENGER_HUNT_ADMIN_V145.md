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
