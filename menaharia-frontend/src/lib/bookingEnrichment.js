import { getPaymentReceipt } from './paymentReceipt';
import { formatTripTime } from './operatorHelpers';

export function unwrapTravelersList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data)) return p.data;
    return [];
}

/** tripSeatId → seat label (A1, B2, …) */
export function buildTripSeatLabelMap(trip) {
    const map = new Map();
    const seats = trip?.tripSeats ?? trip?.seats ?? [];
    for (const s of seats) {
        const id = s.id ?? s.tripSeatId;
        const label = s.seatNumber ?? s.label ?? s.number;
        if (id && label) map.set(id, String(label));
    }
    return map;
}

export function collectSeatLabels(travelers, seatMap) {
    const labels = [];
    for (const t of travelers) {
        const bookingSeats = t.bookingSeats ?? [];
        if (bookingSeats.length > 0) {
            for (const bs of bookingSeats) {
                const label =
                    seatMap.get(bs.tripSeatId)
                    ?? bs.seatNumber
                    ?? bs.tripSeat?.seatNumber
                    ?? bs.seat?.seatNumber;
                if (label) labels.push(String(label));
            }
        } else {
            const direct = t.seat?.seatNumber ?? t.seatNumber;
            if (direct) labels.push(String(direct));
        }
    }
    return [...new Set(labels)];
}

export function resolvePaymentForBooking(booking, paymentFromList, receipt) {
    let payment =
        booking?.payment
        ?? (Array.isArray(booking?.payments) ? booking.payments[0] : null)
        ?? paymentFromList
        ?? null;

    if (receipt?.status === 'SUCCESS') {
        payment = {
            ...(payment ?? {}),
            status: 'SUCCESS',
            amount: receipt.amount ?? payment?.amount ?? booking?.totalAmount,
            method: receipt.method ?? payment?.method ?? 'CHAPA',
            gatewayReference: receipt.gatewayReference ?? payment?.gatewayReference,
        };
    }

    return payment;
}

/**
 * Merge booking + travelers + payment list row + local receipt into one record for UI normalisation.
 */
export function mergeBookingRecord(booking, { travelers = [], payment = null, receipt = null } = {}) {
    if (!booking) return null;

    const savedReceipt = receipt ?? getPaymentReceipt(booking.id);
    const mergedTravelers =
        travelers.length > 0 ? travelers : (booking.travelers ?? booking.bookingTravelers ?? []);
    const trip = booking.trip ?? {};
    const seatMap = buildTripSeatLabelMap(trip);
    const paymentObj = resolvePaymentForBooking(booking, payment, savedReceipt);

    return {
        ...booking,
        travelers: mergedTravelers,
        payment: paymentObj,
        trip: {
            ...trip,
            departureTime: trip.departureTime,
            arrivalTime: trip.arrivalTime,
        },
        _seatLabels: collectSeatLabels(mergedTravelers, seatMap),
    };
}

export function formatBookingTime(value) {
    if (!value) return '';
    if (String(value).includes('T')) {
        const formatted = formatTripTime(value);
        return formatted !== '—' ? formatted : '';
    }
    return String(value);
}
