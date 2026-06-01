import { api, unwrapEnvelope } from '../lib/api';
import { normaliseInitiatePaymentResponse } from '../lib/bookingResponse';

/**
 * Payments API  (all endpoints require auth except /callback)
 *
 * initiate — POST /v1/payments/initiate   Initiate payment for a pending booking
 * callback — POST /v1/payments/callback   Webhook from payment provider (public)
 * list     — GET  /v1/payments
 * getById  — GET  /v1/payments/:id
 *
 * Payment methods: TELEBIRR | SANTIM | CHAPA
 * Payment status:  PENDING  | SUCCESS | FAILED
 */

/**
 * Initiate payment for a pending booking.
 * Returns a payment URL or reference to redirect the user to the gateway.
 *
 * @param {{
 *   method: 'TELEBIRR' | 'SANTIM' | 'CHAPA',
 *   bookingId: string,
 *   customerReference?: string
 * }} data
 * @returns {{ paymentUrl?: string, reference?: string, ... }}
 */
export const initiatePayment = (data) =>
    api.post('/payments/initiate', data).then((res) =>
        normaliseInitiatePaymentResponse(unwrapEnvelope(res))
    );

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
    api.post('/payments/callback', data).then(unwrapEnvelope);

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'SUCCESS' | 'FAILED',
 *   method?: 'TELEBIRR' | 'CBE' | 'CHAPA'
 * }} params
 */
export const listPayments = (params = {}) =>
    api.get('/payments', { params }).then(unwrapEnvelope);

/**
 * @param {string} id
 */
export const getPaymentById = (id) =>
    api.get(`/payments/${id}`).then(unwrapEnvelope);

export const paymentsApi = { initiatePayment, paymentCallback, listPayments, getPaymentById };
