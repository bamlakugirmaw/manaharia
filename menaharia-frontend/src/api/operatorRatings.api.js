import { api, unwrapEnvelope, sanitizeListParams } from '../lib/api';

/**
 * Operator ratings API  (auth required)
 *
 * create  — POST   /v1/operator-ratings
 * list    — GET    /v1/operator-ratings
 * getById — GET    /v1/operator-ratings/:id
 * update  — PATCH  /v1/operator-ratings/:id
 * remove  — DELETE /v1/operator-ratings/:id
 */

/**
 * @param {{
 *   operatorId: string,
 *   bookingId?: string,
 *   rating: number,
 *   comment?: string
 * }} data
 */
export const createOperatorRating = (data) =>
    api.post('/operator-ratings', data).then(unwrapEnvelope);

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   operatorId?: string,
 *   userId?: string,
 *   bookingId?: string
 * }} params
 */
export const listOperatorRatings = (params = {}) =>
    api.get('/operator-ratings', { params: sanitizeListParams(params) }).then(unwrapEnvelope);

/** Public reviews on operator profile — no login redirect on 401. */
export const listOperatorRatingsPublic = (params = {}) =>
    api.get('/operator-ratings', {
        params: sanitizeListParams(params),
        skipAuthRedirect: true,
    }).then(unwrapEnvelope);

/** @param {string} id */
export const getOperatorRatingById = (id) =>
    api.get(`/operator-ratings/${id}`).then(unwrapEnvelope);

/**
 * @param {string} id
 * @param {{
 *   rating?: number,
 *   comment?: string,
 *   operatorId?: string,
 *   bookingId?: string
 * }} data
 */
export const updateOperatorRating = (id, data) =>
    api.patch(`/operator-ratings/${id}`, data).then(unwrapEnvelope);

/** @param {string} id */
export const deleteOperatorRating = (id) =>
    api.delete(`/operator-ratings/${id}`).then(unwrapEnvelope);

export const operatorRatingsApi = {
    createOperatorRating,
    listOperatorRatings,
    listOperatorRatingsPublic,
    getOperatorRatingById,
    updateOperatorRating,
    deleteOperatorRating,
};
