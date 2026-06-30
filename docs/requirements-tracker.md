# Requirements Implementation Tracker

This document tracks implementation status for requirements identified from:

- `C:\Users\onyan\Downloads\excel\_Design Guide 189609 193430.xlsx`
- `C:\Users\onyan\Downloads\Mido,189609,193430 (1) (4).docx`

Use this file as the living checklist for confirming whether each system requirement has been catered for in the current codebase.

## Status Legend

| Status | Meaning |
|---|---|
| Implemented | Requirement is represented in the app and has matching code/routes/pages. |
| Partially implemented | Some behavior exists, but the requirement needs confirmation or more complete implementation. |
| Not clearly implemented | No clear matching code/page/API was identified. |
| Needs decision | The requirement may be satisfied by existing behavior, but the team must confirm interpretation. |

## Functional Requirements

### Farmer Requirements

| ID | Requirement | Status | Current implementation evidence | Follow-up |
|---|---|---|---|---|
| FR-01 | Register account | Implemented | `src/app/register/page.tsx`, `src/app/api/auth/register/route.ts` | Confirm registration demo flow. |
| FR-05 | Log in | Implemented | `src/app/login/page.tsx`, `src/app/api/auth/login/route.ts` | Confirm role redirect after login. |
| FR-08 | Submit planting data | Implemented | `src/app/farmer/supplies/new/page.tsx`, `src/app/api/supplies/route.ts` | Manual farmer flow test. |
| FR-09 | Farmer updates existing planting cycle information | Implemented | `src/app/farmer/supplies/[id]/page.tsx`, `src/app/api/supplies/[id]/route.ts` | Manual edit flow test. |
| FR-14 | Validate planting data | Implemented | Supply API validates request fields before insert/update. | Confirm validation messages in UI. |
| FR-17 | Generate crop planning calendar | Implemented | `src/app/farmer/calendar/page.tsx` | Confirm calendar displays seeded and newly created supplies. |
| FR-23 | Store farmer profile and credentials | Implemented | `database/migrations/001_create_users.sql`, auth API routes | Passwords are hashed. |
| FR-25 | Store planting cycle records | Implemented | `database/migrations/002_create_crop_supplies.sql` | None. |
| FR-28 | View crop planning calendar | Implemented | `src/app/farmer/calendar/page.tsx` | Manual farmer role check. |
| FR-30 | Receive booking notification | Implemented | In-app notifications table, notification APIs, navbar notification dropdown, and booking-created notification for farmers. | Run migration `010_create_notifications.sql` and manually test buyer booking creates farmer notification. |
| FR-36 | View booking history and status | Implemented | `src/app/farmer/bookings/page.tsx`, `src/app/api/bookings/route.ts` | Manual farmer booking walkthrough. |

### Institutional Buyer Requirements

| ID | Requirement | Status | Current implementation evidence | Follow-up |
|---|---|---|---|---|
| FR-02 | Institutional buyer registers an account | Implemented | `src/app/register/page.tsx`, `src/app/api/auth/register/route.ts` | Confirm buyer role registration. |
| FR-06 | Institutional buyer logs in using credentials | Implemented | `src/app/login/page.tsx`, `src/app/api/auth/login/route.ts` | Confirm buyer redirect to `/buyer`. |
| FR-10 | Buyer submits procurement demand request | Implemented | `src/app/buyer/page.tsx`, `src/app/buyer/demands/new/page.tsx`, `src/app/api/demands/route.ts` | Manual buyer demand test. |
| FR-12 | Authenticate credentials | Implemented | `src/app/api/auth/login/route.ts`, `src/lib/auth.ts` | None. |
| FR-13 | Assign RBAC role | Implemented | `src/middleware.ts`, `src/lib/session.ts`, role column in users table | Confirm wrong-role redirects. |
| FR-16 | Calculate demand-supply gap | Implemented | `src/app/admin/reports/page.tsx`, `src/app/api/admin/summary/route.ts` show requested quantity, available supply, gap quantity, and match status by crop/unit. | Manual admin reports check with seeded demand and supply data. |
| FR-18 | Match harvest to buyer demand | Implemented | `src/app/api/demands/[id]/matches/route.ts`, `src/app/buyer/demands/[id]/matches/page.tsx` | Manual match flow test with seeded data. |
| FR-24 | Store buyer profile and credentials | Implemented | `database/migrations/001_create_users.sql` | None. |
| FR-24 | Store procurement request records | Implemented, documentation issue | `database/migrations/003_create_demand_requests.sql` | Requirement source duplicates FR-24; consider renumbering in final documentation. |
| FR-26 | Store booking transaction records | Implemented | `database/migrations/004_create_bookings.sql`, booking APIs | None. |
| FR-29 | View matched harvest listings | Implemented | `src/app/buyer/demands/[id]/matches/page.tsx` | Manual buyer match flow test. |
| FR-31 | Receive booking confirmation/rejection | Implemented | Buyer booking history/status exists, and `src/app/api/bookings/[id]/status/route.ts` creates in-app notifications when bookings are accepted or rejected. | Manual buyer notification walkthrough. |
| FR-37 | View procurement history and delivery schedule | Implemented | `src/app/buyer/bookings/page.tsx` | Confirm delivery schedule wording/data in UI. |

### Admin Requirements

| ID | Requirement | Status | Current implementation evidence | Follow-up |
|---|---|---|---|---|
| FR-03 | Verify farmer account | Implemented | Email verification exists; admin users page lists verification state. | Email verification is treated as account verification for MVP. |
| FR-04 | Verify institutional buyer account | Implemented | Email verification exists; admin users page lists verification state. | Email verification is treated as account verification for MVP. |
| FR-07 | System admin logs in to admin dashboard | Implemented | `src/app/admin/page.tsx`, middleware role protection | Manual admin login test. |
| FR-15 | Synchronise supply and demand | Implemented | Matching APIs, buyer match pages, and admin demand-vs-supply reporting compare active supplies with demand records. | Synchronisation is treated as matching and reporting supply against demand for MVP. |
| FR-27 | Store RBAC roles and permissions | Implemented | `users.role`, `src/lib/session.ts`, `src/middleware.ts` | None. |
| FR-33 | View demand-supply summary dashboard | Implemented | `src/app/admin/page.tsx`, `src/app/api/admin/summary/route.ts` | Manual admin dashboard test. |
| FR-34 | Generate harvest projection reports | Implemented | `src/app/admin/reports/page.tsx`, `src/app/api/admin/summary/route.ts` show upcoming projected harvest quantities by month, crop, unit, and farmer count. | Manual admin reports check with seeded future harvest data. |

### Restriction / Negative Requirements

| Requirement | Status | Current implementation evidence | Follow-up |
|---|---|---|---|
| Farmer should not view other farmers' planting data. | Implemented if owner filtering is enforced | Farmer supply APIs should filter by session user. | Manual two-farmer test. |
| Buyer should not modify farmer harvest estimates. | Implemented | Buyer pages only view matched supplies; supply mutation APIs require farmer access. | Manual buyer access test. |
| Buyer should not approve their own booking. | Implemented if status API is farmer-only | `src/app/api/bookings/[id]/status/route.ts` should enforce farmer access. | Manual buyer forbidden test. |
| Admin should not place or accept bookings. | Implemented by UI/API role separation | Admin pages are read-only for MVP. | Confirm admin cannot access booking mutation actions. |

## Non-Functional Requirements

| Requirement | Status | Current implementation evidence | Follow-up |
|---|---|---|---|
| Performance | Partially implemented | Next.js API routes, normalized PostgreSQL tables, focused pages. | No formal performance test yet. |
| Security | Partially implemented | Password hashing, session cookies, RBAC middleware/API checks. | Audit logs and broader encryption requirements need confirmation. |
| Data integrity | Mostly implemented | Validation in APIs, normalized migrations, foreign keys/indexes. | Confirm all forms validate edge cases. |
| Reliability | Partially implemented | Auth/session flows, persistent PostgreSQL storage, build passes. | Notification reliability not confirmed. |
| Accessibility | Partially implemented | Responsive layouts and semantic pages exist. | Run manual keyboard/mobile/accessibility check. |
| Scalability | Mostly implemented | PostgreSQL schema and modular API route structure. | No load testing yet. |

## Missing / Unclear Requirement IDs

The source documents reference requirements up to `FR-37`, but these IDs were not clearly found as standalone listed requirements:

- `FR-11`
- `FR-19`
- `FR-21`
- `FR-32`

`FR-20` appears only in a restriction note: booking acceptance is exclusive to the farmer role.

## High-Priority Open Decisions

Christine will work on the remaining FR requirement gaps and final requirement decisions, including:

1. Should the duplicated `FR-24` ID in the source requirement list be corrected in final documentation?

## Verification Checklist

Before marking all requirements complete, run:

```bash
npm run lint
npm run build
```

Then complete manual walkthroughs for farmer, buyer, admin, wrong-role access, and logged-out access.
