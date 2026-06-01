import { useQuery } from '@tanstack/react-query';
import { travelersApi } from '../api/travelers.api';
import { unwrapTravelersList } from '../lib/bookingEnrichment';

export const travelerKeys = {
    all: ['travelers'],
    byBooking: (bookingId) => ['travelers', 'booking', bookingId],
};

export function useTravelersByBooking(bookingId, enabled = true) {
    return useQuery({
        queryKey: travelerKeys.byBooking(bookingId),
        queryFn: async () => {
            const res = await travelersApi.listTravelers({ bookingId, limit: 50 });
            return unwrapTravelersList(res);
        },
        enabled: enabled && !!bookingId,
        staleTime: 0,
    });
}
