import { api, unwrap } from '../lib/api';

/**
 * Payments API  (all endpoints require auth except /callback)
 *
 * initiate — POST /v1/payments/initiate   Initiate payment for a pending booking
 * callback — POST /v1/payments/callback   Webhook from payment provider (public)
 * list     — GET  /v1/payments
 * getById  — GET  /v1/payments/:id
 *
 * Payment methods: TELEBIRR | CBE | CHAPA
 * Payment status:  PENDING  | SUCCESS | FAILED
 */

/**
 * Initiate payment for a pending booking.
 * Returns a payment URL or reference to redirect the user to the gateway.
 *
 * @param {{
 *   method: 'TELEBIRR' | 'CBE' | 'CHAPA',
 *   bookingId: string,
 *   customerReference?: string
 * }} data
 * @returns {{ paymentUrl?: string, reference?: string, ... }}
 */
export const initiatePayment = (data) =>
    api.post('/payments/initiate', data).then(unwrap);

/**
 * Receive payment provider callback (webhook).
 * Called by the payment gateway — not directly by the frontend in production.
 * Exposed here for testing/manual confirmation flows.
 *
 * @param {{
 *   bookingId: string,
 *   gatewayReference?: string,
 *   transactionCode?: string,
 *   status: string,
 *   callbackReference?: string,
 *   rawPayload?: string
 * }} data
 */
export const paymentCallback = (data) =>
    api.post('/payments/callback', data).then(unwrap);

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'SUCCESS' | 'FAILED',
 *   method?: 'TELEBIRR' | 'CBE' | 'CHAPA'
 * }} params
 */
export const listPayments = (params = {}) =>
    api.get('/payments', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getPaymentById = (id) =>
    api.get(`/payments/${id}`).then(unwrap);

export const paymentsApi = { initiatePayment, paymentCallback, listPayments, getPaymentById };
