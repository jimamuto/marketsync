# Progress Check 1

This document compares the current codebase against `docs/sprint-plan.md` and lists the remaining work based on the actual files currently present in the repository.

## Verification Snapshot

Current verified project checks:

- `npm run lint` passes.
- `npm run build` passes.

## Still Left, Based on Actual Code

### Highest Priority

#### 1. Frontend feature pages still use static placeholder data

These pages mostly do not call the real APIs yet:

- `src/app/farmer/page.tsx`
- `src/app/farmer/supplies/page.tsx`
- `src/app/farmer/supplies/new/page.tsx`
- `src/app/farmer/supplies/[id]/page.tsx`
- `src/app/farmer/calendar/page.tsx`
- `src/app/farmer/bookings/page.tsx`
- `src/app/buyer/page.tsx`
- `src/app/buyer/demands/page.tsx`
- `src/app/buyer/demands/new/page.tsx`
- `src/app/buyer/demands/[id]/page.tsx`
- `src/app/buyer/demands/[id]/matches/page.tsx`
- `src/app/buyer/bookings/page.tsx`

Needed work:

- Replace static placeholder arrays with real `fetch()` calls.
- Connect pages to existing API routes.
- Add loading, empty, success, and error states.
- Confirm each page works while logged in as the correct role.

#### 2. Admin backend is not implemented

Current state:

- No `src/app/api/admin/...` routes exist.
- Only `src/app/admin/page.tsx` exists.

Missing admin API routes:

- `GET /api/admin/users`
- `GET /api/admin/supplies`
- `GET /api/admin/demands`
- `GET /api/admin/bookings`
- `GET /api/admin/summary`

Needed work:

- Create admin-only API routes.
- Query existing database tables.
- Return useful summary and table data.
- Block non-admin access.
- Document and manually test each route.

#### 3. Admin nested pages are missing

Missing admin pages:

- `/admin/users`
- `/admin/supplies`
- `/admin/demands`
- `/admin/bookings`
- `/admin/reports`

Needed work:

- Create nested admin pages.
- Add tables for users, supplies, demands, and bookings.
- Wire pages to the new admin APIs.
- Add loading, empty, and error states.
- Keep admin actions read-only for the MVP unless safe mutation APIs are added.

#### 4. `.env.example` is incomplete

Current state:

- `.env.example` only has `DATABASE_URL`.
- SMTP/email variables are not documented there yet, even though mail, reset-password, and email-verification code exists.

Needed work:

- Add safe placeholder SMTP/email variables to `.env.example`.
- Do not commit real credentials.
- Keep values clearly marked as examples.

#### 5. No demo seed migration exists

Current state:

- `docs/database-migrations.md` mentions `006_seed_demo_data.sql`.
- Actual migrations do not include demo data.
- Current migration `006` is `006_seed_admin_user.sql`, not demo data.

Needed work:

- Either create a real demo seed migration with a correct new number, or update the documentation so it no longer references the wrong migration.
- Add demo data that supports the final presentation flow:
  - farmer account
  - buyer account
  - crop supply
  - demand request
  - matchable records
  - booking examples if needed

#### 6. API/manual endpoint checks are still not documented

Current state:

- Documentation says endpoint checks are needed.
- Completed curl, Thunder Client, or Postman result sections were not found for the newer feature APIs.

Checks still need to be documented for:

- Auth follow-up flows:
  - `GET /api/auth/me`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET /api/auth/verify-email`
  - `POST /api/auth/resend-verification`
- Farmer supplies APIs.
- Buyer demands APIs.
- Matching API.
- Booking APIs.
- Admin APIs after they are created.

Needed work:

- Add request examples.
- Add expected responses.
- Record which manual checks passed.
- Include role/access checks where relevant.

## Proposed Work Allocation

### Christine

Christine should own backend-heavy work and farmer page wiring:

1. Wire farmer pages to existing APIs:
   - `src/app/farmer/page.tsx`
   - `src/app/farmer/supplies/page.tsx`
   - `src/app/farmer/supplies/new/page.tsx`
   - `src/app/farmer/supplies/[id]/page.tsx`
   - `src/app/farmer/calendar/page.tsx`
   - `src/app/farmer/bookings/page.tsx`
2. Create admin API routes:
   - `/api/admin/users`
   - `/api/admin/supplies`
   - `/api/admin/demands`
   - `/api/admin/bookings`
   - `/api/admin/summary`
3. Document/test backend endpoint checks for her API work.
4. Add or help define demo seed data if backend data setup is needed.

### Jim

Jim should own buyer page wiring and admin frontend pages:

1. Wire buyer pages to existing APIs:
   - `src/app/buyer/page.tsx`
   - `src/app/buyer/demands/page.tsx`
   - `src/app/buyer/demands/new/page.tsx`
   - `src/app/buyer/demands/[id]/page.tsx`
   - `src/app/buyer/demands/[id]/matches/page.tsx`
   - `src/app/buyer/bookings/page.tsx`
2. Create nested admin pages:
   - `/admin/users`
   - `/admin/supplies`
   - `/admin/demands`
   - `/admin/bookings`
   - `/admin/reports`
3. Wire admin pages to Christine's admin APIs once available.
4. Add frontend loading, empty, success, and error states.
5. Help update demo/presentation documentation after the pages are wired.

## Is That Everything?

This covers the biggest remaining work from the current codebase comparison.

The main remaining categories are:

1. Farmer frontend API wiring.
2. Buyer frontend API wiring.
3. Admin backend APIs.
4. Admin frontend pages and wiring.
5. `.env.example` SMTP/email documentation.
6. Demo seed data or corrected migration documentation.
7. Manual/API endpoint check documentation.
8. Final demo documentation and presentation polish.

After these are complete, the team should run:

```bash
npm run lint
npm run build
```

Then both partners should walk through the final demo flow end to end.
