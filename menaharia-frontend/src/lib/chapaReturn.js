/**
 * Chapa redirect query params on PAYMENT_REDIRECT_URL
 * e.g. ?trx_ref=TXN-...&status=success&bookingId=... (bookingId from our return URL)
 */

/** Map Chapa return status to API payment_status enum. */
export function mapChapaStatusToApi(status) {
    const s = (status ?? '').toLowerCase().trim();
    if (s === 'success' || s === 'successful' || s === 'completed') return 'SUCCESS';
    if (s === 'failed' || s === 'failure' || s === 'cancelled' || s === 'canceled') {
        return 'FAILED';
    }
    return null;
}

/**
 * @param {URLSearchParams} searchParams
 */
export function parseChapaReturnParams(searchParams) {
    const gatewayReference =
        searchParams.get('trx_ref')
        ?? searchParams.get('reference')
        ?? null;

    const chapaStatus = searchParams.get('status') ?? '';

    return {
        gatewayReference,
        chapaStatus,
        apiStatus: mapChapaStatusToApi(chapaStatus),
        transactionCode:
            searchParams.get('tx_ref')
            ?? searchParams.get('transaction_id')
            ?? searchParams.get('transactionCode')
            ?? null,
        callbackReference:
            searchParams.get('ref_id')
            ?? searchParams.get('callbackReference')
            ?? null,
    };
}

export function shouldAttemptClientCallback(chapaParams) {
    return Boolean(
        chapaParams?.gatewayReference
        && (chapaParams.apiStatus === 'SUCCESS' || chapaParams.apiStatus === 'FAILED'),
    );
}

const PENDING_PAYMENT_KEY = 'menaharia.booking.pendingPayment';

/** gatewayReference saved at POST /payments/initiate when Chapa omits trx_ref on return. */
export function getStoredGatewayReference(bookingId) {
    try {
        const raw = sessionStorage.getItem(PENDING_PAYMENT_KEY);
        if (!raw) return null;
        const pending = JSON.parse(raw);
        if (!pending?.gatewayReference) return null;
        if (bookingId && pending.bookingId && pending.bookingId !== bookingId) return null;
        return pending.gatewayReference;
    } catch {
        return null;
    }
}

export function wasCallbackSentForGateway(gatewayReference) {
    if (!gatewayReference) return false;
    try {
        return Boolean(
            sessionStorage.getItem(`menaharia.payment.callbackSent.${gatewayReference}`),
        );
    } catch {
        return false;
    }
}

/**
 * Merge URL params with session fallback (initiate response / payment-return.html).
 * @param {URLSearchParams} searchParams
 * @param {string | null} [bookingId]
 */
export function resolveChapaReturnParams(searchParams, bookingId = null) {
    const fromUrl = parseChapaReturnParams(searchParams);
    const storedRef = getStoredGatewayReference(bookingId);
    const gatewayReference = fromUrl.gatewayReference ?? storedRef;
    let apiStatus = fromUrl.apiStatus;

    if (!apiStatus && fromUrl.chapaStatus) {
        apiStatus = mapChapaStatusToApi(fromUrl.chapaStatus);
    }
    // Only use the dedup key as a signal — never assume SUCCESS from stored ref alone.
    // If Chapa didn't provide a status, we cannot safely assume the payment succeeded.
    if (!apiStatus && gatewayReference && wasCallbackSentForGateway(gatewayReference)) {
        apiStatus = 'SUCCESS';
    }

    const transactionCode = fromUrl.transactionCode ?? gatewayReference;
    const callbackReference = fromUrl.callbackReference ?? gatewayReference;

    return {
        ...fromUrl,
        gatewayReference,
        apiStatus,
        transactionCode,
        callbackReference,
    };
}
