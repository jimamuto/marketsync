# Foundational Work Plan

This document covers the very small foundational work that should happen before building major features.

The purpose is to avoid rushing into screens and features before both partners understand the system.

---

## 1. Foundation Checklist

Before feature coding starts, complete these items:

1. Agree on MVP scope.
2. Agree on out-of-scope features.
3. Agree on branch workflow.
4. Agree on Docker/local PostgreSQL usage.
5. Agree on database tables and migration script rules.
6. Agree on demo flow.
7. Create setup documentation.
8. Create code explanation documentation.
9. Create presentation guide outline.

---

## 2. Small First Technical Steps

These are intentionally small.

### Step 1: Initialize project

Create the Next.js TypeScript project.

Expected review:

- both partners can run the app
- both partners understand the folder structure

### Step 2: Add local PostgreSQL with Docker

Add Docker Compose with PostgreSQL so both partners can run the same database setup locally.

Expected review:

- both partners can start the database
- both partners know the database name, username, and port

### Step 3: Add database connection

Add a simple database connection file.

Expected review:

- both partners can explain `DATABASE_URL`
- both partners know where database connection code lives

### Step 4: Add initial SQL migrations

Create numbered migration scripts for users, crop supplies, demand requests, and bookings.

Expected review:

- both partners can explain every table
- both partners can explain the relationship between supply, demand, and bookings
- both partners can recreate the database from migration scripts

### Step 5: Add health check endpoint

Create a small endpoint to confirm the app and database are working.

Example purpose:

- app responds
- database connection works

Expected review:

- both partners understand request/response flow

---

## 3. Foundational Documentation Files

Create these documents as development continues:

```text
docs/database.md
docs/api.md
docs/code-explanation.md
docs/presentation-guide.md
docs/testing.md
```

Each document should be simple and updated as features are added.

---

## 4. First Demo Target

The first tiny demo should not be the full system.

It should show:

1. Local PostgreSQL running through Docker.
2. App running.
3. Database health endpoint working.
4. Initial tables created by migration scripts.

This proves the foundation is ready before feature work begins.

---

## 5. Why This Matters

This project may be assessed through presentation and code explanation. Small foundational work helps because:

- both partners understand the base setup
- fewer unexplained tools are added
- future features are easier to build
- the project looks professionally organized
- documentation evidence exists from the beginning
