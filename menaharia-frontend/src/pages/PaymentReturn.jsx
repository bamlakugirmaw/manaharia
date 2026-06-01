import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import PaymentReceiptCard from '../components/PaymentReceiptCard';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Ticket } from 'lucide-react';
import { useBooking } from '../hooks/useBookings';
import { useInitiatePayment } from '../hooks/usePayments';
import { clearBookingFlow, clearPendingPayment, loadPendingPayment } from '../lib/bookingFlow';
import { isBookingPaid } from '../lib/bookingUi';
import { buildPaymentReceipt, getPaymentReceipt, savePaymentReceipt } from '../lib/paymentReceipt';
import { extractErrorMessage } from '../lib/api';

/**
 * Return URL after Chapa checkout.
 * Shows a persisted receipt on success (no auto-redirect).
 */
export default function PaymentReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pending = loadPendingPayment();

    const bookingId =
        searchParams.get('bookingId')
        ?? searchParams.get('booking_id')
        ?? pending?.bookingId
        ?? null;

    const { data: booking, isLoading, refetch, isFetching } = useBooking(bookingId);
    const { mutateAsync: initiatePayment, isPending: retrying } = useInitiatePayment();

    const [errorMsg, setErrorMsg] = useState('');
    const [pollCount, setPollCount] = useState(0);
    const [savedReceipt, setSavedReceipt] = useState(() =>
        bookingId ? getPaymentReceipt(bookingId) : null,
    );

    const paymentStatus = (booking?.payment?.status ?? '').toUpperCase();
    const bookingStatus = (booking?.status ?? '').toUpperCase();
    const isPaid = isBookingPaid(booking);
    const isFailed = paymentStatus === 'FAILED';

    useEffect(() => {
        if (!bookingId) {
            navigate('/search', { replace: true });
        }
    }, [bookingId, navigate]);

    useEffect(() => {
        if (!bookingId || isPaid) return undefined;

        const interval = setInterval(() => {
            setPollCount((c) => c + 1);
            refetch();
        }, 3000);

        return () => clearInterval(interval);
    }, [bookingId, isPaid, refetch]);

    useEffect(() => {
        if (!isPaid || !bookingId || !booking) return;

        const receipt = buildPaymentReceipt({
            booking,
            bookingId,
            searchParams,
            pending,
        });
        savePaymentReceipt(receipt);
        setSavedReceipt(receipt);
        clearBookingFlow();
        clearPendingPayment();
    }, [isPaid, bookingId, booking, searchParams, pending]);

    const receipt = useMemo(
        () => savedReceipt ?? (bookingId ? getPaymentReceipt(bookingId) : null),
        [savedReceipt, bookingId],
    );

    const handleRetryPayment = async () => {
        if (!bookingId) return;
        setErrorMsg('');
        try {
            const result = await initiatePayment({
                method: 'CHAPA',
                bookingId,
                customerReference: pending?.passengerDetails?.email ?? undefined,
            });
            if (result?.paymentUrl) {
                window.location.href = result.paymentUrl;
                return;
            }
            setErrorMsg('Could not open Chapa checkout. Try again in a moment.');
        } catch (err) {
            setErrorMsg(extractErrorMessage(err, 'Payment initiation failed.'));
        }
    };

    const handleViewTicket = () => {
        if (!bookingId) return;
        navigate(`/booking/ticket/${bookingId}`, {
            state: {
                bookingId,
                booking,
                trip: pending?.trip ?? booking?.trip,
                selectedSeats: pending?.selectedSeats,
                passengerDetails: pending?.passengerDetails,
                totalPrice: booking?.payment?.amount ?? booking?.totalAmount ?? pending?.totalPrice,
                receipt,
            },
        });
    };

    if (!bookingId) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-lg w-full p-10">
                {isLoading && !booking ? (
                    <div className="text-center">
                        <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Confirming payment…</h1>
                        <p className="text-sm text-gray-500">
                            Please wait while we verify your Chapa payment with the server.
                        </p>
                    </div>
                ) : isPaid ? (
                    <div className="space-y-6">
                        <div className="text-center">
                            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
                            <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful</h1>
                            <p className="text-sm text-gray-500">
                                Your receipt is saved below. You can return here anytime from My Bookings.
                            </p>
                        </div>

                        <PaymentReceiptCard receipt={receipt} />

                        <div className="flex flex-col gap-3">
                            <Button onClick={handleViewTicket} className="w-full">
                                <Ticket className="w-4 h-4 mr-2" />
                                View ticket
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/traveller/payments')}
                                className="w-full"
                            >
                                Payment history
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={() => navigate('/traveller/bookings')}
                                className="w-full text-sm"
                            >
                                My bookings
                            </Button>
                        </div>
                    </div>
                ) : isFailed ? (
                    <div className="text-center">
                        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment failed</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Your booking is still reserved for a limited time. You can try paying again with Chapa.
                        </p>
                        {errorMsg && (
                            <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
                        )}
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleRetryPayment} disabled={retrying} className="w-full">
                                {retrying ? 'Opening Chapa…' : 'Retry with Chapa'}
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/traveller/bookings')} className="w-full">
                                My Bookings
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="text-center">
                        <Loader2 className="w-14 h-14 text-amber-500 animate-spin mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment pending</h1>
                        <p className="text-sm text-gray-500 mb-2">
                            If you completed payment on Chapa, confirmation may take a few seconds.
                        </p>
                        <p className="text-xs text-gray-400 mb-6">
                            Booking ref: {booking?.bookingReference ?? bookingId}
                            {pollCount > 0 && ` · checked ${pollCount}×`}
                        </p>
                        {errorMsg && (
                            <p className="text-sm text-red-600 mb-4">{errorMsg}</p>
                        )}
                        <div className="flex flex-col gap-3">
                            <Button
                                onClick={() => refetch()}
                                disabled={isFetching}
                                variant="outline"
                                className="w-full"
                            >
                                {isFetching ? 'Checking…' : 'Check status now'}
                            </Button>
                            <Button onClick={handleRetryPayment} disabled={retrying} className="w-full">
                                {retrying ? 'Opening Chapa…' : 'Pay again with Chapa'}
                            </Button>
                            <Button variant="ghost" onClick={handleViewTicket} className="w-full text-sm">
                                View reservation (unpaid)
                                <ArrowRight className="w-4 h-4 ml-1 inline" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
