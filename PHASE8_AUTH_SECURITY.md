# Phase 8 — MySQL authentication and admin security

This phase adds real server-side authentication. Passwords are stored as salted scrypt hashes. Login creates a cryptographically random session token; only its SHA-256 hash is stored in MySQL. The browser receives the raw token only in an HttpOnly, SameSite=Lax cookie. Admin APIs are protected by an ACTIVE ADMIN role check.

## 1. Update environment
Copy the new values from `server/.env.example` into your existing `server/.env`. Set a unique `ADMIN_EMAIL` and a strong `ADMIN_PASSWORD`. Do not commit `server/.env`.

## 2. Apply the database migration
From `server`:

```bat
npx prisma generate
npx prisma migrate dev --name add_auth_sessions
```

The migration adds `User.passwordHash`, `User.lastLoginAt`, and the `AuthSession` table.

## 3. Create or reset the admin login

```bat
npm run admin:bootstrap
```

This upserts the configured account as `ADMIN`, hashes its password, marks it active, and invalidates old sessions for that account.

## 4. Start both apps

```bat
npm run dev
```

Run the frontend in another terminal from the project root with `npm run dev`.

Visit `http://localhost:5173/login`, sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`, then visit `/admin`.

## Security behavior
- Public registration can only create `USER` accounts.
- Blocked users cannot log in or keep using sessions.
- `/api/admin/*` returns 401 without a session and 403 to non-admin users.
- Logout deletes the server-side session and clears the cookie.
- Session tokens expire after `SESSION_DAYS` (7 by default).
- CORS is credential-aware and restricted to `CLIENT_ORIGIN`.
- Admin credentials are never hard-coded into source files.

## Not implemented yet
Google OAuth and forgot-password email delivery are intentionally not faked. Subscriber entitlements/payment authorization and protected master-PDF delivery are separate production-security work.
