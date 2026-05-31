import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { busesApi } from '../api/buses.api';

export const busKeys = {
    all:    ['buses'],
    list:   (params) => ['buses', 'list', params],
    detail: (id)     => ['buses', 'detail', id],
};

function unwrapList(response) {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
 *   operatorId?: string
 * }} params
 */
export function useBuses(params = {}) {
    return useQuery({
        queryKey: busKeys.list(params),
        queryFn: async () => {
            const res = await busesApi.listBuses(params);
            return unwrapList(res);
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function useBus(id) {
    return useQuery({
        queryKey: busKeys.detail(id),
        queryFn: async () => {
            const res = await busesApi.getBusById(id);
            return res?.data ?? res;
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useRemoveBus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => busesApi.removeBus(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: busKeys.all }),
    });
}
