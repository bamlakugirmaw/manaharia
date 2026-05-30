import { api, unwrap } from '../lib/api';

/**
 * Destinations API  (all endpoints require auth)
 *
 * list    — GET    /v1/destinations
 * getById — GET    /v1/destinations/:id
 * create  — POST   /v1/destinations   (admin)
 * update  — PATCH  /v1/destinations/:id (admin)
 * remove  — DELETE /v1/destinations/:id (admin)
 *
 * NOTE: The backend requires auth for listing destinations.
 * The landing page uses the static DESTINATIONS array from mock-db.js
 * as a fallback until a public endpoint is available.
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   name?: string
 * }} params
 */
export const listDestinations = (params = {}) =>
    api.get('/destinations', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getDestinationById = (id) =>
    api.get(`/destinations/${id}`).then(unwrap);

/**
 * @param {{
 *   name: string,
 *   description: string,
 *   image: string,
 *   highlights?: string[]
 * }} data
 */
export const createDestination = (data) =>
    api.post('/destinations', data).then(unwrap);

/**
 * @param {string} id
 * @param {Partial<CreateDestinationDto>} data
 */
export const updateDestination = (id, data) =>
    api.patch(`/destinations/${id}`, data).then(unwrap);

/**
 * @param {string} id
 */
export const removeDestination = (id) =>
    api.delete(`/destinations/${id}`).then(unwrap);

export const destinationsApi = {
    listDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    removeDestination,
};
