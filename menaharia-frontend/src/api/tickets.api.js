import { api, unwrapEnvelope, sanitizeListParams } from '../lib/api';

/**
 * Tickets API
 *
 * getByBooking — GET  /v1/tickets/booking/:bookingId  (after payment confirms)
 * validate     — POST /v1/tickets/validate             (QR / ticket number check-in)
 * getById      — GET  /v1/tickets/:id
 * pdf          — GET  /v1/tickets/:ticketId/pdf
 *
 * Tickets are issued by the backend after payment callback — no create endpoint.
 */

/**
 * @param {string} bookingId
 */
export const getTicketsByBooking = (bookingId) =>
    api.get(`/tickets/booking/${bookingId}`).then(unwrapEnvelope);

/**
 * Validate an issued ticket (operator check-in).
 * @param {{ ticketNumber?: string, qrCode?: string }} params
 */
export const validateTicket = ({ ticketNumber, qrCode } = {}) => {
    const params = {};
    if (ticketNumber) params.ticketNumber = ticketNumber;
    if (qrCode) params.qrCode = qrCode;
    return api.post('/tickets/validate', null, { params }).then(unwrapEnvelope);
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   bookingId?: string
 * }} params
 * @deprecated Prefer getTicketsByBooking — list route is not in OpenAPI.
 */
export const listTickets = (params = {}) => {
    const { bookingId, ...rest } = params;
    if (bookingId) {
        return getTicketsByBooking(bookingId);
    }
    return api.get('/tickets', { params: sanitizeListParams(rest) }).then(unwrapEnvelope);
};

/**
 * @param {string} id
 */
export const getTicketById = (id) =>
    api.get(`/tickets/${id}`).then(unwrapEnvelope);

export const ticketsApi = {
    getTicketsByBooking,
    validateTicket,
    listTickets,
    getTicketById,
};
