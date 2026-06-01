/**
 * Public frontend origin for Chapa return URLs.
 * Set VITE_APP_URL in .env (e.g. http://localhost:5173 in dev, https://your-app.com in prod).
 */
export function getAppOrigin() {
    const configured = import.meta.env.VITE_APP_URL;
    if (configured && typeof configured === 'string') {
        return configured.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return window.location.origin;
    }
    return '';
}

/**
 * Static bridge page Chapa should redirect to after checkout.
 * Backend must set FRONTEND_URL (or equivalent) to this URL — not the API host.
 *
 * @param {string} [bookingId]
 */
export function getChapaReturnPageUrl(bookingId) {
    const origin = getAppOrigin();
    const base = `${origin}/payment-return.html`;
    if (!bookingId) return base;
    return `${base}?bookingId=${encodeURIComponent(bookingId)}`;
}
