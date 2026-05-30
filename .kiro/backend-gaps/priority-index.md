# Priority Index

Quick reference — all gaps ranked by impact on the booking flow and user experience.

---

## 🔴 Critical (Booking flow breaks without these)

| # | Gap | File | Fix |
|---|---|---|---|
| C1 | `GET /v1/trips/:id/seats` missing — `tripSeatId` is null, `POST /v1/bookings` fails with 400 | `SeatSelection.jsx` | Add trip seats endpoint |
| C2 | `POST /v1/bookings` `tripSeatId` required but frontend sends `null` | `Payment.jsx` | Depends on C1 |
| C3 | Login response shape undocumented — tokens may not be stored correctly | `AuthContext.jsx` | Document + confirm response shape |
| C4 | `GET /v1/auth/me` doesn't return `operatorId` — operator dashboard never loads | `OperatorOverview.jsx` | Add `operatorId` to me response |

---

## 🟠 High (Features broken or missing)

| # | Gap | File | Fix |
|---|---|---|---|
| H1 | No complaints API — entire complaint/dispute system is in-memory | `ComplaintsContext.jsx`, `UserBookings.jsx` | Add complaints endpoints |
| H2 | `POST /v1/payments/initiate` response field name unknown — payment redirect may not work | `Payment.jsx` | Document `paymentUrl` field |
| H3 | `GET /v1/bookings` response shape undocumented — booking list may show empty fields | `UserBookings.jsx` | Document response with nested relations |
| H4 | `GET /v1/tickets?bookingId=` response shape undocumented — ticket page shows `'—'` | `Ticket.jsx` | Document response with nested trip/traveler |

---

## 🟡 Medium (Degraded experience, fallbacks active)

| # | Gap | File | Fix |
|---|---|---|---|
| M1 | `GET /v1/operators` requires auth — public listing uses static data | `OperatorsListing.jsx` | Make GET public |
| M2 | `GET /v1/destinations` requires auth — landing page uses static data | `LandingPage.jsx` | Make GET public |
| M3 | Operator dashboard KPI fields undocumented — shows `'—'` for all metrics | `OperatorOverview.jsx` | Document dashboard response |
| M4 | Admin dashboard KPI fields undocumented — shows `'—'` for all metrics | `AdminSystemOverview.jsx` | Document dashboard response |
| M5 | `GET /v1/bookings` has no `operatorId` filter — operator sees all bookings | `OperatorOverview.jsx` | Add `operatorId` query param |
| M6 | `GET /v1/trips` response may not embed `operator` relation — sort by rating broken | `SearchResults.jsx` | Embed operator in trip response |
| M7 | `upcomingTrips` not embedded in operator response — profile shows "No trips" | `OperatorProfile.jsx` | Embed or add separate endpoint |

---

## 🟢 Low (Minor, non-blocking)

| # | Gap | File | Fix |
|---|---|---|---|
| L1 | No `GET /v1/tickets/:id/pdf` — download button is a no-op | `Ticket.jsx` | Add PDF endpoint |
| L2 | Booking cancellation has no refund response — no feedback shown | `UserBookings.jsx` | Add refund fields to cancel response |
| L3 | No `GET /v1/locations` — city dropdowns use static array | `SearchResults.jsx`, `LandingPage.jsx` | Add locations endpoint or derive from routes |
| L4 | Pagination envelope inconsistency — some endpoints may use `items` vs `data` | All list pages | Standardise to `{ data: [], total, page, limit }` |
| L5 | Jobs API not role-restricted — any user could trigger seat expiry | N/A | Add admin role guard |

---

## Summary Counts

| Severity | Count |
|---|---|
| 🔴 Critical | 4 |
| 🟠 High | 4 |
| 🟡 Medium | 7 |
| 🟢 Low | 5 |
| **Total** | **20** |
