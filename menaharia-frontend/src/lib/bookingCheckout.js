import { bookingsApi } from '../api/bookings.api';
import { fetchTripSeatContext, resolveSelectedSeats } from './tripSeats';
import { buildSeatTypeMap, totalPriceForSelectedSeats } from './seatPricing';
import { getPendingPaymentForTrip, savePendingPayment } from './bookingFlow';
import { isBookingPaid } from './bookingUi';
import { getChapaReturnPageUrl } from './appUrl';

export const DEFAULT_PAYMENT_METHOD = 'CHAPA';

/**
 * Reserve seats + create PENDING booking (POST /v1/bookings).
 * Reuses an existing pending booking for the same trip when possible.
 */
export async function reserveBooking({
    tripId,
    trip,
    selectedSeats,
    passengerDetails,
    paymentMethod = DEFAULT_PAYMENT_METHOD,
}) {
    const ctx = await fetchTripSeatContext(tripId);
    const resolved = resolveSelectedSeats(selectedSeats, ctx.seatIdMap);
    const seatTypeMap = buildSeatTypeMap(ctx.tripSeats);
    const amount = totalPriceForSelectedSeats(
        ctx.trip?.price ?? trip?.price ?? 0,
        resolved,
        seatTypeMap,
    );

    const missing = resolved.filter((s) => !s.tripSeatId);
    if (missing.length > 0) {
        const err = new Error(
            ctx.unavailableMessage ??
                'Selected seats are no longer available. Go back and choose different seats.',
        );
        err.code = 'SEATS_UNAVAILABLE';
        throw err;
    }

    const existingPending = getPendingPaymentForTrip(tripId);
    if (existingPending?.bookingId) {
        try {
            const existing = await bookingsApi.getBookingById(existingPending.bookingId);
            const status = (existing?.status ?? '').toUpperCase();
            if (status === 'PENDING' || status === 'PENDING_PAYMENT') {
                if (!isBookingPaid(existing)) {
                    return {
                        bookingId: existingPending.bookingId,
                        booking: existing,
                        bookingReference: existing?.bookingReference ?? null,
                        reservedUntil: existing?.reservedUntil ?? null,
                        totalAmount: existing?.totalAmount ?? amount,
                        trip: ctx.trip ?? trip,
                        selectedSeats: resolved,
                        reused: true,
                    };
                }
            }
        } catch {
            /* create fresh booking */
        }
    }

    const travelers = resolved.map((seat) => ({
        tripSeatId: seat.tripSeatId,
        fullName: passengerDetails?.fullName ?? '',
        email: passengerDetails?.email ?? '',
        phone: passengerDetails?.phone ?? '',
        emergencyContact: passengerDetails?.emergencyContact ?? '',
    }));

    const result = await bookingsApi.createBooking({
        tripId,
        paymentMethod,
        travelers,
    });

    if (!result?.bookingId) {
        throw new Error('Booking was created but no booking ID was returned.');
    }

    savePendingPayment({
        bookingId: result.bookingId,
        tripId,
        trip: ctx.trip ?? trip,
        selectedSeats: resolved,
        passengerDetails,
        totalPrice: result.totalAmount ?? amount,
        returnPageUrl: getChapaReturnPageUrl(result.bookingId),
    });

    return {
        bookingId: result.bookingId,
        booking: result.booking,
        bookingReference: result.bookingReference ?? result.booking?.bookingReference ?? null,
        reservedUntil: result.reservedUntil,
        totalAmount: result.totalAmount ?? amount,
        trip: ctx.trip ?? trip,
        selectedSeats: resolved,
        reused: false,
    };
}
