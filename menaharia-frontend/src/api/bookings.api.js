import { api, unwrapEnvelope, sanitizeListParams } from '../lib/api';
import { normaliseCreateBookingResponse, normaliseBookingDetail } from '../lib/bookingResponse';

/**
 * Bookings API  (all endpoints require auth)
 *
 * create  — POST  /v1/bookings              Reserves seats + creates booking (+ payment record)
 * list    — GET   /v1/bookings
 * getById — GET   /v1/bookings/:id
 * cancel  — PATCH /v1/bookings/:id/cancel
 *
 * Booking status: PENDING | CONFIRMED | CANCELLED
 */

/**
 * Reserve seats and create a booking for the logged-in user.
 *
 * @param {{
 *   tripId: string,
 *   paymentMethod: 'TELEBIRR' | 'SANTIM' | 'CHAPA',
 *   travelers: Array<{
 *     tripSeatId: string,
 *     fullName: string,
 *     email: string,
 *     phone: string,
 *     emergencyContact: string
 *   }>
 * }} data
 */
export const createBooking = (data) =>
    api.post('/bookings', data).then((res) =>
        normaliseCreateBookingResponse(unwrapEnvelope(res))
    );

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
 *   userId?: string
 * }} params
 */
export const listBookings = (params = {}) =>
    api.get('/bookings', { params: sanitizeListParams(params) }).then(unwrapEnvelope);

/**
 * @param {string} id
 */
export const getBookingById = (id) =>
    api.get(`/bookings/${id}`).then((res) =>
        normaliseBookingDetail(unwrapEnvelope(res))
    );

/**
 * @param {string} id
 */
export const cancelBooking = (id) =>
    api.patch(`/bookings/${id}/cancel`).then(unwrapEnvelope);

/**
 * Create a booking on behalf of another user (operator/admin).
 * POST /v1/bookings/for-user
 */
export const createBookingForUser = (data) =>
    api.post('/bookings/for-user', data).then((res) =>
        normaliseCreateBookingResponse(unwrapEnvelope(res))
    );

export const bookingsApi = {
    createBooking,
    createBookingForUser,
    listBookings,
    getBookingById,
    cancelBooking,
};
