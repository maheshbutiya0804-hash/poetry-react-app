# Poetry Request production deployment

The production database already contains the poetry request user fields from:
`20260817050000_poetry_request_user_fields`.

Migration:
`20260817170000_poetry_request_frontend_fields`
is intentionally an EMPTY migration because it was manually created in the Railway
container and marked as applied to recover Prisma migration state.

Do not add ALTER TABLE statements to that migration.

Backend API routes included:
- GET /poetry-requests
- POST /poetry-requests

Both require authentication and an ACTIVE subscription.

Deploy backend:
1. cd server
2. npm install
3. npx prisma generate
4. npx prisma migrate deploy
5. npm run build
6. restart/redeploy the API service

Expected `npx prisma migrate status`:
Database schema is up to date.
