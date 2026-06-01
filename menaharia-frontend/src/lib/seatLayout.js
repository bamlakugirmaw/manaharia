import { VIP_SEAT_LABELS } from './seatPricing';

/** Standard 45-seater layout: 0 = aisle, 1 = seat */
export const DEFAULT_BUS_LAYOUT = [
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1],
];

export const getSeatLabel = (rowIndex, colIndex) => {
    const rowChar = String.fromCharCode(65 + rowIndex);
    const colNum = colIndex > 2 ? colIndex : colIndex + 1;
    return `${rowChar}${colNum}`;
};

/** All seat labels from the default grid. */
export const allDefaultSeatLabels = () => {
    const labels = [];
    DEFAULT_BUS_LAYOUT.forEach((row, rowIndex) => {
        row.forEach((type, colIndex) => {
            if (type !== 0) labels.push(getSeatLabel(rowIndex, colIndex));
        });
    });
    return labels;
};

/**
 * Normalise tripSeats from GET /v1/trips/:id
 * @returns {Array<{ id: string, seatNumber: string, status: string }>}
 */
export const normaliseTripSeats = (trip) => {
    const raw = trip?.tripSeats ?? trip?.seats ?? [];
    if (!Array.isArray(raw)) return [];
    return raw.map((s) => ({
        id: s.id,
        seatNumber: s.seatNumber ?? s.seat?.seatNumber ?? '',
        seatType: s.seatType ?? s.seat?.seatType ?? null,
        status: s.status ?? 'AVAILABLE',
    })).filter((s) => s.seatNumber);
};

export const bookedLabelsFromTripSeats = (tripSeats) =>
    tripSeats
        .filter((s) => {
            const status = (s.status ?? 'AVAILABLE').toUpperCase();
            return status !== 'AVAILABLE';
        })
        .map((s) => s.seatNumber);

/** Seat numbers on the default grid (A1…E5). */
export const DEFAULT_GRID_LABELS = new Set(allDefaultSeatLabels());

/** Trip seats whose numbers are not on the default 45-seat grid. */
export function overflowTripSeats(tripSeats = []) {
    return tripSeats.filter((s) => s.seatNumber && !DEFAULT_GRID_LABELS.has(s.seatNumber));
}

export const tripSeatIdByLabel = (tripSeats) => {
    const map = {};
    tripSeats.forEach((s) => { map[s.seatNumber] = s.id; });
    return map;
};

/**
 * Build seat definitions for POST /v1/seats/batch from bus capacity.
 */
export function buildSeatDefinitionsForBus(totalSeats) {
    const count = Math.max(1, Number(totalSeats) || 45);
    const layoutLabels = allDefaultSeatLabels();
    const seats = [];
    for (let i = 0; i < count; i++) {
        const seatNumber = layoutLabels[i] ?? `S${i + 1}`;
        seats.push({
            seatNumber,
            seatType: VIP_SEAT_LABELS.has(seatNumber) ? 'VIP' : 'STANDARD',
        });
    }
    return seats;
}
