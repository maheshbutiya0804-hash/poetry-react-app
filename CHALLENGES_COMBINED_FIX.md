# Combined Challenges Fix

Includes:
- GET /challenges/current
- PATCH /challenges/preferences
- User.challengeEmailEnabled in server Prisma schema
- User.challengeSmsEnabled in server Prisma schema
- Railway trust proxy / HTTPS asset URL handling
- Empty reconciled poetry-request migration retained

Backend deploy:
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

Then restart/redeploy the API service.
