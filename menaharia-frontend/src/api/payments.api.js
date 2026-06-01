import axios from 'axios';
import { api, unwrapEnvelope } from '../lib/api';
import { normaliseInitiatePaymentResponse } from '../lib/bookingResponse';

const API_ROOT = (import.meta.env.VITE_API_URL ?? 'http://localhost:3002').replace(/\/$/, '');

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
 *   method: 'CHAPA' | 'TELEBIRR' | 'SANTIM',
 *   bookingId: string,
 * }} data
 * @returns {{ paymentUrl?: string, gatewayReference?: string, message?: string }}
 */
export const initiatePayment = ({ bookingId, method }) =>
    api.post('/payments/initiate', { bookingId, method }).then((res) =>
        normaliseInitiatePaymentResponse(unwrapEnvelope(res))
    );

/**
 * Chapa return / webhook — no auth required (plain POST, no Bearer).
 *
 * @param {{
 *   gatewayReference: string,
 *   status: 'SUCCESS' | 'FAILED' | string,
 *   method: 'CHAPA' | 'TELEBIRR' | 'SANTIM',
 *   transactionCode?: string,
 *   callbackReference?: string,
 * }} data
 */
export const paymentCallbackPublic = (data) =>
    axios
        .post(`${API_ROOT}/v1/payments/callback`, data, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000,
        })
        .then((res) => unwrapEnvelope(res));

/** Authenticated callback (testing only). */
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

export const paymentsApi = {
    initiatePayment,
    paymentCallbackPublic,
    paymentCallback,
    listPayments,
    getPaymentById,
};
