import { api, unwrapEnvelope, sanitizeListParams } from '../lib/api';

function unwrapBusList(response) {
    const body = response?.data ?? response;
    const payload = body?.success !== undefined && body?.data !== undefined
        ? body.data
        : body;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/**
 * Buses API  (all endpoints require auth)
 *
 * list    — GET    /v1/buses
 * getById — GET    /v1/buses/:id
 * create  — POST   /v1/buses   (operator/admin)
 * update  — PATCH  /v1/buses/:id
 * remove  — DELETE /v1/buses/:id
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
 *   operatorId?: string
 * }} params
 */
export const listBuses = (params = {}) =>
    api.get('/buses', { params: sanitizeListParams(params) }).then(unwrapBusList);

/**
 * @param {string} id
 */
export const getBusById = (id) =>
    api.get(`/buses/${id}`).then(unwrapEnvelope);

/**
 * @param {{
 *   operatorId: string,
 *   plateNumber: string,
 *   totalSeats: number,
 *   make: string,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} data
 */
export const createBus = (data) =>
    api.post('/buses', data).then(unwrapEnvelope);

/**
 * @param {string} id
 * @param {Partial<CreateBusDto>} data
 */
export const updateBus = (id, data) =>
    api.patch(`/buses/${id}`, data).then(unwrapEnvelope);

/**
 * @param {string} id
 */
export const removeBus = (id) =>
    api.delete(`/buses/${id}`).then(unwrapEnvelope);

export const busesApi = { listBuses, getBusById, createBus, updateBus, removeBus };
