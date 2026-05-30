# Missing Backend Endpoints

These are features the frontend needs that have **no corresponding backend endpoint** in the current OpenAPI spec.

---

## 1. Complaints / Disputes System

**Frontend need:** `UserBookings.jsx` and `UserComplaints.jsx` have a full complaint chat UI — users can file complaints against bookings, send messages, and see status updates. Operators can reply. The `ComplaintsContext.jsx` manages this entirely in-memory.

**Missing endpoints:**
```
POST   /v1/complaints                    Create a complaint for a booking
GET    /v1/complaints                    List complaints (filter: userId, operatorId, status)
GET    /v1/complaints/:id                Get complaint by ID
PATCH  /v1/complaints/:id/status         Update status (Open → In Progress → Resolved)
POST   /v1/complaints/:id/messages       Add a message to a complaint thread
GET    /v1/complaints/:id/messages       Get all messages for a complaint
```

**Required DTOs:**
```typescript
CreateComplaintDto {
  bookingId: string        // links complaint to a booking
  message: string          // first message text
}

AddComplaintMessageDto {
  text: string
  sender: 'user' | 'operator'
}

UpdateComplaintStatusDto {
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED'
}
```

**Impact:** High. The entire complaint/dispute flow is currently mocked in-memory and resets on page refresh.

---

## 2. Trip Seats Endpoint (TripSeat, not BusSeat)

**Frontend need:** `SeatSelection.jsx` calls `GET /v1/seats?busId=` to get the seat list and build a `seatNumber → tripSeatId` map. However, `POST /v1/bookings` requires a `tripSeatId` — a UUID for a **trip-level** seat record (materialized when the trip is created), not the physical bus seat ID.

**Problem:** The current `GET /v1/seats?busId=` returns **bus seats** (physical, reusable). It does not return **trip seats** (per-trip availability records with booking status). These are different entities.

**Missing endpoint:**
```
GET    /v1/trips/:id/seats               Get all trip seats for a specific trip
                                         Returns: [{ id (tripSeatId), seatNumber, seatType, status: AVAILABLE|RESERVED|BOOKED }]
```

**Why this matters:** Without this, `SeatSelection` cannot:
1. Know which seats are already booked for *this specific trip* (vs. the bus in general)
2. Get the correct `tripSeatId` UUID required by `POST /v1/bookings`

**Impact:** Critical. The booking flow will fail at `POST /v1/bookings` if `tripSeatId` is null.

---

## 3. Public Operators Endpoint

**Frontend need:** `OperatorsListing.jsx` and `OperatorProfile.jsx` are public pages (no login required). Currently `GET /v1/operators` requires a Bearer token.

**Missing endpoint:**
```
GET    /v1/operators/public              List operators without auth (or make GET /v1/operators public)
GET    /v1/operators/:id/public          Get operator by ID without auth
```

**Alternative:** Remove the auth guard from `GET /v1/operators` and `GET /v1/operators/:id` for read-only access. The frontend already falls back to static data when unauthenticated, but this is a workaround, not a solution.

**Impact:** Medium. Public visitors cannot browse operators without logging in.

---

## 4. Public Destinations Endpoint

**Frontend need:** `LandingPage.jsx` shows a destinations grid. `Destinations.jsx` and `DestinationDetail.jsx` are public pages. Currently `GET /v1/destinations` requires auth.

**Missing endpoint:**
```
GET    /v1/destinations/public           List destinations without auth (or make GET /v1/destinations public)
```

**Impact:** Medium. The landing page currently uses static `DESTINATIONS` from `mock-db.js` as a fallback.

---

## 5. Operator Dashboard — Missing Response Fields

**Frontend need:** `OperatorOverview.jsx` calls `GET /v1/operators/:id/dashboard` and expects:

```typescript
{
  totalRevenue: number
  revenueGrowth: string          // e.g. "+12.5%"
  activeBookings: number
  bookingsGrowth: string
  scheduledTrips: number
  tripsGrowth: string
  totalPassengers: number
  passengersGrowth: string
  dailyRevenue: Array<{ name: string, revenue: number }>   // for chart
  weeklyRevenue: Array<{ name: string, revenue: number }>  // alternative
  topRoutes: Array<{ name: string, occupancy: number }>
}
```

The OpenAPI spec shows this endpoint exists but documents **no response schema**. The frontend will show `'—'` for all KPIs until the backend returns these fields.

**Impact:** Medium. Dashboard renders but shows no real data.

---

## 6. Admin Dashboard — Missing Response Fields

**Frontend need:** `AdminSystemOverview.jsx` calls `GET /v1/admin/dashboard` and expects:

```typescript
{
  totalRevenue: number
  totalBookings: number
  activeOperators: number
  activeUsers: number
  avgOccupancy: number           // percentage
  monthlyRevenue: Array<{ name: string, revenue: number }>  // for chart
  revenueChart: Array<{ name: string, revenue: number }>    // alternative key
}
```

Same issue — endpoint exists, response schema is undocumented.

**Impact:** Medium. Admin dashboard renders but shows no real data.

---

## 7. Booking Filter by Operator

**Frontend need:** `OperatorOverview.jsx` calls `GET /v1/bookings` to show recent bookings for the operator's trips. The current spec only supports `?userId=` as a filter.

**Missing filter param:**
```
GET    /v1/bookings?operatorId=          Filter bookings by operator
```

Without this, the operator dashboard shows all bookings in the system, not just their own.

**Impact:** Medium. Operator sees all users' bookings instead of their own.

---

## 8. User Profile Update (PATCH /v1/auth/me)

**Frontend need:** `UserProfile.jsx` (dashboard) needs to update the user's name, email, and phone. `AuthContext` already has `updateProfile()` wired to `PATCH /v1/auth/me`.

**Status:** Endpoint exists in the spec. No gap in the endpoint itself.

**Gap:** The `UpdateProfileDto` only accepts `{ fullName, email, phone }`. The frontend `UserProfile.jsx` page (not yet integrated) may need additional fields like `profilePhoto`. Flag for future.

---

## 9. Booking Cancellation — Missing Refund Logic

**Frontend need:** `UserBookings.jsx` has a "Cancel" action. `bookingsApi.cancelBooking(id)` calls `PATCH /v1/bookings/:id/cancel`.

**Gap:** The spec shows the endpoint exists but documents no response schema and no refund/payment reversal logic. The frontend has no way to show the refund amount or status after cancellation.

**Missing:**
- Response should include `{ refundAmount, refundStatus, cancellationFee }`
- Or a separate `GET /v1/payments/:id/refund-status` endpoint

**Impact:** Low for now. Cancel works but no refund feedback is shown.

---

## 10. Ticket Download (PDF)

**Frontend need:** `Ticket.jsx` has a "Download Ticket (PDF)" button that is currently a no-op.

**Missing endpoint:**
```
GET    /v1/tickets/:id/pdf               Download ticket as PDF (returns binary or signed URL)
```

**Impact:** Low. Button exists in UI but does nothing.
