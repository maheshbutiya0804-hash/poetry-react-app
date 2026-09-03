# HeartString Notes — React + MySQL API v7

This revision switches the backend from SQLite to **MySQL** while keeping the existing React frontend, admin card upload flow, Prisma ORM, Express API, local card file storage, and PDF validation.

## Architecture

- Frontend: React + Vite + TypeScript
- API: Node.js + Express + TypeScript
- ORM: Prisma
- Database: MySQL 8+
- Development card storage: `server/storage/cards`
- Upload handling: Multer
- PDF validation: `pdf-lib`

The backend validates each uploaded card master as exactly one page, 7 × 5 inches, landscape, and single-sided/front-only.

## 1. Create the MySQL database

You can use XAMPP, MySQL Community Server, phpMyAdmin, MySQL Workbench, Hostinger MySQL, or Docker.

### MySQL CLI / phpMyAdmin

Run `server/create-database.sql`, or execute:

```sql
CREATE DATABASE IF NOT EXISTS heartstring_notes
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### Optional Docker MySQL

From `server/`:

```bash
docker compose -f docker-compose.mysql.yml up -d
```

For that Docker configuration, use:

```env
DATABASE_URL="mysql://heartstring:heartstring_dev@localhost:3306/heartstring_notes"
```

## 2. Configure backend environment

```bat
cd server
copy .env.example .env
```

Edit `server/.env`.

Local MySQL example with a password:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/heartstring_notes"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

XAMPP default root account with no password:

```env
DATABASE_URL="mysql://root@localhost:3306/heartstring_notes"
PORT=4000
CLIENT_ORIGIN="http://localhost:5173"
```

If the password contains reserved URL characters such as `@`, `:`, `/`, `#`, `?`, or `%`, URL-encode the password in `DATABASE_URL`.

## 3. Install and initialize the API

From `server/`:

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init_mysql
npm run prisma:seed
npm run dev
```

The API runs at:

```text
http://localhost:4000
```

Health check:

```text
http://localhost:4000/api/health
```

Expected response:

```json
{ "ok": true }
```

## 4. Frontend setup

Open another terminal at the project root:

```bat
copy .env.example .env
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Admin Love Note upload:

```text
http://localhost:5173/admin/love-notes
```

## 5. Database tables

Prisma creates the following main tables:

### Collection

Stores the nine Love Note collections and their display metadata.

### Card

Stores card metadata such as title, collection, PDF path, optional preview path, size, page count, side count and publish state. The actual PDF/image bytes remain in file storage rather than MySQL.

Long descriptions use MySQL `TEXT`; paths use `VARCHAR(500)`; the database uses UTF-8 capable fields so card and collection copy is safe for normal punctuation and Unicode text.

## Useful Prisma commands

```bash
# regenerate Prisma Client
npx prisma generate

# create/apply a development migration
npx prisma migrate dev --name your_change

# inspect data in the browser
npx prisma studio

# reseed starter collections/cards
npm run prisma:seed
```

## Moving from the previous SQLite v6 project

Do **not** reuse an old SQLite migration as a MySQL migration.

If you copied v7 over v6 and previously created `server/prisma/migrations`, remove that old development migration folder before the first MySQL migration, then run:

```bash
npx prisma migrate dev --name init_mysql
```

The old `dev.db` SQLite file is no longer used.

## Production notes

Before public deployment:

1. Add real admin authentication/authorization to `/api/admin/*`.
2. Use a managed MySQL database with a dedicated non-root user.
3. Move PDF and preview storage from local disk to Cloudflare R2, S3, or equivalent object storage.
4. Store secrets only in server environment variables.
5. Run production migrations with `npx prisma migrate deploy` rather than `migrate dev`.


## Phase 8 authentication
The admin is now protected by MySQL-backed server sessions and role checks. See `PHASE8_AUTH_SECURITY.md` for migration, admin bootstrap, and sign-in steps.
