import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from '../api';
import { filterTripsForOperator } from '../lib/operatorHelpers';
import { normaliseTripForDisplay, prepareTripsList } from '../lib/normaliseTrip';

export const tripKeys = {
    all:    ['trips'],
    list:   (params) => ['trips', 'list', params],
    detail: (id)     => ['trips', 'detail', id],
};

function unwrapSingle(res) {
    if (res && typeof res === 'object' && res.id && (res.routeId != null || res.busId != null)) {
        return res;
    }
    const p = res?.data ?? res;
    if (p && typeof p === 'object' && p.data !== undefined && p.success !== undefined) {
        return p.data;
    }
    return p?.data ?? p;
}

export function useTrips(params = {}) {
    return useQuery({
        queryKey: tripKeys.list(params),
        queryFn: async () => prepareTripsList(await tripsApi.listTrips(params)),
        // Only require origin+destination for the public search flow.
        // Pass enabled:true explicitly to bypass this guard for operator views.
        enabled: params.enabled !== undefined ? params.enabled : !!(params.origin && params.destination),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Fetch all trips without requiring origin/destination filters.
 * Used by the operator Bookings page to list all trips for the operator's buses.
 */
export function useAllTrips(params = {}) {
    const { enabled = true, ...queryParams } = params;
    return useQuery({
        queryKey: tripKeys.list({ _all: true, ...queryParams }),
        queryFn: async () => prepareTripsList(await tripsApi.listTrips(queryParams)),
        enabled,
        placeholderData: (prev) => (Array.isArray(prev) ? prev : []),
        staleTime: 30 * 1000, // 30s — operator needs fresh data after creating a trip
    });
}

/**
 * Scheduled/all trips scoped to one operator (client filter on GET /v1/trips).
 * @param {string | null} operatorId
 * @param {object} params — passed to listTrips (limit, status, …)
 * @param {string[]} operatorBusIds — fleet bus ids from GET /v1/buses?operatorId=
 */
export function useOperatorTrips(operatorId, params = {}, operatorBusIds = []) {
    const busKey = operatorBusIds.join(',');
    const query = useAllTrips({
        ...params,
        enabled: params.enabled !== false && !!operatorId,
    });

    const data = useMemo(
        () => filterTripsForOperator(query.data ?? [], operatorId, operatorBusIds),
        [query.data, operatorId, busKey]
    );

    return { ...query, data };
}

export function useTrip(tripId, options = {}) {
    const { enabled = true, staleTime = 2 * 60 * 1000, refetchOnMount } = options;
    return useQuery({
        queryKey: tripKeys.detail(tripId),
        queryFn: async () => {
            const raw = unwrapSingle(await tripsApi.getTripById(tripId));
            return raw ? normaliseTripForDisplay(raw) : null;
        },
        enabled: !!tripId && enabled,
        staleTime,
        refetchOnMount,
    });
}

export function useCreateTrip() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => tripsApi.createTrip(data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: tripKeys.all });
        },
    });
}

export function useUpdateTrip() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => tripsApi.updateTrip(id, data),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: tripKeys.all });
            qc.invalidateQueries({ queryKey: tripKeys.detail(id) });
        },
    });
}

export function useRemoveTrip() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => tripsApi.removeTrip(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: tripKeys.all }),
    });
}
