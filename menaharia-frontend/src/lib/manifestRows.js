import { mapPaymentDisplay, resolveBookingPayment } from './bookingUi';

const METHOD_LABEL = {
    TELEBIRR: 'Telebirr',
    SANTIM: 'Santim',
    CHAPA: 'Chapa',
    CBE: 'CBE Birr',
};

export function isWalkInTraveler(traveler) {
    const email = (traveler?.email ?? '').toLowerCase();
    return email.endsWith('@menaharia.local') || email.includes('walkin.');
}

function formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatAmount(amount) {
    if (amount == null || amount === '') return '—';
    const n = Number(amount);
    if (Number.isNaN(n)) return '—';
    return `ETB ${n.toLocaleString()}`;
}

function seatSortKey(label) {
    if (!label || label === '—') return 'zzz';
    const m = String(label).match(/^([A-Z]+)(\d+)$/i);
    if (!m) return label;
    return `${m[1].toUpperCase().padStart(2, '0')}${m[2].padStart(3, '0')}`;
}

/**
 * Flatten trip bookings into manifest rows (one row per reserved seat).
 * @param {Array} bookings — bookings for this trip (already operator-scoped)
 * @param {Record<string, Array>} travelersByBookingId
 * @param {Record<string, object>} paymentsByBookingId
 * @param {Map<string, string>} seatLabelMap — tripSeatId → A1
 * @param {Record<string, Array>} [ticketsByBookingId]
 */
export function buildManifestRows(
    bookings,
    travelersByBookingId,
    paymentsByBookingId,
    seatLabelMap,
    ticketsByBookingId = {},
) {
    const rows = [];
    const sorted = [...(bookings ?? [])].sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
    );

    for (const booking of sorted) {
        const travelers = travelersByBookingId[booking.id] ?? booking.travelers ?? [];
        const payment = resolveBookingPayment({
            ...booking,
            payment: paymentsByBookingId[booking.id] ?? booking.payment,
        });
        const paymentStatus = mapPaymentDisplay(payment.status, booking.status);
        const paymentMethod = METHOD_LABEL[payment.method] ?? payment.method ?? '—';
        const amount = payment.amount ?? booking.totalAmount;
        const tickets = ticketsByBookingId[booking.id] ?? booking.tickets ?? [];
        const ticketId = tickets[0]?.id ?? booking.ticketId ?? null;
        const bookedBy =
            booking.user?.fullName
            ?? booking.user?.name
            ?? booking.user?.email
            ?? booking.bookedByUser?.fullName
            ?? booking.createdBy?.fullName
            ?? '—';
        const bookingDate = formatDate(booking.createdAt);
        const bookingRef = booking.bookingReference ?? booking.reference ?? null;

        const pushRow = (traveler, seatLabel, channel) => {
            rows.push({
                id: `${booking.id}-${traveler?.id ?? 'x'}-${seatLabel}`,
                bookingId: booking.id,
                ticketId,
                bookingReference: bookingRef,
                bookingStatus: (booking.status ?? 'PENDING').toUpperCase(),
                bookingDate,
                passengerName: traveler?.fullName ?? '—',
                passengerPhone: traveler?.phone ?? '—',
                passengerEmail: traveler?.email ?? '—',
                seatLabel: seatLabel || '—',
                paymentStatus,
                paymentStatusRaw: (payment.status ?? '').toUpperCase(),
                paymentMethod,
                amount: formatAmount(amount),
                channel,
                bookedBy,
                isPaid: paymentStatus === 'Paid',
            });
        };

        if (travelers.length === 0) {
            pushRow(null, '—', '—');
            continue;
        }

        for (const traveler of travelers) {
            const channel = isWalkInTraveler(traveler) ? 'Walk-in' : 'Online';
            const bookingSeats = traveler.bookingSeats ?? [];

            if (bookingSeats.length > 0) {
                for (const bs of bookingSeats) {
                    const seatLabel =
                        (bs.tripSeatId && seatLabelMap.get(bs.tripSeatId))
                        ?? bs.seatNumber
                        ?? bs.tripSeat?.seatNumber
                        ?? bs.seat?.seatNumber
                        ?? '—';
                    pushRow(traveler, seatLabel, channel);
                }
            } else {
                const seatLabel =
                    traveler.seat?.seatNumber
                    ?? traveler.seatNumber
                    ?? '—';
                pushRow(traveler, seatLabel, channel);
            }
        }
    }

    return rows.sort((a, b) => seatSortKey(a.seatLabel).localeCompare(seatSortKey(b.seatLabel)));
}

export function countBookedSeatsFromRows(rows) {
    const labels = new Set(
        rows.map((r) => r.seatLabel).filter((s) => s && s !== '—'),
    );
    return labels.size;
}
