import { useQuery, useMutation } from '@tanstack/react-query';
import { ticketsApi } from '../api';

export const ticketKeys = {
    all:    ['tickets'],
    list:   (params) => ['tickets', 'list', params],
    byBooking: (bookingId) => ['tickets', 'booking', bookingId],
    detail: (id)     => ['tickets', 'detail', id],
    validate: (key) => ['tickets', 'validate', key],
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

export function useTicketsByBooking(bookingId, options = {}) {
    const { enabled = true } = options;
    return useQuery({
        queryKey: ticketKeys.byBooking(bookingId),
        queryFn: async () => unwrapList(await ticketsApi.getTicketsByBooking(bookingId)),
        enabled: enabled && !!bookingId,
        staleTime: 0,
    });
}

/**
 * POST /v1/tickets/validate — operator QR / ticket number check-in.
 */
export function useValidateTicket() {
    return useMutation({
        mutationFn: (params) => ticketsApi.validateTicket(params),
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
