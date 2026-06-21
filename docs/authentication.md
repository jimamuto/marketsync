# MarketSync Authentication

This document explains the current MarketSync authentication work, what has been completed, and what remains.

---

## Ownership

Current working split:

- **Jim**: frontend auth pages, nested page creation, page wiring, loading/error states, and user-facing flows.
- **Christine**: backend auth APIs, database/security logic, email/token handling, and API tests.

This split keeps Jim moving quickly on UI while Christine finishes the API layer that those pages will call.

---

## Auth Goal

MarketSync uses custom authentication backed by the existing PostgreSQL `users` table.

Allowed roles:

```text
farmer, buyer, admin
```

Rules:

- Farmers use the farmer dashboard.
- Buyers use the buyer dashboard.
- Admins use the admin dashboard.
- Public registration must not create admin accounts.
- Admin accounts are seeded by a database script.
- Passwords are stored as hashes, never as plain text.
- API responses must never return `password_hash`.

---

## Completed Work

### Auth helper

File:

```text
src/lib/auth.ts
```

Purpose:

- Defines valid user roles.
- Checks whether a role is valid.
- Hashes passwords with `bcryptjs`.
- Compares submitted passwords with stored password hashes.
- Converts database user rows into safe user objects.

---

### Mail helper

File:

```text
src/lib/mail.ts
```

Purpose:

- Centralizes SMTP email sending.
- Uses environment variables for SMTP host, port, user, and app password.
- Supports future password reset, email verification, and 2FA email flows.

Required local environment values:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
APP_URL=http://localhost:3000
```

Do not commit real email credentials.

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
- Blocks public admin registration.
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

Expected error cases:

| Status | Reason |
| --- | --- |
| `400` | Required fields are missing. |
| `400` | Password is too short. |
| `400` | Role is not `farmer`, `buyer`, or `admin`. |
| `403` | Public registration attempted to create an admin. |
| `409` | Email already exists. |
| `500` | Unexpected server/database error. |

---

### Login API

File:

```text
src/app/api/auth/login/route.ts
```

Endpoint:

```text
POST /api/auth/login
```

Purpose:

- Reads email and password from the request body.
- Looks up the user by email.
- Compares the submitted password with the stored hash.
- Returns safe user data on success.
- Sets auth cookies used by the frontend navigation and role redirects.

Frontend redirects by role:

```text
farmer -> /farmer
buyer -> /buyer
admin -> /admin
```

---

### Logout API

File:

```text
src/app/api/auth/logout/route.ts
```

Endpoint:

```text
POST /api/auth/logout
```

Purpose:

- Clears auth cookies.
- Allows the logout button to return the user to `/login`.

---

### Admin seed script

File:

```text
database/migrations/006_seed_admin_user.sql
```

Purpose:

- Creates a known admin user because public registration blocks admin accounts.
- Uses a pre-hashed password.
- Uses `ON CONFLICT (email) DO UPDATE` so the script can be run more than once safely.

Local test admin:

```text
Email: admin@marketsync.local
Password: Admin123!
```

---

### Password reset token migration

File:

```text
database/migrations/007_create_password_reset_tokens.sql
```

Purpose:

- Stores hashed password reset tokens.
- Links reset tokens to users.
- Tracks expiry and whether a token has already been used.

This migration has been run locally.

---

### Auth frontend pages

Implemented pages:

```text
/login
/register
/forgot-password
/reset-password
/check-email
/unauthorized
```

Files:

```text
src/app/login/page.tsx
src/app/register/page.tsx
src/app/forgot-password/page.tsx
src/app/reset-password/page.tsx
src/app/check-email/page.tsx
src/app/unauthorized/page.tsx
```

Current state:

- Login and register pages call real APIs.
- Forgot/reset pages exist and are ready to be connected to Christine's password reset APIs.
- Check-email and unauthorized pages are presentational support pages.

---

### Current User API

File:

```text
src/app/api/auth/me/route.ts
```

Endpoint:

```text
GET /api/auth/me
```

Purpose:

- Reads auth cookies.
- Returns the current safe user if logged in.
- Returns `401` if not logged in.
- Never returns `password_hash`.

---

### Forgot Password API

File:

```text
src/app/api/auth/forgot-password/route.ts
```

Endpoint:

```text
POST /api/auth/forgot-password
```

Purpose:

- Accepts an email address.
- Always returns a generic success message so attackers cannot discover registered emails.
- If the user exists:
  - creates a random reset token
  - stores only a hash of that token
  - sets a 30 minute expiry time
  - emails a reset link such as `/reset-password?token=...`

---

### Reset Password API

File:

```text
src/app/api/auth/reset-password/route.ts
```

Endpoint:

```text
POST /api/auth/reset-password
```

Purpose:

- Accepts `token` and new `password`.
- Requires the new password to be at least 8 characters.
- Hashes the submitted token.
- Finds a matching unused, unexpired token.
- Hashes the new password.
- Updates `users.password_hash`.
- Marks the reset token as used.

---

## Remaining Auth Work

### Christine: backend/API follow-up work

- Add API tests or documented curl/Thunder Client checks for current-user and password reset endpoints.
- Confirm SMTP placeholders are documented safely without real credentials.
- Help verify the complete reset flow after the frontend pages call the APIs.

Future/optional APIs:

```text
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/2fa/setup
POST /api/auth/2fa/verify
POST /api/auth/2fa/disable
```

---

### Jim: frontend work

Next frontend tasks:

- Connect `/forgot-password` to `POST /api/auth/forgot-password`.
- Connect `/reset-password` to `POST /api/auth/reset-password`.
- Read the reset token from the URL query string.
- Show loading, success, and error states.
- Redirect to `/check-email` after a successful forgot-password request.
- Redirect to `/login` after a successful password reset.
- Use `/unauthorized` when a logged-in user reaches a page for the wrong role.
- Use `GET /api/auth/me` for future protected page checks.

---

## Manual Testing Plan

Run the app:

```bash
npm run dev
```

Test register/login/logout manually through the pages:

```text
/register
/login
```

Test admin login with the seeded account:

```text
Email: admin@marketsync.local
Password: Admin123!
```

Run checks before committing auth changes:

```bash
npm run lint
npm run build
```

Current known completed checks:

```text
npm run lint passed
npm run build passed
```

---

## Notes

- `.env` must stay untracked.
- Use `.env.example` for safe placeholder values only.
- Gmail app passwords are acceptable for local MVP/demo use.
- A production deployment should eventually use a transactional email provider such as Resend, SendGrid, Mailgun, or AWS SES.
- Password reset backend APIs are implemented; remaining reset work is frontend wiring and endpoint checks.
- 2FA should be completed only after the base login/session and password reset flows are stable.
