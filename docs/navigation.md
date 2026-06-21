# MarketSync Navigation Guide

This document explains what each main role-based page does and how the nested pages connect.

---

## Buyer Pages

### `/buyer`

Main buyer dashboard.

Shows:

- total demand requests
- active matches
- pending bookings
- quick links to create demand and view bookings

---

### `/buyer/demands`

List of buyer's demand requests.

Example content:

- crop needed
- quantity
- delivery location
- required date
- status
- buttons:
  - View
  - Find Matches
  - New Demand

---

### `/buyer/demands/new`

Form to create a demand request.

Fields:

- crop name
- quantity
- unit
- delivery location
- required date
- max price / budget
- notes
- status

For now button can be:

```tsx
<button type="button">Save demand request</button>
```

Later it submits to:

```txt
POST /api/demands
```

---

### `/buyer/demands/[id]`

Details page for one demand request.

Shows:

- crop
- quantity
- delivery location
- required date
- status
- budget
- notes

Also link to:

```txt
/buyer/demands/[id]/matches
```

---

### `/buyer/demands/[id]/matches`

Shows farmer supplies that match that buyer demand.

Example content:

- farmer/location
- crop
- available quantity
- harvest date
- price
- match reason

Button:

- Create booking

Later connects to:

```txt
GET /api/demands/:id/matches
POST /api/bookings
```

---

### `/buyer/bookings`

Shows buyer's booking history.

Example content:

- crop
- farmer
- quantity
- date
- status

Statuses:

- Pending
- Accepted
- Rejected
- Completed
- Cancelled

---

## Farmer Pages

### `/farmer`

Main farmer dashboard.

Shows:

- crop planning calendar preview
- active booking contracts
- quick link to log a new crop
- quick links to supplies, calendar, and bookings

---

### `/farmer/supplies`

List of farmer's crop supplies.

Example content:

- crop name
- quantity
- farm/location
- planting date
- harvest date
- status
- buttons:
  - View
  - Add new supply

Later connects to:

```txt
GET /api/supplies
```

---

### `/farmer/supplies/new`

Form to create a new crop supply.

Fields:

- crop name
- quantity
- unit
- location
- planting date
- expected harvest date
- status

For now button can be:

```tsx
<button type="button">Save crop supply</button>
```

Later it submits to:

```txt
POST /api/supplies
```

---

### `/farmer/supplies/[id]`

Details page for one crop supply.

Shows:

- crop
- quantity
- location
- planting date
- harvest date
- status
- price

The `[id]` part means this page works for any supply id, such as:

```txt
/farmer/supplies/1
/farmer/supplies/2
/farmer/supplies/3
```

Later connects to:

```txt
GET /api/supplies/:id
PATCH /api/supplies/:id
DELETE /api/supplies/:id
```

---

### `/farmer/calendar`

Crop calendar or harvest timeline page.

Shows:

- crop name
- planting activity
- expected harvest date
- location
- status

Purpose:

- helps the farmer track upcoming harvests
- helps the system know when crops may become available to buyers

Later connects to:

```txt
GET /api/supplies
```

---

### `/farmer/bookings`

Shows buyer booking requests for the farmer's crops.

Example content:

- buyer name
- crop
- quantity
- request date
- booking status
- buttons:
  - Accept
  - Reject

Statuses:

- Pending
- Accepted
- Rejected
- Completed
- Cancelled

Later connects to:

```txt
GET /api/bookings
PATCH /api/bookings/:id/status
```

---

## Route Tree

```txt
src/app/
├── buyer/
│   ├── page.tsx                         → /buyer
│   ├── demands/
│   │   ├── page.tsx                     → /buyer/demands
│   │   ├── new/page.tsx                 → /buyer/demands/new
│   │   └── [id]/
│   │       ├── page.tsx                 → /buyer/demands/1
│   │       └── matches/page.tsx         → /buyer/demands/1/matches
│   └── bookings/page.tsx                → /buyer/bookings
│
└── farmer/
    ├── page.tsx                         → /farmer
    ├── supplies/
    │   ├── page.tsx                     → /farmer/supplies
    │   ├── new/page.tsx                 → /farmer/supplies/new
    │   └── [id]/page.tsx                → /farmer/supplies/1
    ├── calendar/page.tsx                → /farmer/calendar
    └── bookings/page.tsx                → /farmer/bookings
```

---

## Simple Explanation

In Next.js App Router, folders create URL paths and `page.tsx` files create pages.

Example:

```txt
src/app/farmer/supplies/page.tsx
```

becomes:

```txt
/farmer/supplies
```

Dynamic folders like `[id]` create reusable details pages for one item.

Example:

```txt
src/app/farmer/supplies/[id]/page.tsx
```

can show:

```txt
/farmer/supplies/1
/farmer/supplies/2
/farmer/supplies/3
```
