const BOOKING_SESSION_KEY = 'menaharia.booking.flow';
const PENDING_PAYMENT_KEY = 'menaharia.booking.pendingPayment';

/** Persist booking wizard state across refresh (best-effort). */
export function saveBookingFlow(state) {
    try {
        sessionStorage.setItem(BOOKING_SESSION_KEY, JSON.stringify(state));
    } catch {
        /* ignore quota / private mode */
    }
}

export function loadBookingFlow() {
    try {
        const raw = sessionStorage.getItem(BOOKING_SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearBookingFlow() {
    try {
        sessionStorage.removeItem(BOOKING_SESSION_KEY);
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
        /* ignore */
    }
}

/** Clear wizard state only — keep pending payment context for Pay Later / resume. */
export function clearBookingSession() {
    try {
        sessionStorage.removeItem(BOOKING_SESSION_KEY);
    } catch {
        /* ignore */
    }
}

/** Persist context across Chapa redirect. */
export function savePendingPayment(state) {
    try {
        sessionStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(state));
    } catch {
        /* ignore */
    }
}

export function loadPendingPayment() {
    try {
        const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function clearPendingPayment() {
    try {
        sessionStorage.removeItem(PENDING_PAYMENT_KEY);
    } catch {
        /* ignore */
    }
}

/** Pending checkout context for the same trip (resume payment without re-booking). */
export function getPendingPaymentForTrip(tripId) {
    const pending = loadPendingPayment();
    if (!pending?.bookingId || !tripId) return null;
    if (pending.tripId !== tripId) return null;
    return pending;
}
