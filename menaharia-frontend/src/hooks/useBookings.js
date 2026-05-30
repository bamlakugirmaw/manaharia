import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api';

export const bookingKeys = {
    all:    ['bookings'],
    list:   (params) => ['bookings', 'list', params],
    detail: (id)     => ['bookings', 'detail', id],
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

export function useBookings(params = {}) {
    return useQuery({
        queryKey: bookingKeys.list(params),
        queryFn: async () => unwrapList(await bookingsApi.listBookings(params)),
        staleTime: 0,
    });
}

export function useBooking(bookingId) {
    return useQuery({
        queryKey: bookingKeys.detail(bookingId),
        queryFn: async () => unwrapSingle(await bookingsApi.getBookingById(bookingId)),
        enabled: !!bookingId,
        staleTime: 0,
    });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => bookingsApi.createBooking(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId) => bookingsApi.cancelBooking(bookingId),
        onSuccess: (_data, bookingId) => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
        },
    });
}
