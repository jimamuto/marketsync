# MarketSync Database Schema

This document explains the current PostgreSQL database structure

The schema is created using numbered SQL migration files in:

```text
database/migrations/
```

Run migrations in order because later tables depend on earlier tables.

---

## 1. Migration Files

| File | Purpose |
| --- | --- |
| `001_create_users.sql` | Creates the shared user table for farmers, buyers, and admins. |
| `002_create_crop_supplies.sql` | Creates farmer crop supply / planting cycle records. |
| `003_create_demand_requests.sql` | Creates institutional buyer procurement demand records. |
| `004_create_bookings.sql` | Creates booking records that connect buyer demand to farmer supply. |
| `005_add_indexes.sql` | Adds indexes for faster filtering, matching, and lookup. |
| `006_seed_admin_user.sql` | Adds a default admin user for review and demo access. |
| `007_create_password_reset_tokens.sql` | Adds password reset token storage for recovery flows. |
| `008_create_email_verification_tokens.sql` | Adds email verification token storage for signup flows. |
| `009_seed_demo_data.sql` | Adds sample demo farmers, buyers, supplies, and demand requests. |

---

## 2. Tables

### `users`

Stores all system users in one table.

| Column | Purpose |
| --- | --- |
| `id` | Unique user ID. |
| `name` | User's full name or organization contact name. |
| `email` | Unique login email. |
| `password_hash` | Stored password hash, not the plain password. |
| `role` | User type: `farmer`, `buyer`, or `admin`. |
| `phone` | Optional contact phone number. |
| `location` | Optional user location. |
| `created_at` | When the user record was created. |
| `updated_at` | When the user record was last updated. |

Allowed roles:

```text
farmer, buyer, admin
```

---

### `crop_supplies`

Stores crop supply records created by farmers. This represents what a farmer has planted or expects to harvest.

| Column | Purpose |
| --- | --- |
| `id` | Unique crop supply ID. |
| `farmer_id` | Links the supply to a farmer in `users.id`. |
| `crop_name` | Name of the crop, such as maize or tomatoes. |
| `crop_variety` | Optional crop variety. |
| `quantity` | Expected quantity available. Must be greater than zero. |
| `unit` | Measurement unit, such as kg, bags, crates, or tonnes. |
| `planting_date` | Date the crop was planted. |
| `expected_harvest_date` | Expected harvest date. Must not be before `planting_date`. |
| `location` | Location of the crop supply. |
| `status` | Current supply status. |
| `created_at` | When the crop supply record was created. |
| `updated_at` | When the crop supply record was last updated. |

Allowed statuses:

```text
planned, growing, ready, booked, cancelled
```

Relationship:

```text
users.id -> crop_supplies.farmer_id
```

One farmer can have many crop supply records.

---

### `demand_requests`

Stores procurement demand records created by institutional buyers.

| Column | Purpose |
| --- | --- |
| `id` | Unique demand request ID. |
| `buyer_id` | Links the request to a buyer in `users.id`. |
| `crop_name` | Name of the crop needed. |
| `quantity` | Quantity needed. Must be greater than zero. |
| `unit` | Measurement unit, such as kg, bags, crates, or tonnes. |
| `required_date` | Date the buyer needs the crop. |
| `location` | Buyer location or required supply area. |
| `notes` | Optional buyer notes. |
| `status` | Current demand request status. |
| `created_at` | When the demand request was created. |
| `updated_at` | When the demand request was last updated. |

Allowed statuses:

```text
open, matched, booked, cancelled, fulfilled
```

Relationship:

```text
users.id -> demand_requests.buyer_id
```

One buyer can have many demand request records.

---

### `bookings`

Stores booking requests between buyers and farmers.

A booking connects:

- one crop supply record
- one demand request record
- one buyer
- one farmer

| Column | Purpose |
| --- | --- |
| `id` | Unique booking ID. |
| `supply_id` | Links the booking to `crop_supplies.id`. |
| `demand_request_id` | Links the booking to `demand_requests.id`. |
| `buyer_id` | Links the booking to the buyer in `users.id`. |
| `farmer_id` | Links the booking to the farmer in `users.id`. |
| `quantity` | Quantity being booked. Must be greater than zero. |
| `unit` | Measurement unit for the booked quantity. |
| `status` | Current booking status. |
| `message` | Optional booking message. |
| `created_at` | When the booking was created. |
| `updated_at` | When the booking was last updated. |

Allowed statuses:

```text
pending, accepted, rejected, cancelled, completed
```

Relationships:

```text
crop_supplies.id -> bookings.supply_id
demand_requests.id -> bookings.demand_request_id
users.id -> bookings.buyer_id
users.id -> bookings.farmer_id
```

A buyer can create many bookings. A farmer can receive many bookings.

---

## 3. Relationship Summary

Text-based ERD:

```text
users (farmer)
  1 ─── many crop_supplies

users (buyer)
  1 ─── many demand_requests

crop_supplies
  1 ─── many bookings

demand_requests
  1 ─── many bookings

users (buyer)
  1 ─── many bookings

users (farmer)
  1 ─── many bookings
```

Main flow:

```text
Farmer creates crop supply
Buyer creates demand request
System matches supply and demand
Buyer creates booking
Farmer accepts or rejects booking
```

---

## 4. Indexes

Indexes are added in `005_add_indexes.sql`.

They help speed up common queries such as:

- finding users by role
- finding crop supplies by farmer
- matching supplies by crop name, location, harvest date, and status
- finding demand requests by buyer
- matching demand by crop name, location, required date, and status
- finding bookings by supply, demand request, buyer, farmer, or status

Index naming style:

```text
idx_table_column
```

Example:

```sql
CREATE INDEX idx_crop_supplies_crop_name ON crop_supplies(crop_name);
```

This means PostgreSQL can search `crop_supplies.crop_name` faster.

---

## 5. Running Migrations

Start Docker Compose first:

```bash
docker compose up -d
```

Run each migration in order:

```bash
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/001_create_users.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/002_create_crop_supplies.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/003_create_demand_requests.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/004_create_bookings.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/005_add_indexes.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/006_seed_admin_user.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/007_create_password_reset_tokens.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/008_create_email_verification_tokens.sql
docker exec -i marketsync-postgres psql -U postgres -d marketsync < database/migrations/009_seed_demo_data.sql
```

Check the tables:

```bash
docker exec -it marketsync-postgres psql -U postgres -d marketsync
```

Inside `psql`:

```sql
\dt
\d users
\d crop_supplies
\d demand_requests
\d bookings
```

Exit `psql`:

```sql
\q
```

---

## 6. Notes for Future Changes

- Do not manually create important tables without a migration file.
- Add a new numbered migration for schema changes.
- Keep this document updated whenever a table, column, relationship, status, or index changes.
- Report data can be generated from existing tables first; a separate `reports` table is not needed yet.
