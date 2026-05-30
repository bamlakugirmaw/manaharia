# Auth & RBAC Gaps

These are access control issues — endpoints that are either too restrictive (blocking legitimate public access) or too permissive (no role enforcement documented).

---

## 1. Public Read Endpoints Require Auth

The following endpoints are used on **public pages** (no login required) but the backend requires a Bearer token:

| Endpoint | Used by | Should be |
|---|---|---|
| `GET /v1/operators` | `OperatorsListing.jsx` (public page) | Public |
| `GET /v1/operators/:id` | `OperatorProfile.jsx` (public page) | Public |
| `GET /v1/destinations` | `LandingPage.jsx`, `Destinations.jsx` | Public |
| `GET /v1/destinations/:id` | `DestinationDetail.jsx` | Public |

**Current workaround:** Frontend falls back to static `operators-data.js` and `mock-db.js` when unauthenticated. This means public visitors see stale static data, not live backend data.

**Recommended fix:** Add a public read guard (no auth required) to these GET endpoints. Write operations (POST/PATCH/DELETE) should remain protected.

---

## 2. Role Enforcement Not Documented

The OpenAPI spec shows `security: [{ bearer: [] }]` on protected endpoints but does **not** document which roles are required. The frontend assumes:

| Endpoint group | Required role |
|---|---|
| `GET /v1/users` | `admin` |
| `POST /v1/operators` | `admin` |
| `DELETE /v1/operators/:id` | `admin` |
| `GET /v1/admin/dashboard` | `admin` |
| `GET /v1/operators/:id/dashboard` | `operator` (own operator only) |
| `POST /v1/trips` | `operator` or `admin` |
| `POST /v1/buses` | `operator` or `admin` |
| `GET /v1/bookings` | `traveller` (own), `operator` (their trips), `admin` (all) |

**Risk:** If the backend enforces roles differently (e.g. operators can't access `GET /v1/bookings` at all), the operator dashboard will get 403 errors.

---

## 3. Booking Ownership — `GET /v1/bookings?userId=`

**Frontend sends:** `GET /v1/bookings?userId={user.id}` from `UserBookings.jsx`.

**Risk 1:** If the backend doesn't validate that the requesting user can only see their own bookings (i.e. any authenticated user can pass any `userId`), this is an IDOR vulnerability.

**Risk 2:** If the backend ignores the `userId` param and returns all bookings for the authenticated user automatically (based on JWT), then passing `userId` is redundant but harmless.

**Recommended:** Backend should scope `GET /v1/bookings` to the authenticated user automatically for the `traveller` role, and only allow `userId` filtering for `admin`/`operator` roles.

---

## 4. Operator Scoping — `GET /v1/operators/:id/dashboard`

**Frontend sends:** `GET /v1/operators/{user.operatorId}/dashboard`

**Risk:** If the backend doesn't verify that the authenticated operator user owns the requested `operatorId`, any operator could view another operator's dashboard metrics.

**Recommended:** Backend should verify `req.user.operatorId === params.id` for the `operator` role.

---

## 5. Roles API — Admin Only, Not Enforced in Spec

`POST /v1/roles`, `POST /v1/roles/assign`, `DELETE /v1/roles/assign` are admin-only operations. The spec marks them as `security: [{ bearer: [] }]` but doesn't specify the required role.

**Frontend:** These endpoints are not called from any page yet (no admin role management UI is implemented). No immediate risk, but worth documenting.

---

## 6. Jobs API — Should Be Admin Only

`POST /v1/jobs/expire-seat-reservations` and `GET /v1/jobs/health` are internal/admin endpoints. The spec marks them as `security: [{ bearer: [] }]`.

**Risk:** Any authenticated user (including travellers) could trigger seat reservation expiry if role enforcement is missing.

**Recommended:** Restrict to `admin` role only.
