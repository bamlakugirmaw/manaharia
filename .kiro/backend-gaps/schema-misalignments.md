# Schema Misalignments

These are cases where the backend endpoint **exists** but the response shape, field names, or data types differ from what the frontend expects. Each item includes the exact field the frontend reads and what the backend likely returns.

---

## 1. Auth — Login Response Shape

**Endpoint:** `POST /v1/auth/login`

| Frontend expects | Backend spec | Status |
|---|---|---|
| `data.accessToken` | Not documented in response schema | Unknown |
| `data.refreshToken` | Not documented | Unknown |
| `data.user` (object) | Not documented | Unknown |
| `data.user.roles` (array of `{ id, name }`) | Not documented | Unknown |
| `data.user.operatorId` or `data.user.operator.id` | Not documented | Unknown |

**Frontend code (`AuthContext.jsx`):**
```js
const data = await authApi.login({ identifier, password });
storeTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken });
const normalisedUser = normaliseUser(data.user);
```

**Risk:** If the backend wraps the response (e.g. `{ data: { accessToken, user } }`) or uses different key names (`token` instead of `accessToken`), login will silently fail — tokens won't be stored and `user` will be null.

**Fix needed:** Backend must document and confirm the exact login response shape.

---

## 2. Auth — `GET /v1/auth/me` Response Shape

**Frontend expects:**
```typescript
{
  id: string
  fullName: string          // or name
  email: string
  phone: string
  roles: Array<{ id: string, name: string }>
  operatorId?: string       // or operator: { id: string }
}
```

**Risk:** If `roles` is returned as `['admin']` (string array) instead of `[{ id, name }]` (object array), `normaliseRole()` handles it — but if `roles` is missing entirely, the user gets `'traveller'` role regardless of their actual role.

**Critical field:** `operatorId` — the operator dashboard (`OperatorOverview.jsx`) uses `user.operatorId` to call `GET /v1/operators/:id/dashboard`. If the backend doesn't return this field, the operator dashboard will never load real data.

---

## 3. Trips — Response Shape

**Endpoint:** `GET /v1/trips` and `GET /v1/trips/:id`

**Frontend expects on each trip object:**
```typescript
{
  id: string
  from: string              // OR route.origin
  to: string                // OR route.destination
  date: string              // ISO date
  departureTime: string     // "HH:MM"
  arrivalTime: string       // "HH:MM"
  price: number
  seatsAvailable: number    // OR availableSeats
  busType: string
  amenities: string[]
  operator: {               // embedded relation
    id: string
    name: string
    rating: number
  }
  bus: {                    // embedded relation
    id: string
    make: string
    plateNumber: string
  }
  route: {                  // embedded relation
    origin: string
    destination: string
    distance: number
  }
}
```

**Known misalignments:**
- The spec `CreateTripDto` uses `routeId` and `busId` (foreign keys), not embedded objects. The GET response may return only IDs, not the full nested objects.
- `seatsAvailable` is not in the spec schema — the spec has `totalSeats` on the bus, not a per-trip available count.
- `from`/`to` are mock-db fields. The backend likely uses `route.origin`/`route.destination`.

**Frontend handles this with fallbacks:**
```js
const from = trip.from ?? trip.route?.origin ?? '';
const to   = trip.to   ?? trip.route?.destination ?? '';
```
But if neither exists, the route displays as `→`.

---

## 4. Seats — `GET /v1/seats?busId=` Returns Bus Seats, Not Trip Seats

**Frontend expects (SeatSelection.jsx):**
```typescript
Array<{
  id: string          // used as tripSeatId in POST /v1/bookings
  seatNumber: string  // e.g. "A1", "B2"
  seatType: 'VIP' | 'STANDARD'
  status: 'AVAILABLE' | 'RESERVED' | 'BOOKED'  // per-trip availability
  busId: string
}>
```

**Backend returns (based on spec):**
```typescript
Array<{
  id: string          // physical bus seat ID
  seatNumber: string
  seatType: 'VIP' | 'STANDARD'
  busId: string
  // NO status field — this is a physical seat, not a trip seat
}>
```

**Critical misalignment:** The `id` from `GET /v1/seats?busId=` is a **bus seat ID**, not a **trip seat ID**. `POST /v1/bookings` requires `tripSeatId` which is a different entity created when the trip is created. Using the bus seat ID will cause a validation error on booking creation.

**Fix:** Backend needs `GET /v1/trips/:id/seats` (see missing-endpoints.md item 2).

---

## 5. Bookings — `GET /v1/bookings` Response Shape

**Frontend expects (UserBookings.jsx `normaliseBooking()`):**
```typescript
{
  id: string
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED'
  createdAt: string           // ISO datetime
  trip: {
    from: string              // OR route.origin
    to: string                // OR route.destination
    date: string
    departureTime: string
    arrivalTime: string
    price: number
    operator: { id, name, companyName }
    bus: { make, plateNumber }
    route: { origin, destination }
  }
  travelers: Array<{
    fullName: string
    phone: string
    seat: { seatNumber: string }  // OR seatNumber directly
  }>
  payment: {
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    amount: number
    method: string
  }
  tickets: Array<{ id: string }>
}
```

**Spec only documents:** `status` filter (`PENDING | CONFIRMED | CANCELLED`) and `userId` filter. No response schema documented.

**Risk:** If the backend returns a flat structure instead of nested relations, `normaliseBooking()` will produce empty strings for route, operator, and passenger fields.

---

## 6. Payments — `POST /v1/payments/initiate` Response Shape

**Frontend expects (Payment.jsx):**
```typescript
{
  paymentUrl: string      // OR checkoutUrl — redirect URL to Chapa gateway
  reference: string
}
```

**Spec documents:** No response schema for this endpoint.

**Frontend code:**
```js
paymentUrl = paymentResult?.paymentUrl ?? paymentResult?.checkoutUrl ?? null;
```

If neither field exists, the user is sent to the ticket page without completing payment. The booking exists as `PENDING` but payment never happens.

**Fix needed:** Backend must confirm the exact field name for the Chapa redirect URL.

---

## 7. Tickets — `GET /v1/tickets?bookingId=` Response Shape

**Frontend expects (Ticket.jsx):**
```typescript
Array<{
  id: string
  booking: {
    trip: {
      from: string
      to: string
      date: string
      departureTime: string
      operator: { name: string }
    }
  }
  travelers: Array<{
    fullName: string
    phone: string
    email: string
    seatNumber: string    // OR seat: { seatNumber }
  }>
}>
```

**Spec documents:** No response schema. The ticket entity is auto-generated after payment — its structure is unknown.

**Risk:** Ticket page will show all `'—'` placeholders if the response doesn't include nested booking/trip/traveler data.

---

## 8. Operators — `GET /v1/operators` Response Shape

**Frontend expects (OperatorsListing.jsx, OperatorProfile.jsx):**
```typescript
{
  id: string
  name: string              // OR companyName
  companyName: string
  logo: string
  rating: number
  reliabilityScore: number
  established: number       // year
  about: string
  safetyInfo: string
  badge: string[]
  companyPhone: string
  companyEmail: string
  address: string
  routesServed: string[]    // OR Array<{ origin, destination }>
  upcomingTrips: Array<{    // NOT in spec — may not be embedded
    id: string
    route: string
    departure: string
    seatsLeft: number
    price: number
  }>
}
```

**Known misalignment:** `upcomingTrips` is in the static `operators-data.js` but is **not** in the backend `CreateOperatorDto` or `UpdateOperatorDto`. The backend likely does not embed upcoming trips in the operator response. `OperatorProfile.jsx` will show "No upcoming trips available" for all operators.

---

## 9. Booking Creation — `tripSeatId` Validation

**Frontend sends (Payment.jsx):**
```typescript
POST /v1/bookings
{
  tripId: string,
  paymentMethod: 'CHAPA',
  travelers: [{
    tripSeatId: string | null,   // null if seats API didn't load
    fullName: string,
    email: string,
    phone: string,
    emergencyContact: string
  }]
}
```

**Backend spec requires:** `tripSeatId` is marked as `required` in `BookingTravelerDto`.

**Risk:** If `tripSeatId` is `null` (because `GET /v1/seats?busId=` returned bus seats instead of trip seats, or the seats API failed), the backend will return a 400 validation error. The frontend shows this as an error banner but the user cannot proceed.

---

## 10. User Roles — `GET /v1/auth/me` Missing `operatorId`

**Frontend need:** `OperatorOverview.jsx` reads `user.operatorId` from `AuthContext`:
```js
const operatorId = user?.operatorId ?? null;
const { data: dashData } = useOperatorDashboard(operatorId);
```

**`normaliseUser()` in AuthContext:**
```js
operatorId: raw.operatorId ?? raw.operator?.id ?? null,
```

**Risk:** If `GET /v1/auth/me` does not return `operatorId` or an `operator` relation on the user object, `operatorId` will always be `null`. The operator dashboard will never call `GET /v1/operators/:id/dashboard` and will show only fallback data.

**Fix needed:** Backend must include `operatorId` (or `operator: { id }`) in the `GET /v1/auth/me` response for users with the operator role.

---

## 11. Pagination — Response Envelope Inconsistency

**Frontend handles both shapes:**
```js
// In SearchResults, UserBookings, OperatorsListing, etc.
const raw = Array.isArray(response) ? response : (response.data ?? []);
```

**Risk:** If some endpoints return `{ data: [], total, page, limit }` and others return a plain array `[]`, the frontend handles it — but if the envelope uses a different key (e.g. `{ items: [], count }` or `{ results: [] }`), the frontend will silently show an empty list.

**Fix needed:** Backend should use a consistent pagination envelope across all list endpoints.
