import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { seatsApi } from '../api';
import { normalizeSeatListPayload } from '../lib/tripSeats';

export const seatKeys = {
    all:  ['seats'],
    list: (params) => ['seats', 'list', params],
};

export function useSeats(busId, params = {}) {
    return useQuery({
        queryKey: seatKeys.list({ busId, ...params }),
        queryFn: async () => normalizeSeatListPayload(await seatsApi.listSeats({ busId, ...params })),
        enabled: !!busId,
        staleTime: 30 * 1000,
    });
}

export function useCreateSeatBatch() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => seatsApi.createSeatBatch(data),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: seatKeys.list({ busId: variables.busId }) });
        },
    });
}
