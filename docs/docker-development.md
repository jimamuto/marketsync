# Docker and Local PostgreSQL Development Guide

The project will use **locally hosted PostgreSQL**, preferably through Docker Compose, so both partners can run the same database setup on their own machines.

The key requirement is that every database table/change must be created through migration SQL scripts. No important table should exist only because someone manually created it on their machine.

---

## 1. Why Local PostgreSQL?

Local PostgreSQL is suitable because:

- it keeps the project simple and explainable
- it avoids depending on a shared online database during development
- each partner can run the system independently
- SQL and table structure remain visible
- migrations can recreate the database from scratch

---

## 2. Why Docker?

Docker is recommended because:

- both partners can use the same PostgreSQL version
- setup is repeatable
- the database can be started with one command
- the project is easier to demo on another machine

If one partner already has PostgreSQL installed locally, that can work too, but Docker is preferred for consistency.

---

## 3. Planned Docker Service

PostgreSQL service:

- database: `marketsync`
- user: `postgres`
- password: `postgres` for local development only
- port: `5432`

Example future `docker-compose.yml`:

```yaml
services:
  postgres:
    image: postgres:16
    container_name: marketsync-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: marketsync
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

---

## 4. Migration Script Rule

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
- Never create important tables only through the database UI.
- If a table changes, add a new migration instead of silently editing the database manually.
- Each migration should be committed to Git.
- Update `docs/database.md` after schema changes.

---

## 5. Expected Commands After Setup

Start database:

```bash
docker compose up -d
```

Stop database:

```bash
docker compose down
```

Open PostgreSQL shell:

```bash
docker exec -it marketsync-postgres psql -U postgres -d marketsync
```

Run a migration manually:

```bash
psql "postgresql://postgres:postgres@localhost:5432/marketsync" -f database/migrations/001_create_users.sql
```

Later we can add a script like:

```bash
npm run db:migrate
```

that runs all migration files in order.

---

## 6. Environment Variables

The app should use:

```text
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/marketsync
```

Commit `.env.example`, but do not commit real `.env` files.

---

## 7. Review Checklist

Both partners should verify:

- Docker is installed or PostgreSQL is locally available.
- PostgreSQL starts successfully.
- The database can be recreated from migration scripts.
- Both partners can run the migrations.
- Both partners can explain every table.
- `docs/database.md` matches the migration scripts.

---

## 8. Presentation Explanation

If asked why local PostgreSQL was used:

> We used PostgreSQL because our system has relational data: users, crop supply, buyer demand, and bookings. We kept migration scripts for every table so the database can be recreated consistently by either partner.

If asked why Docker was used:

> Docker helps both partners run the same PostgreSQL setup locally without different manual installations causing problems.
