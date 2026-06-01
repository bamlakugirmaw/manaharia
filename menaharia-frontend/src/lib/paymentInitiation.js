import { bookingsApi } from '../api/bookings.api';
import { paymentsApi } from '../api/payments.api';
import { isBookingPaid } from './bookingUi';

const LOCK_PREFIX = 'menaharia.payment.initiating.';

/** @param {string} bookingId */
export function clearPaymentInitiationLock(bookingId) {
    if (!bookingId) return;
    try {
        sessionStorage.removeItem(`${LOCK_PREFIX}${bookingId}`);
    } catch {
        /* ignore */
    }
}

function isLockActive(bookingId, windowMs = 90_000) {
    try {
        const raw = sessionStorage.getItem(`${LOCK_PREFIX}${bookingId}`);
        if (!raw) return false;
        return Date.now() - Number(raw) < windowMs;
    } catch {
        return false;
    }
}

/**
 * POST /v1/payments/initiate — validates booking, prevents duplicate opens.
 *
 * @param {{
 *   bookingId: string,
 *   method?: 'CHAPA' | 'TELEBIRR' | 'SANTIM',
 *   force?: boolean
 * }} params
 */
export async function initiatePaymentForBooking({
    bookingId,
    method = 'CHAPA',
    force = false,
}) {
    if (!bookingId?.trim()) {
        throw new Error('A valid booking ID is required before payment can start.');
    }

    if (!force && isLockActive(bookingId)) {
        throw new Error('Payment is already being opened for this booking. Please wait a moment.');
    }

    const booking = await bookingsApi.getBookingById(bookingId);
    if (!booking?.id) {
        throw new Error('Booking not found. It may have expired or been cancelled.');
    }

    if (isBookingPaid(booking)) {
        throw new Error('This booking is already paid.');
    }

    const status = (booking.status ?? '').toUpperCase();
    if (status === 'CANCELLED') {
        throw new Error('This booking was cancelled and cannot be paid.');
    }

    try {
        sessionStorage.setItem(`${LOCK_PREFIX}${bookingId}`, String(Date.now()));
    } catch {
        /* ignore */
    }

    try {
        const result = await paymentsApi.initiatePayment({
            bookingId,
            method,
        });

        if (result?.gatewayReference) {
            try {
                const raw = sessionStorage.getItem('menaharia.booking.pendingPayment');
                const pending = raw ? JSON.parse(raw) : {};
                if (!pending.bookingId || pending.bookingId === bookingId) {
                    pending.bookingId = bookingId;
                    pending.gatewayReference = result.gatewayReference;
                    sessionStorage.setItem(
                        'menaharia.booking.pendingPayment',
                        JSON.stringify(pending),
                    );
                }
            } catch {
                /* ignore */
            }
        }

        return result;
    } catch (err) {
        clearPaymentInitiationLock(bookingId);
        throw err;
    }
}
