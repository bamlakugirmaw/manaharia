import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useTicketsByBooking } from '../hooks/useTickets';
import { ticketsApi } from '../api/tickets.api';

/**
 * Invisible redirect page — fetches the ticket PDF, opens it in a new tab,
 * then immediately navigates the user back to /traveller/bookings.
 * Nothing is rendered; the user never "sees" this page.
 */
export default function Ticket() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const didOpen = useRef(false);

    const { data: tickets = [], isLoading } = useTicketsByBooking(bookingId);
    const ticket = Array.isArray(tickets) ? tickets[0] : null;
    const ticketId = ticket?.id ?? null;

    useEffect(() => {
        if (didOpen.current) return;
        if (isLoading) return;        // wait for ticket list to load
        if (!ticketId) {
            // No ticket yet — just go back to bookings
            navigate('/traveller/bookings', { replace: true });
            return;
        }

        didOpen.current = true;

        ticketsApi.getTicketPdf(ticketId)
            .then((blob) => {
                const url = URL.createObjectURL(blob);
                const tab = window.open(url, '_blank');
                // Revoke after 60 s once the new tab has loaded
                setTimeout(() => URL.revokeObjectURL(url), 60_000);
                if (!tab) {
                    // Popup blocked — open in same tab as fallback
                    window.location.href = url;
                    return;
                }
            })
            .catch(() => {
                // PDF unavailable — just go back
            })
            .finally(() => {
                navigate('/traveller/bookings', { replace: true });
            });
    }, [ticketId, isLoading, navigate]);

    // Show a brief spinner while the ticket loads — disappears in <1 s
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </div>
    );
}
