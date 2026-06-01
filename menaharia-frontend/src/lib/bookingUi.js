import { tripOperatorName, tripOrigin, tripDest } from './tripHelpers';
import { bookingOperatorId } from './operatorHelpers';

const METHOD_LABEL = {
    TELEBIRR: 'Telebirr',
    SANTIM: 'Santim',
    CHAPA: 'Chapa',
    CBE: 'CBE Birr',
};

export function resolveBookingPayment(booking) {
    if (!booking) return {};
    return booking.payment ?? (Array.isArray(booking.payments) ? booking.payments[0] : null) ?? {};
}

export function mapPaymentDisplay(paymentStatus, bookingStatus) {
    const ps = (paymentStatus ?? '').toUpperCase();
    const bs = (bookingStatus ?? '').toUpperCase();
    if (ps === 'SUCCESS' || bs === 'CONFIRMED') return 'Paid';
    if (ps === 'FAILED') return 'Failed';
    if (bs === 'CANCELLED') return 'Cancelled';
    return 'Pending';
}

export function mapBookingRowStatus(paymentStatus, bookingStatus) {
    const ps = (paymentStatus ?? '').toUpperCase();
    const bs = (bookingStatus ?? '').toUpperCase();
    if (bs === 'CANCELLED') return { key: 'cancelled', label: 'Cancelled' };
    if (ps === 'SUCCESS' || bs === 'CONFIRMED') return { key: 'confirmed', label: 'Confirmed' };
    if (ps === 'FAILED') return { key: 'failed', label: 'Payment Failed' };
    return { key: 'pending', label: 'Pending Payment' };
}

export function isBookingPaid(booking) {
    const payment = resolveBookingPayment(booking);
    const ps = (payment.status ?? '').toUpperCase();
    const bs = (booking?.status ?? '').toUpperCase();
    return ps === 'SUCCESS' || bs === 'CONFIRMED';
}

/**
 * Normalise a backend booking for traveller dashboard UI.
 */
export function normaliseBookingForUI(b) {
    const trip = b.trip ?? {};
    const traveler = b.travelers?.[0] ?? {};
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

    const rawPaymentStatus = (payment.status ?? '').toUpperCase();
    const rawBookingStatus = (b.status ?? '').toUpperCase();

    return {
        id: b.id,
        ticketId: b.tickets?.[0]?.id ?? b.ticketId ?? b.id,
        operator: operatorName || 'Unknown',
        operatorId,
        busName: bus.make ?? bus.model ?? `${operatorName || 'Bus'} Coach`,
        busPlate: bus.plateNumber ?? '—',
        route: from && to ? `${from} → ${to}` : '—',
        from,
        to,
        departure: trip.departureTime ?? '',
        arrival: trip.arrivalTime ?? '',
        seatNumber: traveler.seat?.seatNumber ?? traveler.seatNumber ?? '—',
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
        passengerName: traveler.fullName ?? '',
        passengerPhone: traveler.phone ?? '',
        status: rawBookingStatus.toLowerCase(),
        paymentStatusRaw: rawPaymentStatus,
        bookingStatusRaw: rawBookingStatus,
        paymentStatus: mapPaymentDisplay(rawPaymentStatus, rawBookingStatus),
        rowStatus: mapBookingRowStatus(rawPaymentStatus, rawBookingStatus),
        amount: payment.amount ?? b.totalAmount ?? trip.price ?? 0,
        paymentMethod: METHOD_LABEL[payment.method] ?? payment.method ?? '—',
        gatewayReference: payment.gatewayReference ?? payment.transactionCode ?? null,
        paymentId: payment.id ?? null,
        _raw: b,
    };
}
