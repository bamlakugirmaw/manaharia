import { api, unwrap } from '../lib/api';

/**
 * Seats API
 *
 * list        — GET  /v1/seats          (PUBLIC — no auth)
 * createBatch — POST /v1/seats/batch    (operator/admin)
 *
 * Seats are physical bus seats. When a trip is created, the backend
 * materializes trip-level seat records (TripSeats) from these.
 * The tripSeatId from a trip's seat list is required when creating a booking.
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   busId?: string
 * }} params
 * @returns {{ data: Array<{ id: string, seatNumber: string, seatType: 'VIP' | 'STANDARD', busId: string }>, ... }}
 */
export const listSeats = (params = {}) =>
    api.get('/seats', { params }).then(unwrap);

/**
 * Create bus seats in batch.
 * @param {{
 *   busId: string,
 *   seats: Array<{ seatNumber: string, seatType: 'VIP' | 'STANDARD' }>
 * }} data
 */
export const createSeatBatch = (data) =>
    api.post('/seats/batch', data).then(unwrap);

export const seatsApi = { listSeats, createSeatBatch };
