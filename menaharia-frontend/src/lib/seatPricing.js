/** Front-row seats materialized as VIP via POST /v1/seats/batch */
export const VIP_SEAT_LABELS = new Set(['A1', 'A2', 'A3', 'A4']);

/** Backend applies a 5% surcharge on VIP seats at booking time. */
export const VIP_PREMIUM_RATE = 0.05;

/**
 * Resolve seat type — prefer API value, fall back to layout rules for A1–A4.
 * @param {string} seatNumber
 * @param {'VIP' | 'STANDARD' | null | undefined} seatTypeFromApi
 */
export function resolveSeatType(seatNumber, seatTypeFromApi) {
    if (seatTypeFromApi === 'VIP' || seatTypeFromApi === 'STANDARD') return seatTypeFromApi;
    return VIP_SEAT_LABELS.has(seatNumber) ? 'VIP' : 'STANDARD';
}

/** @param {number} basePrice Trip base fare (standard seat). */
export function seatPriceForType(basePrice, seatType) {
    const base = Number(basePrice) || 0;
    if (seatType === 'VIP') return Math.round(base * (1 + VIP_PREMIUM_RATE));
    return base;
}

/**
 * @param {number} basePrice
 * @param {string} seatNumber
 * @param {'VIP' | 'STANDARD' | null | undefined} [seatTypeFromApi]
 */
export function seatPriceForLabel(basePrice, seatNumber, seatTypeFromApi) {
    return seatPriceForType(basePrice, resolveSeatType(seatNumber, seatTypeFromApi));
}

/**
 * @param {Array<{ seatNumber: string, seatType?: string }>} tripSeats
 */
export function buildSeatTypeMap(tripSeats = []) {
    const map = {};
    tripSeats.forEach((s) => {
        if (s.seatNumber) {
            map[s.seatNumber] = resolveSeatType(s.seatNumber, s.seatType ?? s.seat?.seatType);
        }
    });
    return map;
}

/**
 * @param {number} basePrice
 * @param {Array<string | { label: string, seatType?: string }>} selectedSeats
 * @param {Record<string, 'VIP' | 'STANDARD'>} [seatTypeMap]
 */
export function totalPriceForSelectedSeats(basePrice, selectedSeats, seatTypeMap = {}) {
    return selectedSeats.reduce((sum, seat) => {
        const label = typeof seat === 'object' ? seat.label : seat;
        const type = typeof seat === 'object' && seat.seatType
            ? seat.seatType
            : seatTypeMap[label];
        return sum + seatPriceForLabel(basePrice, label, type);
    }, 0);
}

export function formatSeatTypeLabel(seatType) {
    return seatType === 'VIP' ? 'VIP' : 'Standard';
}
