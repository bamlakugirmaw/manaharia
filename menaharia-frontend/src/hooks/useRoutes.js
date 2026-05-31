import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routesApi } from '../api';

export const routeKeys = {
    all:    ['routes'],
    list:   (params) => ['routes', 'list', params],
    detail: (id)     => ['routes', 'detail', id],
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

export function useRoutes(params = {}) {
    return useQuery({
        queryKey: routeKeys.list(params),
        queryFn: async () => unwrapList(await routesApi.listRoutes(params)),
        staleTime: 30 * 60 * 1000,
    });
}

export function useRoute(routeId) {
    return useQuery({
        queryKey: routeKeys.detail(routeId),
        queryFn: async () => unwrapSingle(await routesApi.getRouteById(routeId)),
        enabled: !!routeId,
        staleTime: 30 * 60 * 1000,
    });
}

export function useCreateRoute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => routesApi.createRoute(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: routeKeys.all }),
    });
}

export function useUpdateRoute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => routesApi.updateRoute(id, data),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: routeKeys.all });
            qc.invalidateQueries({ queryKey: routeKeys.detail(id) });
        },
    });
}
