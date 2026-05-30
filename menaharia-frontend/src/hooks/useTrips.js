import { useQuery } from '@tanstack/react-query';
import { tripsApi } from '../api';

export const tripKeys = {
    all:    ['trips'],
    list:   (params) => ['trips', 'list', params],
    detail: (id)     => ['trips', 'detail', id],
};

function unwrapList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p))        return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data))  return p.data;
    return [];
}

function unwrapSingle(res) {
    return res?.data ?? res;
}

export function useTrips(params = {}) {
    return useQuery({
        queryKey: tripKeys.list(params),
        queryFn: async () => unwrapList(await tripsApi.listTrips(params)),
        enabled: !!(params.origin && params.destination),
        staleTime: 2 * 60 * 1000,
    });
}

export function useTrip(tripId) {
    return useQuery({
        queryKey: tripKeys.detail(tripId),
        queryFn: async () => unwrapSingle(await tripsApi.getTripById(tripId)),
        enabled: !!tripId,
        staleTime: 2 * 60 * 1000,
    });
}
