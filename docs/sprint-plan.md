# MarketSync Sprint Plan

This document structures the work into small sprints. Each sprint has development work, documentation work, and review work.

Recommended sprint length: **3-5 days** for a student project, but this can be adjusted.

Current ownership split:

- **Jim**: frontend pages, nested route shells, UI states, navigation, and connecting pages to completed APIs.
- **Christine**: backend APIs, PostgreSQL queries, auth/security logic, email/token handling, and API tests.

Jim can build page shells with temporary data while Christine finishes the APIs. Once an API is ready, Jim replaces the placeholder data with `fetch()` calls and verifies the full user flow.

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

**Status: Done.** Jim and Christine have completed the shared local project foundation.

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

Current status: complete.

---

## Sprint 2: Database Schema and Migrations

**Status: Done.** Jim and Christine have completed the base PostgreSQL schema and migration structure.

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

Current status: complete. Base migrations exist for users, crop supplies, demand requests, bookings, and indexes. Later migrations now also include admin seeding and password reset tokens.

---

## Sprint 3: Authentication and Role APIs

### Goal

Build and test custom authentication with role-aware redirects, admin seeding, password reset groundwork, and reusable auth pages.

### Completed So Far

- Implemented custom auth using the existing `users` table.
- Added password hashing and password comparison through `src/lib/auth.ts`.
- Added role support for Farmer, Buyer, and Admin.
- Implemented API routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
- Blocked public admin registration.
- Added admin seed migration:
  - `database/migrations/006_seed_admin_user.sql`
- Added password reset token migration:
  - `database/migrations/007_create_password_reset_tokens.sql`
- Added SMTP mail helper:
  - `src/lib/mail.ts`
- Added auth pages:
  - `/login`
  - `/register`
  - `/forgot-password`
  - `/reset-password`
  - `/check-email`
  - `/unauthorized`
- Verified recent auth page work with:
  - `npm run lint`
  - `npm run build`

### Remaining Work

Christine should own the backend/API tasks:

- Add `GET /api/auth/me`.
- Add `POST /api/auth/forgot-password`.
- Add `POST /api/auth/reset-password`.
- Send password reset emails using `src/lib/mail.ts`.
- Store only hashed reset tokens.
- Reject expired or already-used reset tokens.
- Keep API responses generic so registered emails cannot be guessed.
- Add API tests or documented curl/Thunder Client checks.

Jim should own the frontend tasks:

- Connect `/forgot-password` to `POST /api/auth/forgot-password`.
- Redirect forgot-password success to `/check-email`.
- Read the reset token from `/reset-password?token=...`.
- Connect `/reset-password` to `POST /api/auth/reset-password`.
- Show clear loading, success, and error states.
- Redirect reset-password success back to `/login`.
- Use `/unauthorized` for wrong-role access once route protection is added.

Later optional hardening:

- Email verification APIs and pages.
- 2FA setup, verify, and disable APIs.
- 2FA UI flow after password login.
- Stronger session handling and role-based route protection.

### Documentation

- Keep `docs/authentication.md` updated with completed and remaining auth work.
- Update `docs/api.md` with auth endpoints as Christine completes them.
- Explain roles and permissions.
- Explain password hashing at a high level.
- Add example request/response bodies for testing.

### Review

Both partners should explain:

- how a user is created
- where the password is stored
- why passwords are hashed
- how the system knows if someone is a farmer, buyer, or admin
- why admin users are seeded instead of publicly registered
- how password reset tokens are stored and used
- how each auth endpoint is tested

### Exit Criteria

- Register, login, logout, current-user, forgot-password, and reset-password APIs work.
- Roles are stored correctly.
- Admin seed works on a fresh database.
- Password reset emails can be sent locally.
- Forgot/reset frontend pages call real APIs.
- API tests or manual endpoint checks pass.
- Both partners can explain the login and password reset flows.

---

## Sprint 4: Farmer Supply Feature

**Status: Not started / next after auth.** This sprint should be split so Christine builds the farmer supply APIs and Jim builds the farmer-facing pages on top of them.

### Goal

Allow farmers to create, view, edit, and manage crop supply records that later power the crop calendar and matching flow.

### Christine: Backend/API Work

- Create API routes for farmer crop supplies:
  - `POST /api/supplies`
  - `GET /api/supplies`
  - `GET /api/supplies/:id`
  - `PATCH /api/supplies/:id`
  - `DELETE /api/supplies/:id`
- Save crop supply data to PostgreSQL using the `crop_supplies` table.
- Add validation for crop name, quantity, unit, location, planting date, harvest date, and status.
- Ensure farmers can only create and manage their own supply records.
- Return clear API errors for missing fields, invalid quantity, invalid dates, and unauthorized access.
- Test endpoints with curl, Postman, Thunder Client, or another API client.

### Jim: Frontend Work

- Build farmer supply pages:
  - `/farmer/supplies`
  - `/farmer/supplies/new`
  - `/farmer/supplies/[id]`
  - `/farmer/calendar`
- Build a crop supply form with loading, success, and error states.
- Build a supply list/table using temporary placeholder data first.
- Connect the pages to Christine's APIs once ready.
- Update the farmer dashboard to link to the new supply pages.
- Display supply records in a simple calendar or timeline view.

### Documentation

- Update `docs/api.md` with farmer supply endpoints.
- Update `docs/code-explanation.md` with farmer supply API and frontend flow.
- Reference `crop_supplies` in `docs/database.md` if anything changes.

### Review

Both partners should explain:

- request body fields
- farmer supply pages
- API routes
- SQL insert/select/update/delete operations
- `crop_supplies` table
- how farmer supply supports the crop calendar and matching

### Exit Criteria

- Farmer supply APIs can create, read, update, and delete records.
- Farmer supply pages call real APIs.
- Farmers cannot manage another farmer's records.
- API tests pass.
- `npm run lint` and `npm run build` pass.
- Documentation is updated.

---

## Sprint 5: Buyer Demand Feature

**Status: Not started.** Christine should build demand APIs while Jim builds buyer demand pages and connects them when ready.

### Goal

Allow institutional buyers to create, view, edit, and manage demand requests for produce.

### Christine: Backend/API Work

- Create API routes for buyer demand requests:
  - `POST /api/demands`
  - `GET /api/demands`
  - `GET /api/demands/:id`
  - `PATCH /api/demands/:id`
  - `DELETE /api/demands/:id`
- Save demand request data to PostgreSQL using the `demand_requests` table.
- Add validation for crop name, quantity, unit, location, required date, and status.
- Ensure buyers can only create and manage their own demand records.
- Return clear API errors for missing fields, invalid quantity, invalid dates, and unauthorized access.
- Test endpoints with API requests before full page integration.

### Jim: Frontend Work

- Build buyer demand pages:
  - `/buyer/demands`
  - `/buyer/demands/new`
  - `/buyer/demands/[id]`
- Build a demand request form with loading, success, and error states.
- Build a demand list/table using temporary placeholder data first.
- Connect buyer demand pages to Christine's APIs once ready.
- Update the buyer dashboard to link to demand creation and demand history.

### Documentation

- Update `docs/api.md` with buyer demand endpoints.
- Update `docs/code-explanation.md` with buyer demand API and frontend flow.
- Reference `demand_requests` in `docs/database.md` if anything changes.

### Review

Both partners should explain:

- request body fields
- buyer demand pages
- API routes
- SQL insert/select/update/delete operations
- `demand_requests` table
- how demand requests support matching

### Exit Criteria

- Buyer demand APIs can create, read, update, and delete records.
- Buyer demand pages call real APIs.
- Buyers cannot manage another buyer's records.
- API tests pass.
- `npm run lint` and `npm run build` pass.
- Documentation is updated.

---

## Sprint 6: Matching Feature

**Status: Not started.** Matching should stay deterministic for the MVP; it does not need AI.

### Goal

Connect buyer demand to farmer supply through a tested matching endpoint and a buyer-facing matches page.

### Christine: Backend/API Work

- Implement a matching API such as:
  - `GET /api/demands/:id/matches`
- Match demand to supply using deterministic rules:
  - crop name
  - location
  - available quantity
  - harvest date near required date
  - active/open statuses
- Return possible supply matches for a demand request.
- Handle no-match cases clearly.
- Add demo records for successful match and no-match testing.
- Test the matching query and response shape.

### Jim: Frontend Work

- Build match pages:
  - `/buyer/demands/[id]/matches`
  - optional `/buyer/matches`
- Show matched supply cards or table rows.
- Show no-match empty state.
- Add a button or link from a demand detail page to its matches.
- Prepare UI for creating a booking from a selected match in Sprint 7.

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
- Match pages display real API results.
- No-match cases are handled clearly in API and UI.
- API tests pass.
- `npm run lint` and `npm run build` pass.
- Both partners can explain the query/rules.

---

## Sprint 7: Booking Feature

**Status: Not started.** This sprint connects matches to real reservations and farmer decisions.

### Goal

Allow buyers to reserve matched produce and allow farmers to accept or reject booking requests.

### Christine: Backend/API Work

- Create booking API routes:
  - `POST /api/bookings`
  - `GET /api/bookings`
  - `GET /api/bookings/:id`
  - `PATCH /api/bookings/:id/status`
- Booking starts as `pending`.
- Farmer can accept or reject a booking.
- Buyer can view booking status.
- Validate booking quantity, status changes, linked supply, and linked demand.
- Prevent invalid status changes.
- Ensure buyers and farmers only see bookings relevant to them unless the user is an admin.
- Test the full booking flow through API requests.

### Jim: Frontend Work

- Build booking pages:
  - `/buyer/bookings`
  - `/farmer/bookings`
  - optional `/bookings/[id]`
- Add a create-booking action from the match result page.
- Add buyer booking status display.
- Add farmer accept/reject controls.
- Show clear empty, loading, success, and error states.
- Update dashboard cards to show booking counts or recent booking activity.

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
- Buyer and farmer booking pages call real APIs.
- Pending, accepted, rejected, cancelled, and completed statuses are understood.
- Invalid status changes are blocked.
- API tests pass.
- `npm run lint` and `npm run build` pass.
- Documentation is updated.

---

## Sprint 8: Admin Reporting Feature

**Status: Page shell started, backend APIs not started.** The current `/admin` page is a static dashboard shell. This sprint should make it data-driven.

### Goal

Give the administrator enough backend visibility for the MVP and connect admin screens to real reporting data.

### Christine: Backend/API Work

- Create admin API routes such as:
  - `GET /api/admin/users`
  - `GET /api/admin/supplies`
  - `GET /api/admin/demands`
  - `GET /api/admin/bookings`
  - `GET /api/admin/summary`
- Add simple summary counts for users, supplies, demands, and bookings.
- Keep reports generated from existing tables first.
- Do not add a report table unless the MVP clearly needs it.
- Require admin-only access.
- Test admin-only access and response data.

### Jim: Frontend Work

- Build admin pages:
  - `/admin/users`
  - `/admin/supplies`
  - `/admin/demands`
  - `/admin/bookings`
  - `/admin/reports`
- Connect `/admin` overview cards to `GET /api/admin/summary`.
- Build tables for users, supplies, demands, and bookings.
- Add loading, empty, and error states.
- Keep admin actions read-only for MVP unless Christine adds safe mutation APIs.

### Documentation

- Update `docs/admin.md`.
- Update `docs/api.md` with admin endpoints.
- Explain what admin can and cannot do in MVP.

### Review

Both partners should explain:

- admin role
- what admin monitors
- which tables provide report data
- why MVP admin pages are mostly read-only
- what is future work

### Exit Criteria

- Admin APIs return useful overview data.
- Admin-only access is tested.
- Admin pages display real API data.
- `npm run lint` and `npm run build` pass.
- Documentation is updated.

---

## Sprint 9: Frontend Integration and Demo Polish

**Status: Partially started.** Base dashboard pages and auth pages exist, but most API integration remains.

### Goal

Finish the user interface on top of verified APIs and prepare the final demo.

### Jim: Frontend Work

- Finalize page flows:
  - register/login/logout
  - forgot/reset password
  - farmer supply form/list/calendar
  - buyer demand form/list
  - matches view
  - buyer and farmer bookings views
  - admin overview and nested admin pages
- Replace temporary placeholder arrays with real `fetch()` calls.
- Polish navigation by role.
- Add consistent empty, loading, success, and error states.
- Improve responsive behavior.
- Prepare demo data screens and presentation flow.

### Christine: Backend Support Work

- Provide stable response shapes for all APIs.
- Provide tested demo data or seed scripts.
- Confirm role protection works for farmer, buyer, and admin routes.
- Help verify full demo flow from database to UI.

### Shared Demo Flow

The final demo should show:

1. User registers or logs in.
2. Farmer creates crop supply.
3. Buyer creates demand.
4. Buyer views matches.
5. Buyer creates booking.
6. Farmer accepts or rejects booking.
7. Buyer sees updated booking status.
8. Admin views overall system activity.

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
- Role-based navigation is clear.
- Seed/demo data is ready.
- `npm run lint` and `npm run build` pass.
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
