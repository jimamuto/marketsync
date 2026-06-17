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
