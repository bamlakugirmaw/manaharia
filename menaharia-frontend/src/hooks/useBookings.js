import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api';

export const bookingKeys = {
    all: ['bookings'],
    list: (params) => ['bookings', 'list', params],
    detail: (id) => ['bookings', 'detail', id],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED',
 *   userId?: string
 * }} params
 */
export function useBookings(params = {}) {
    return useQuery({
        queryKey: bookingKeys.list(params),
        queryFn: () => bookingsApi.listBookings(params),
        staleTime: 0, // Always fresh — booking state changes frequently
    });
}

/**
 * @param {string | undefined} bookingId
 */
export function useBooking(bookingId) {
    return useQuery({
        queryKey: bookingKeys.detail(bookingId),
        queryFn: () => bookingsApi.getBookingById(bookingId),
        enabled: !!bookingId,
        staleTime: 0,
    });
}

/**
 * Mutation: create a booking (reserve seats + init payment).
 * Invalidates the bookings list on success.
 */
export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => bookingsApi.createBooking(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Mutation: cancel a booking.
 * Invalidates both the list and the specific booking detail on success.
 */
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
