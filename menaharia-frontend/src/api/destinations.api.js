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
 * NOTE: Listing requires bearer auth on the backend. Public pages use
 * listDestinationsPublic / getDestinationByIdPublic (skipAuthRedirect) so
 * 401 does not force a login redirect — the UI shows a sign-in prompt instead.
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

/** Same as listDestinations but safe for public routes (no login redirect on 401). */
export const listDestinationsPublic = (params = {}) =>
    api.get('/destinations', { params, skipAuthRedirect: true }).then(unwrap);

/**
 * @param {string} id
 */
export const getDestinationById = (id) =>
    api.get(`/destinations/${id}`).then(unwrap);

export const getDestinationByIdPublic = (id) =>
    api.get(`/destinations/${id}`, { skipAuthRedirect: true }).then(unwrap);

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
    listDestinationsPublic,
    getDestinationById,
    getDestinationByIdPublic,
    createDestination,
    updateDestination,
    removeDestination,
};
