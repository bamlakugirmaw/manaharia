import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api';
import { filterBookingsForOperator } from '../lib/operatorHelpers';
import { tripKeys } from './useTrips';

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
    if (res && typeof res === 'object' && res.id && (res.tripId != null || res.status)) {
        return res;
    }
    return res?.data ?? res;
}

export function useBookings(params = {}) {
    const { enabled = true, ...queryParams } = params;
    return useQuery({
        queryKey: bookingKeys.list(queryParams),
        queryFn: async () => unwrapList(await bookingsApi.listBookings(queryParams)),
        enabled,
        staleTime: 0,
    });
}

/**
 * Bookings for one operator's trips (client filter when API returns a broad list).
 */
export function useOperatorBookings(operatorId, params = {}, operatorBusIds = []) {
    const busKey = operatorBusIds.join(',');
    const query = useBookings({
        ...params,
        enabled: params.enabled !== false && !!operatorId,
    });

    const data = useMemo(
        () => filterBookingsForOperator(query.data ?? [], operatorId, operatorBusIds),
        [query.data, operatorId, busKey]
    );

    return { ...query, data };
}

export function useBooking(bookingId) {
    return useQuery({
        queryKey: bookingKeys.detail(bookingId),
        queryFn: async () => unwrapSingle(await bookingsApi.getBookingById(bookingId)),
        enabled: !!bookingId,
        staleTime: 0,
    });
}

function invalidateBookingAndSeats(queryClient, bookingId) {
    queryClient.invalidateQueries({ queryKey: bookingKeys.all });
    if (bookingId) {
        queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
    }
    queryClient.invalidateQueries({ queryKey: tripKeys.all });
}

export function useCreateBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => bookingsApi.createBooking(data),
        onSuccess: (result) => {
            invalidateBookingAndSeats(queryClient, result?.bookingId);
        },
    });
}

export function useCreateBookingForUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => bookingsApi.createBookingForUser(data),
        onSuccess: (result) => {
            invalidateBookingAndSeats(queryClient, result?.bookingId);
        },
    });
}

export function useCancelBooking() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (bookingId) => bookingsApi.cancelBooking(bookingId),
        onSuccess: (_data, bookingId) => {
            invalidateBookingAndSeats(queryClient, bookingId);
        },
    });
}
