import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api';
import { bookingKeys } from './useBookings';

export const paymentKeys = {
    all: ['payments'],
    list: (params) => ['payments', 'list', params],
    detail: (id) => ['payments', 'detail', id],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'SUCCESS' | 'FAILED',
 *   method?: 'TELEBIRR' | 'CBE' | 'CHAPA'
 * }} params
 */
export function usePayments(params = {}) {
    return useQuery({
        queryKey: paymentKeys.list(params),
        queryFn: async () => {
            const res = await paymentsApi.listPayments(params);
            // Backend envelope: { success, data: { items: [], meta: {} } }
            const payload = res?.data ?? res;
            if (Array.isArray(payload))        return payload;
            if (Array.isArray(payload?.items)) return payload.items;
            if (Array.isArray(payload?.data))  return payload.data;
            return [];
        },
        staleTime: 0,
    });
}

/**
 * @param {string | undefined} paymentId
 */
export function usePayment(paymentId) {
    return useQuery({
        queryKey: paymentKeys.detail(paymentId),
        queryFn: () => paymentsApi.getPaymentById(paymentId),
        enabled: !!paymentId,
        staleTime: 0,
    });
}

/**
 * Mutation: initiate payment for a pending booking.
 * On success, invalidates the related booking so its status refreshes.
 */
export function useInitiatePayment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => paymentsApi.initiatePayment(data),
        onSuccess: (_data, variables) => {
            // Refresh the booking that was just paid for
            queryClient.invalidateQueries({
                queryKey: bookingKeys.detail(variables.bookingId),
            });
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}
