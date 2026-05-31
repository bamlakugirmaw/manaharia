const BOOKING_SESSION_KEY = 'menaharia.booking.flow';

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
    } catch {
        /* ignore */
    }
}
