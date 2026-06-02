import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBuses } from './useBuses';
import { useOperatorTrips } from './useTrips';
import { useBookings } from './useBookings';

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
    const operatorId = user?.role === 'operator' ? (user?.operatorId ?? null) : null;
    const scopeReady = !!operatorId;

    const busesQuery = useBuses({
        operatorId: operatorId ?? undefined,
        limit: 100,
        enabled: scopeReady,
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

    const operatorBookings = useMemo(() => {
        const all = bookingsQuery.data ?? [];

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
    }, [bookingsQuery.data, operatorId, operatorBusIds, operatorTripIds]);

    const operatorRouteIds = useMemo(() => {
        const set = new Set();
        for (const t of tripsQuery.data ?? []) {
            const rid = t.routeId ?? t.route?.id;
            if (rid) set.add(rid);
        }
        return set;
    }, [tripsQuery.data]);

    return {
        user,
        operatorId,
        scopeReady,
        scopeError: user?.role === 'operator' && !scopeReady
            ? 'Your account is not linked to a bus operator profile. Contact support.'
            : null,
        buses: busesBelongToOperator,
        busesQuery,
        operatorBusIds,
        trips: tripsQuery.data ?? [],
        tripsQuery,
        operatorTripIds,
        bookings: operatorBookings,
        bookingsQuery,
        operatorRouteIds,
    };
}
