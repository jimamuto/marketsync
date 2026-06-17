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

## Sprint 3: Authentication and Role APIs

### Goal

Build and test simple custom authentication before creating full frontend screens.

### Work

- Implement custom auth using the existing `users` table.
- Hash passwords before saving them.
- Add role support for Farmer, Buyer, and Admin.
- Create API routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - `GET /api/auth/me`
- Test the routes using curl, Postman, Thunder Client, or another API client.
- Keep frontend work minimal until the APIs are verified.

### Documentation

- Create/update `docs/authentication.md`.
- Create/update `docs/api.md` with auth endpoints.
- Explain roles and permissions.
- Explain password hashing at a high level.
- Add example request/response bodies for testing.

### Review

Both partners should explain:

- how a user is created
- where the password is stored
- why passwords are hashed
- how the system knows if someone is a farmer, buyer, or admin
- how each auth endpoint is tested

### Exit Criteria

- Register, login, logout, and current-user APIs work.
- Roles are stored correctly.
- API tests pass.
- Both partners can explain the login flow.

---

## Sprint 4: Farmer Supply APIs

### Goal

Build and test the farmer crop supply API layer.

### Work

- Create API routes for farmer crop supplies:
  - `POST /api/supplies`
  - `GET /api/supplies`
  - `GET /api/supplies/:id`
  - `PATCH /api/supplies/:id`
  - `DELETE /api/supplies/:id`
- Save crop supply data to PostgreSQL.
- Add basic validation for required fields, quantity, dates, and status.
- Ensure farmer-owned records can be created and viewed.
- Test endpoints with API requests before building full pages.

### Documentation

- Update `docs/api.md` with farmer supply endpoints.
- Update `docs/code-explanation.md` with farmer supply API flow.
- Reference `crop_supplies` in `docs/database.md` if anything changes.

### Review

Both partners should explain:

- request body fields
- API routes
- SQL insert/select/update/delete operations
- `crop_supplies` table
- how this supports the crop calendar later

### Exit Criteria

- Farmer supply APIs can create, read, update, and delete records.
- API tests pass.
- Documentation is updated.

---

## Sprint 5: Buyer Demand APIs

### Goal

Build and test the institutional buyer demand API layer.

### Work

- Create API routes for buyer demand requests:
  - `POST /api/demands`
  - `GET /api/demands`
  - `GET /api/demands/:id`
  - `PATCH /api/demands/:id`
  - `DELETE /api/demands/:id`
- Save demand request data to PostgreSQL.
- Add basic validation for required fields, quantity, required date, and status.
- Ensure buyer-owned demand records can be created and viewed.
- Test endpoints with API requests before building full pages.

### Documentation

- Update `docs/api.md` with buyer demand endpoints.
- Update `docs/code-explanation.md` with buyer demand API flow.
- Reference `demand_requests` in `docs/database.md` if anything changes.

### Review

Both partners should explain:

- request body fields
- API routes
- SQL insert/select/update/delete operations
- `demand_requests` table
- how this supports matching

### Exit Criteria

- Buyer demand APIs can create, read, update, and delete records.
- API tests pass.
- Documentation is updated.

---

## Sprint 6: Matching API

### Goal

Connect farmer supply to buyer demand through a tested deterministic matching endpoint.

### Work

- Implement a matching API such as:
  - `GET /api/demands/:id/matches`
- Match demand to supply using deterministic rules:
  - crop name
  - location
  - quantity
  - harvest date near required date
  - active/open statuses
- Return possible supply matches for a demand request.
- Add demo records for testing the matching query.
- Test successful matches and no-match cases.

### Documentation

- Create/update `docs/matching-logic.md`.
- Update `docs/api.md` with the matching endpoint.
- Explain matching rules in plain language.
- State limitations and future improvements.

### Review

Both partners should explain:

- why matching is not AI
- what rules are used
- what SQL/query logic is used
- what happens when no match exists
- how matching supports the proposal aim

### Exit Criteria

- Matching API works with demo data.
- No-match cases are handled clearly.
- API tests pass.
- Both partners can explain the query/rules.

---

## Sprint 7: Booking APIs

### Goal

Allow buyers to reserve matched produce through tested booking endpoints.

### Work

- Create booking API routes:
  - `POST /api/bookings`
  - `GET /api/bookings`
  - `GET /api/bookings/:id`
  - `PATCH /api/bookings/:id/status`
- Booking starts as `pending`.
- Farmer can accept or reject a booking.
- Buyer can view booking status.
- Validate booking quantity, status changes, linked supply, and linked demand.
- Test the full booking flow through API requests.

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
- which API request changes each status

### Exit Criteria

- Booking APIs support create, view, and status updates.
- Pending, accepted, rejected, cancelled, and completed statuses are understood.
- API tests pass.
- Documentation is updated.

---

## Sprint 8: Admin APIs and Reporting Data

### Goal

Give the administrator enough backend visibility for MVP before building admin screens.

### Work

- Create admin API routes such as:
  - `GET /api/admin/users`
  - `GET /api/admin/supplies`
  - `GET /api/admin/demands`
  - `GET /api/admin/bookings`
  - `GET /api/admin/summary`
- Add simple summary counts for users, supplies, demands, and bookings.
- Keep reports generated from existing tables first.
- Do not add a report table unless the MVP clearly needs it.
- Test admin-only access and response data.

### Documentation

- Update `docs/admin.md`.
- Update `docs/api.md` with admin endpoints.
- Explain what admin can and cannot do in MVP.

### Review

Both partners should explain:

- admin role
- what admin monitors
- which tables provide report data
- what is future work

### Exit Criteria

- Admin APIs return useful overview data.
- Admin-only access is tested.
- Documentation is updated.

---

## Sprint 9: Frontend Integration and Demo Polish

### Goal

Build the user interface on top of verified APIs and prepare the final demo.

### Work

- Add simple frontend screens after the APIs are working:
  - register/login
  - farmer dashboard and supply form/list
  - buyer dashboard and demand form/list
  - matches view
  - bookings view
  - admin overview
- Add simple harvest/demand timeline or calendar list if time allows.
- Polish navigation.
- Add demo data.
- Prepare presentation script.

### Documentation

- Create/update `docs/presentation-guide.md`.
- Update `docs/code-explanation.md` with frontend-to-API flow.
- Add final demo script.
- Add troubleshooting notes.

### Review

Both partners should independently run and explain the demo.

### Exit Criteria

- Demo works from start to finish.
- Frontend uses tested APIs.
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
