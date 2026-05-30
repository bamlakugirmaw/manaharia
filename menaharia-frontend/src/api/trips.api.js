import { api, unwrap } from '../lib/api';

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
    api.get('/trips', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getTripById = (id) =>
    api.get(`/trips/${id}`).then(unwrap);

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
export const createTrip = (data) =>
    api.post('/trips', data).then(unwrap);

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
