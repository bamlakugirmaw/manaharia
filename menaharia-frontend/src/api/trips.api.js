import { api, unwrap, unwrapEnvelope, sanitizeListParams } from '../lib/api';

/**
 * Trips API  (GET endpoints are public — no auth required)
 *
 * list   — GET  /v1/trips
 * getById — GET /v1/trips/:id
 * create — POST /v1/trips          (operator/admin)
 * update — PATCH /v1/trips/:id     (operator/admin)
 * remove — DELETE /v1/trips/:id    (operator/admin)
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   origin?: string,
 *   destination?: string,
 *   date?: string,          // ISO date string e.g. "2025-12-15"
 *   dateFrom?: string,
 *   dateTo?: string,
 *   routeSearch?: string,
 *   status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
 * }} params
 */
export const listTrips = (params = {}) =>
    api.get('/trips', { params: sanitizeListParams(params) }).then(unwrap);

/**
 * @param {string} id
 */
export const getTripById = (id) =>
    api.get(`/trips/${id}`).then(unwrapEnvelope);

/**
 * @param {{
 *   routeId: string,
 *   busId: string,
 *   date: string,
 *   departureTime: string,
 *   arrivalTime: string,
 *   price: number,
 *   amenities?: string[],
 *   status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
 * }} data
 */
/** Normalise POST /trips body — backend may return trip object or wrapped shapes. */
function normaliseCreatedTrip(raw) {
    if (raw == null) return null;
    if (Array.isArray(raw)) return raw.find((t) => t?.id) ?? raw[0] ?? null;
    if (raw.id) return raw;
    if (raw.trip?.id) return raw.trip;
    if (Array.isArray(raw.items)) return raw.items.find((t) => t?.id) ?? raw.items[0] ?? null;
    if (raw.data?.id) return raw.data;
    return raw;
}

export async function createTrip(data) {
    const res = await api.post('/trips', data);
    const trip = normaliseCreatedTrip(unwrapEnvelope(res));
    if (!trip?.id) {
        throw new Error('Trip was saved but the server response did not include a trip id.');
    }
    return trip;
}

/**
 * @param {string} id
 * @param {Partial<CreateTripDto>} data
 */
export const updateTrip = (id, data) =>
    api.patch(`/trips/${id}`, data).then(unwrap);

/**
 * @param {string} id
 */
export const removeTrip = (id) =>
    api.delete(`/trips/${id}`).then(unwrap);

export const tripsApi = { listTrips, getTripById, createTrip, updateTrip, removeTrip };
