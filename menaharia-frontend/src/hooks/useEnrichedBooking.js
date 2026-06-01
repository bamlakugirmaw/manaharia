import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api/trips.api';
import { useBooking } from './useBookings';
import { useTravelersByBooking } from './useTravelers';
import { usePayments } from './usePayments';
import { mergeBookingRecord } from '../lib/bookingEnrichment';
import { normaliseBookingForUI } from '../lib/bookingUi';
import { getPaymentReceipt } from '../lib/paymentReceipt';

/**
 * Full booking for modals: GET /bookings/:id + /travelers?bookingId= + /payments + saved receipt.
 */
export function useEnrichedBooking(bookingId, enabled = true) {
    const active = enabled && !!bookingId;

    const bookingQuery = useBooking(active ? bookingId : null);
    const travelersQuery = useTravelersByBooking(bookingId, active);
    const paymentsQuery = usePayments({ limit: 100, enabled: active });

    const tripId = bookingQuery.data?.tripId ?? bookingQuery.data?.trip?.id;
    const tripNeedsSeats =
        !!tripId
        && !(bookingQuery.data?.trip?.tripSeats?.length);

    const tripQuery = useQuery({
        queryKey: ['trips', 'detail', tripId, 'enrich-seats'],
        queryFn: () => tripsApi.getTripById(tripId),
        enabled: active && tripNeedsSeats,
        staleTime: 60 * 1000,
    });

    const paymentForBooking = useMemo(() => {
        if (!bookingId) return null;
        const list = Array.isArray(paymentsQuery.data) ? paymentsQuery.data : [];
        return list.find(
            (p) => (p.bookingId ?? p.booking?.id) === bookingId,
        ) ?? null;
    }, [paymentsQuery.data, bookingId]);

    const enrichedRaw = useMemo(() => {
        if (!bookingQuery.data) return null;
        const tripDetail = tripQuery.data;
        const booking = tripDetail?.tripSeats?.length
            ? {
                ...bookingQuery.data,
                trip: { ...bookingQuery.data.trip, tripSeats: tripDetail.tripSeats },
            }
            : bookingQuery.data;
        return mergeBookingRecord(booking, {
            travelers: travelersQuery.data ?? [],
            payment: paymentForBooking,
            receipt: getPaymentReceipt(bookingId),
        });
    }, [bookingQuery.data, travelersQuery.data, paymentForBooking, bookingId, tripQuery.data]);

    const data = useMemo(
        () => (enrichedRaw ? normaliseBookingForUI(enrichedRaw) : null),
        [enrichedRaw],
    );

    return {
        data,
        raw: enrichedRaw,
        isLoading: bookingQuery.isLoading || travelersQuery.isLoading || tripQuery.isLoading,
        isFetching: bookingQuery.isFetching || travelersQuery.isFetching || tripQuery.isFetching,
        isError: bookingQuery.isError || travelersQuery.isError,
        refetch: () => {
            bookingQuery.refetch();
            travelersQuery.refetch();
            paymentsQuery.refetch();
        },
    };
}
