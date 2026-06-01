import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { travelersApi } from '../api/travelers.api';
import { usePayments } from './usePayments';
import { ticketsApi } from '../api/tickets.api';
import { ticketKeys } from './useTickets';
import { travelerKeys } from './useTravelers';
import { unwrapTravelersList, buildTripSeatLabelMap } from '../lib/bookingEnrichment';
import { buildManifestRows, countBookedSeatsFromRows } from '../lib/manifestRows';
import { bookingOperatorId } from '../lib/operatorHelpers';

/**
 * Passenger manifest for one trip: operator-scoped bookings + travelers + payments + tickets.
 */
export function useTripManifest({
    tripId,
    operatorId,
    operatorBusIds = [],
    bookings = [],
    tripSeats = [],
    enabled = true,
}) {
    const busIdSet = useMemo(
        () => new Set(operatorBusIds.filter(Boolean)),
        [operatorBusIds],
    );

    const tripBookings = useMemo(() => {
        if (!tripId || !operatorId) return [];
        return (bookings ?? []).filter((b) => {
            const tripMatch = (b.tripId ?? b.trip?.id) === tripId;
            if (!tripMatch) return false;
            const opId = bookingOperatorId(b);
            if (opId) return opId === operatorId;
            const busId = b.trip?.busId ?? b.trip?.bus?.id;
            return Boolean(busId && busIdSet.has(busId));
        });
    }, [bookings, tripId, operatorId, busIdSet]);

    const bookingIds = useMemo(
        () => tripBookings.map((b) => b.id).filter(Boolean),
        [tripBookings],
    );

    const seatLabelMap = useMemo(() => {
        const trip = { tripSeats };
        return buildTripSeatLabelMap(trip);
    }, [tripSeats]);

    const active = enabled && !!tripId && !!operatorId;

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
    const isLoading = travelersLoading || paymentsLoading || ticketsLoading;

    const refetch = () => {
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
