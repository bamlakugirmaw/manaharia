import { useQuery } from '@tanstack/react-query';
import { seatsApi } from '../api';

export const seatKeys = {
    all:  ['seats'],
    list: (params) => ['seats', 'list', params],
};

function unwrapList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p))        return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data))  return p.data;
    return [];
}

export function useSeats(busId, params = {}) {
    return useQuery({
        queryKey: seatKeys.list({ busId, ...params }),
        queryFn: async () => unwrapList(await seatsApi.listSeats({ busId, ...params })),
        enabled: !!busId,
        staleTime: 30 * 1000,
    });
}
