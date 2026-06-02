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

function unwrapBookingList(res) {
    // Backend envelope: { success, data: { items: [...], meta: {} } } OR { success, data: [...] }
    const body = res?.data ?? res;
    // Already unwrapped by listBookings → unwrapEnvelope, so body may be { items, meta } or []
    if (Array.isArray(body)) return body;
    if (Array.isArray(body?.items)) return body.items;
    if (Array.isArray(body?.data)) return body.data;
    return [];
}

/**
 * Passenger manifest for one trip.
 *
 * Strategy (most-reliable-first):
 * 1. Client-filter the pre-fetched operator bookings by tripId (fastest, always works)
 * 2. Also fetch GET /v1/bookings?tripId=... in case the backend supports it (extra coverage)
 * 3. Merge both sources, then load travelers/payments/tickets per booking
 * 4. Show any booking that is CONFIRMED or has a successful payment
 */
export function useTripManifest({
    tripId,
    operatorId,
    operatorBusIds = [],
    bookings = [],       // pre-fetched operator bookings from useOperatorScope — primary source
    tripSeats = [],
    enabled = true,
}) {
    const active = enabled && !!tripId && !!operatorId;

    // ── 1. Client-side filter of pre-fetched bookings ─────────────────────────
    // This is the primary source — bookings already loaded by useOperatorScope.
    // Filter to only those matching the selected trip.
    const preFilteredBookings = useMemo(() => {
        if (!tripId) return [];
        return (bookings ?? []).filter((b) => {
            const tid = b.tripId ?? b.trip?.id;
            return tid === tripId;
        });
    }, [bookings, tripId]);

    // ── 2. Direct server fetch by tripId (supplementary) ─────────────────────
    // Catches bookings that aren't in the pre-fetched list (e.g. just created).
    const directQuery = useQuery({
        queryKey: bookingKeys.list({ tripId, limit: 100 }),
        queryFn: async () => {
            const res = await bookingsApi.listBookings({ tripId, limit: 100 });
            return unwrapBookingList(res);
        },
        enabled: active,
        staleTime: 0,
    });

    // ── 3. Merge both sources, deduplicate by booking id ─────────────────────
    const tripBookings = useMemo(() => {
        const merged = new Map();
        // Pre-fetched first (may have richer nested data)
        for (const b of preFilteredBookings) {
            if (b.id) merged.set(b.id, b);
        }
        // Direct fetch overrides/adds (fresher status)
        for (const b of (directQuery.data ?? [])) {
            if (b.id) merged.set(b.id, b);
        }
        return [...merged.values()];
    }, [preFilteredBookings, directQuery.data]);

    const bookingIds = useMemo(
        () => tripBookings.map((b) => b.id).filter(Boolean),
        [tripBookings],
    );

    const seatLabelMap = useMemo(
        () => buildTripSeatLabelMap({ tripSeats }),
        [tripSeats],
    );

    // ── 4. Load travelers per booking ─────────────────────────────────────────
    const travelersQueries = useQueries({
        queries: bookingIds.map((bookingId) => ({
            queryKey: travelerKeys.byBooking(bookingId),
            queryFn: async () => {
                const res = await travelersApi.listTravelers({ bookingId, limit: 50 });
                return unwrapTravelersList(res);
            },
            enabled: active,
            staleTime: 30_000,
        })),
    });

    // ── 5. Load payments (global list, matched by bookingId) ──────────────────
    const { data: payments = [], isLoading: paymentsLoading } = usePayments({
        limit: 300,
        enabled: active && bookingIds.length > 0,
    });

    // ── 6. Load tickets per booking ───────────────────────────────────────────
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
            staleTime: 30_000,
        })),
    });

    // ── Build lookup maps ─────────────────────────────────────────────────────
    const travelersByBookingId = useMemo(() => {
        const map = {};
        bookingIds.forEach((id, i) => {
            // Also fall back to travelers already embedded in the booking object
            const fetched = travelersQueries[i]?.data ?? [];
            const embedded = tripBookings.find((b) => b.id === id)?.travelers
                ?? tripBookings.find((b) => b.id === id)?.bookingTravelers
                ?? [];
            map[id] = fetched.length > 0 ? fetched : embedded;
        });
        return map;
    }, [bookingIds, travelersQueries, tripBookings]);

    const paymentsByBookingId = useMemo(() => {
        const map = {};
        const idSet = new Set(bookingIds);
        for (const p of payments) {
            const bid = p.bookingId ?? p.booking?.id;
            if (bid && idSet.has(bid)) map[bid] = p;
        }
        // Also use payments already embedded in bookings
        for (const b of tripBookings) {
            if (!map[b.id] && b.payment) map[b.id] = b.payment;
        }
        return map;
    }, [payments, bookingIds, tripBookings]);

    const ticketsByBookingId = useMemo(() => {
        const map = {};
        bookingIds.forEach((id, i) => {
            map[id] = ticketsQueries[i]?.data ?? [];
        });
        return map;
    }, [bookingIds, ticketsQueries]);

    // ── Build manifest rows ───────────────────────────────────────────────────
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

    const isLoading =
        directQuery.isLoading
        || travelersQueries.some((q) => q.isLoading)
        || paymentsLoading
        || ticketsQueries.some((q) => q.isLoading);

    const refetch = () => {
        directQuery.refetch();
        travelersQueries.forEach((q) => q.refetch?.());
    };

    return { rows, tripBookings, bookedSeatCount, isLoading, refetch };
}
