import { api, unwrapEnvelope, sanitizeListParams } from '../lib/api';

/**
 * Tickets API  (all endpoints require auth)
 *
 * Tickets are generated server-side automatically after a payment is confirmed.
 * There is no create endpoint — they are a result of a successful booking payment.
 *
 * list    — GET /v1/tickets
 * getById — GET /v1/tickets/:id
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   bookingId?: string
 * }} params
 * @returns {{ data: Array<Ticket>, total: number, ... }}
 */
export const listTickets = (params = {}) =>
    api.get('/tickets', { params: sanitizeListParams(params) }).then(unwrapEnvelope);

/**
 * @param {string} id
 * @returns {Ticket}
 */
export const getTicketById = (id) =>
    api.get(`/tickets/${id}`).then(unwrapEnvelope);

export const ticketsApi = { listTickets, getTicketById };
