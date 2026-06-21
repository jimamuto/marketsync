# MarketSync API Documentation

This document tracks the backend API routes as they are created and tested.

---

## Sprint 3: Authentication APIs

Sprint 3 builds the authentication API layer before frontend login/register screens.

Current auth route status:

| Method | Route | Status | Owner |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Started / golden example | Current work |
| `POST` | `/api/auth/login` | To do | Follow-up colleague task |
| `POST` | `/api/auth/logout` | To do | Follow-up colleague task |
| `GET` | `/api/auth/me` | Later | Needs session/cookie/JWT decision |

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

## Planned `POST /api/auth/login`

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

## Planned `POST /api/auth/logout`

Expected behavior for the current simple version:

1. Accept a `POST` request.
2. Return a success message.

Expected success response:

```json
{
  "message": "Logged out successfully."
}
```

A fuller logout flow can be added later after the project decides on session, cookie, or JWT handling.

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
