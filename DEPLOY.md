# Deploying FantasyKings88 (Render)

This app needs a real server (not static hosting) — it has a database, real
auth, and server actions. Render is a good fit because it supports a
persistent disk, so the SQLite database survives restarts and redeploys.

## 1. Create the Web Service

1. Sign in at [render.com](https://render.com) and connect your GitHub account.
2. **New → Web Service** → select `taskforceinsta-cyber/rivaldraft-app`.
3. Settings:
   - **Build command**: `npm install && npm run build`
   - **Start command**: `npm run start`
   - **Instance type**: Free works for a quick demo (see the Free tier note
     below); Starter (~$7/mo) is the cheapest tier with a persistent disk,
     Shell access, and no cold-start spin-down.

## 2. (Starter tier and above only) Add a persistent disk

Skip this on Free — disks aren't available on that tier.

- **Mount path**: `/data`
- **Size**: 1 GB is plenty to start.

## 3. Environment variables

| Key | Value |
|---|---|
| `DATABASE_URL` | `file:/data/prod.db` on Starter+ with a disk attached. On **Free** (no disk), use `file:./prod.db` instead — the database resets on every redeploy/restart, which is fine for a demo but not for anything longer-lived. |
| `AUTH_SECRET` | Output of `openssl rand -base64 32` — generate a **new** one, don't reuse the local dev secret |
| `AUTH_TRUST_HOST` | `true` |
| `SEED_SECRET` | Output of `openssl rand -hex 16` — only needed if you'll use the `/api/seed` route (see step 5) |

## 4. Deploy

Click **Create Web Service**. Render builds and starts the app, then gives
you a `https://<something>.onrender.com` URL.

The `start` script (`prisma migrate deploy && next start`) applies database
migrations automatically on every boot, so the schema is always in sync —
no manual migration step needed.

## 5. Seed the database (one-time, after first successful deploy)

The database starts empty — no sports, players, leagues, or accounts exist
yet.

**If your plan includes Shell access** (Starter tier and above), open the
service's **Shell** tab and run:

```
npx prisma db seed
```

**On the Free tier** (no Shell access), set a `SEED_SECRET` environment
variable, then visit this URL once in your browser instead:

```
https://<your-app>.onrender.com/api/seed?secret=<your SEED_SECRET value>
```

Either way, this creates:
- Football (~14 players)
- 5 leagues
- Test player: `testaccount@fantasykings88.test`
- Test player (second): `testaccount-player2@fantasykings88.test`
- Test management/admin: `testaccount-admin@fantasykings88.test`
- Password for all three: `TESTACCOUNT123!@#`

## Notes

- Everything here runs on **test/play money** — no real payment processor
  is wired in. Don't treat the wallet balances as real currency handling
  until that's built deliberately, with proper licensing.
- To move off SQLite later (e.g. for multi-instance scaling), swap the
  Prisma datasource provider to `postgresql`, point `DATABASE_URL` at a
  hosted Postgres instance, and re-run `prisma migrate deploy`.
- **On Free tier (no disk), log out after every redeploy.** The database
  resets on redeploy/restart, but login sessions are JWT-based and don't
  get invalidated — a browser that was logged in before the redeploy will
  keep presenting a session for a user ID that no longer exists in the
  fresh database. The app handles this gracefully (clear "log back in"
  messaging instead of a crash), but the fix is always: log out, log back
  in. This resets for every tester every time you redeploy on Free tier.
