# Phase 5 – Reference Create Card Editor

This phase updates `/admin/cards/new` to match the latest Heartstring Notes Create Card reference.

## MySQL migration
From `server` run:

```bat
npx prisma generate
npx prisma migrate dev --name add_card_editor_fields
npm run dev
```

New Card fields:
- poemText
- adminNotes
- isFeatured
- templateKey
- frontLayout JSON
- backLayout JSON
- nullable pdfPath/originalFileName for editor-created cards

The public/download contract remains 7 × 5 landscape and single-sided. Front/back controls are stored as editor layout settings; only the front is intended for final downloadable output unless requirements are later changed.
