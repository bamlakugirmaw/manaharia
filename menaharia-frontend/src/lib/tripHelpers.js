/** Shared field accessors for backend trip objects. */

export const tripOrigin = (t) => {
    const v = t?.route?.origin ?? t?.from ?? '';
    return v == null ? '' : typeof v === 'string' ? v : String(v);
};
export const tripDest = (t) => {
    const v = t?.route?.destination ?? t?.to ?? '';
    return v == null ? '' : typeof v === 'string' ? v : String(v);
};

/** First segment before a comma (city label for UI). */
export const tripCityLabel = (value) => {
    if (value == null || value === '') return '';
    const s = typeof value === 'string' ? value : String(value);
    return s.split(',')[0].trim();
};

/** Backend stores trip.date as ISO midnight UTC (see GET /v1/trips). */
export function toTripDateISO(dateStr) {
    if (!dateStr) return '';
    if (dateStr.includes('T')) return dateStr;
    return `${dateStr}T00:00:00.000Z`;
}
export function parseTripDateTime(dateStr, timeStr) {
    if (!dateStr || !timeStr) {
        throw new Error('Date and time are required.');
    }
    const raw = String(timeStr).trim();
    // Accept HH:mm or HH:mm:ss from <input type="time">
    const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (!match) {
        throw new Error(`Invalid time: ${timeStr}`);
    }
    const hh = match[1].padStart(2, '0');
    const mm = match[2];
    const d = new Date(`${dateStr}T${hh}:${mm}:00`);
    if (Number.isNaN(d.getTime())) {
        throw new Error(`Invalid date/time: ${dateStr} ${timeStr}`);
    }
    return d.toISOString();
}

/** Arrival ISO datetime; rolls to the next calendar day when arrival ≤ departure. */
export function buildArrivalDateTime(dateStr, arrivalTime, departureISO) {
    const arrivalISO = parseTripDateTime(dateStr, arrivalTime);
    const arrival = new Date(arrivalISO);
    const departure = new Date(departureISO);
    if (arrival <= departure) {
        arrival.setDate(arrival.getDate() + 1);
    }
    return arrival.toISOString();
}

/** Normalise amenities from a comma string or string array. */
export function parseAmenities(value, fallback = 'WiFi,AC') {
    if (Array.isArray(value)) {
        return value.map((s) => String(s).trim()).filter(Boolean);
    }
    const raw = value ?? fallback;
    return String(raw).split(',').map((s) => s.trim()).filter(Boolean);
}

export const tripOperatorName = (t) =>
    t?.bus?.operator?.companyName ??
    t?.bus?.operator?.name ??
    t?.operator?.companyName ??
    t?.operator?.name ??
    t?.operatorName ??
    '';

export const tripSeatsLeft = (t) =>
    t?.availableSeatCount ?? t?.seatsAvailable ?? t?.availableSeats ?? 0;

/** Human-readable duration from departure/arrival time strings (HH:mm). */
export function formatTripDuration(trip) {
    const dep = trip?.departureTime;
    const arr = trip?.arrivalTime;
    if (!dep || !arr) return '—';
    const toMins = (s) => {
        const [h, m] = String(s).split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
    };
    let mins = toMins(arr) - toMins(dep);
    if (mins < 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
