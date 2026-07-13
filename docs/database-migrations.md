# Database Migration Plan

This project will use local PostgreSQL with SQL migration scripts.

The goal is simple: **any partner should be able to recreate the full database from the repository alone.**

---

## 1. Migration Folder

Use:

```text
database/migrations/
```

Each table or schema change should have a migration file.

---

## 2. Initial Migration Sequence

Planned first migrations:

```text
001_create_users.sql
002_create_crop_supplies.sql
003_create_demand_requests.sql
004_create_bookings.sql
005_add_indexes.sql
006_seed_admin_user.sql
007_create_password_reset_tokens.sql
008_create_email_verification_tokens.sql
009_seed_demo_data.sql
010_create_notifications.sql
011_seed_showcase_demo_data.sql
012_add_created_at_indexes.sql
013_add_admin_moderation_fields.sql
014_add_user_account_status.sql
015_create_admin_audit_logs.sql
016_seed_admin_action_center_demo_data.sql
```

### 001_create_users.sql

Creates users for:

- farmers
- institutional buyers
- admins

### 002_create_crop_supplies.sql

Creates farmer crop supply records.

### 003_create_demand_requests.sql

Creates institutional buyer demand records.

### 004_create_bookings.sql

Creates booking requests connecting crop supply and buyer demand.

### 005_add_indexes.sql

Adds indexes for faster matching/searching.

### 006_seed_admin_user.sql

Adds a default admin account for setup and review.

### 007_create_password_reset_tokens.sql

Creates password reset token storage for account recovery flows.

### 008_create_email_verification_tokens.sql

Creates email verification token storage for account verification flows.

### 009_seed_demo_data.sql

Adds only reusable demo login users and passwords for farmers and buyers.

### 010_create_notifications.sql

Adds in-app notification storage for booking and status updates.

### 011_seed_showcase_demo_data.sql

Adds resettable showcase supplies, demands, bookings, and notifications for presentation walkthroughs. This is separate from `009_seed_demo_data.sql` so demo credentials stay stable while showcase records can be recreated quickly.

### 012_add_created_at_indexes.sql

Adds indexes for recent-record and dashboard queries.

### 013_add_admin_moderation_fields.sql

Adds separate moderation status, notes, reviewer, and review timestamp fields to supplies and demands.

### 014_add_user_account_status.sql

Adds active and suspended account states for administrative access control.

### 015_create_admin_audit_logs.sql

Creates the audit trail for administrator decisions and marketplace operations.

### 016_seed_admin_action_center_demo_data.sql

Adds repeatable presentation records for pending supply review, pending demand review, and overdue supply alerts.

---

## 3. Migration Rules

- Do not manually create tables without adding SQL files.
- Do not depend on one partner's database state.
- Migration names must be numbered in order.
- Each migration should have a clear purpose.
- If a table changes later, create a new migration instead of hiding the change.
- Documentation must be updated when schema changes.

---

## 4. Review Questions

For every database migration, both partners should answer:

1. What table or column changed?
2. Why was the change needed?
3. Which feature uses this table?
4. What relationships does it have?
5. Can the migration run on a fresh database?

---

## 5. Presentation Explanation

If asked how the database is managed:

> We use PostgreSQL with SQL migration scripts. Each table is created through a numbered migration file, so either partner can recreate the same database locally and explain the schema clearly.
