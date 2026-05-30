import { api, unwrap } from '../lib/api';

/**
 * Disputes API  (all endpoints require auth)
 *
 * create  — POST   /v1/disputes
 * list    — GET    /v1/disputes
 * getById — GET    /v1/disputes/:id
 * update  — PATCH  /v1/disputes/:id   (status + response)
 * remove  — DELETE /v1/disputes/:id   (withdraw)
 *
 * Status enum: PENDING | IN_REVIEW | RESOLVED | REJECTED
 */

/**
 * @param {{
 *   operatorId: string,
 *   bookingId?: string,
 *   subject: string,
 *   message: string
 * }} data
 */
export const createDispute = (data) =>
    api.post('/disputes', data).then(unwrap);

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED',
 *   userId?: string,
 *   operatorId?: string,
 *   bookingId?: string
 * }} params
 */
export const listDisputes = (params = {}) =>
    api.get('/disputes', { params }).then(unwrap);

/** @param {string} id */
export const getDisputeById = (id) =>
    api.get(`/disputes/${id}`).then(unwrap);

/**
 * @param {string} id
 * @param {{
 *   status?: 'PENDING' | 'IN_REVIEW' | 'RESOLVED' | 'REJECTED',
 *   response?: string
 * }} data
 */
export const updateDispute = (id, data) =>
    api.patch(`/disputes/${id}`, data).then(unwrap);

/** @param {string} id */
export const removeDispute = (id) =>
    api.delete(`/disputes/${id}`).then(unwrap);

export const disputesApi = {
    createDispute,
    listDisputes,
    getDisputeById,
    updateDispute,
    removeDispute,
};
