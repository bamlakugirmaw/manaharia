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
    });
}

/**
 * @param {string | undefined} operatorId
 */
export function useOperator(operatorId) {
    return useQuery({
        queryKey: operatorKeys.detail(operatorId),
        queryFn: async () => {
            const res = await operatorsApi.getOperatorById(operatorId);
            // Backend envelope: { success, data: { id, companyName, ... } }
            return res?.data ?? res;
        },
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
        queryFn: async () => {
            const res = await operatorsApi.getOperatorDashboard(operatorId, params);
            // Backend envelope: { success, data: { totalRevenue, ... } }
            return res?.data ?? res;
        },
        enabled: !!operatorId,
        staleTime: 5 * 60 * 1000,
    });
}
