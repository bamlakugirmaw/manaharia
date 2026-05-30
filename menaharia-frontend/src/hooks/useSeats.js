import { useQuery } from '@tanstack/react-query';
import { seatsApi } from '../api';

export const seatKeys = {
    all: ['seats'],
    list: (params) => ['seats', 'list', params],
};

/**
 * Fetch seats for a given bus.
 * Used in SeatSelection to build the seatNumber → tripSeatId map
 * required by the booking API.
 *
 * @param {string | undefined} busId
 * @param {{ page?: number, limit?: number }} params
 */
export function useSeats(busId, params = {}) {
    return useQuery({
        queryKey: seatKeys.list({ busId, ...params }),
        queryFn: () => seatsApi.listSeats({ busId, ...params }),
        enabled: !!busId,
        staleTime: 30 * 1000, // 30 seconds — availability changes
    });
}
