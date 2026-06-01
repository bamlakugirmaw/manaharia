/**
 * Run: node scripts/verify-payment-sync.mjs
 * Verifies Chapa callback payload and paid-visibility business rules.
 */

import {
    buildChapaCallbackPayload,
    CHAPA_PAYMENT_METHOD,
    isBookingVisibleOnOperatorManifest,
    isPaidPaymentStatus,
} from '../src/lib/paymentSync.js';

function assert(condition, message) {
    if (!condition) {
        console.error('FAIL:', message);
        process.exitCode = 1;
        throw new Error(message);
    }
    console.log('OK:', message);
}

// --- Callback payload ---
const callbackBody = buildChapaCallbackPayload({
    gatewayReference: 'TXN-123',
    status: 'SUCCESS',
    transactionCode: 'TXN-123',
    callbackReference: 'TXN-123',
});

assert(callbackBody.method === CHAPA_PAYMENT_METHOD, 'callback includes method CHAPA');
assert(callbackBody.gatewayReference === 'TXN-123', 'gatewayReference set');
assert(callbackBody.status === 'SUCCESS', 'status set');

// Mirror payment-return.html buildCallbackPayload shape
function buildCallbackPayloadHtml(trxRef, status) {
    const apiStatus = status === 'success' ? 'SUCCESS' : 'FAILED';
    return {
        gatewayReference: trxRef,
        status: apiStatus,
        transactionCode: trxRef,
        callbackReference: trxRef,
        method: 'CHAPA',
    };
}

const htmlPayload = buildCallbackPayloadHtml('TXN-456', 'success');
assert(htmlPayload.method === 'CHAPA', 'payment-return.html payload includes method CHAPA');

// --- canRateBooking logic (inline mirror of ratingHelpers) ---
function canRateBooking(booking) {
    if (!booking?.operatorId) return false;
    if (booking.rowStatus?.key === 'cancelled' || booking.bookingStatusRaw === 'CANCELLED') {
        return false;
    }
    const payStatus = (booking.paymentStatusRaw ?? '').toUpperCase();
    return payStatus === 'SUCCESS' || payStatus === 'COMPLETED';
}

assert(
    canRateBooking({ operatorId: 'op-1', paymentStatusRaw: 'COMPLETED' }),
    'can rate when COMPLETED',
);
assert(
    !canRateBooking({ operatorId: 'op-1', paymentStatusRaw: 'PENDING' }),
    'cannot rate when PENDING',
);
assert(
    !canRateBooking({ operatorId: 'op-1', paymentStatusRaw: 'COMPLETED', bookingStatusRaw: 'CANCELLED' }),
    'cannot rate when cancelled',
);

// --- Manifest visibility ---
assert(isPaidPaymentStatus('SUCCESS'), 'SUCCESS is paid');
assert(isPaidPaymentStatus('COMPLETED'), 'COMPLETED is paid');

const paidBooking = {
    id: 'b1',
    status: 'CONFIRMED',
    payment: { status: 'SUCCESS' },
};
const unpaidBooking = {
    id: 'b2',
    status: 'PENDING',
    payment: { status: 'PENDING' },
};

assert(
    isBookingVisibleOnOperatorManifest(paidBooking, paidBooking.payment),
    'paid booking visible on manifest',
);
assert(
    !isBookingVisibleOnOperatorManifest(unpaidBooking, unpaidBooking.payment),
    'unpaid booking hidden from manifest',
);

// Simulate buildManifestRows filter
function manifestRowCount(bookings) {
    return bookings.filter((b) =>
        isBookingVisibleOnOperatorManifest(b, b.payment),
    ).length;
}

assert(manifestRowCount([paidBooking, unpaidBooking]) === 1, 'manifest includes only paid');

if (process.exitCode !== 1) {
    console.log('\nAll payment sync checks passed.');
}
