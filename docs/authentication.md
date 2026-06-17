# MarketSync Authentication

This document explains the Sprint 3 authentication work currently in progress.

---

## Sprint 3 Auth Goal

Sprint 3 focuses on building simple custom authentication APIs before the full frontend screens are created.

The authentication work uses the existing `users` table from the database migrations.

Allowed user roles are:

```text
farmer, buyer, admin
```

---

## Work Completed So Far

### Auth Helper Library

File:

```text
src/lib/auth.ts
```

Purpose:

- Defines the valid user roles.
- Checks whether a submitted role is valid.
- Hashes passwords before saving them.
- Compares submitted passwords with stored password hashes.
- Converts a database user row into a safe user object.

Important rule:

```text
Never return password_hash in API responses.
```

The helper uses `bcryptjs` for password hashing.

---

### Register API

File:

```text
src/app/api/auth/register/route.ts
```

Endpoint:

```text
POST /api/auth/register
```

Purpose:

- Reads registration data from the request body.
- Validates required fields.
- Validates the user role.
- Checks whether the email already exists.
- Hashes the password.
- Inserts the new user into the `users` table.
- Returns safe user data without the password hash.

Example request body:

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

Example success response:

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

Expected error cases:

| Status | Reason |
| --- | --- |
| `400` | Required fields are missing. |
| `400` | Password is too short. |
| `400` | Role is not `farmer`, `buyer`, or `admin`. |
| `409` | Email already exists. |
| `500` | Unexpected server/database error. |

---

## Remaining Sprint 3 Auth Work

The next APIs are assigned as follow-up work:

```text
POST /api/auth/login
POST /api/auth/logout
```

Recommended split:

- Existing register endpoint is the golden example.
- Login should copy the same route, validation, database, and safe-response style.
- Logout can be a simple endpoint for now.

---

## Manual Testing Plan

After starting the app with:

```bash
npm run dev
```

Test registration with an API client or curl.

Windows PowerShell/cmd-style example:

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ama Farmer\",\"email\":\"ama@example.com\",\"password\":\"password123\",\"role\":\"farmer\",\"phone\":\"0240000000\",\"location\":\"Kumasi\"}"
```

Verification command run during this work:

```bash
npm run lint
```

Result:

```text
Lint completed successfully.
```

---

## Notes

- Passwords must be stored as hashes, not plain text.
- API responses must not expose `password_hash`.
- The `users` table is shared by farmers, buyers, and admins.
- `.env` should stay untracked; use `.env.example` for template values if needed.
