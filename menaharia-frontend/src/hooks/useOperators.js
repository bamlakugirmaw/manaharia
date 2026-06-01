import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorsApi } from '../api';
import { useAuth } from '../contexts/AuthContext';
import { useAllTrips } from './useTrips';
import {
    aggregateOperatorsFromTrips,
    buildOperatorTripStats,
    mergeOperatorLists,
    mergeOperatorRecord,
    normaliseOperatorForUI,
} from '../lib/operatorHelpers';

export const operatorKeys = {
    all: ['operators'],
    list: (params) => ['operators', 'list', params],
    detail: (id) => ['operators', 'detail', id],
    dashboard: (id, params) => ['operators', 'dashboard', id, params],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
 *   enabled?: boolean
 * }} params
 */
export function useOperators(params = {}) {
    const { enabled = true, ...queryParams } = params;
    return useQuery({
        queryKey: operatorKeys.list(queryParams),
        queryFn: async () => {
            const response = await operatorsApi.listOperators(queryParams);
            // Backend envelope: { success, data: { items: [], meta: {} } }
            // Normalise to always return an array
            const payload = response?.data ?? response;
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload?.items)) return payload.items;
            if (Array.isArray(payload?.data)) return payload.data;
            return [];
        },
        enabled,
        staleTime: 10 * 60 * 1000,
        retry: false,
    });
}

/**
 * @param {string | undefined} operatorId
 */
export function useOperator(operatorId, options = {}) {
    const { enabled = true } = options;
    return useQuery({
        queryKey: operatorKeys.detail(operatorId),
        queryFn: async () => {
            const res = await operatorsApi.getOperatorById(operatorId);
            // Backend envelope: { success, data: { id, companyName, ... } }
            return res?.data ?? res;
        },
        enabled: !!operatorId && enabled,
        staleTime: 10 * 60 * 1000,
        retry: false,
    });
}

/**
 * Public operator listing — works without auth by aggregating GET /trips.
 * When signed in, merges GET /operators with trip stats (routes, prices, trips).
 */
export function usePublicOperators(params = {}) {
    const { isAuthenticated } = useAuth();
    const { status = 'ACTIVE', enabled = true } = params;

    const { data: trips = [], isLoading: tripsLoading } = useAllTrips({
        limit: 100,
        status: 'SCHEDULED',
        enabled,
    });

    const { data: apiOperators = [], isLoading: apiLoading, isError: apiError } = useQuery({
        queryKey: operatorKeys.list({ status, public: true }),
        queryFn: async () => {
            try {
                const response = await operatorsApi.listOperatorsPublic({ limit: 100, status });
                const payload = response?.data ?? response;
                if (Array.isArray(payload)) return payload;
                if (Array.isArray(payload?.items)) return payload.items;
                if (Array.isArray(payload?.data)) return payload.data;
                return [];
            } catch {
                return [];
            }
        },
        enabled: enabled && isAuthenticated,
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    const operators = useMemo(() => {
        if (isAuthenticated && apiOperators.length > 0) {
            return mergeOperatorLists(apiOperators, trips);
        }
        return aggregateOperatorsFromTrips(trips);
    }, [isAuthenticated, apiOperators, trips]);

    return {
        data: operators,
        isLoading: tripsLoading || (isAuthenticated && apiLoading),
        isFromApi: isAuthenticated && !apiError && apiOperators.length > 0,
        tripCount: trips.length,
    };
}

/**
 * Single operator profile — public via trip aggregation; enriched when authenticated.
 */
export function usePublicOperator(operatorId) {
    const { isAuthenticated } = useAuth();

    const { data: trips = [], isLoading: tripsLoading } = useAllTrips({
        limit: 100,
        status: 'SCHEDULED',
        enabled: !!operatorId,
    });

    const { data: apiOperator, isLoading: apiLoading } = useQuery({
        queryKey: operatorKeys.detail({ id: operatorId, public: true }),
        queryFn: async () => {
            try {
                const res = await operatorsApi.getOperatorByIdPublic(operatorId);
                return res?.data ?? res;
            } catch {
                return null;
            }
        },
        enabled: isAuthenticated && !!operatorId,
        staleTime: 10 * 60 * 1000,
        retry: false,
    });

    const operator = useMemo(() => {
        if (!operatorId) return null;

        const stats = buildOperatorTripStats(trips, operatorId);
        if (apiOperator) {
            return mergeOperatorRecord(apiOperator, stats
                ? {
                    routesServed: stats.routesServed,
                    routeDetails: stats.routeDetails,
                    startingPrice: stats.startingPrice,
                    upcomingTrips: stats.upcomingTrips,
                    scheduledTripCount: stats.scheduledTripCount,
                }
                : null);
        }

        if (stats?.rawOperator || stats?.upcomingTrips?.length) {
            const raw = stats.rawOperator ?? { id: operatorId };
            return normaliseOperatorForUI(
                { ...raw, id: operatorId },
                {
                    routesServed: stats.routesServed,
                    routeDetails: stats.routeDetails,
                    startingPrice: stats.startingPrice,
                    upcomingTrips: stats.upcomingTrips,
                    scheduledTripCount: stats.scheduledTripCount,
                },
            );
        }

        return null;
    }, [operatorId, trips, apiOperator]);

    return {
        data: operator,
        isLoading: tripsLoading || (isAuthenticated && apiLoading),
    };
}

export function useRemoveOperator() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => operatorsApi.removeOperator(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.all }),
    });
}

/**
 * @param {string | undefined} operatorId
 * @param {{ from?: string, to?: string }} params
 */
export function useOperatorDashboard(operatorId, params = {}) {
    return useQuery({
        queryKey: operatorKeys.dashboard(operatorId, params),
        queryFn: async () => {
            const res = await operatorsApi.getOperatorDashboard(operatorId, params);
            // Backend envelope: { success, data: { totalRevenue, ... } }
            return res?.data ?? res;
        },
        enabled: !!operatorId,
        staleTime: 5 * 60 * 1000,
    });
}
