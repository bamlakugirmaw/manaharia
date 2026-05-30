import { api, unwrap } from '../lib/api';

/**
 * Bookings API  (all endpoints require auth)
 *
 * create  — POST  /v1/bookings              Reserves seats + creates booking + inits payment
 * list    — GET   /v1/bookings
 * getById — GET   /v1/bookings/:id
 * cancel  — PATCH /v1/bookings/:id/cancel
 *
 * Booking status: PENDING | CONFIRMED | CANCELLED
 */

/**
 * Reserve seats, create a booking, and initialize payment in one call.
 *
 * @param {{
 *   tripId: string,
 *   paymentMethod: 'TELEBIRR' | 'CBE' | 'CHAPA',
 *   travelers: Array<{
 *     tripSeatId: string,
 *     fullName: string,
 *     email: string,
 *     phone: string,
 *     emergencyContact: string
 *   }>
 * }} data
 * @returns {{ id: string, status: 'PENDING', payment: object, ... }}
 */
export const createBooking = (data) =>
    api.post('/bookings', data).then(unwrap);

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
 *   userId?: string
 * }} params
 */
export const listBookings = (params = {}) =>
    api.get('/bookings', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getBookingById = (id) =>
    api.get(`/bookings/${id}`).then(unwrap);

/**
 * @param {string} id
 */
export const cancelBooking = (id) =>
    api.patch(`/bookings/${id}/cancel`).then(unwrap);

export const bookingsApi = { createBooking, listBookings, getBookingById, cancelBooking };
