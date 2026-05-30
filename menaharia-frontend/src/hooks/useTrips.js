import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api';

/**
 * Query keys for trips.
 * Centralised here so invalidation is consistent across the app.
 */
export const tripKeys = {
    all: ['trips'],
    list: (params) => ['trips', 'list', params],
    detail: (id) => ['trips', 'detail', id],
};

/**
 * Fetch a paginated / filtered list of trips.
 * Only fires when both origin and destination are provided.
 *
 * @param {{
 *   origin?: string,
 *   destination?: string,
 *   date?: string,
 *   page?: number,
 *   limit?: number,
 *   status?: string
 * }} params
 */
export function useTrips(params = {}) {
    return useQuery({
        queryKey: tripKeys.list(params),
        queryFn: () => tripsApi.listTrips(params),
        // Don't fire until the user has selected both cities.
        enabled: !!(params.origin && params.destination),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

/**
 * Fetch a single trip by ID.
 *
 * @param {string | undefined} tripId
 */
export function useTrip(tripId) {
    return useQuery({
        queryKey: tripKeys.detail(tripId),
        queryFn: () => tripsApi.getTripById(tripId),
        enabled: !!tripId,
        staleTime: 2 * 60 * 1000,
    });
}
