import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api';

export const ticketKeys = {
    all: ['tickets'],
    list: (params) => ['tickets', 'list', params],
    detail: (id) => ['tickets', 'detail', id],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   bookingId?: string
 * }} params
 */
export function useTickets(params = {}) {
    return useQuery({
        queryKey: ticketKeys.list(params),
        queryFn: () => ticketsApi.listTickets(params),
        staleTime: 0,
    });
}

/**
 * Fetch tickets for a specific booking.
 * Only fires when bookingId is provided.
 *
 * @param {string | undefined} bookingId
 */
export function useTicketsByBooking(bookingId) {
    return useQuery({
        queryKey: ticketKeys.list({ bookingId }),
        queryFn: () => ticketsApi.listTickets({ bookingId }),
        enabled: !!bookingId,
        staleTime: 0,
    });
}

/**
 * @param {string | undefined} ticketId
 */
export function useTicket(ticketId) {
    return useQuery({
        queryKey: ticketKeys.detail(ticketId),
        queryFn: () => ticketsApi.getTicketById(ticketId),
        enabled: !!ticketId,
        staleTime: 0,
    });
}
