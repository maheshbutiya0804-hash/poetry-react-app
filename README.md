# HeartString Notes — Requirements-Aligned React Restructure

This branch/restructure uses the supplied **HeartString Notes – Website Redesign & Card Generation Specification** as the source of truth.

## Implemented structure

- Home
- About Me
- Love In Action
- FAQ
- Monthly Challenges
- Scavenger Hunt
- Love Notes index
- 9 collection slots (names intentionally left as placeholders because the specification does not list them)
- Collection product pages
- Love Note preview/personalization page
- Single-sided 7 × 5 inch landscape PDF generation using the exact preview DOM renderer
- Simple admin/product upload UI for client-supplied approved card artwork

## Important product rule

The client supplies the approved Canva artwork. Treat each design like a product asset. Do **not** redraw or reinterpret the approved design in application code.

## PDF implementation

`src/components/love-notes/LoveNoteCard.tsx` is the shared renderer used by the website preview.
`src/utils/downloadLoveNotePdf.ts` captures that same DOM element and places it on a single landscape 7 × 5 inch PDF page.

This keeps the customer preview and downloaded output aligned.

## Setup

```bash
npm install
npm run dev
```

Production check:

```bash
npm run build
```

## Content still needed from client

The supplied specification does not provide:

- Names/descriptions of the 9 Love Note collections
- Actual Canva design assets
- Existing approved About Me copy
- Existing Love In Action content
- Monthly Challenge content/rules
- Scavenger Hunt content/rules
- Existing FAQ wording
- Exact rules for which card text fields customers may edit

Those should be migrated from the existing approved website/client assets rather than invented.
