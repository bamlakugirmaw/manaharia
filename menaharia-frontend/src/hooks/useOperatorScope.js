import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBuses } from './useBuses';
import { useOperatorTrips } from './useTrips';
import { filterBookingsForOperator } from '../lib/operatorHelpers';
import { useBookings } from './useBookings';

/**
 * Central operator tenancy: correct operatorId + fleet bus ids + scoped trips/bookings.
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
        { limit: 200, status: 'SCHEDULED' },
        operatorBusIds,
    );

    const operatorTripIds = useMemo(
        () => (tripsQuery.data ?? []).map((t) => t.id).filter(Boolean),
        [tripsQuery.data],
    );

    const bookingsQuery = useBookings({
        ...bookingParams,
        limit: bookingParams.limit ?? 500,
        enabled: scopeReady && (bookingParams.enabled !== false),
    });

    const operatorBookings = useMemo(() => {
        const filtered = filterBookingsForOperator(
            bookingsQuery.data ?? [],
            operatorId,
            operatorBusIds,
        );
        if (operatorTripIds.length === 0) return filtered;
        const tripSet = new Set(operatorTripIds);
        return filtered.filter((b) => {
            const tid = b.tripId ?? b.trip?.id;
            if (!tid) return true;
            return tripSet.has(tid);
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
