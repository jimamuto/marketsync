# MarketSync API Documentation

This document tracks the backend API routes as they are created and tested.

---

## Sprint 3: Authentication APIs

Sprint 3 builds the authentication API layer before frontend login/register screens.

Current auth route status:

| Method | Route | Status | Owner |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Implemented | Jim/backend foundation |
| `POST` | `/api/auth/login` | Implemented | Christine |
| `POST` | `/api/auth/logout` | Implemented | Christine |
| `GET` | `/api/auth/me` | Implemented | Christine |
| `POST` | `/api/auth/forgot-password` | Implemented | Christine |
| `POST` | `/api/auth/reset-password` | Implemented | Christine |

---

## `POST /api/auth/register`

Creates a new user account.

### Request Body

```json
{
  "name": "Ama Farmer",
  "email": "ama@example.com",
  "password": "password123",
  "role": "farmer",
  "phone": "0240000000",
  "location": "Kumasi"
}
```

### Required Fields

```text
name
email
password
role
```

### Optional Fields

```text
phone
location
```

### Valid Roles

```text
farmer
buyer
admin
```

### Success Response

Status:

```text
201 Created
```

Body:

```json
{
  "user": {
    "id": 1,
    "name": "Ama Farmer",
    "email": "ama@example.com",
    "role": "farmer",
    "phone": "0240000000",
    "location": "Kumasi"
  }
}
```

### Error Responses

| Status | Meaning |
| --- | --- |
| `400` | Missing required registration fields. |
| `400` | Password is shorter than the minimum length. |
| `400` | Role is invalid. |
| `409` | Email already exists. |
| `500` | Server or database error. |

---

## Follow-up API Pattern for Colleague

Use `POST /api/auth/register` as the golden example.

For every auth endpoint:

- Use the same `NextResponse.json(...)` response style.
- Validate request body fields before database work.
- Return clear error messages.
- Never return `password_hash`.
- Keep route files under `src/app/api/auth/<endpoint>/route.ts`.
- Run `npm run lint` before opening a pull request.

---

## `POST /api/auth/login`

Expected behavior:

1. Read `email` and `password` from the request body.
2. Validate that both fields exist.
3. Find the user by email.
4. Compare the submitted password with the stored password hash.
5. Return `401` if the email or password is invalid.
6. Return safe user data if login succeeds.
7. Do not return `password_hash`.

Expected request body:

```json
{
  "email": "ama@example.com",
  "password": "password123"
}
```

Expected success response:

```json
{
  "message": "Logged in successfully.",
  "user": {
    "id": 1,
    "name": "Ama Farmer",
    "email": "ama@example.com",
    "role": "farmer",
    "phone": "0240000000",
    "location": "Kumasi"
  }
}
```

---

## `POST /api/auth/logout`

Expected behavior for the current simple version:

1. Accept a `POST` request.
2. Return a success message.

Expected success response:

```json
{
  "message": "Logged out successfully."
}
```

The current logout flow clears the session cookies used by the app.

---

## `GET /api/auth/me`

Returns the current authenticated user from the session cookies.

Success response:

```json
{
  "user": {
    "id": 1,
    "name": "Ama Farmer",
    "email": "ama@example.com",
    "role": "farmer",
    "phone": "0240000000",
    "location": "Kumasi"
  }
}
```

Error responses:

| Status | Meaning |
| --- | --- |
| `401` | No valid session cookie is present. |
| `404` | Session user no longer exists. |
| `500` | Server or database error. |

---

## `POST /api/auth/forgot-password`

Starts the password reset flow.

Request body:

```json
{
  "email": "ama@example.com"
}
```

Behavior:

- Always returns a generic success message when an email is provided.
- If the user exists, creates a secure reset token.
- Stores only the hashed reset token in `password_reset_tokens`.
- Emails `/reset-password?token=...` using `src/lib/mail.ts`.
- The token expires after 30 minutes.

---

## `POST /api/auth/reset-password`

Completes the password reset flow.

Request body:

```json
{
  "token": "reset-token-from-email",
  "password": "newPassword123"
}
```

Behavior:

- Requires token and password.
- Requires password length of at least 8 characters.
- Hashes the submitted token before lookup.
- Rejects invalid, expired, or already-used tokens.
- Hashes the new password before updating `users.password_hash`.
- Marks the reset token as used.

---

## Sprint 4: Farmer Supply APIs

Current supply route status:

| Method | Route | Status |
| --- | --- | --- |
| `POST` | `/api/supplies` | Implemented |
| `GET` | `/api/supplies` | Implemented |
| `GET` | `/api/supplies/[id]` | Implemented |
| `PATCH` | `/api/supplies/[id]` | Implemented |
| `DELETE` | `/api/supplies/[id]` | Implemented |

### Access Rules

- Farmers can create, update, view, and delete their own supplies.
- Admins can view and manage all supplies.
- Other roles receive `403 Forbidden`.

### Supply Create Request Body

```json
{
  "crop_name": "Maize",
  "crop_variety": "Yellow maize",
  "quantity": 100,
  "unit": "bags",
  "planting_date": "2026-06-01",
  "expected_harvest_date": "2026-08-15",
  "location": "Kisumu",
  "status": "planned"
}
```

### Supply Validation Notes

- `crop_name`, `quantity`, `unit`, `planting_date`, `expected_harvest_date`, and `location` are required.
- `quantity` must be greater than `0`.
- `expected_harvest_date` must be on or after `planting_date`.
- Allowed statuses are `planned`, `growing`, `ready`, `booked`, and `cancelled`.

---

## Sprint 5: Buyer Demand APIs

Current demand route status:

| Method | Route | Status |
| --- | --- | --- |
| `POST` | `/api/demands` | Implemented |
| `GET` | `/api/demands` | Implemented |
| `GET` | `/api/demands/[id]` | Implemented |
| `PATCH` | `/api/demands/[id]` | Implemented |
| `DELETE` | `/api/demands/[id]` | Implemented |

### Access Rules

- Buyers can create, update, view, and delete their own demand requests.
- Admins can view and manage all demand requests.
- Other roles receive `403 Forbidden`.

### Demand Create Request Body

```json
{
  "crop_name": "Maize",
  "quantity": 50,
  "unit": "bags",
  "required_date": "2026-08-20",
  "location": "Kisumu",
  "notes": "Need delivery before the school term starts",
  "status": "open"
}
```

### Demand Validation Notes

- `crop_name`, `quantity`, `unit`, `required_date`, and `location` are required.
- `quantity` must be greater than `0`.
- Allowed statuses are `open`, `matched`, `booked`, `cancelled`, and `fulfilled`.

---

## Sprint 6: Matching API

Current matching route status:

| Method | Route | Status |
| --- | --- | --- |
| `GET` | `/api/demands/[id]/matches` | Implemented |

### Access Rules

- Buyers can view matches for their own demand requests.
- Admins can view matches for any demand request.
- Other roles receive `403 Forbidden`.

### Matching Rules

The backend uses deterministic rules:

- crop name must match
- location must match
- supply quantity must cover demand quantity
- harvest date should be near the required date
- supply status must be open for matching (`planned`, `growing`, or `ready`)

### Matching Response Shape

The endpoint returns:

- the demand record
- the matched supply records
- a `match_count`

Each match includes:

- `match_score`
- `match_reasons`
- `harvest_gap_days`

---

## Sprint 8: Admin Reporting APIs

Current admin route status:

| Method | Route | Status |
| --- | --- | --- |
| `GET` | `/api/admin/summary` | Implemented |
| `GET` | `/api/admin/users` | Implemented |
| `GET` | `/api/admin/supplies` | Implemented |
| `GET` | `/api/admin/demands` | Implemented |
| `GET` | `/api/admin/bookings` | Implemented |

### Access Rules

- Only admins can access these routes.
- Non-admin users receive `403 Forbidden`.

### Admin Summary Response

```json
{
  "summary": {
    "users": 12,
    "supplies": 8,
    "demands": 6,
    "bookings": 3
  }
}
```

### Admin Users Response

```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com",
      "role": "admin",
      "phone": null,
      "location": null,
      "email_verified_at": null,
      "created_at": "2026-06-22T00:00:00.000Z",
      "updated_at": "2026-06-22T00:00:00.000Z"
    }
  ]
}
```

### Admin Supplies Response

```json
{
  "supplies": []
}
```

### Admin Demands Response

```json
{
  "demands": []
}
```

### Admin Bookings Response

```json
{
  "bookings": []
}
```

### Testing Note

These routes are meant to be tested with an admin session cookie or an admin login flow. The routes are read-only reporting endpoints and do not change data.

---

## Sprint 7: Booking APIs

Current booking route status:

| Method | Route | Status |
| --- | --- | --- |
| `POST` | `/api/bookings` | Implemented |
| `GET` | `/api/bookings` | Implemented |
| `GET` | `/api/bookings/[id]` | Implemented |
| `PATCH` | `/api/bookings/[id]/status` | Implemented |

### Access Rules

- Buyers can create bookings from their own demand requests.
- Buyers can view their own bookings and cancel them.
- Farmers can view bookings for their supplies and accept or reject them.
- Admins can view and update all bookings.

### Booking Create Request Body

```json
{
  "supply_id": 1,
  "demand_request_id": 2,
  "quantity": 50,
  "unit": "bags",
  "message": "Optional note to the farmer"
}
```

### Booking Validation Notes

- `supply_id`, `demand_request_id`, `quantity`, and `unit` are required.
- `quantity` must be greater than `0`.
- Supply and demand crop names must match.
- Supply and demand locations must match.
- Booking unit must match both supply and demand units.
- Booking quantity cannot exceed supply or demand quantity.
- New bookings start as `pending`.

### Booking Status Updates

Endpoint:

```text
PATCH /api/bookings/[id]/status
```

Request body:

```json
{
  "status": "accepted"
}
```

Allowed statuses:

```text
pending, accepted, rejected, cancelled, completed
```

Role rules:

- Buyers can only change their bookings to `cancelled`.
- Farmers can only change their bookings to `accepted` or `rejected`.
- Admins can use any valid status.
- Completed bookings cannot be changed back to another status.

Related status effects:

- `accepted` sets the linked crop supply to `booked`.
- `rejected` or `cancelled` reopens the linked demand request.
- `completed` marks the demand as `fulfilled` and returns the supply to `ready`.

---

## Manual Verification Log

These are the endpoint checks that were run locally in PowerShell during development:

### Auth

- `POST /api/auth/register` returned a created user for:
  - a test farmer account
  - a test buyer account
- `POST /api/auth/login` returned the signed-in user and set the session cookies.
- `POST /api/auth/logout` clears the auth session for the current browser session.

### Farmer supply

- `POST /api/supplies` created a crop supply for the signed-in farmer.
- `GET /api/supplies` returned the farmer's supply list.

### Buyer demand

- `POST /api/demands` created a demand request for the signed-in buyer.
- `GET /api/demands` returned the buyer's demand list.

### Booking flow

- `POST /api/bookings` created a booking from a matched supply and demand pair.
- `GET /api/bookings` returned the buyer's bookings.
- `PATCH /api/bookings/[id]/status` changed the booking status to `accepted`.
- `GET /api/bookings/[id]` returned the booking after the status update.

### Admin reporting

- `GET /api/admin/summary`
- `GET /api/admin/users`
- `GET /api/admin/supplies`
- `GET /api/admin/demands`
- `GET /api/admin/bookings`

These admin routes are implemented and included in the production build. They should be checked with an admin session once Docker is running again.
