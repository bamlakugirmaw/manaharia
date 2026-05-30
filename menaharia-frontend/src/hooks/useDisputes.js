import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { disputesApi } from '../api/disputes.api';

export const disputeKeys = {
    all:    ['disputes'],
    list:   (params) => ['disputes', 'list', params],
    detail: (id)     => ['disputes', 'detail', id],
};

// Backend status → UI label mapping
export const DISPUTE_STATUS_LABEL = {
    PENDING:   'Pending',
    IN_REVIEW: 'In Review',
    RESOLVED:  'Resolved',
    REJECTED:  'Rejected',
};

/**
 * Unwrap the backend envelope { success, data: { items, meta } }
 */
function unwrapList(response) {
    const payload = response?.data ?? response;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

function unwrapSingle(response) {
    return response?.data ?? response;
}

export function useDisputes(params = {}) {
    return useQuery({
        queryKey: disputeKeys.list(params),
        queryFn: async () => {
            const res = await disputesApi.listDisputes(params);
            return unwrapList(res);
        },
        staleTime: 0,
    });
}

export function useDispute(id) {
    return useQuery({
        queryKey: disputeKeys.detail(id),
        queryFn: async () => {
            const res = await disputesApi.getDisputeById(id);
            return unwrapSingle(res);
        },
        enabled: !!id,
        staleTime: 0,
    });
}

export function useCreateDispute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => disputesApi.createDispute(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: disputeKeys.all }),
    });
}

export function useUpdateDispute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => disputesApi.updateDispute(id, data),
        onSuccess: (_data, { id }) => {
            qc.invalidateQueries({ queryKey: disputeKeys.all });
            qc.invalidateQueries({ queryKey: disputeKeys.detail(id) });
        },
    });
}

export function useRemoveDispute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => disputesApi.removeDispute(id),
        onSuccess: () => qc.invalidateQueries({ queryKey: disputeKeys.all }),
    });
}
