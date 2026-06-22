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

#### 2. Admin backend is implemented, but admin pages are still missing

Current state:

- `src/app/api/admin/...` routes now exist.
- Only `src/app/admin/page.tsx` exists on the frontend side.

Missing admin API routes:

- `GET /api/admin/users`
- `GET /api/admin/supplies`
- `GET /api/admin/demands`
- `GET /api/admin/bookings`
- `GET /api/admin/summary`

Needed work:

- Create admin-only frontend pages.
- Wire those pages to the new admin APIs.
- Keep the admin routes read-only for the MVP.
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

#### 4. `.env.example` has been updated, but it should stay in sync with future email changes

Current state:

- `.env.example` now includes safe placeholder SMTP/email variables.
- Real credentials are not committed.

Needed work:

- Keep `.env.example` updated if new email fields are added later.

#### 5. Demo seed migration exists

Current state:

- `database/migrations/009_seed_demo_data.sql` now exists.
- The schema docs and migration plan have been updated to reference the actual migration sequence.

Needed work:

- Keep the seed data aligned with the demo flow if future features change the schema.

#### 6. API/manual endpoint checks are partially documented

Current state:

- `docs/api.md` now includes manual verification notes for the auth, supply, demand, booking, and admin reporting flows that were checked locally.
- Auth follow-up flows still need dedicated verification if the SMTP/email path changes again:
  - `GET /api/auth/me`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET /api/auth/verify-email`
  - `POST /api/auth/resend-verification`

Needed work:

- Keep adding request/response examples as more backend routes change.
- Re-run the remaining auth email-flow checks if SMTP settings or token logic change.

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
