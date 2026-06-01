import { tripsApi } from '../api/trips.api';
import { seatsApi } from '../api/seats.api';
import { normaliseTripSeats, tripSeatIdByLabel, buildSeatDefinitionsForBus } from './seatLayout';

/** Unwrap GET /v1/seats list payloads ({ items, meta }) or plain arrays. */
export function normalizeSeatListPayload(payload) {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/** Count seats from list response, including paginated meta.total. */
export function countBusSeats(payload) {
    const list = normalizeSeatListPayload(payload);
    if (list.length > 0) return list.length;
    const total = payload?.meta?.total ?? payload?.meta?.totalItems ?? payload?.meta?.itemCount;
    return typeof total === 'number' && total > 0 ? total : 0;
}

async function fetchBusSeatCount(busId) {
    const payload = await seatsApi.listSeats({ busId, limit: 100 });
    return countBusSeats(payload);
}

function isDuplicateSeatsError(err) {
    const status = err?.response?.status;
    const raw = err?.response?.data?.message ?? err?.message ?? '';
    const msg = typeof raw === 'string' ? raw : raw?.message ?? JSON.stringify(raw);
    return status === 409
        || (status === 400 && /exist|duplicate|already/i.test(String(msg)));
}

/**
 * POST /v1/trips materializes trip seats from bus seats.
 * Ensures layout exists; treats duplicate batch create as success.
 */
export async function ensureBusSeatsReady(busId, totalSeats = 45) {
    if (!busId) {
        throw new Error('Select a bus before creating a trip schedule.');
    }

    let count = await fetchBusSeatCount(busId);
    if (count > 0) return count;

    const seatCount = Math.max(1, Number(totalSeats) || 45);
    try {
        await seatsApi.createSeatBatch({
            busId,
            seats: buildSeatDefinitionsForBus(seatCount),
        });
    } catch (err) {
        if (!isDuplicateSeatsError(err)) throw err;
    }

    count = await fetchBusSeatCount(busId);
    if (count > 0) return count;

    const noSeats = new Error(
        'Could not verify a seat layout for this bus. Edit the bus in Fleet Management or add it again with a valid seat count.'
    );
    noSeats.code = 'NO_BUS_SEATS';
    throw noSeats;
}

/** Normalise bus-level seats from GET /v1/seats (layout setup only — not for booking IDs). */
export function normaliseBusSeats(list) {
    if (!Array.isArray(list)) return [];
    return list
        .map((s) => ({
            id: s.id,
            seatNumber: s.seatNumber ?? s.seat?.seatNumber ?? '',
            seatType: s.seatType ?? s.seat?.seatType ?? null,
        }))
        .filter((s) => s.id && s.seatNumber);
}

/** Trip seat is available for selection / POST /bookings. */
export function isTripSeatAvailable(seat) {
    const status = (seat?.status ?? 'AVAILABLE').toUpperCase();
    return status === 'AVAILABLE';
}

/** Trip seat cannot be selected (reserved, booked, etc.). */
export function isTripSeatOccupied(seat) {
    return !isTripSeatAvailable(seat);
}

/**
 * Map seat label → tripSeatId (ONLY from trip-level seats).
 * POST /v1/bookings requires tripSeatId — never bus seat ids.
 */
export function buildTripSeatIdMap(tripSeats = []) {
    return tripSeatIdByLabel(tripSeats.filter(isTripSeatAvailable));
}

/**
 * Fresh trip + seat context for booking (re-fetch before POST /bookings).
 */
export async function fetchTripSeatContext(tripId) {
    const trip = await tripsApi.getTripById(tripId);
    const tripSeats = normaliseTripSeats(trip);
    const busId = trip?.busId ?? trip?.bus?.id ?? null;

    let busSeats = [];
    if (busId) {
        const busPayload = await seatsApi.listSeats({ busId, limit: 100 });
        busSeats = normaliseBusSeats(normalizeSeatListPayload(busPayload));
    }

    const seatIdMap = buildTripSeatIdMap(tripSeats);
    const bookableCount = tripSeats.filter(isTripSeatAvailable).length;

    return {
        trip,
        tripSeats,
        busSeats,
        seatIdMap,
        canBook: bookableCount > 0,
        unavailableMessage: seatsUnavailableMessage(tripSeats, busSeats),
    };
}

export function seatsUnavailableMessage(tripSeats = [], busSeats = []) {
    const bookable = tripSeats.filter(isTripSeatAvailable).length;
    if (bookable > 0) return null;

    if (tripSeats.length > 0) {
        return 'All seats on this trip are currently reserved or sold out. Choose another trip or try again later.';
    }

    if (busSeats.length > 0) {
        return 'This trip has no seat inventory. In Fleet Management, seats exist on the bus, but this trip was created before seats were set up. Create a new trip schedule for this bus.';
    }

    return 'This trip has no bookable seats yet. Add the bus in Fleet Management (seats are created automatically), then create a new trip schedule.';
}

/** @param {Array<{ label: string, tripSeatId?: string | null, seatType?: string } | string>} selectedSeats */
export function resolveSelectedSeats(selectedSeats, seatIdMap) {
    return selectedSeats.map((seat) => {
        const label = typeof seat === 'object' ? seat.label : seat;
        const existing = typeof seat === 'object' ? seat.tripSeatId : null;
        const seatType = typeof seat === 'object' ? seat.seatType : null;
        return {
            label,
            tripSeatId: seatIdMap[label] ?? existing ?? null,
            ...(seatType ? { seatType } : {}),
        };
    });
}

/** Labels of seats that are not AVAILABLE on this trip. */
export function occupiedSeatLabels(tripSeats = []) {
    return tripSeats.filter(isTripSeatOccupied).map((s) => s.seatNumber);
}
