import { useQuery } from '@tanstack/react-query';
import { operatorsApi } from '../api';

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
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} params
 */
export function useOperators(params = {}) {
    return useQuery({
        queryKey: operatorKeys.list(params),
        queryFn: async () => {
            const response = await operatorsApi.listOperators(params);
            // Backend envelope: { success, data: { items: [], meta: {} } }
            // Normalise to always return an array
            const payload = response?.data ?? response;
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload?.items)) return payload.items;
            if (Array.isArray(payload?.data)) return payload.data;
            return [];
        },
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * @param {string | undefined} operatorId
 */
export function useOperator(operatorId) {
    return useQuery({
        queryKey: operatorKeys.detail(operatorId),
        queryFn: () => operatorsApi.getOperatorById(operatorId),
        enabled: !!operatorId,
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * @param {string | undefined} operatorId
 * @param {{ from?: string, to?: string }} params
 */
export function useOperatorDashboard(operatorId, params = {}) {
    return useQuery({
        queryKey: operatorKeys.dashboard(operatorId, params),
        queryFn: () => operatorsApi.getOperatorDashboard(operatorId, params),
        enabled: !!operatorId,
        staleTime: 5 * 60 * 1000,
    });
}
