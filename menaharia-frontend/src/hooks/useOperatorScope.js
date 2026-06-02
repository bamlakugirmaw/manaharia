import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { useBuses } from './useBuses';
import { useOperatorTrips } from './useTrips';
import { useBookings } from './useBookings';
import { bookingsApi } from '../api/bookings.api';

/**
 * Central operator tenancy: correct operatorId + fleet bus ids + scoped trips/bookings.
 *
 * Key design principle:
 * The backend scopes GET /v1/bookings to the authenticated user's operator automatically.
 * Client-side filtering is additive (include when we can confirm ownership) NOT subtractive
 * (never exclude a booking just because we lack the nested fields to verify it).
 */
export function useOperatorScope(bookingParams = {}) {
    const { user } = useAuth();
    const isOperatorUser = user?.role === 'operator';
    const operatorId = isOperatorUser ? (user?.operatorId ?? null) : null;
    const scopeReady = isOperatorUser;

    const busesQuery = useBuses({
        operatorId: operatorId ?? undefined,
        limit: 100,
        enabled: scopeReady && !!operatorId,
    });

    const operatorBusIds = useMemo(
        () => (busesQuery.data ?? []).map((b) => b.id).filter(Boolean),
        [busesQuery.data],
    );

    const busesBelongToOperator = useMemo(
        () => (busesQuery.data ?? []).filter(
            (b) => (b.operatorId ?? b.operator?.id) === operatorId,
        ),
        [busesQuery.data, operatorId],
    );

    const tripsQuery = useOperatorTrips(
        operatorId,
        { limit: 200 },
        operatorBusIds,
    );

    const operatorTripIds = useMemo(
        () => (tripsQuery.data ?? []).map((t) => t.id).filter(Boolean),
        [tripsQuery.data],
    );

    const bookingsQuery = useBookings({
        ...bookingParams,
        limit: bookingParams.limit ?? 100,
        enabled: scopeReady && (bookingParams.enabled !== false),
    });

    const shouldUseTripBookingFallback =
        scopeReady
        && (bookingsQuery.data ?? []).length === 0
        && operatorTripIds.length > 0;

    const tripBookingsQueries = useQueries({
        queries: shouldUseTripBookingFallback
            ? operatorTripIds.map((tripId) => ({
                queryKey: ['bookings', 'trip-fallback', tripId],
                queryFn: async () =>
                    bookingsApi.listBookings({
                        tripId,
                        limit: bookingParams.limit ?? 200,
                    }),
                staleTime: 30 * 1000,
                enabled: true,
            }))
            : [],
    });

    const tripFallbackBookings = useMemo(() => {
        if (!shouldUseTripBookingFallback) return [];
        const map = new Map();
        for (const q of tripBookingsQueries) {
            for (const b of q.data ?? []) {
                if (b?.id) map.set(b.id, b);
            }
        }
        return [...map.values()];
    }, [shouldUseTripBookingFallback, tripBookingsQueries]);

    const effectiveBookings = (bookingsQuery.data ?? []).length > 0
        ? (bookingsQuery.data ?? [])
        : tripFallbackBookings;

    const operatorBookings = useMemo(() => {
        const all = effectiveBookings;
        if (!isOperatorUser) return [];
        if (!operatorId) {
            // Fallback: if backend auth payload omitted operatorId, trust operator-scoped list endpoint.
            return all;
        }

        // The backend already returns only this operator's bookings for an operator role.
        // Trust the API response — return all bookings as-is.
        // Only do a positive-match filter if we have confirmed ownership signals.
        if (all.length === 0) return [];

        const tripSet = new Set(operatorTripIds.filter(Boolean));
        const busSet  = new Set(operatorBusIds.filter(Boolean));

        return all.filter((b) => {
            // ── Positive signals: we can confirm this booking belongs to this operator ──

            // 1. Trip ID is in our known trip set
            const tid = b.tripId ?? b.trip?.id;
            if (tid && tripSet.size > 0 && tripSet.has(tid)) return true;

            // 2. Booking has operator ID embedded
            const opId =
                b.trip?.bus?.operator?.id
                ?? b.trip?.bus?.operatorId
                ?? b.trip?.operator?.operatorId
                ?? b.trip?.operator?.id
                ?? b.trip?.operatorId
                ?? b.operatorId
                ?? null;
            if (opId) return opId === operatorId;

            // 3. Booking's bus is in our known bus set
            const busId = b.trip?.busId ?? b.trip?.bus?.id ?? b.busId;
            if (busId && busSet.size > 0 && busSet.has(busId)) return true;

            // ── No ownership signal available ──
            // The backend is the source of truth — trust it and include the booking.
            // This handles list responses that don't embed nested trip/bus/operator.
            return true;
        });
    }, [effectiveBookings, isOperatorUser, operatorId, operatorBusIds, operatorTripIds]);

    const operatorTrips = useMemo(() => {
        if (!isOperatorUser) return [];
        const trips = tripsQuery.data ?? [];
        if (trips.length > 0) return trips;
        if (operatorId) return [];

        // Fallback when operatorId is missing: infer trips from bookings payload.
        const inferred = [];
        const seen = new Set();
        for (const b of operatorBookings) {
            const t = b.trip;
            if (!t?.id || seen.has(t.id)) continue;
            seen.add(t.id);
            inferred.push(t);
        }
        return inferred;
    }, [isOperatorUser, operatorId, tripsQuery.data, operatorBookings]);

    const operatorRouteIds = useMemo(() => {
        const set = new Set();
        for (const t of operatorTrips) {
            const rid = t.routeId ?? t.route?.id;
            if (rid) set.add(rid);
        }
        return set;
    }, [operatorTrips]);

    return {
        user,
        operatorId,
        scopeReady,
        scopeError: null,
        buses: busesBelongToOperator,
        busesQuery,
        operatorBusIds,
        trips: operatorTrips,
        tripsQuery,
        operatorTripIds: operatorTrips.map((t) => t.id).filter(Boolean),
        bookings: operatorBookings,
        bookingsQuery: {
            ...bookingsQuery,
            isFetching: bookingsQuery.isFetching || tripBookingsQueries.some((q) => q.isFetching),
            isLoading: bookingsQuery.isLoading || (shouldUseTripBookingFallback && tripBookingsQueries.some((q) => q.isLoading)),
        },
        operatorRouteIds,
    };
}
