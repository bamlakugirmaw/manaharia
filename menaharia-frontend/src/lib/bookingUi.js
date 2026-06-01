import { tripOperatorName, tripOrigin, tripDest } from './tripHelpers';
import { bookingOperatorId, formatTripTime } from './operatorHelpers';
import { getPaymentReceipt } from './paymentReceipt';
import { collectSeatLabels, buildTripSeatLabelMap } from './bookingEnrichment';

const METHOD_LABEL = {
    TELEBIRR: 'Telebirr',
    SANTIM: 'Santim',
    CHAPA: 'Chapa',
    CBE: 'CBE Birr',
    MANUAL: 'Manual / Cash',
};

/** Normalise API payment status (SUCCESS | COMPLETED → paid). */
export function normalizePaymentStatus(status) {
    const s = (status ?? '').toUpperCase();
    if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'PAID') return 'COMPLETED';
    if (s === 'FAILED') return 'FAILED';
    return 'PENDING';
}

/** True only when the API reports a completed payment or confirmed booking. */
export function isBackendBookingPaid(booking, payment = null) {
    const p = payment ?? booking?.payment ?? (Array.isArray(booking?.payments) ? booking.payments[0] : null);
    const ps = normalizePaymentStatus(p?.status);
    const bs = (booking?.status ?? '').toUpperCase();
    return ps === 'COMPLETED' || bs === 'CONFIRMED';
}

/** User can open Chapa checkout for this booking. */
export function canPayBooking(booking) {
    if (!booking) return false;
    if (isBookingPaid(booking)) return false;
    const bs = (booking.status ?? booking.bookingStatusRaw ?? '').toUpperCase();
    if (bs === 'CANCELLED') return false;
    const ps = normalizePaymentStatus(
        booking.payment?.status ?? booking.paymentStatusRaw,
    );
    return ps === 'PENDING' || ps === 'FAILED';
}

export function resolveBookingPayment(booking) {
    if (!booking) return {};
    let payment = booking.payment ?? (Array.isArray(booking.payments) ? booking.payments[0] : null) ?? {};

    // Local Chapa receipt is display-only — never override pending/failed API state.
    if (isBackendBookingPaid(booking, payment)) {
        const receipt = getPaymentReceipt(booking.id);
        if (receipt) {
            payment = {
                ...payment,
                gatewayReference: receipt.gatewayReference ?? payment.gatewayReference,
                transactionId: receipt.transactionId ?? payment.transactionCode,
            };
        }
    }

    return payment;
}

export function mapPaymentDisplay(paymentStatus, bookingStatus) {
    const ps = normalizePaymentStatus(paymentStatus);
    const bs = (bookingStatus ?? '').toUpperCase();
    if (ps === 'COMPLETED' || bs === 'CONFIRMED') return 'Completed';
    if (ps === 'FAILED') return 'Failed';
    if (bs === 'CANCELLED') return 'Cancelled';
    return 'Pending';
}

export function mapBookingStatusDisplay(bookingStatus) {
    const bs = (bookingStatus ?? '').toUpperCase();
    if (bs === 'CONFIRMED') return 'Confirmed';
    if (bs === 'CANCELLED') return 'Cancelled';
    if (bs === 'PENDING_PAYMENT') return 'Pending Payment';
    if (bs === 'PENDING') return 'Pending';
    return bs ? bs.replace(/_/g, ' ') : '—';
}

export function mapBookingRowStatus(paymentStatus, bookingStatus) {
    const ps = normalizePaymentStatus(paymentStatus);
    const bs = (bookingStatus ?? '').toUpperCase();
    if (bs === 'CANCELLED') return { key: 'cancelled', label: 'Cancelled' };
    if (ps === 'COMPLETED' || bs === 'CONFIRMED') return { key: 'confirmed', label: 'Confirmed' };
    if (ps === 'FAILED') return { key: 'failed', label: 'Payment Failed' };
    return { key: 'pending', label: 'Pending Payment' };
}

export function isBookingPaid(booking) {
    const payment = booking?.payment ?? (Array.isArray(booking?.payments) ? booking.payments[0] : null);
    return isBackendBookingPaid(booking, payment);
}

/** Payment failed or booking cancelled after checkout. */
export function isBookingPaymentFailed(booking) {
    if (!booking) return false;
    const bs = (booking.status ?? '').toUpperCase();
    if (bs === 'CANCELLED') return true;
    const payment = booking.payment ?? (Array.isArray(booking.payments) ? booking.payments[0] : null);
    const ps = (payment?.status ?? '').toUpperCase();
    return ps === 'FAILED';
}

/**
 * Normalise a backend booking for traveller dashboard UI.
 */
export function normaliseBookingForUI(b) {
    const trip = b.trip ?? {};
    const travelers = b.travelers ?? b.bookingTravelers ?? [];
    const traveler = travelers[0] ?? {};
    const payment = resolveBookingPayment(b);
    const bus = trip.bus ?? {};
    const operator = trip.bus?.operator ?? trip.operator ?? b.operator ?? {};

    const from = tripOrigin(trip);
    const to = tripDest(trip);
    const operatorId = bookingOperatorId(b) || b.operatorId || operator.id || '';
    const operatorName =
        tripOperatorName(trip)
        || operator.companyName
        || operator.name
        || '';

    const seatMap = buildTripSeatLabelMap(trip);
    const seatLabels = b._seatLabels ?? collectSeatLabels(travelers, seatMap);
    const seatNumber = seatLabels.length > 0 ? seatLabels.join(', ') : '';

    const departureRaw = trip.departureTime ?? '';
    const arrivalRaw = trip.arrivalTime ?? '';
    const departure = departureRaw.includes('T')
        ? formatTripTime(departureRaw)
        : departureRaw;
    const arrival = arrivalRaw.includes('T')
        ? formatTripTime(arrivalRaw)
        : arrivalRaw;

    const passengerNames = [
        ...new Set(travelers.map((t) => t.fullName).filter(Boolean)),
    ];
    const passengerName = passengerNames.join(', ') || (traveler.fullName ?? '');
    const passengerPhone = traveler.phone ?? travelers.find((t) => t.phone)?.phone ?? '';
    const passengerEmail = traveler.email ?? travelers.find((t) => t.email)?.email ?? '';

    const rawPaymentStatus = normalizePaymentStatus(payment.status);
    const rawBookingStatus = (b.status ?? '').toUpperCase();

    return {
        id: b.id,
        ticketId: b.tickets?.[0]?.id ?? b.ticketId ?? b.id,
        bookingReference: b.bookingReference ?? null,
        operator: operatorName || 'Unknown',
        operatorId,
        busName: bus.make ?? bus.model ?? bus.name ?? `${operatorName || 'Bus'} Coach`,
        busPlate: bus.plateNumber ?? '—',
        route: from && to ? `${from} → ${to}` : '—',
        from,
        to,
        departure: departure && departure !== '—' ? departure : '—',
        arrival: arrival && arrival !== '—' ? arrival : '—',
        seatNumber: seatNumber || '—',
        seatLabels,
        date: trip.date
            ? new Date(trip.date).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
            })
            : '—',
        bookingDate: b.createdAt
            ? new Date(b.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
            })
            : '—',
        passengerName,
        passengerPhone,
        passengerEmail,
        status: rawBookingStatus.toLowerCase(),
        paymentStatusRaw: rawPaymentStatus,
        bookingStatusRaw: rawBookingStatus,
        paymentStatus: mapPaymentDisplay(rawPaymentStatus, rawBookingStatus),
        paymentStatusLabel: mapPaymentDisplay(rawPaymentStatus, rawBookingStatus),
        bookingStatusLabel: mapBookingStatusDisplay(rawBookingStatus),
        rowStatus: mapBookingRowStatus(rawPaymentStatus, rawBookingStatus),
        canPayNow: canPayBooking({ ...b, payment, status: rawBookingStatus, paymentStatusRaw: rawPaymentStatus }),
        amount: payment.amount ?? b.totalAmount ?? trip.price ?? 0,
        paymentMethod: METHOD_LABEL[payment.method] ?? payment.method ?? '—',
        gatewayReference: payment.gatewayReference ?? payment.transactionCode ?? null,
        paymentId: payment.id ?? null,
        isPaid: isBookingPaid({ ...b, payment, status: rawBookingStatus }),
        _raw: b,
    };
}
