/**
 * Operator in-person booking — paid outside the app (cash / office).
 */

export const MANUAL_PAYMENT_METHOD = 'MANUAL';

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
        paymentMethod: MANUAL_PAYMENT_METHOD,
        paymentStatus: 'PAID',
        travelers: [{
            tripSeatId,
            fullName: fullName.trim(),
            email: trimmedEmail,
            phone: trimmedPhone,
            emergencyContact: trimmedPhone,
        }],
    };
}
