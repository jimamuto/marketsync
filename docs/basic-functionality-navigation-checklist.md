# Basic Functionality and Navigation Checklist

Use this checklist before moving from static page shells into real dashboard/database functionality.

---

## Goal

Confirm that the main pages are connected, navigable, understandable, and safe to demo before adding live dashboard data.

---

## 1. Global Navigation

- [ ] Confirm the navbar appears on all main pages.
- [ ] Confirm navbar links work:
  - [ ] Home: `/`
  - [ ] Register: `/register`
  - [ ] Login: `/login`
  - [ ] Farmer: `/farmer`
  - [ ] Buyer: `/buyer`
  - [ ] Admin: `/admin`
- [ ] Confirm no navbar link points to a missing route.
- [ ] Confirm mobile/small-screen navbar layout is still usable.

---

## 2. Home Page `/`

- [ ] Confirm the homepage loads without errors.
- [ ] Add or verify clear calls to action:
  - [ ] Register
  - [ ] Login
- [ ] Confirm the homepage explains the basic MarketSync purpose.
- [ ] Confirm links from the homepage route correctly.

Effort: **Small**

---

## 3. Register Page `/register`

- [ ] Confirm form fields exist:
  - [ ] Name
  - [ ] Email
  - [ ] Password
  - [ ] Role
  - [ ] Phone
  - [ ] Location
- [ ] Confirm the page submits to `POST /api/auth/register`.
- [ ] Confirm registration creates a user in the database.
- [ ] Confirm password is hashed before saving.
- [ ] Confirm duplicate email shows a clear error.
- [ ] Confirm missing required fields show a clear error.
- [ ] Confirm short password shows a clear error.
- [ ] Confirm success message appears after registration.
- [ ] Decide whether successful registration should:
  - [ ] stay on `/register` with a success message, or
  - [ ] redirect to `/login`.

Recommended for now: **stay on `/register` and show success message**.

Effort: **Small–Medium**

---

## 4. Login Page `/login`

- [ ] Confirm form fields exist:
  - [ ] Email
  - [ ] Password
- [ ] Confirm the page submits to `POST /api/auth/login`.
- [ ] Confirm login checks the database user record.
- [ ] Confirm login checks password against `password_hash`.
- [ ] Confirm invalid email/password shows a clear error.
- [ ] Confirm successful login sets session cookies:
  - [ ] `session_user_id`
  - [ ] `session_role`
- [ ] Replace fixed redirect with role-based redirect:
  - [ ] Farmer users go to `/farmer`
  - [ ] Buyer users go to `/buyer`
  - [ ] Admin users go to `/admin`
- [ ] Keep fallback redirect to `/` if role is missing or unexpected.

Suggested redirect logic:

```ts
const roleRoutes = {
  farmer: "/farmer",
  buyer: "/buyer",
  admin: "/admin",
} as const;

router.push(roleRoutes[data.user.role as keyof typeof roleRoutes] ?? "/");
```

Effort: **Small**

---

## 5. Farmer Dashboard `/farmer`

- [ ] Confirm the page loads without errors.
- [ ] Confirm the page matches the planned static shell:
  - [ ] Crop Planning Calendar
  - [ ] Log New Crop Planting Cycle action/card
  - [ ] Active Booking Contracts
  - [ ] Buyer name
  - [ ] Quantity requested
  - [ ] Booking status
  - [ ] Delivery date
  - [ ] Accept booking action
- [ ] Confirm all buttons are honest before APIs exist:
  - [ ] disabled,
  - [ ] marked as demo/static, or
  - [ ] showing a clear “coming soon” message.
- [ ] Confirm no button pretends to save real data yet.

Effort: **Small**

---

## 6. Buyer Dashboard `/buyer`

- [ ] Confirm the page loads without errors.
- [ ] Confirm the page matches the planned static shell:
  - [ ] Submit Procurement Demand form
  - [ ] Crop Required field
  - [ ] Demanded Quantity field
  - [ ] Target Delivery Window field
  - [ ] Special Delivery Instructions field
  - [ ] Matched Harvest Listings Feed
  - [ ] Procurement History & Delivery Schedule table
- [ ] Decide whether the procurement form is currently:
  - [ ] fully static,
  - [ ] disabled, or
  - [ ] allowed to submit only a local demo message.
- [ ] Confirm no buyer form sends fake or incomplete data to the database.
- [ ] Confirm matched harvest cards are clearly sample data.

Effort: **Small–Medium**

---

## 7. Admin Dashboard `/admin`

- [ ] Confirm the page loads without errors.
- [ ] Confirm the page matches the planned static shell:
  - [ ] Sidebar navigation
  - [ ] Analytics
  - [ ] Verification
  - [ ] Configuration
  - [ ] Audit Logs
  - [ ] Supply-Demand Summary Dashboard
  - [ ] Projected Crop Supply vs Institutional Demand area
  - [ ] Synchronization / Auto-Match Engine panel
  - [ ] Pending User Account Validation Queue
- [ ] Confirm sidebar links either:
  - [ ] navigate correctly,
  - [ ] scroll to sections correctly, or
  - [ ] are visibly placeholder/static.
- [ ] Confirm validation buttons are disabled/static until real validation workflow exists.
- [ ] Confirm no admin action pretends to update real account status yet.

Effort: **Small–Medium**

---

## 8. Logout / Session Follow-up

This can happen after basic login redirect is done.

- [ ] Confirm `POST /api/auth/logout` clears session cookies.
- [ ] Decide where a logout button should appear:
  - [ ] Navbar
  - [ ] Dashboard pages
  - [ ] both
- [ ] Confirm logout redirects user to `/login` or `/`.

Effort: **Small–Medium**

---

## 9. Verification

Run before moving to real dashboard data:

```bash
npm run lint
npm run build
```

Manual route check:

- [ ] `/`
- [ ] `/register`
- [ ] `/login`
- [ ] `/farmer`
- [ ] `/buyer`
- [ ] `/admin`

Manual auth check:

- [ ] Register a farmer account.
- [ ] Register a buyer account.
- [ ] Register an admin account.
- [ ] Log in as farmer and confirm redirect to `/farmer`.
- [ ] Log in as buyer and confirm redirect to `/buyer`.
- [ ] Log in as admin and confirm redirect to `/admin`.

---

## Definition of Done

This phase is complete when:

- [ ] All main pages load successfully.
- [ ] Navbar navigation works.
- [ ] Register is connected to the database.
- [ ] Login is connected to the database.
- [ ] Login redirects users by role.
- [ ] Static dashboard buttons do not imply unfinished real functionality.
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.

---

## Recommended Next Step After This Checklist

Start real dashboard functionality in this order:

1. Farmer crop supply records.
2. Buyer demand request records.
3. Booking/matching flow.
4. Admin validation queue.
