# Deployment — Supabase + Render + Vercel (free tier)

Deploy order matters: **DB → Backend → Frontend**, because the backend needs the
DB URL and the frontend needs the backend URL.

```
[Browser] → [Vercel: Next.js]  → (server-side forward) →  [Render: .NET API] → [Supabase: Postgres]
             frontend/                                      backend/
```

Why the cookie auth "just works" across two hosts: the browser only ever talks to
**Vercel same-origin** (`/api/*`). Vercel's Route Handlers forward server-side to
Render, relaying the session cookie. So `SameSite=Strict` holds and **no CORS is
needed**.

---

## 1. Supabase (database)

1. Create a new project. Set a strong **database password** and save it.
2. Wait until the project is provisioned (~2 min).
3. Click **Connect** (top bar) → **Connection string** → choose **Session pooler**.
   - ⚠️ **Use the Session pooler, NOT "Direct connection".** Direct connection is
     IPv6-only; Render's network can't reach it (you'd get
     "Network is unreachable"). The Session pooler is IPv4 on port 5432 and works
     with EF migrations.
4. Supabase shows a URI like:
   `postgresql://postgres.abcdxyz:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres`
5. Convert it to the **Npgsql keyword format** the backend expects (this is the
   value for `ConnectionStrings__Default`):

   ```
   Host=aws-0-ap-southeast-1.pooler.supabase.com;Port=5432;Database=postgres;Username=postgres.abcdxyz;Password=YOUR-PASSWORD;SSL Mode=Require;Trust Server Certificate=true
   ```

   - `Host`, `Username` (`postgres.<projectref>`), and region come straight from
     the URI. Keep the `SSL Mode=Require;Trust Server Certificate=true` — Supabase
     requires TLS.

---

## 2. Render (backend / .NET API)

1. **New +** → **Web Service** → connect your GitHub repo `my-investment`.
2. Settings:
   - **Root Directory:** `backend`
   - **Runtime / Language:** Render auto-detects the `Dockerfile` → **Docker**.
   - **Instance Type:** **Free**.
3. **Environment variables** (Advanced → Add Environment Variable). Note the
   **double underscore** `__` — that's how .NET reads nested config from env:

   | Key | Value |
   |---|---|
   | `ConnectionStrings__Default` | the Npgsql string from step 1.5 |
   | `Auth__Username` | `wavefufy` |
   | `Auth__PasswordHash` | your PBKDF2 hash (`AQAAAA…`) |

   - Don't set `ASPNETCORE_ENVIRONMENT` — the container defaults to `Production`,
     which turns on `Secure` cookies and turns off Swagger. That's what we want.
   - Don't set `PORT` — Render injects it; the Dockerfile now binds to it.
4. **Create Web Service.** Watch the **Logs** tab. On first boot you should see EF
   apply every migration, then `Seeded initial user 'wavefufy'`.
5. Verify: open `https://<your-service>.onrender.com/health` → `{"status":"ok"}`.
6. Copy the service URL — you need it for Vercel.

> **Free tier sleeps** after ~15 min idle. The first request after sleeping takes
> ~30–50 s to wake (login will feel slow that once). Fine for weekly personal use.

---

## 3. Vercel (frontend / Next.js)

1. **Add New** → **Project** → import `my-investment`.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Next.js (auto-detected).
3. **Environment Variables** — add one:

   | Key | Value |
   |---|---|
   | `API_PROXY_URL` | `https://<your-service>.onrender.com` |

   - No trailing slash, no `/api` — the forward helper appends `/api` itself.
4. **Deploy.**
5. Open the Vercel URL → log in with `wavefufy` / `P@ssW0rd0001`.

---

## Docker files — what changed and what's unused

- **`backend/Dockerfile`** — updated: the `ENTRYPOINT` now binds
  `ASPNETCORE_URLS` to `${PORT}` so Render's injected port is honored (falls back
  to 8080 locally). Render uses this file.
- **`frontend/Dockerfile`** — **not used by Vercel.** Vercel builds Next.js
  natively and ignores it. Leave it; it's only for local `docker compose`.
- **`docker-compose.yml`** — **not used in the cloud.** It's only for running the
  full stack locally. Each cloud service is deployed independently.

---

## Troubleshooting

- **Render: "no open ports detected" / port scan timeout** → the `$PORT` binding
  fix in the Dockerfile handles this. Make sure the latest commit is deployed.
- **Backend logs: "Network is unreachable" connecting to Postgres** → you used the
  Direct connection (IPv6). Switch to the **Session pooler** string.
- **Backend logs: migration error mentioning `__EFMigrationsHistory` /
  `MigrationId`** → a naming-convention edge case; capture the log and fix the
  history-table column names once (see `docs/PROGRESS.md` gotchas).
- **Login returns 401 in the cloud but works locally** → check `Auth__Username` /
  `Auth__PasswordHash` on Render match the hash you generated.
- **Changing the password later in prod** → update `Auth__PasswordHash` on Render,
  then in Supabase SQL editor run `DELETE FROM users;` and redeploy (seeding only
  runs when the table is empty), or `UPDATE users SET password_hash='…';` directly.
