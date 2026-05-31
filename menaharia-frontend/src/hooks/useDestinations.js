import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { destinationsApi } from '../api/destinations.api';

export const destinationKeys = {
    all: ['destinations'],
    list: (params) => ['destinations', 'list', params],
    publicList: (params) => ['destinations', 'public', params],
    detail: (id) => ['destinations', 'detail', id],
    publicDetail: (id) => ['destinations', 'public', 'detail', id],
};

function unwrapList(res) {
    const p = res?.data ?? res;
    if (Array.isArray(p)) return p;
    if (Array.isArray(p?.items)) return p.items;
    if (Array.isArray(p?.data)) return p.data;
    return [];
}

function unwrapSingle(res) {
    return res?.data ?? res;
}

/** Admin / authenticated management (redirects to login when session expires). */
export function useDestinations(params = {}) {
    return useQuery({
        queryKey: destinationKeys.list(params),
        queryFn: async () => unwrapList(await destinationsApi.listDestinations(params)),
        staleTime: 10 * 60 * 1000,
    });
}

/**
 * Public browse — GET /v1/destinations with skipAuthRedirect.
 * Returns { destinations, needsAuth } where needsAuth is true on 401 without a session.
 */
export function usePublicDestinations(params = {}) {
    return useQuery({
        queryKey: destinationKeys.publicList(params),
        queryFn: async () => {
            try {
                const res = await destinationsApi.listDestinationsPublic(params);
                return { destinations: unwrapList(res), needsAuth: false };
            } catch (err) {
                if (err?.response?.status === 401) {
                    return { destinations: [], needsAuth: true };
                }
                throw err;
            }
        },
        staleTime: 5 * 60 * 1000,
    });
}

export function usePublicDestination(id) {
    return useQuery({
        queryKey: destinationKeys.publicDetail(id),
        queryFn: async () => {
            try {
                const res = await destinationsApi.getDestinationByIdPublic(id);
                return { destination: unwrapSingle(res), needsAuth: false };
            } catch (err) {
                if (err?.response?.status === 401) {
                    return { destination: null, needsAuth: true };
                }
                if (err?.response?.status === 404) {
                    return { destination: null, needsAuth: false };
                }
                throw err;
            }
        },
        enabled: !!id,
        staleTime: 5 * 60 * 1000,
    });
}

export function useDestination(id) {
    return useQuery({
        queryKey: destinationKeys.detail(id),
        queryFn: async () => unwrapSingle(await destinationsApi.getDestinationById(id)),
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}

export function useCreateDestination() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => destinationsApi.createDestination(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: destinationKeys.all }),
    });
}

export function useUpdateDestination() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => destinationsApi.updateDestination(id, data),
        onSuccess: (_d, { id }) => {
            qc.invalidateQueries({ queryKey: destinationKeys.all });
            qc.invalidateQueries({ queryKey: destinationKeys.detail(id) });
        },
    });
}

export function useRemoveDestination() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => destinationsApi.removeDestination(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: destinationKeys.all }),
    });
}
