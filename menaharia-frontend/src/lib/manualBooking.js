/**
 * Operator in-person booking — paid in cash or at the office.
 *
 * Backend POST /v1/bookings/for-user accepts:
 *   { tripId, userId, paymentMethod: 'CHAPA'|'TELEBIRR'|'SANTIM', travelers: [...] }
 *
 * Notes:
 *  - `paymentStatus` is NOT accepted — the backend sets it internally.
 *  - `MANUAL` is NOT a valid paymentMethod enum value.
 *  - We use CHAPA as the method since it's the only supported gateway; the booking
 *    is created in CONFIRMED state by the operator endpoint regardless of gateway.
 */

export const MANUAL_PAYMENT_METHOD = 'CHAPA';

/**
 * @param {{
 *   tripId: string,
 *   userId: string,
 *   tripSeatId: string,
 *   fullName: string,
 *   phone: string,
 *   email?: string,
 * }} params
 */
export function buildManualBookingForUserPayload({
    tripId,
    userId,
    tripSeatId,
    fullName,
    phone,
    email,
}) {
    const trimmedPhone = phone.trim();
    const trimmedEmail =
        email?.trim()
        || `walkin.${trimmedPhone.replace(/\D/g, '') || Date.now()}@menaharia.local`;

    return {
        tripId,
        userId,
        paymentMethod: MANUAL_PAYMENT_METHOD,   // CHAPA — only accepted enum value
        // paymentStatus is intentionally omitted — backend sets it internally
        travelers: [{
            tripSeatId,
            fullName: fullName.trim(),
            email: trimmedEmail,
            phone: trimmedPhone,
            emergencyContact: trimmedPhone,
        }],
    };
}
