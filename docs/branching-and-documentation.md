# Branching and Documentation Guide

This project should use branches carefully so both partners can review work, understand changes, and explain the full system during presentation.

---

## 1. Main Branch Rule

`main` should represent stable agreed work.

Do not build major features directly on `main`.

Use feature branches for development, then merge after review.

---

## 2. Branch Naming

Use clear branch names that describe the work.

Recommended format:

```text
type/short-description
```

Examples:

```text
docs/roadmap
setup/local-postgres-docker
database/initial-migrations
feature/auth
feature/farmer-supply
feature/buyer-demand
feature/matching
feature/bookings
feature/admin-overview
feature/calendar
fix/login-validation
```

Branch types:

- `docs/` for documentation work
- `setup/` for tooling, Docker, environment setup
- `feature/` for new system features
- `fix/` for bug fixes
- `test/` for testing improvements

---

## 3. Development Flow

For every piece of work:

1. Create or switch to a branch.
2. Make small focused changes.
3. Run the relevant checks.
4. Update documentation.
5. Let the other partner review.
6. Merge only after both understand the change.

Example:

```bash
git checkout main
git pull
git checkout -b feature/farmer-supply
# build feature
git status
git add .
git commit -m "Add farmer supply feature"
git push -u origin feature/farmer-supply
```

---

## 4. Review Checklist

Before merging a branch, check:

- Does the feature work?
- Does it match the proposal/MVP scope?
- Are there unrelated changes?
- Is documentation updated?
- Can both partners explain the change?
- Were build/test commands run?
- Is the branch name clear?

---

## 5. Documentation Rules

Every major change needs documentation.

### Database change

Update:

- `database/migrations/` with a numbered SQL migration
- `docs/database.md`
- `docs/database-migrations.md` if the migration sequence changes

Document:

- table name
- column names
- relationships
- why the change was needed
- how to run or verify the migration

### API change

Update:

- `docs/api.md`

Document:

- endpoint path
- method
- request body
- response
- which table it uses

### Feature change

Update:

- `docs/code-explanation.md`
- relevant sprint notes

Document:

- user problem solved
- files changed
- data flow
- explanation for presentation

### Docker/setup change

Update:

- `docs/docker-development.md`
- `README.md`

Document:

- commands to run
- environment variables
- troubleshooting notes

### Presentation-impacting change

Update:

- `docs/presentation-guide.md`

Document:

- how to demo it
- how to explain it
- likely questions

---

## 6. Commit Message Style

Use simple clear messages.

Examples:

```text
Add local PostgreSQL Docker setup
Create initial database migrations
Create initial database schema
Add farmer supply API
Document matching logic
Fix booking status validation
```

Avoid vague messages like:

```text
updates
changes
final
work done
```

---

## 7. Partner Understanding Rule

A branch should not be merged until both partners can explain:

1. What changed?
2. Why was it needed?
3. Which files changed?
4. Which database table or API changed?
5. How does it affect the demo?

This prevents one partner from being unable to present if the other is absent.
