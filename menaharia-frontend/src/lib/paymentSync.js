/** Payment gateway identifier required by POST /v1/payments/callback. */
export const CHAPA_PAYMENT_METHOD = 'CHAPA';

/**
 * Payload for POST /v1/payments/callback (Chapa return + SPA backup).
 */
export function buildChapaCallbackPayload({
    gatewayReference,
    status,
    transactionCode,
    callbackReference,
}) {
    return {
        gatewayReference,
        status,
        transactionCode: transactionCode ?? gatewayReference,
        callbackReference: callbackReference ?? gatewayReference,
        method: CHAPA_PAYMENT_METHOD,
    };
}

/** Raw API / UI payment status indicates a completed charge. */
export function isPaidPaymentStatus(status) {
    const s = (status ?? '').toUpperCase();
    return s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID';
}

/**
 * Operator manifest / overview: only show passengers with confirmed payment.
 */
export function isBookingVisibleOnOperatorManifest(booking, payment = null) {
    if (!booking) return false;
    const p = payment ?? booking.payment ?? (Array.isArray(booking.payments) ? booking.payments[0] : null);
    const payStatus = (p?.status ?? booking.paymentStatusRaw ?? '').toUpperCase();
    const bookingPayStatus = (booking.paymentStatus ?? '').toUpperCase();
    if (isPaidPaymentStatus(payStatus) || isPaidPaymentStatus(bookingPayStatus)) {
        return true;
    }
    const bs = (booking.status ?? booking.bookingStatusRaw ?? '').toUpperCase();
    return bs === 'CONFIRMED';
}
