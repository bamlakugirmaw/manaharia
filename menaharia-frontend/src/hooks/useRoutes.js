import { useQuery } from '@tanstack/react-query';
import { routesApi } from '../api';

export const routeKeys = {
    all: ['routes'],
    list: (params) => ['routes', 'list', params],
    detail: (id) => ['routes', 'detail', id],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   origin?: string,
 *   destination?: string
 * }} params
 */
export function useRoutes(params = {}) {
    return useQuery({
        queryKey: routeKeys.list(params),
        queryFn: () => routesApi.listRoutes(params),
        staleTime: 30 * 60 * 1000, // 30 minutes — routes are near-static
    });
}

/**
 * @param {string | undefined} routeId
 */
export function useRoute(routeId) {
    return useQuery({
        queryKey: routeKeys.detail(routeId),
        queryFn: () => routesApi.getRouteById(routeId),
        enabled: !!routeId,
        staleTime: 30 * 60 * 1000,
    });
}
