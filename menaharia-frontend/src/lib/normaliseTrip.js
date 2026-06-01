import {
    tripOrigin,
    tripDest,
    tripOperatorName,
    tripSeatsLeft,
} from './tripHelpers';

/** Display times in Ethiopia — matches how operators schedule trips. */
export const TRIP_DISPLAY_TZ = 'Africa/Addis_Ababa';

export function formatTripDisplayTime(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) {
        const part = String(value).includes('T') ? String(value).split('T')[1] : String(value);
        const [h, m] = part.split(':');
        return h && m ? `${h.padStart(2, '0')}:${m}` : '—';
    }
    return d.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: TRIP_DISPLAY_TZ,
    });
}

export function formatTripDisplayDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: TRIP_DISPLAY_TZ,
    });
}

export function tripDurationFromIso(departureIso, arrivalIso) {
    if (!departureIso || !arrivalIso) return '—';
    const ms = new Date(arrivalIso).getTime() - new Date(departureIso).getTime();
    if (!Number.isFinite(ms) || ms <= 0) return '—';
    const totalMins = Math.round(ms / 60000);
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

/** Seats travellers can still book on this trip. */
export function tripAvailableSeatCount(trip) {
    if (typeof trip?.availableSeatCount === 'number') {
        return trip.availableSeatCount;
    }
    const seats = trip?.tripSeats ?? [];
    if (!Array.isArray(seats) || seats.length === 0) {
        return tripSeatsLeft(trip);
    }
    return seats.filter((s) => {
        const status = (s.status ?? '').toUpperCase();
        if (status === 'AVAILABLE') return true;
        if (s.isAvailable === true) return true;
        return false;
    }).length;
}

export function tripOperatorId(trip) {
    return (
        trip?.bus?.operator?.id
        ?? trip?.bus?.operatorId
        ?? trip?.operator?.id
        ?? trip?.operatorId
        ?? ''
    );
}

/**
 * Exclude soft-deleted or inactive entities from public search results.
 */
export function isTripPubliclyVisible(trip) {
    if (!trip?.id) return false;
    if (trip.deletedAt) return false;
    if ((trip.status ?? '').toUpperCase() !== 'SCHEDULED') return false;
    if (trip.route?.deletedAt) return false;
    if (trip.bus?.deletedAt) return false;
    const busStatus = (trip.bus?.status ?? 'ACTIVE').toUpperCase();
    if (busStatus !== 'ACTIVE') return false;
    const opStatus = (trip.bus?.operator?.status ?? 'ACTIVE').toUpperCase();
    if (opStatus !== 'ACTIVE') return false;
    if (!tripOrigin(trip) || !tripDest(trip)) return false;
    if (!tripOperatorName(trip)) return false;
    return true;
}

/**
 * Normalise GET /v1/trips (and /:id) records for search cards and booking flow.
 * Preserves the raw API object on `_raw` for mutations and seat maps.
 */
export function normaliseTripForDisplay(trip) {
    if (!trip) return null;
    const operator = trip.bus?.operator ?? trip.operator ?? {};
    const from = tripOrigin(trip);
    const to = tripDest(trip);

    return {
        ...trip,
        from,
        to,
        route: trip.route ?? { origin: from, destination: to },
        operatorName: tripOperatorName(trip),
        operatorId: tripOperatorId(trip),
        operatorRating: operator.rating ?? null,
        busMake: trip.bus?.make ?? trip.busName ?? 'Standard',
        busPlate: trip.bus?.plateNumber ?? '',
        departureDisplay: formatTripDisplayTime(trip.departureTime),
        arrivalDisplay: formatTripDisplayTime(trip.arrivalTime),
        dateDisplay: formatTripDisplayDate(trip.date),
        duration: tripDurationFromIso(trip.departureTime, trip.arrivalTime),
        seatsAvailable: tripAvailableSeatCount(trip),
        _raw: trip,
    };
}

export function unwrapTripsList(response) {
    const body = response?.data ?? response;
    const payload = body?.success !== undefined && body?.data !== undefined
        ? body.data
        : body;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

export function prepareTripsList(rawList) {
    return (Array.isArray(rawList) ? rawList : [])
        .filter(isTripPubliclyVisible)
        .map(normaliseTripForDisplay)
        .filter(Boolean);
}
