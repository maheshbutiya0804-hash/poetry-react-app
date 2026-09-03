# Phase 9 — Google Sign-In / Sign-Up

## Added
- Google Identity Services button on `/login` and `/register`.
- `POST /api/auth/google` verifies the Google ID token on the server.
- Google accounts are linked using Google's stable `sub` identifier (`User.googleSubject`).
- New Google users are always created with the `USER` role. Existing users keep their current role.
- Successful Google authentication creates the same HttpOnly HeartString session cookie used by password login.

## Install backend dependency
```bash
cd server
npm install google-auth-library
```

## Database migration
```bash
npx prisma generate
npx prisma migrate dev --name add_google_auth
```

## Environment
Frontend `.env`:
```env
VITE_API_URL="http://localhost:4000/api"
VITE_GOOGLE_CLIENT_ID="534624533577-i40b434490c21tl90l6978p7iih7k3cn.apps.googleusercontent.com"
```

Server `.env`:
```env
GOOGLE_CLIENT_ID="534624533577-i40b434490c21tl90l6978p7iih7k3cn.apps.googleusercontent.com"
```

In Google Cloud Console, register the exact JavaScript origins used by the browser, such as `http://localhost:5173` and your production HTTPS domain.
