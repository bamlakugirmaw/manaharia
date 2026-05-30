import { api, unwrap } from '../lib/api';

/**
 * Travelers API  (all endpoints require auth)
 *
 * Traveler records are the per-seat passenger details submitted during booking.
 * They are created automatically as part of POST /v1/bookings.
 *
 * list    — GET /v1/travelers
 * getById — GET /v1/travelers/:id
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   bookingId?: string
 * }} params
 */
export const listTravelers = (params = {}) =>
    api.get('/travelers', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getTravelerById = (id) =>
    api.get(`/travelers/${id}`).then(unwrap);

export const travelersApi = { listTravelers, getTravelerById };
