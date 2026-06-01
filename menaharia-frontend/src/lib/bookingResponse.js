/**
 * Normalise POST /v1/bookings and POST /v1/bookings/for-user responses.
 * Backend envelope data shape: { booking: {...}, payment: {...} }
 */

export function extractBookingId(payload) {
    if (!payload || typeof payload !== 'object') return null;
    return (
        payload.booking?.id
        ?? payload.id
        ?? payload.bookingId
        ?? null
    );
}

export function extractPayment(payload) {
    if (!payload || typeof payload !== 'object') return null;
    return payload.payment ?? null;
}

/**
 * @returns {{ booking: object | null, payment: object | null, bookingId: string | null }}
 */
export function normaliseCreateBookingResponse(payload) {
    const root = payload?.booking ? payload : { booking: payload, payment: payload?.payment };
    const booking = root.booking ?? null;
    const payment = root.payment ?? booking?.payment ?? null;
    const bookingId = extractBookingId(root) ?? extractBookingId(booking);

    return {
        booking,
        payment,
        bookingId,
        bookingReference: booking?.bookingReference ?? null,
        totalAmount: booking?.totalAmount ?? payment?.amount ?? null,
        reservedUntil: booking?.reservedUntil ?? null,
    };
}

/**
 * Normalise POST /v1/payments/initiate response.
 * @returns {{ paymentUrl: string | null, gatewayReference: string | null, transactionId: string | null, message: string | null }}
 */
export function normaliseInitiatePaymentResponse(payload) {
    if (!payload || typeof payload !== 'object') {
        return { paymentUrl: null, gatewayReference: null, transactionId: null, message: null };
    }
    return {
        paymentUrl: payload.paymentUrl ?? payload.checkoutUrl ?? payload.url ?? null,
        gatewayReference: payload.gatewayReference ?? payload.reference ?? null,
        transactionId: payload.transactionId ?? payload.transactionCode ?? null,
        message: payload.message ?? null,
    };
}

/**
 * Normalise GET /v1/bookings/:id — may return booking directly or nested.
 */
export function normaliseBookingDetail(payload) {
    if (!payload) return null;
    if (payload.booking) {
        return {
            ...payload.booking,
            payment: payload.payment ?? payload.booking.payment,
            travelers: payload.travelers ?? payload.booking.travelers,
            trip: payload.trip ?? payload.booking.trip,
            tickets: payload.tickets ?? payload.booking.tickets,
        };
    }
    return payload;
}
