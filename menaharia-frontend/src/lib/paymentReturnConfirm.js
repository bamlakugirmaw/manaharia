import { paymentsApi } from '../api/payments.api';
import { resolveChapaReturnParams, shouldAttemptClientCallback } from './chapaReturn';
import { appendPaymentCallbackAudit } from './paymentCallbackAudit';
import { buildChapaCallbackPayload, CHAPA_PAYMENT_METHOD } from './paymentSync';

const CALLBACK_SENT_PREFIX = 'menaharia.payment.callbackSent.';

export function buildCallbackBody(chapa, bookingId) {
    return buildChapaCallbackPayload({
        gatewayReference: chapa.gatewayReference,
        status: chapa.apiStatus,
        transactionCode: chapa.transactionCode,
        callbackReference: chapa.callbackReference,
        bookingId,
    });
}

/**
 * POST /v1/payments/callback from the SPA return route (backup if payment-return.html did not run).
 * payment-return.html is the primary caller; this retries when trx_ref is in the URL or stored gateway ref exists.
 *
 * @param {{ bookingId: string, searchParams: URLSearchParams, forceRetry?: boolean }} options
 *   forceRetry — bypass the dedup key and send the callback again (used after polling timeout)
 */
export async function confirmPaymentFromChapaReturn({ bookingId, searchParams, forceRetry = false }) {
    const chapa = resolveChapaReturnParams(searchParams, bookingId);

    appendPaymentCallbackAudit({
        bookingId,
        gatewayReference: chapa.gatewayReference,
        status: chapa.apiStatus ?? chapa.chapaStatus,
        transactionCode: chapa.transactionCode,
        callbackReference: chapa.callbackReference,
        rawPayload: searchParams?.toString() ?? '',
        method: CHAPA_PAYMENT_METHOD,
    });

    if (!shouldAttemptClientCallback(chapa)) {
        return { attempted: false, chapa };
    }

    const dedupeKey = `${CALLBACK_SENT_PREFIX}${chapa.gatewayReference}`;
    if (!forceRetry) {
        try {
            if (sessionStorage.getItem(dedupeKey)) {
                return { attempted: false, chapa, skipped: 'duplicate' };
            }
        } catch {
            /* continue */
        }
    }

    try {
        await paymentsApi.paymentCallbackPublic(buildCallbackBody(chapa, bookingId));
        try {
            sessionStorage.setItem(dedupeKey, String(Date.now()));
        } catch {
            /* ignore */
        }
        return { attempted: true, chapa };
    } catch (err) {
        console.error('Payment callback failed', err);
        return { attempted: true, chapa, error: err };
    }
}
