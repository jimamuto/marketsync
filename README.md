# MarketSync

Web-Based Market Synchronization and B2B Booking Platform for Small-Scale Farmers and Institutional Buyers in Kenya.

This repository contains the project foundation:

- Next.js application
- TypeScript configuration
- Docker Compose app service
- Docker Compose PostgreSQL service
- environment variable example
- database migration folder structure

## Requirements

Install these before running the project:

- Docker Desktop or another Docker Compose-compatible runtime
- Node.js 20+ and npm only if you want to run development commands outside Docker

## Recommended Setup: Run Everything with Docker Compose

From the repository root, run:

```bash
docker compose pull
docker compose up
```

The app image is built by GitHub Actions and published to GitHub Container Registry as `ghcr.io/jimamuto/marketsync-app:latest`.

If Docker cannot pull the image, make sure the GHCR package is public or log in with `docker login ghcr.io`.

This starts:

- `marketsync-postgres` on PostgreSQL port `5432`
- `marketsync-app` on app port `3000`

Open the app at:

```text
http://localhost:3000
```

Check the database health endpoint:

```text
http://localhost:3000/api/health/db
```

Stop the full setup:

```bash
docker compose down
```

Reset the Docker database volume only when you intentionally want a fresh database:

```bash
docker compose down -v
```

## Optional: Run the App Directly with npm

Use this only if PostgreSQL is already running through Docker Compose.

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

Start only PostgreSQL:

```bash
docker compose up -d postgres
```

Start the app:

```bash
npm run dev
```

## Common Commands

```bash
docker compose pull     # download the latest published app image
docker compose up       # start app + PostgreSQL
docker compose up -d    # start app + PostgreSQL in the background
docker compose down     # stop app + PostgreSQL
```

```bash
npm run lint   # run lint checks
npm run build  # create a production build
```

## Documentation

Start here:

- `docs/development-handbook.md` — full shared handbook and roadmap
- `docs/sprint-plan.md` — sprint-by-sprint work and review structure
- `docs/branching-and-documentation.md` — branch workflow and documentation rules
- `docs/docker-development.md` — local PostgreSQL and Docker development setup
- `docs/database-migrations.md` — migration-script rules for every table/change
- `docs/foundational-work.md` — very small first steps before feature coding
