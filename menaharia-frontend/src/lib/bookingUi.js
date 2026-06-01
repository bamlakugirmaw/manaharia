import { tripOperatorName, tripOrigin, tripDest } from './tripHelpers';
import { bookingOperatorId, formatTripTime } from './operatorHelpers';
import { getPaymentReceipt } from './paymentReceipt';
import { collectSeatLabels, buildTripSeatLabelMap } from './bookingEnrichment';

const METHOD_LABEL = {
    TELEBIRR: 'Telebirr',
    SANTIM: 'Santim',
    CHAPA: 'Chapa',
    CBE: 'CBE Birr',
};

export function resolveBookingPayment(booking) {
    if (!booking) return {};
    const receipt = getPaymentReceipt(booking.id);
    let payment = booking.payment ?? (Array.isArray(booking.payments) ? booking.payments[0] : null) ?? {};
    if (receipt?.status === 'SUCCESS') {
        payment = {
            ...payment,
            status: 'SUCCESS',
            amount: receipt.amount ?? payment.amount ?? booking.totalAmount,
            method: receipt.method ?? payment.method ?? 'CHAPA',
        };
    }
    return payment;
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

    const rawPaymentStatus = (payment.status ?? '').toUpperCase();
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
        rowStatus: mapBookingRowStatus(rawPaymentStatus, rawBookingStatus),
        amount: payment.amount ?? b.totalAmount ?? trip.price ?? 0,
        paymentMethod: METHOD_LABEL[payment.method] ?? payment.method ?? '—',
        gatewayReference: payment.gatewayReference ?? payment.transactionCode ?? null,
        paymentId: payment.id ?? null,
        isPaid: isBookingPaid({ ...b, payment, status: rawBookingStatus }),
        _raw: b,
    };
}
