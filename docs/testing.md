# MarketSync Automated Test Suite

## Overview

MarketSync uses [Vitest](https://vitest.dev/) for automated testing. The initial suite contains:

- **6 unit tests** for authentication and session helpers
- **47 integration tests** for API, validation, security, moderation, booking, and PostgreSQL workflows
- **53 tests total**

Each integration test performs API, authorization, and direct database assertions.

## Test safety and isolation

Integration tests run against a dedicated PostgreSQL database named:

```text
marketsync_test
```

The test setup intentionally refuses to run against any database with another name. This protects development and presentation data from being deleted or modified.

Before integration tests run, `scripts/test-db-prepare.mjs`:

1. Connects to PostgreSQL.
2. Creates `marketsync_test` if it does not exist.
3. Applies unapplied database migrations.
4. Records applied migrations in `test_schema_migrations`.

The integration setup clears only tables inside `marketsync_test`. Test users receive unique email addresses to prevent collisions between runs. Email delivery is mocked, so authentication tests do not send real messages.

## Running the tests

Run the complete suite:

```bash
npm test
```

Run only unit tests:

```bash
npm run test:unit
```

Run only integration tests:

```bash
npm run test:integration
```

Prepare the test database manually:

```bash
npm run test:db:prepare
```

Generate unit-test coverage:

```bash
npm run test:coverage
```

## Unit tests

### Authentication helpers

File: `tests/unit/auth.test.ts`

These tests confirm that:

- Only `farmer`, `buyer`, and `admin` are accepted as user roles.
- Unsupported or missing roles are rejected.
- Passwords are hashed instead of stored as plain text.
- Correct passwords pass verification.
- Incorrect passwords fail verification.
- Safe user responses exclude sensitive fields such as password hashes.

### Session and access helpers

File: `tests/unit/session.test.ts`

These tests confirm that:

- Valid session cookies return the correct user ID and role.
- Invalid user identifiers and unsupported roles are rejected.
- Farmers receive farmer permissions.
- Buyers receive buyer permissions.
- Administrators can access farmer and buyer functionality.
- Non-admin users do not receive administrator access.

## PostgreSQL integration tests

Integration tests call the actual Next.js route handlers and verify results in the real test database.

### Authentication workflow

Files:

- `tests/integration/auth.integration.test.ts`
- `tests/integration/auth-validation.integration.test.ts`

The authentication tests verify that:

1. A farmer can register.
2. The user is inserted into PostgreSQL.
3. An email-verification token is created.
4. Email delivery is invoked through a mock.
5. Login is blocked before email verification.
6. The verification endpoint verifies the account.
7. The verification token is consumed.
8. Login succeeds after verification.
9. Session cookies are returned.
10. Public registration cannot create administrator accounts.
11. Invalid login credentials are rejected.
12. Missing registration fields and short passwords are rejected.
13. Unsupported roles and duplicate emails are rejected.
14. Incorrect passwords do not create sessions.
15. Expired verification tokens are deleted without verifying users.
16. Missing and unknown verification tokens return safely to login.
17. Logout expires both session cookies.

### Farmer supply workflow

Files:

- `tests/integration/farmer.integration.test.ts`
- `tests/integration/farmer-validation.integration.test.ts`

The farmer tests verify that:

- A farmer can create a crop supply.
- New supplies begin with `moderation_status = 'pending'`.
- The supply is stored in PostgreSQL with the correct owner and lifecycle status.
- A farmer can list and read owned supplies.
- A farmer can update supply quantity and lifecycle status.
- Updating the business lifecycle does not overwrite moderation status.
- A farmer can delete a supply.
- The deleted supply is removed from PostgreSQL.
- Another farmer cannot access the supply.
- Buyers cannot use farmer-only supply endpoints.
- Unauthenticated users cannot create supplies.
- Missing fields, invalid quantities, reversed harvest dates, and unsupported statuses are rejected.
- Invalid identifiers, empty updates, invalid update quantities, and invalid update statuses are rejected.
- Another farmer cannot delete an owned supply.

### Buyer demand workflow

Files:

- `tests/integration/buyer.integration.test.ts`
- `tests/integration/buyer-validation.integration.test.ts`

The buyer tests verify that:

- A buyer can create a demand request.
- New demands begin with `moderation_status = 'pending'`.
- The demand is stored with the correct owner and lifecycle status.
- A buyer can list and read owned demands.
- A buyer can update quantity and notes.
- Updating business data does not overwrite moderation status.
- A buyer can delete a demand.
- The deleted demand is removed from PostgreSQL.
- Another buyer cannot access the demand.
- Farmers cannot use buyer-only demand endpoints.
- Unauthenticated users cannot create demands.
- Missing fields, invalid quantities, and unsupported statuses are rejected.
- Invalid identifiers, empty updates, invalid update quantities, and invalid update statuses are rejected.
- Another buyer cannot delete an owned demand.

### Administrator workflow

Files:

- `tests/integration/admin.integration.test.ts`
- `tests/integration/admin-validation.integration.test.ts`

The administrator tests verify that:

- An administrator can suspend a user.
- A suspended user cannot log in.
- An administrator can reactivate the user.
- Suspension and reactivation create audit-log entries.
- Suspension and reactivation create user notifications.
- Non-admin users cannot moderate supplies.
- An administrator can approve or reject a supply.
- Moderation notes are stored in PostgreSQL.
- Moderation decisions are recorded for accountability.
- Administrators cannot suspend themselves or other administrator accounts.
- Invalid account statuses, identifiers, and missing users are rejected.
- Invalid moderation decisions and missing supplies or demands are rejected.
- Reviewer identity and review timestamps are stored.
- Audit metadata and notification content are checked, not only record counts.

### Moderated marketplace and booking workflow

Files:

- `tests/integration/marketplace.integration.test.ts`
- `tests/integration/booking-validation.integration.test.ts`

These tests cover the core MarketSync business workflow:

1. A farmer creates a supply.
2. A buyer creates a demand.
3. Both records begin pending administrator review.
4. Pending supplies are excluded from buyer matches.
5. Pending supplies and demands cannot be booked.
6. An administrator approves both records.
7. The approved supply appears in the buyer's matches.
8. The buyer creates a booking.
9. Booking creation changes the demand status to `booked`.
10. The farmer accepts the booking.
11. Acceptance changes the supply status to `booked`.
12. An administrator completes the booking.
13. Completion changes the demand status to `fulfilled`.
14. Completion returns the supply status to `ready`.
15. Notifications are created for affected users.
16. Administrator actions are written to the audit log.
17. Only buyers can create bookings.
18. Missing booking fields and non-positive quantities are rejected.
19. Rejected supplies and pending demands cannot be booked.
20. Crop, location, unit, and quantity mismatches are rejected.
21. Buyers cannot book demands owned by another buyer.
22. Buyers and farmers are limited to their permitted booking transitions.
23. Invalid booking identifiers and statuses are rejected.
24. Buyer cancellation and farmer rejection reopen the demand.
25. Completed bookings cannot return to another state.

## What the suite demonstrates

The suite demonstrates three important qualities of MarketSync:

### Role-based security

Users can access only operations allowed for their roles and can modify only records they own. Administrator-only moderation and account controls are protected.

### Moderated marketplace participation

A supply or demand can exist in the system without immediately entering the marketplace. Pending or rejected records cannot be matched or booked. Marketplace participation begins only after administrator approval.

### Real database consistency

The tests do not only inspect HTTP responses. They query PostgreSQL to confirm that records are inserted, updated, deleted, moderated, audited, and linked to notifications correctly.

## Suggested presentation explanation

> MarketSync has an automated Vitest suite with unit tests and real PostgreSQL integration tests. The unit tests validate password security, safe user data, sessions, roles, and permissions. The integration tests exercise complete farmer, buyer, administrator, and marketplace workflows against an isolated test database. They prove that new supplies and demands require approval, pending records cannot be matched or booked, users cannot modify other users' records, and completed bookings update all related lifecycle statuses, notifications, and audit logs correctly.

During the presentation, run:

```bash
npm test
```

A successful run shows that all unit and integration test files pass while using the isolated `marketsync_test` database.

## Current scope

This suite covers principal workflows plus high-risk validation and authorization boundaries. Future additions can include concurrency testing, performance testing, SMTP transport integration, browser-level accessibility checks, and end-to-end UI automation.
