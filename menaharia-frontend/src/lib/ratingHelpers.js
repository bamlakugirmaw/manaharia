/** Unwrap list payloads from GET /operator-ratings */
export function unwrapRatingsList(response) {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/** Normalise a rating record for UI */
export function normaliseOperatorRating(raw) {
    if (!raw) return null;
    const user = raw.user ?? raw.author ?? {};
    return {
        id: raw.id,
        operatorId: raw.operatorId,
        bookingId: raw.bookingId ?? null,
        rating: Number(raw.rating) || 0,
        comment: (raw.comment ?? '').trim(),
        userId: raw.userId ?? user.id ?? null,
        reviewerName:
            user.fullName
            ?? user.name
            ?? raw.reviewerName
            ?? 'Traveller',
        createdAt: raw.createdAt ?? null,
        updatedAt: raw.updatedAt ?? null,
        _raw: raw,
    };
}

export function formatRatingDate(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Build bookingId → rating map */
export function ratingsByBookingId(ratings) {
    const map = {};
    for (const r of ratings ?? []) {
        const n = normaliseOperatorRating(r);
        if (n?.bookingId) map[n.bookingId] = n;
    }
    return map;
}

export function averageFromRatings(ratings) {
    const values = (ratings ?? [])
        .map((r) => Number(r.rating ?? r))
        .filter((n) => n >= 1 && n <= 5);
    if (values.length === 0) return null;
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

import { isPaidPaymentStatus } from './paymentSync';

/** Travellers may rate only after payment is SUCCESS / COMPLETED. */
export function canRateBooking(booking) {
    if (!booking?.operatorId) return false;
    if (booking.rowStatus?.key === 'cancelled' || booking.bookingStatusRaw === 'CANCELLED') {
        return false;
    }
    return isPaidPaymentStatus(booking.paymentStatusRaw);
}
