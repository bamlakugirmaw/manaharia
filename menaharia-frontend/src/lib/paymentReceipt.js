const RECEIPTS_KEY = 'menaharia.payment.receipts';

/**
 * Build a storable Chapa/payment receipt from booking + return URL params.
 */
export function buildPaymentReceipt({ booking, bookingId, searchParams, pending = null }) {
    const payment = booking?.payment ?? (Array.isArray(booking?.payments) ? booking.payments[0] : null) ?? {};
    const params = {};
    if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
            if (value) params[key] = value;
        }
    }

    return {
        bookingId: bookingId ?? booking?.id ?? null,
        bookingReference:
            booking?.bookingReference
            ?? pending?.bookingReference
            ?? params.bookingReference
            ?? null,
        paymentId: payment.id ?? null,
        amount: payment.amount ?? booking?.totalAmount ?? pending?.totalPrice ?? null,
        method: payment.method ?? 'CHAPA',
        status: (payment.status ?? (booking?.status === 'CONFIRMED' ? 'SUCCESS' : 'PENDING')).toUpperCase(),
        gatewayReference:
            payment.gatewayReference
            ?? payment.reference
            ?? params.trx_ref
            ?? params.reference
            ?? null,
        transactionId:
            payment.transactionId
            ?? payment.transactionCode
            ?? params.tx_ref
            ?? params.transaction_id
            ?? null,
        paidAt: payment.updatedAt ?? payment.createdAt ?? new Date().toISOString(),
        chapaParams: Object.keys(params).length > 0 ? params : undefined,
    };
}

export function loadAllPaymentReceipts() {
    try {
        const raw = localStorage.getItem(RECEIPTS_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function getPaymentReceipt(bookingId) {
    if (!bookingId) return null;
    return loadAllPaymentReceipts()[bookingId] ?? null;
}

export function savePaymentReceipt(receipt) {
    if (!receipt?.bookingId) return;
    try {
        const all = loadAllPaymentReceipts();
        all[receipt.bookingId] = {
            ...all[receipt.bookingId],
            ...receipt,
            savedAt: new Date().toISOString(),
        };
        localStorage.setItem(RECEIPTS_KEY, JSON.stringify(all));
    } catch {
        /* quota / private mode */
    }
}
