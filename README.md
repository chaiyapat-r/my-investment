# Portfolio & Net Worth Tracker

Personal, single-user web app for tracking net worth and investment performance,
plus a staged stock entry planner. See [`CLAUDE.md`](CLAUDE.md) for the spec and
[`docs/data-model.md`](docs/data-model.md) for the schema, auth, and deployment
design.

## Stack

- **Backend:** ASP.NET Core 9 Minimal API + EF Core + PostgreSQL (`backend/`)
- **Frontend:** Next.js 16 (App Router, TypeScript, Tailwind) (`frontend/`)
- **Database:** PostgreSQL 16 (Docker Compose)

## Layout

```
backend/    .NET Minimal API — talks to the DbContext directly, no repository layer
frontend/   Next.js 16 app; /api/* is proxied server-side to the backend
docker-compose.yml   Postgres + api + web
```

## Local development (recommended)

Run Postgres in Docker, backend and frontend natively for fast reloads.

1. Start the database:

```bash
docker compose up -d db
```

2. Backend (`http://localhost:5153`):

```bash
cd backend
cp appsettings.Development.json.example appsettings.Development.json   # first time only
dotnet run
```

`appsettings.Development.json` is gitignored (it holds the DB connection and the
Auth password hash). Generate a hash with `dotnet run --no-build -- hash "<password>"`
and paste it into `Auth:PasswordHash`.

3. Frontend (`http://localhost:3000`):

```bash
cd frontend
npm run dev
```

The browser only talks to `http://localhost:3000`; Next.js forwards `/api/*` to
the backend (same-origin, so the auth cookie stays `SameSite=Strict`).

Smoke test:

```bash
curl http://localhost:5153/health
```

## Full stack in Docker (deploy rehearsal)

`api` and `web` live behind the `full` profile, so the dev command above never
starts them (they would grab ports 5153/3000). To run the whole stack:

```bash
docker compose --profile full up --build
```

Stop and remove it with `docker compose --profile full down`.

- Web: http://localhost:3000
- API: http://localhost:5153
- DB:  localhost:5435 (user/pass/db all `portfolio`)

## Next steps

Entities, `DbContext` configuration, the first migration, and the auth endpoints
(`/api/auth/login|logout|me`) are the next slice — see `docs/data-model.md`.
