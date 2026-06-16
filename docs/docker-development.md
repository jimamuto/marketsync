# Docker and PostgreSQL Development Guide

The project uses **PostgreSQL through Docker Compose** so both partners can run the same database setup on their own computers.

The database should be created and started by Docker Compose, not by manually creating a database in a local PostgreSQL installation.

The key requirement is that every database table/change must be created through migration SQL scripts. No important table should exist only because someone manually created it on their machine.

---

## 1. Why PostgreSQL?

PostgreSQL is suitable because:

- the project has relational data such as users, crop supply, buyer demand, and bookings
- SQL relationships are easy to explain during presentation
- migrations can recreate the database from scratch
- both partners can inspect the same table structure

---

## 2. Why Docker Compose?

Docker Compose is recommended because:

- both partners use the same PostgreSQL version
- the app and database start with one command
- setup is repeatable on Windows, Mac, and Linux
- the app connects to the Docker database service by service name
- development does not depend on one person's local PostgreSQL installation

---

## 3. Docker Services

`docker-compose.yml` defines two services.

### PostgreSQL service

- service name: `postgres`
- container name: `marketsync-postgres`
- image: `postgres:16`
- database: `marketsync`
- user: `postgres`
- password: `postgres` for local development only
- exposed port: `5432`

### App service

- service name: `app`
- container name: `marketsync-app`
- image: `ghcr.io/jimamuto/marketsync-app:latest`
- exposed port: `3000`
- database URL inside Docker: `postgresql://postgres:postgres@postgres:5432/marketsync`

The app image is built by GitHub Actions and published to GitHub Container Registry. The GHCR package should be public so a partner can pull it without logging in. The hostname `postgres` works inside Docker Compose because it is the service name.

---

## 4. Recommended Setup Commands

Download the latest published app image and start the full project:

```bash
docker compose pull
docker compose up
```

Open the app:

```text
http://localhost:3000
```

Check the app can reach the Docker PostgreSQL database:

```text
http://localhost:3000/api/health/db
```

Stop the setup:

```bash
docker compose down
```

Reset the Docker database volume only when a fresh database is intentionally needed:

```bash
docker compose down -v
```

---

## 5. Optional npm Development Commands

These commands are optional and are mainly useful while actively editing the app.

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Start only the Docker PostgreSQL service:

```bash
docker compose up -d postgres
```

Start the app directly with npm:

```bash
npm run dev
```

If a computer already has local PostgreSQL using port `5432`, stop that local PostgreSQL service before using this Docker setup. The project database should come from Docker Compose.

---

## 6. Migration Script Rule

All database changes must be written as SQL migration files.

Use this folder:

```text
database/migrations/
```

Recommended naming:

```text
001_create_users.sql
002_create_crop_supplies.sql
003_create_demand_requests.sql
004_create_bookings.sql
005_add_indexes.sql
```

Rules:

- One migration should have one clear purpose.
- Never create important tables only through a database UI.
- If a table changes, add a new migration instead of silently editing the database manually.
- Each migration should be committed to Git.
- Update `docs/database.md` after schema changes.

Open the Docker PostgreSQL shell:

```bash
docker exec -it marketsync-postgres psql -U postgres -d marketsync
```

Run a migration manually after migrations are added:

```bash
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/001_create_users.sql
```

Later we can add a script like:

```bash
npm run db:migrate
```

that runs all migration files in order.

---

## 7. Environment Variables

Docker Compose sets this for the app container automatically:

```text
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/marketsync
```

`.env.example` is only for optional npm-based local development from the host machine.

Commit `.env.example`, but do not commit real `.env` files.

---

## 8. Operating System Notes

- Windows: use Docker Desktop and run commands in PowerShell, Git Bash, or Windows Terminal.
- Mac: Docker Desktop works with the same `docker compose` commands.
- Linux: install Docker Engine with the Compose plugin, then use the same `docker compose` commands.

---

## 9. Review Checklist

Both partners should verify:

- Docker is installed.
- `docker compose pull` downloads the published app image.
- `docker compose up` starts the app and PostgreSQL.
- PostgreSQL starts successfully in the `marketsync-postgres` container.
- The app starts successfully in the `marketsync-app` container.
- `http://localhost:3000/api/health/db` returns `status: ok`.
- The database can be recreated from migration scripts.
- Both partners can run the migrations.
- Both partners can explain every table.
- `docs/database.md` matches the migration scripts after schema work begins.

---

## 10. Presentation Explanation

If asked why PostgreSQL was used:

> We used PostgreSQL because our system has relational data: users, crop supply, buyer demand, and bookings. We kept migration scripts for every table so the database can be recreated consistently by either partner.

If asked why Docker Compose was used:

> Docker Compose lets both partners run the same app and PostgreSQL setup locally without relying on different manual database installations.
