import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { loadPendingPayment } from '../lib/bookingFlow';

/**
 * SPA fallback for Chapa return (prefer /payment-return.html for backend FRONTEND_URL).
 */
export default function ChapaReturnBridge() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const params = new URLSearchParams(searchParams);
        let bookingId = params.get('bookingId') ?? params.get('booking_id') ?? '';
        if (!bookingId) {
            bookingId = loadPendingPayment()?.bookingId ?? '';
        }
        if (bookingId && !params.has('bookingId')) {
            params.set('bookingId', bookingId);
        }
        const qs = params.toString();
        navigate(`/booking/payment/return${qs ? `?${qs}` : ''}`, { replace: true });
    }, [navigate, searchParams]);

    return (
        <div className="min-h-[40vh] flex items-center justify-center text-gray-500 text-sm">
            Returning to your booking…
        </div>
    );
}
