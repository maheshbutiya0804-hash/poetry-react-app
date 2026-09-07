# Bulk PDF ZIP Upload – deployment steps

## What was added
- Admin `/admin/cards/bulk-upload` page.
- ZIP upload by collection; categories are not required.
- Background import job persisted in MySQL.
- Per-PDF validation and status tracking.
- PDF filename -> card title conversion.
- PDF files stored under the existing `storage/cards/<card-id>/master.pdf` structure.
- Admin Create/Edit Card no longer requires a category.
- Category navigation removed from the admin sidebar (existing category tables/routes are retained for backward compatibility).

## Required database migration
The new Prisma migration is:
`server/prisma/migrations/20260814150000_add_bulk_pdf_import/migration.sql`

It creates `cardimportjob` and `cardimportitem` only. The existing `card.categoryId` is already nullable, so no card-table migration is required for category-free imports.

## Railway server changes
1. Deploy this updated server code.
2. Build command can remain `npm install && npx prisma generate`.
3. Pre-deploy command should remain `npx prisma migrate deploy`.
4. The server now depends on `unzipper`; `npm install` will install it from `server/package.json`.
5. Strongly recommended: attach a Railway Volume and mount it at `/app/storage`, then add `STORAGE_ROOT=/app/storage` to the server variables. Without persistent storage, uploaded PDFs can disappear when Railway replaces/redeploys the container.

## Limits
- ZIP: 750 MB maximum.
- Up to 2,000 PDFs per ZIP.
- Each PDF: 40 MB maximum.
- PDFs are processed one at a time to reduce memory usage.

## Preview images
This phase imports and stores the original PDFs. It does NOT rasterize page 1 into WebP/JPEG yet. The next phase should add automatic preview generation (or client-side PDF.js thumbnails) for the collection card grid.
