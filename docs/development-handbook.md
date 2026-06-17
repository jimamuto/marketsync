# MarketSync Development Handbook

Project: **Web-Based Market Synchronization and B2B Booking Platform for Small-Scale Farmers and Institutional Buyers in Kenya**

This handbook is the shared agreement document for both partners. It explains what the system will do, what will be built first, how branches will be used, how Docker will support development, and how every major change will be documented.

Implementation should begin only after both partners agree on this roadmap.

---

## 1. Proposal Alignment: What the System Is Supposed to Do

This roadmap is based on Chapters 1-4 of the proposal document.

### Chapter 1: Problem and Aim

Small-scale farmers often make planting decisions without reliable future market demand information. This causes a mismatch between what farmers produce and what institutional buyers need. The result is surplus produce, food wastage, unstable prices, and low farmer income. Institutional buyers such as schools and hospitals also face unstable supply and procurement costs.

The aim of the project is to build a **web-based market synchronization system** that helps farmers plan crop cycles using a visual calendar and helps institutional buyers reserve produce through a B2B booking module.

### Chapter 1: Scope

The project scope is:

- web application only
- small-scale farmers and institutional buyers as main users
- Next.js for the web application
- PostgreSQL for the database
- deterministic matching logic, not AI
- no payments in the MVP
- no physical logistics tracking in the MVP
- no native mobile app in the MVP

### Chapter 2: Difference From Existing Systems

Existing digital agriculture platforms mainly provide reactive information, such as current prices. MarketSync should focus on **future coordination**:

- farmer expected harvests
- buyer future demand
- matching before harvest
- booking/reservation before produce reaches the market

### Chapter 3: Methodology

The project should follow an agile-style approach:

- agree on backlog
- plan sprints
- build small vertical slices
- review after each sprint
- document every major change
- test continuously

### Chapter 4: Requirements

Main users:

1. Farmer
2. Institutional Buyer
3. System Administrator

Core system requirements:

- farmer account creation/login
- buyer account creation/login
- admin access
- farmer crop supply entry
- crop calendar information
- buyer demand entry
- supply-demand matching
- B2B booking request
- farmer accept/reject booking
- booking status tracking
- admin monitoring/reporting

---

## 2. Fresh-Slate Development Decision

Before implementation begins, the team should agree on the development process and system direction.

Reason:

- both partners need to understand the system from the beginning
- the final project should be built deliberately, not rushed
- the team needs a shared roadmap before coding
- branches, Docker, and documentation standards should be agreed first

Current repository purpose:

- planning
- sprint structure
- development handbook
- Docker plan
- branching rules
- documentation standards

---

## 3. Agreed MVP

The MVP should prove the central project idea without becoming too large.

### MVP Goal

A farmer can publish future crop supply. A buyer can publish future demand. The system can match the two. The buyer can send a booking request. The farmer can accept or reject it.

### MVP Must Include

1. User roles
   - Farmer
   - Institutional Buyer
   - Admin

2. Farmer crop supply
   - crop name
   - quantity
   - unit
   - planting date
   - expected harvest date
   - location
   - status

3. Buyer demand request
   - crop needed
   - quantity
   - unit
   - required date
   - location
   - notes/status

4. Matching logic
   - crop name match
   - location match
   - quantity check
   - date window check

5. Booking
   - buyer sends request
   - farmer accepts/rejects
   - status is stored

6. Admin overview
   - view users
   - view supply
   - view demand
   - view bookings

### Out of Scope for MVP

- AI prediction
- payment integration
- SMS integration
- logistics tracking
- complex analytics
- full MFA
- native mobile app

---

## 4. Technology Agreement

### Application

- Next.js
- TypeScript
- PostgreSQL
- Raw SQL through PostgreSQL driver

### Development Environment

- Local PostgreSQL will be used for development.
- Docker Compose is recommended so both partners can run the same PostgreSQL setup.
- Every database table/change must be captured in numbered SQL migration scripts.
- Local development should not depend on one partner's machine setup.

### Why PostgreSQL Directly

The team is more comfortable with PostgreSQL . Raw SQL is easier to explain during presentation because table structure and queries are visible.

---

## 5. Team Workflow

Do not strictly split work as “one person only backend” and “one person only frontend.”

Use **primary + backup ownership**.

| Area | Primary | Backup |
| --- | --- | --- |
| Database | Partner A | Partner B |
| API/backend | Partner A | Partner B |
| Frontend | Partner B | Partner A |
| Matching logic | Both | Both |
| Booking flow | Both | Both |
| Documentation | Both | Both |
| Presentation | Both | Both |

Rule:

> If one partner is absent, the other must still explain the full system.

After every feature, both partners should answer:

1. What problem does this feature solve?
2. Which table stores its data?
3. Which API route handles it?
4. Which page uses it?
5. How does it connect to the demo flow?

---

## 6. Development Standards

### Branches

All work should happen on branches. Do not work directly on `main` except for documentation-only emergency fixes if agreed.

Recommended branch names:

- `docs/roadmap`
- `setup/local-postgres-docker`
- `database/initial-migrations`
- `feature/auth`
- `feature/farmer-supply`
- `feature/buyer-demand`
- `feature/matching`
- `feature/bookings`
- `feature/admin-overview`
- `feature/calendar`

### Documentation Requirement

Every major change must include documentation.

Examples:

- Database change: add/update SQL migration and update `docs/database.md`
- API change: update `docs/api.md`
- Docker/setup change: update `docs/docker-development.md`
- Feature change: update the relevant sprint notes or feature documentation
- Presentation-impacting change: update `docs/presentation-guide.md`

### Review Requirement

Before merging any branch:

- code builds
- feature is explained to the other partner
- documentation is updated
- branch is reviewed by the other partner
- demo impact is understood

---

## 7. High-Level Roadmap

1. Planning and agreement
2. Local PostgreSQL/Docker setup
3. Database schema and migration scripts
4. Authentication and roles
5. Farmer supply feature
6. Buyer demand feature
7. Matching feature
8. Booking feature
9. Admin overview
10. Calendar/demo polish
11. Testing and presentation preparation

See `docs/sprint-plan.md` for the detailed sprint structure.

---

## 8. Presentation Preparation

The presentation should explain:

- the real-world problem
- why reactive market information is not enough
- how the system supports future planning
- the farmer flow
- the buyer flow
- the matching logic
- the booking flow
- the database design
- how Docker supports development
- how branches and documentation were used professionally

Both partners should practice explaining the system independently.
