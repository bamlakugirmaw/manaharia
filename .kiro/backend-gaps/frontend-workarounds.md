# Frontend Workarounds

These are places in the frontend code that are working around a backend gap. Each item describes what the workaround is, why it exists, and what needs to change on the backend to remove it.

---

## 1. Static Operator Data Fallback

**File:** `OperatorsListing.jsx`, `OperatorProfile.jsx`

**Workaround:**
```js
const allOperators = apiOperators ?? getAllOperators();  // falls back to operators-data.js
```

**Why:** `GET /v1/operators` requires auth. Public visitors get static data.

**Remove when:** Backend makes `GET /v1/operators` and `GET /v1/operators/:id` public (no auth required for reads).

---

## 2. Static Destinations on Landing Page

**File:** `LandingPage.jsx`

**Workaround:** Imports `DESTINATIONS` from `mock-db.js` directly. No API call.

**Why:** `GET /v1/destinations` requires auth. Landing page is public.

**Remove when:** Backend makes `GET /v1/destinations` public.

---

## 3. Static LOCATIONS Array for Search Dropdowns

**File:** `SearchResults.jsx`, `LandingPage.jsx`

**Workaround:**
```js
import { LOCATIONS } from '../data/mock-db';
// Used to populate From/To dropdowns
```

**Why:** There is no `GET /v1/locations` or `GET /v1/routes/locations` endpoint. Locations are derived from route origin/destination fields but there's no dedicated endpoint to list all unique city names.

**Remove when:** Backend adds `GET /v1/routes` (already public) and the frontend derives unique locations from the route list, OR backend adds a dedicated `GET /v1/locations` endpoint.

---

## 4. Bus Seat ID Used as Trip Seat ID

**File:** `SeatSelection.jsx`

**Workaround:**
```js
const busId = trip?.bus?.id ?? trip?.busId;
const { data: seatsResponse } = useSeats(busId);  // GET /v1/seats?busId=
// ...
const tripSeatId = seatIdMap[seatLabel] ?? null;  // null if not found
```

**Why:** There is no `GET /v1/trips/:id/seats` endpoint. The frontend uses bus seat IDs as a proxy, but these are not the same as trip seat IDs required by `POST /v1/bookings`.

**Remove when:** Backend adds `GET /v1/trips/:id/seats` returning trip-level seat records with `{ id (tripSeatId), seatNumber, status }`.

---

## 5. Complaint System Entirely In-Memory

**File:** `ComplaintsContext.jsx`, `UserBookings.jsx`, `UserComplaints.jsx`

**Workaround:** All complaint data lives in React state. Pre-seeded with `INITIAL_COMPLAINTS`. Resets on page refresh.

**Why:** No complaints API exists on the backend.

**Remove when:** Backend adds the complaints endpoints (see missing-endpoints.md item 1). Replace `ComplaintsContext` with React Query hooks.

---

## 6. Payment Confirmation Without Webhook

**File:** `Payment.jsx`

**Workaround:**
```js
// If gateway returned a paymentUrl, redirect. Otherwise go straight to ticket page.
if (paymentUrl) {
    window.location.href = paymentUrl;
} else {
    navigate(`/booking/ticket/${bookingId}`, { state: { booking, ... } });
}
```

**Why:** The real Chapa flow redirects externally and returns via webhook. In development/testing, `POST /v1/payments/initiate` may not return a real URL, so the frontend skips the gateway and goes directly to the ticket page with a `PENDING` booking.

**Remove when:** Backend confirms the exact `paymentUrl` field name in the `POST /v1/payments/initiate` response, and the Chapa integration is live.

---

## 7. Ticket Page Uses State Instead of API

**File:** `Ticket.jsx`

**Workaround:**
```js
// Priority: ticket.booking.trip > state.booking.trip > state.trip
const tripData =
    ticket?.booking?.trip ??
    booking?.trip ??
    stateTripObj ??
    null;
```

**Why:** `GET /v1/tickets?bookingId=` may not return nested trip/operator data. The page falls back to the trip object passed through `navigate` state from `Payment.jsx`.

**Remove when:** Backend confirms that `GET /v1/tickets?bookingId=` returns fully nested `booking.trip.operator` and `travelers[].seat.seatNumber`.

---

## 8. Operator Dashboard Shows Fallback Data

**File:** `OperatorOverview.jsx`

**Workaround:**
```js
const operatorId = user?.operatorId ?? null;
// If operatorId is null, useOperatorDashboard is disabled (enabled: !!operatorId)
const revenueData = dashData?.dailyRevenue ?? dashData?.weeklyRevenue ?? FALLBACK_REVENUE;
```

**Why:** `GET /v1/auth/me` may not return `operatorId`. Dashboard falls back to hardcoded chart data.

**Remove when:** Backend includes `operatorId` (or `operator.id`) in the `GET /v1/auth/me` response for operator users, AND `GET /v1/operators/:id/dashboard` returns the expected KPI fields.

---

## 9. Admin Dashboard Shows Fallback Data

**File:** `AdminSystemOverview.jsx`

**Workaround:**
```js
const revenueData = dashData?.monthlyRevenue ?? dashData?.revenueChart ?? FALLBACK_REVENUE;
// Top operators falls back to hardcoded list if API returns empty
```

**Why:** `GET /v1/admin/dashboard` response schema is undocumented. KPI field names are unknown.

**Remove when:** Backend documents and returns the expected fields from `GET /v1/admin/dashboard`.

---

## 10. Booking Amount Fallback Chain

**File:** `UserBookings.jsx` (`normaliseBooking`)

**Workaround:**
```js
amount: payment.amount ?? trip.price ?? 0,
```

**Why:** It's unclear whether the booking's payment amount is stored on `payment.amount` or derived from `trip.price`. The spec doesn't document the payment sub-object shape.

**Remove when:** Backend confirms `payment.amount` is always present on a booking response.
