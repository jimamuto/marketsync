# MarketSync Automated Test Suite

## Overview

MarketSync uses [Vitest](https://vitest.dev/) for automated testing. The initial suite contains:

- **6 unit tests** for authentication and session helpers
- **10 integration tests** for complete API and PostgreSQL workflows
- **16 tests total**

Although the suite has 16 named tests, each integration test performs several API, authorization, and database assertions.

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

File: `tests/integration/auth.integration.test.ts`

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

### Farmer supply workflow

File: `tests/integration/farmer.integration.test.ts`

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

### Buyer demand workflow

File: `tests/integration/buyer.integration.test.ts`

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

### Administrator workflow

File: `tests/integration/admin.integration.test.ts`

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

### Moderated marketplace and booking workflow

File: `tests/integration/marketplace.integration.test.ts`

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

This is the initial high-value regression suite. It covers principal workflows, permissions, moderation rules, and database mutations. Future additions can expand validation boundaries, expired-token handling, booking transition errors, malformed identifiers, and more detailed notification-content assertions.
