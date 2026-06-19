# MarketSync Page Guide

This guide tracks the pages we have, the pages we are building in Sprint 3, and what each page is responsible for.

---

## Current Page Map

| Route | File | Purpose | Status | Owner |
| --- | --- | --- | --- | --- |
| `/` | `src/app/page.tsx` | Public homepage / intro landing page | Existing | Team |
| `/register` | `src/app/register/page.tsx` | User registration form | In progress / built from register API | Current frontend work |
| `/login` | `src/app/login/page.tsx` | User login form | To do | Colleague |
| `/farmer` | `src/app/farmer/page.tsx` | Farmer dashboard | To do | Current dashboard branch |
| `/buyer` | `src/app/buyer/page.tsx` | Buyer dashboard | To do | Current dashboard branch |
| `/admin` | `src/app/admin/page.tsx` | Admin dashboard | To do | Current dashboard branch |

---

## Shared Layout

### Root Layout

File:

```text
src/app/layout.tsx
```

Purpose:

- Loads global styles.
- Wraps every page.
- Renders the shared navbar above page content.

### Navbar

File:

```text
src/components/Navbar.tsx
```

Purpose:

- Gives users a consistent way to move around the app.
- Should include links to the main public and role pages.

Recommended links during Sprint 3:

```text
Home
Register
Login
Farmer
Buyer
Admin
```

---

## Sprint 3 Page Priorities

Sprint 3 is focused on moving fast by building APIs and frontend page shells in parallel.

### Current work split

Current developer:

```text
/register page
/farmer page
/buyer page
/admin page
page guide docs
```

Colleague:

```text
POST /api/auth/login
POST /api/auth/logout
/login page
manual auth testing
```

---

## Wireframe-Based Page Plan

The wireframe maps to three major dashboard areas.

### Farmer Dashboard

Route:

```text
/farmer
```

File:

```text
src/app/farmer/page.tsx
```

Wireframe reference:

```text
Mobile-style crop planning calendar screen
```

Page sections:

- Crop Planning Calendar
- Log New Crop Planting Cycle button/card
- Active Booking Contracts
- Buyer name
- Quantity requested
- Booking status
- Delivery date
- Accept booking action

Sprint 3 version:

- Static UI shell first.
- Use sample placeholder data.
- No database fetch yet.
- No auth protection yet.

Future API connections:

```text
crop_supplies
bookings
```

---

### Buyer Dashboard

Route:

```text
/buyer
```

File:

```text
src/app/buyer/page.tsx
```

Wireframe reference:

```text
Procurement demand and matched harvest listing screen
```

Page sections:

- Submit Procurement Demand form
- Crop Required field
- Demanded Quantity field
- Target Delivery Window field
- Special Delivery Instructions field
- Matched Harvest Listings Feed
- Procurement History & Delivery Schedule table

Sprint 3 version:

- Static UI shell first.
- Use sample matched harvest cards.
- Use sample procurement history rows.
- No database fetch yet.

Future API connections:

```text
demand_requests
crop_supplies
bookings
```

---

### Admin Dashboard

Route:

```text
/admin
```

File:

```text
src/app/admin/page.tsx
```

Wireframe reference:

```text
Desktop supply-demand summary dashboard
```

Page sections:

- Sidebar navigation
- Analytics
- Verification
- Configuration
- Audit Logs
- Supply-Demand Summary Dashboard
- Projected Crop Supply vs Institutional Demand chart area
- Synchronization / Auto-Match Engine panel
- Pending User Account Validation Queue
- Validate account actions

Sprint 3 version:

- Static admin dashboard shell first.
- Use sample metrics and table rows.
- No real validation workflow yet.

Future API connections:

```text
users
crop_supplies
demand_requests
bookings
```

---

## Register Page

Route:

```text
/register
```

File:

```text
src/app/register/page.tsx
```

Purpose:

- Allows a user to create a MarketSync account.
- Sends form data to `POST /api/auth/register`.

Fields:

```text
name
email
password
role
phone
location
```

Connected API:

```text
POST /api/auth/register
```

Status:

```text
Built / verify with lint and build
```

---

## Login Page

Route:

```text
/login
```

File:

```text
src/app/login/page.tsx
```

Purpose:

- Allows an existing user to log in.
- Should copy the structure of the register page.

Fields:

```text
email
password
```

Connected API:

```text
POST /api/auth/login
```

Status:

```text
Assigned to colleague
```

---

## Page Build Rules

For Sprint 3 speed:

1. Build the page shell first.
2. Use static sample data if the API is not ready.
3. Keep page sections close to the wireframe.
4. Avoid auth protection until login/session strategy is decided.
5. Keep styling in `src/app/globals.css` for now.
6. Reuse existing classes where possible.
7. Run verification before committing:

```bash
npm run lint
npm run build
```

---

## Next Pages to Build on `feature/dashboard-pages`

Recommended order:

```text
1. src/app/farmer/page.tsx
2. src/app/buyer/page.tsx
3. src/app/admin/page.tsx
4. update src/components/Navbar.tsx links
5. update src/app/globals.css dashboard styles
```

Reason:

- Farmer page is the simplest wireframe.
- Buyer page is most connected to demand workflow.
- Admin page is bigger, but can stay as a static dashboard shell for Sprint 3.
