# MarketSync Sprint Plan

This document structures the work into small sprints. Each sprint has development work, documentation work, and review work.

Recommended sprint length: **3-5 days** for a student project, but this can be adjusted.

---

## Sprint 0: Agreement and Fresh-Slate Setup

### Goal

Agree on the system direction before coding.

### Work

- Review proposal Chapters 1-4.
- Agree on MVP scope.
- Agree on out-of-scope features.
- Agree on Docker use.
- Agree on branch workflow.
- Agree on documentation rules.

### Documentation

- `docs/development-handbook.md`
- `docs/sprint-plan.md`
- `docs/branching-and-documentation.md`
- `docs/docker-development.md`
- `docs/foundational-work.md`

### Review

Both partners should explain:

- problem statement
- system aim
- MVP features
- what is out of scope
- how branches will be used
- why Docker is being used

### Exit Criteria

- Both partners agree on the roadmap.
- No implementation starts until agreement is reached.

---

## Sprint 1: Local PostgreSQL, Docker, and Project Foundation

### Goal

Create a stable development environment.

### Work

- Create Next.js project.
- Add TypeScript.
- Add Docker Compose for local PostgreSQL.
- Add PostgreSQL service.
- Add environment variable example.
- Confirm database setup can be recreated from scripts.
- Confirm both partners can run the same setup.

### Expected Files

- `package.json`
- `docker-compose.yml`
- `Dockerfile` if app container is added immediately
- `.env.example`
- basic app folder structure

### Documentation

- Update `docs/docker-development.md` with exact commands.
- Update `README.md` with setup steps.
- Add notes if setup differs on Windows/Mac/Linux.

### Review

Check:

- Can Partner A run the project?
- Can Partner B run the project?
- Can PostgreSQL start using Docker?
- Can the app connect to the database?

### Exit Criteria

- `docker compose up` works.
- Database container starts successfully.
- App starts successfully.
- Setup instructions are clear.

---

## Sprint 2: Database Schema and Migrations

### Goal

Create the initial PostgreSQL database structure using numbered SQL migration scripts.

### Work

Create migration scripts for:

- `users`
- `crop_supplies`
- `demand_requests`
- `bookings`

Add:

- primary keys
- foreign keys
- role/status constraints
- indexes for matching/searching

### Documentation

- Create/update `docs/database.md`.
- Update `docs/database-migrations.md` if the migration sequence changes.
- Explain each table in simple language.
- Add ERD or text-based relationship explanation.

### Review

Both partners should explain:

- what each table stores
- how farmer supply links to users
- how buyer demand links to users
- how bookings connect supply and demand

### Exit Criteria

- Migration scripts run successfully in PostgreSQL.
- Tables are visible.
- A fresh database can be recreated from migrations.
- Relationships are clear.
- Documentation is updated.

---

## Sprint 3: Authentication and Role Foundation

### Goal

Allow users to exist with roles.

### Work

- Register user.
- Login user.
- Password hashing.
- Store role: Farmer, Buyer, Admin.
- Basic role-based redirects or protected endpoints.

### Documentation

- Create/update `docs/authentication.md`.
- Explain roles and permissions.
- Explain password hashing at a high level.

### Review

Both partners should explain:

- how a user is created
- where the password is stored
- why passwords are hashed
- how the system knows if someone is a farmer, buyer, or admin

### Exit Criteria

- Users can register/login.
- Roles are stored correctly.
- Both partners can explain the login flow.

---

## Sprint 4: Farmer Supply Vertical Slice

### Goal

Build the first complete farmer feature.

### Work

- Farmer can add crop supply.
- Farmer can view crop supply.
- Data saves to PostgreSQL.
- Basic validation is included.

### Documentation

- Update `docs/api.md` with farmer supply endpoints.
- Update `docs/code-explanation.md` with farmer supply flow.

### Review

Both partners should explain:

- form data
- API route
- SQL insert/select
- database table
- how this supports the crop calendar later

### Exit Criteria

- Farmer supply can be created and viewed.
- Documentation is updated.

---

## Sprint 5: Buyer Demand Vertical Slice

### Goal

Build the first complete buyer feature.

### Work

- Buyer can add demand request.
- Buyer can view demand requests.
- Data saves to PostgreSQL.
- Basic validation is included.

### Documentation

- Update `docs/api.md` with buyer demand endpoints.
- Update `docs/code-explanation.md` with buyer demand flow.

### Review

Both partners should explain:

- demand form fields
- API route
- SQL insert/select
- database table
- how this supports matching

### Exit Criteria

- Buyer demand can be created and viewed.
- Documentation is updated.

---

## Sprint 6: Matching Logic

### Goal

Connect farmer supply to buyer demand.

### Work

Implement deterministic matching by:

- crop name
- location
- quantity
- harvest date near required date

### Documentation

- Create/update `docs/matching-logic.md`.
- Explain matching rules in plain language.
- State limitations and future improvements.

### Review

Both partners should explain:

- why matching is not AI
- what rules are used
- what happens when no match exists
- how matching supports the proposal aim

### Exit Criteria

- Matching works with demo data.
- Both partners can explain the query/rules.

---

## Sprint 7: Booking Flow

### Goal

Allow buyers to reserve matched produce.

### Work

- Buyer creates booking request.
- Booking starts as pending.
- Farmer accepts or rejects.
- Buyer can see booking status.

### Documentation

- Update `docs/api.md`.
- Update `docs/code-explanation.md`.
- Add booking status lifecycle diagram or list.

### Review

Both partners should explain:

- why booking exists
- how booking connects supply and demand
- booking statuses
- farmer decision process

### Exit Criteria

- End-to-end booking flow works.
- Documentation is updated.

---

## Sprint 8: Admin Overview and Reports

### Goal

Give the administrator enough visibility for MVP.

### Work

- Admin can view users.
- Admin can view supply/demand/bookings.
- Add simple summary counts.
- Optional: simple report table.

### Documentation

- Update `docs/admin.md`.
- Explain what admin can and cannot do in MVP.

### Review

Both partners should explain:

- admin role
- what admin monitors
- what is future work

### Exit Criteria

- Admin overview works.
- Documentation is updated.

---

## Sprint 9: Calendar and Demo Polish

### Goal

Make the system easier to present.

### Work

- Add simple harvest/demand timeline or calendar list.
- Polish navigation.
- Add demo data.
- Prepare presentation script.

### Documentation

- Create/update `docs/presentation-guide.md`.
- Add final demo script.
- Add troubleshooting notes.

### Review

Both partners should independently run and explain the demo.

### Exit Criteria

- Demo works from start to finish.
- Either partner can present alone.

---

## Sprint Review Template

At the end of every sprint, answer:

1. What did we build?
2. What files changed?
3. What database tables changed?
4. What API routes changed?
5. What documentation changed?
6. What tests/checks passed?
7. What is unfinished?
8. Can both partners explain it?

---

## Definition of Done

A task is done only when:

- code works
- both partners understand it
- documentation is updated
- branch is reviewed
- build/test checks pass where applicable
- demo impact is clear
