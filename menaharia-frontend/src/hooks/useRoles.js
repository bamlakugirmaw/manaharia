import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rolesApi } from '../api/roles.api';

export const roleKeys = {
    all: ['roles'],
    list: (params) => ['roles', 'list', params],
};

function unwrapList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data)) return p.data;
    return [];
}

export function useRoles(params = {}) {
    return useQuery({
        queryKey: roleKeys.list(params),
        queryFn: async () => unwrapList(await rolesApi.listRoles(params)),
        staleTime: 10 * 60 * 1000,
    });
}

/** Resolve BUS_OPERATOR role id from GET /v1/roles (cached). */
export function useBusOperatorRoleId() {
    return useQuery({
        queryKey: roleKeys.list({ purpose: 'bus_operator' }),
        queryFn: async () => {
            const items = unwrapList(await rolesApi.listRoles({}));
            const match = items.find((r) => {
                const name = (r.name ?? '').toUpperCase().replace(/\s+/g, '_');
                return name === 'BUS_OPERATOR' || name === 'OPERATOR';
            });
            return match?.id ?? null;
        },
        staleTime: Infinity,
    });
}

export function useRevokeRole() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => rolesApi.revokeRole(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: roleKeys.all }),
    });
}
