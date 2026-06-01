import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useBooking } from '../hooks/useBookings';
import { useInitiatePayment } from '../hooks/usePayments';
import { clearBookingFlow, clearPendingPayment, loadPendingPayment } from '../lib/bookingFlow';
import { isBookingPaid } from '../lib/bookingUi';
import { buildPaymentReceipt, savePaymentReceipt } from '../lib/paymentReceipt';
import { extractErrorMessage } from '../lib/api';

/**
 * Return URL after Chapa checkout — confirms payment then sends user to My Bookings.
 */
export default function PaymentReturn() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const pending = loadPendingPayment();
    const redirectedRef = useRef(false);

    const bookingId =
        searchParams.get('bookingId')
        ?? searchParams.get('booking_id')
        ?? pending?.bookingId
        ?? null;

    const { data: booking, isLoading, refetch, isFetching } = useBooking(bookingId);
    const { mutateAsync: initiatePayment, isPending: retrying } = useInitiatePayment();

    const [errorMsg, setErrorMsg] = useState('');
    const [pollCount, setPollCount] = useState(0);

    const paymentStatus = (booking?.payment?.status ?? '').toUpperCase();
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
        if (!isPaid || !bookingId || !booking || redirectedRef.current) return;

        redirectedRef.current = true;

        const receipt = buildPaymentReceipt({
            booking,
            bookingId,
            searchParams,
            pending,
        });
        savePaymentReceipt(receipt);
        clearBookingFlow();
        clearPendingPayment();

        navigate('/traveller/bookings', {
            replace: true,
            state: {
                paymentSuccess: true,
                bookingId,
                receipt,
            },
        });
    }, [isPaid, bookingId, booking, searchParams, pending, navigate]);

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

    if (!bookingId) {
        return null;
    }

    if (isPaid) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-sm text-gray-600 font-medium">Payment confirmed — opening your bookings…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-lg w-full p-10 text-center">
                {isLoading && !booking ? (
                    <>
                        <Loader2 className="w-14 h-14 text-primary animate-spin mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Confirming payment…</h1>
                        <p className="text-sm text-gray-500">
                            Please wait while we verify your Chapa payment.
                        </p>
                    </>
                ) : isFailed ? (
                    <>
                        <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment failed</h1>
                        <p className="text-sm text-gray-500 mb-6">
                            Your booking may still be reserved. You can try Chapa again or view bookings.
                        </p>
                        {errorMsg && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}
                        <div className="flex flex-col gap-3">
                            <Button onClick={handleRetryPayment} disabled={retrying} className="w-full">
                                {retrying ? 'Opening Chapa…' : 'Retry with Chapa'}
                            </Button>
                            <Button variant="outline" onClick={() => navigate('/traveller/bookings')} className="w-full">
                                My Bookings
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <Loader2 className="w-14 h-14 text-amber-500 animate-spin mx-auto mb-6" />
                        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment pending</h1>
                        <p className="text-sm text-gray-500 mb-2">
                            If you paid on Chapa, confirmation may take a few seconds.
                        </p>
                        <p className="text-xs text-gray-400 mb-6">
                            Ref: {booking?.bookingReference ?? bookingId}
                            {pollCount > 0 && ` · checked ${pollCount}×`}
                        </p>
                        {errorMsg && <p className="text-sm text-red-600 mb-4">{errorMsg}</p>}
                        <div className="flex flex-col gap-3">
                            <Button onClick={() => refetch()} disabled={isFetching} variant="outline" className="w-full">
                                {isFetching ? 'Checking…' : 'Check status now'}
                            </Button>
                            <Button onClick={handleRetryPayment} disabled={retrying} className="w-full">
                                {retrying ? 'Opening Chapa…' : 'Pay again with Chapa'}
                            </Button>
                            <Button variant="ghost" onClick={() => navigate('/traveller/bookings')} className="w-full text-sm">
                                My Bookings
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
