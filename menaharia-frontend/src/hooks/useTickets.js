import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api';

export const ticketKeys = {
    all:    ['tickets'],
    list:   (params) => ['tickets', 'list', params],
    detail: (id)     => ['tickets', 'detail', id],
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

export function useTickets(params = {}) {
    const { enabled = true, ...queryParams } = params;
    return useQuery({
        queryKey: ticketKeys.list(queryParams),
        queryFn: async () => unwrapList(await ticketsApi.listTickets(queryParams)),
        enabled,
        staleTime: 0,
    });
}

export function useTicketsByBooking(bookingId) {
    return useQuery({
        queryKey: ticketKeys.list({ bookingId }),
        queryFn: async () => unwrapList(await ticketsApi.listTickets({ bookingId })),
        enabled: !!bookingId,
        staleTime: 0,
    });
}

export function useTicket(ticketId) {
    return useQuery({
        queryKey: ticketKeys.detail(ticketId),
        queryFn: async () => unwrapSingle(await ticketsApi.getTicketById(ticketId)),
        enabled: !!ticketId,
        staleTime: 0,
    });
}
