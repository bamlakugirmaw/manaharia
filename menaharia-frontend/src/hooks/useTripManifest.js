import { useMemo } from 'react';
import { useQueries, useQuery } from '@tanstack/react-query';
import { travelersApi } from '../api/travelers.api';
import { usePayments } from './usePayments';
import { ticketsApi } from '../api/tickets.api';
import { bookingsApi } from '../api/bookings.api';
import { ticketKeys } from './useTickets';
import { travelerKeys } from './useTravelers';
import { bookingKeys } from './useBookings';
import { unwrapTravelersList, buildTripSeatLabelMap } from '../lib/bookingEnrichment';
import { buildManifestRows, countBookedSeatsFromRows } from '../lib/manifestRows';
import { bookingOperatorId } from '../lib/operatorHelpers';

function unwrapBookingList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data)) return p.data;
    return [];
}

/**
 * Passenger manifest for one trip: fetches confirmed bookings directly by tripId,
 * then loads travelers, payments, and tickets for each booking.
 */
export function useTripManifest({
    tripId,
    operatorId,
    operatorBusIds = [],
    bookings = [],        // fallback pre-fetched bookings (used when tripId query not supported)
    tripSeats = [],
    enabled = true,
}) {
    const busIdSet = useMemo(
        () => new Set(operatorBusIds.filter(Boolean)),
        [operatorBusIds],
    );

    const active = enabled && !!tripId && !!operatorId;

    // Fetch confirmed bookings directly for this trip — most reliable source
    const tripBookingsQuery = useQuery({
        queryKey: bookingKeys.list({ tripId, status: 'CONFIRMED', limit: 200 }),
        queryFn: async () => unwrapBookingList(
            await bookingsApi.listBookings({ tripId, status: 'CONFIRMED', limit: 200 })
        ),
        enabled: active,
        staleTime: 0,
    });

    // Also fetch all bookings for this trip (PENDING + CONFIRMED) as fallback
    const allTripBookingsQuery = useQuery({
        queryKey: bookingKeys.list({ tripId, limit: 200 }),
        queryFn: async () => unwrapBookingList(
            await bookingsApi.listBookings({ tripId, limit: 200 })
        ),
        enabled: active,
        staleTime: 0,
    });

    // Merge: confirmed bookings from direct query + any confirmed ones from the pre-fetched list
    const tripBookings = useMemo(() => {
        if (!tripId || !operatorId) return [];

        // Start with directly fetched confirmed bookings
        const directConfirmed = tripBookingsQuery.data ?? [];

        // Also include any confirmed bookings from the pre-fetched list (fallback)
        const preFiltered = (bookings ?? []).filter((b) => {
            const tripMatch = (b.tripId ?? b.trip?.id) === tripId;
            if (!tripMatch) return false;
            const opId = bookingOperatorId(b);
            if (opId) return opId === operatorId;
            const busId = b.trip?.busId ?? b.trip?.bus?.id;
            return Boolean(busId && busIdSet.has(busId));
        });

        // Merge by id, preferring directly fetched data
        const merged = new Map();
        for (const b of preFiltered) merged.set(b.id, b);
        for (const b of directConfirmed) merged.set(b.id, b);

        // Also include all bookings from the all-trip query (for payment status check)
        for (const b of (allTripBookingsQuery.data ?? [])) {
            if (!merged.has(b.id)) merged.set(b.id, b);
        }

        return [...merged.values()];
    }, [bookings, tripId, operatorId, busIdSet, tripBookingsQuery.data, allTripBookingsQuery.data]);

    const bookingIds = useMemo(
        () => tripBookings.map((b) => b.id).filter(Boolean),
        [tripBookings],
    );

    const seatLabelMap = useMemo(() => {
        const trip = { tripSeats };
        return buildTripSeatLabelMap(trip);
    }, [tripSeats]);

    const travelersQueries = useQueries({
        queries: bookingIds.map((bookingId) => ({
            queryKey: travelerKeys.byBooking(bookingId),
            queryFn: async () => {
                const res = await travelersApi.listTravelers({ bookingId, limit: 50 });
                return unwrapTravelersList(res);
            },
            enabled: active,
            staleTime: 30 * 1000,
        })),
    });

    const { data: payments = [], isLoading: paymentsLoading } = usePayments({
        limit: 300,
        enabled: active && bookingIds.length > 0,
    });

    const ticketsQueries = useQueries({
        queries: bookingIds.map((bookingId) => ({
            queryKey: ticketKeys.byBooking(bookingId),
            queryFn: async () => {
                const res = await ticketsApi.getTicketsByBooking(bookingId);
                const p = res?.data ?? res;
                if (Array.isArray(p)) return p;
                if (Array.isArray(p?.items)) return p.items;
                if (Array.isArray(p?.data)) return p.data;
                return [];
            },
            enabled: active,
            staleTime: 30 * 1000,
        })),
    });

    const travelersByBookingId = useMemo(() => {
        const map = {};
        bookingIds.forEach((id, index) => {
            map[id] = travelersQueries[index]?.data ?? [];
        });
        return map;
    }, [bookingIds, travelersQueries]);

    const paymentsByBookingId = useMemo(() => {
        const map = {};
        const idSet = new Set(bookingIds);
        for (const p of payments) {
            const bid = p.bookingId ?? p.booking?.id;
            if (bid && idSet.has(bid)) map[bid] = p;
        }
        return map;
    }, [payments, bookingIds]);

    const ticketsByBookingId = useMemo(() => {
        const map = {};
        bookingIds.forEach((id, index) => {
            map[id] = ticketsQueries[index]?.data ?? [];
        });
        return map;
    }, [bookingIds, ticketsQueries]);

    const rows = useMemo(
        () => buildManifestRows(
            tripBookings,
            travelersByBookingId,
            paymentsByBookingId,
            seatLabelMap,
            ticketsByBookingId,
        ),
        [tripBookings, travelersByBookingId, paymentsByBookingId, seatLabelMap, ticketsByBookingId],
    );

    const bookedSeatCount = useMemo(() => countBookedSeatsFromRows(rows), [rows]);

    const travelersLoading = travelersQueries.some((q) => q.isLoading || q.isFetching);
    const ticketsLoading = ticketsQueries.some((q) => q.isLoading || q.isFetching);
    const isLoading = tripBookingsQuery.isLoading || allTripBookingsQuery.isLoading
        || travelersLoading || paymentsLoading || ticketsLoading;

    const refetch = () => {
        tripBookingsQuery.refetch();
        allTripBookingsQuery.refetch();
        travelersQueries.forEach((q) => q.refetch());
    };

    return {
        rows,
        tripBookings,
        bookedSeatCount,
        isLoading,
        refetch,
    };
}
