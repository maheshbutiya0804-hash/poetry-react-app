# Bulk PDF Preview + Subscriber PDF Access

## Added
- First page preview JPEG generation during ZIP imports.
- Preview saved beside each original PDF as `preview.jpg` on persistent storage.
- Public card APIs return `previewImageUrl` but no public `pdfUrl`.
- `/uploads/cards/*.pdf` is blocked.
- Subscriber-only endpoints:
  - `GET /cards/:cardId/pdf` (inline view)
  - `GET /cards/:cardId/pdf?download=1` (download)
- Active subscription is checked server-side before the original PDF is streamed.

## New server dependencies
- `pdfjs-dist`
- `@napi-rs/canvas`

Railway build uses `npm install`, so these install automatically on the next backend deployment.

## No new database migration
The existing `card.previewPath`, `card.pdfPath`, and `cardimportitem.previewPath` fields already support this phase.

## Existing imported PDFs
Cards imported before this update have `previewPath = NULL`. Re-import those test PDFs (or generate previews separately) to get thumbnails.
