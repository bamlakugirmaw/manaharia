import { api, unwrap } from '../lib/api';

/**
 * Routes API
 *
 * list    — GET    /v1/routes   (PUBLIC — no auth)
 * getById — GET    /v1/routes/:id (PUBLIC)
 * create  — POST   /v1/routes   (admin)
 * update  — PATCH  /v1/routes/:id (admin)
 * remove  — DELETE /v1/routes/:id (admin)
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   origin?: string,
 *   destination?: string
 * }} params
 */
export const listRoutes = (params = {}) =>
    api.get('/routes', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getRouteById = (id) =>
    api.get(`/routes/${id}`).then(unwrap);

/**
 * @param {{
 *   code: string,
 *   origin: string,
 *   destination: string,
 *   distance: number
 * }} data
 */
export const createRoute = (data) =>
    api.post('/routes', data).then(unwrap);

/**
 * @param {string} id
 * @param {Partial<CreateRouteDto>} data
 */
export const updateRoute = (id, data) =>
    api.patch(`/routes/${id}`, data).then(unwrap);

/**
 * @param {string} id
 */
export const removeRoute = (id) =>
    api.delete(`/routes/${id}`).then(unwrap);

export const routesApi = { listRoutes, getRouteById, createRoute, updateRoute, removeRoute };
