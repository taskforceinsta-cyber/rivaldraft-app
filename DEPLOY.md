# Deploying RivalDraft (Render)

This app needs a real server (not static hosting) — it has a database, real
auth, and server actions. Render is a good fit because it supports a
persistent disk, so the SQLite database survives restarts and redeploys.

## 1. Create the Web Service

1. Sign in at [render.com](https://render.com) and connect your GitHub account.
2. **New → Web Service** → select `taskforceinsta-cyber/rivaldraft-app`.
3. Settings:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm run start`
   - **Instance type**: anything with a persistent disk (the free tier does
     not support disks — Starter, ~$7/mo, is the cheapest that does).

## 2. Add a persistent disk

- **Mount path**: `/data`
- **Size**: 1 GB is plenty to start.

## 3. Environment variables

| Key | Value |
|---|---|
| `DATABASE_URL` | `file:/data/prod.db` |
| `AUTH_SECRET` | Output of `openssl rand -base64 32` — generate a **new** one, don't reuse the local dev secret |
| `AUTH_TRUST_HOST` | `true` |

## 4. Deploy

Click **Create Web Service**. Render builds and starts the app, then gives
you a `https://<something>.onrender.com` URL.

The `start` script (`prisma migrate deploy && next start`) applies database
migrations automatically on every boot, so the schema is always in sync —
no manual migration step needed.

## 5. Seed the database (one-time, after first successful deploy)

The database starts empty — no sports, players, leagues, or accounts exist
yet. In Render's dashboard, open the service's **Shell** tab and run:

```
npx prisma db seed
```

This creates:
- 5 sports (~40 players across them)
- 5 leagues
- Demo login: `demo@rivaldraft.test` / `demo1234`
- Admin login: `admin@rivaldraft.test` / `admin1234`

## Notes

- Everything here runs on **test/play money** — no real payment processor
  is wired in. Don't treat the wallet balances as real currency handling
  until that's built deliberately, with proper licensing.
- To move off SQLite later (e.g. for multi-instance scaling), swap the
  Prisma datasource provider to `postgresql`, point `DATABASE_URL` at a
  hosted Postgres instance, and re-run `prisma migrate deploy`.
