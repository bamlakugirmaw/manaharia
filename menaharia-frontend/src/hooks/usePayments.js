import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentsApi } from '../api';
import { initiatePaymentForBooking } from '../lib/paymentInitiation';
import { bookingKeys } from './useBookings';
import { tripKeys } from './useTrips';
import { ticketKeys } from './useTickets';

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
 *   method?: 'TELEBIRR' | 'SANTIM' | 'CHAPA'
 * }} params
 */
export function usePayments(params = {}) {
    const { enabled = true, ...queryParams } = params;
    return useQuery({
        queryKey: paymentKeys.list(queryParams),
        queryFn: async () => {
            const res = await paymentsApi.listPayments(queryParams);
            // Backend envelope: { success, data: { items: [], meta: {} } }
            const payload = res?.data ?? res;
            if (Array.isArray(payload))        return payload;
            if (Array.isArray(payload?.items)) return payload.items;
            if (Array.isArray(payload?.data))  return payload.data;
            return [];
        },
        enabled,
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
        mutationFn: (data) => initiatePaymentForBooking(data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({
                queryKey: bookingKeys.detail(variables.bookingId),
            });
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            queryClient.invalidateQueries({ queryKey: tripKeys.all });
            queryClient.invalidateQueries({
                queryKey: ticketKeys.byBooking(variables.bookingId),
            });
        },
    });
}
