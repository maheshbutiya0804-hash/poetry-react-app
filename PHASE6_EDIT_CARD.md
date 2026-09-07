# Phase 6 — Edit Card

This phase makes the existing `/admin/cards/:cardId/edit` route fully functional.

## Added
- Admin GET endpoint: `GET /api/admin/cards/:cardId`
- Admin update endpoint: `PUT /api/admin/cards/:cardId/design`
- Edit mode in the shared Create/Edit Card editor
- Existing title, category, description, poem, admin notes, publish state, featured state, front layout, and back layout load from MySQL
- Update Card saves the edited values back to MySQL
- The Cards Management pencil action now opens a real populated editor

## Database
No Prisma migration is required for Phase 6 because it reuses the fields introduced in Phase 5.

## Run
Backend:
```bat
cd server
npm run dev
```

Frontend:
```bat
npm run dev
```

Open `/admin/cards`, then click the pencil icon for any card.
