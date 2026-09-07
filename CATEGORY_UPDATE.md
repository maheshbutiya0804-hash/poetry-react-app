# Categories + Collections admin update

Implemented:
- Admin `/admin/collections` management page (create/edit/activate/deactivate/delete when unused).
- Admin `/admin/categories` management page with the same behavior.
- Public `GET /api/categories` and protected admin CRUD APIs.
- Card now stores `categoryId` separately from `collectionId`.
- Create/Edit Card loads active Collections and Categories dynamically.
- Admin Cards list displays and filters by Category.

## Database
A new migration was added:

`server/prisma/migrations/20260811180000_add_card_category_relation/migration.sql`

It adds nullable `card.categoryId`, an index, and a foreign key to `category.id`.

Because `20260811094851_add_categories` was already marked applied on Bluehost, Railway's existing `npx prisma migrate deploy` build step should apply only this new relation migration.

If `card.categoryId` has already been manually created in Bluehost, do not run the new migration unchanged; reconcile/mark it applied instead.

## Frontend dependencies
`html-to-image` and `jspdf` were added to root `package.json` because `src/utils/downloadLoveNotePdf.ts` imports them. Run `npm install` once to refresh `package-lock.json`, then `npm run build`.
