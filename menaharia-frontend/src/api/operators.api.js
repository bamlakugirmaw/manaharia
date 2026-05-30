import { api, unwrap } from '../lib/api';

/**
 * Operators API  (all endpoints require auth)
 *
 * list      — GET    /v1/operators
 * getById   — GET    /v1/operators/:id
 * dashboard — GET    /v1/operators/:id/dashboard
 * create    — POST   /v1/operators   (admin)
 * update    — PATCH  /v1/operators/:id
 * remove    — DELETE /v1/operators/:id (admin)
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} params
 */
export const listOperators = (params = {}) =>
    api.get('/operators', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getOperatorById = (id) =>
    api.get(`/operators/${id}`).then(unwrap);

/**
 * @param {string} id
 * @param {{ from?: string, to?: string }} params  ISO date strings
 */
export const getOperatorDashboard = (id, params = {}) =>
    api.get(`/operators/${id}/dashboard`, { params }).then(unwrap);

/**
 * @param {{
 *   companyName: string,
 *   businessLicenseNo: string,
 *   tinNo: string,
 *   phone: string,
 *   address: string,
 *   responsibleName: string,
 *   companyPhone: string,
 *   companyEmail: string,
 *   name?: string,
 *   logo?: string,
 *   established?: number,
 *   rating?: number,
 *   reliabilityScore?: number,
 *   badge?: string[],
 *   about?: string,
 *   safetyInfo?: string,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} data
 */
export const createOperator = (data) =>
    api.post('/operators', data).then(unwrap);

/**
 * @param {string} id
 * @param {Partial<CreateOperatorDto>} data
 */
export const updateOperator = (id, data) =>
    api.patch(`/operators/${id}`, data).then(unwrap);

/**
 * @param {string} id
 */
export const removeOperator = (id) =>
    api.delete(`/operators/${id}`).then(unwrap);

export const operatorsApi = {
    listOperators,
    getOperatorById,
    getOperatorDashboard,
    createOperator,
    updateOperator,
    removeOperator,
};
