import { parseChapaReturnParams, mapChapaStatusToApi } from './chapaReturn';

const AUDIT_KEY = 'menaharia.payment.callbackAudit';

/**
 * Append provider return/callback params for troubleshooting (frontend audit log).
 * Backend webhook is the source of truth for payment finalization.
 */
export function appendPaymentCallbackAudit(entry) {
    if (!entry?.bookingId) return;
    try {
        const all = loadPaymentCallbackAudits();
        const list = Array.isArray(all[entry.bookingId]) ? all[entry.bookingId] : [];
        list.push({
            ...entry,
            recordedAt: new Date().toISOString(),
        });
        all[entry.bookingId] = list.slice(-20);
        localStorage.setItem(AUDIT_KEY, JSON.stringify(all));
    } catch {
        /* quota */
    }
}

export function loadPaymentCallbackAudits() {
    try {
        const raw = localStorage.getItem(AUDIT_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export { parseChapaReturnParams, mapChapaStatusToApi };

/**
 * Build audit entry from Chapa return URL params.
 */
export function buildCallbackPayloadFromReturn({
    bookingId,
    searchParams,
    method = 'CHAPA',
}) {
    const params = {};
    if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
            if (value) params[key] = value;
        }
    }

    const chapa = parseChapaReturnParams(searchParams ?? new URLSearchParams());

    return {
        bookingId: bookingId ?? params.bookingId ?? params.booking_id ?? null,
        gatewayReference: chapa.gatewayReference,
        transactionCode: chapa.transactionCode,
        status: chapa.apiStatus ?? chapa.chapaStatus ?? 'PENDING',
        callbackReference: chapa.callbackReference,
        rawPayload: JSON.stringify(params),
        method,
    };
}
