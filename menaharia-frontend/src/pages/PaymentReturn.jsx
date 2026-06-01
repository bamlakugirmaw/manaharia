import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useQueryClient } from '@tanstack/react-query';
import { useBooking, bookingKeys } from '../hooks/useBookings';
import { useInitiatePayment } from '../hooks/usePayments';
import { tripKeys } from '../hooks/useTrips';
import { ticketKeys } from '../hooks/useTickets';
import { clearBookingFlow, clearPendingPayment, loadPendingPayment } from '../lib/bookingFlow';
import { appendPaymentCallbackAudit, buildCallbackPayloadFromReturn } from '../lib/paymentCallbackAudit';
import { clearPaymentInitiationLock } from '../lib/paymentInitiation';
import { confirmPaymentFromChapaReturn } from '../lib/paymentReturnConfirm';
import { isBookingPaid, isBookingPaymentFailed } from '../lib/bookingUi';
import { buildPaymentReceipt, savePaymentReceipt } from '../lib/paymentReceipt';
import { extractErrorMessage } from '../lib/api';

/**
 * After Chapa redirect: POST /v1/payments/callback (with retry), then poll GET /v1/bookings/:id.
 * On success, show confirmation and let user continue to My Bookings.
 */
const MAX_POLL_ATTEMPTS = 40;
const POLL_INTERVAL_MS = 2000;
// After this many polls without confirmation, retry the callback once more.
const CALLBACK_RETRY_AFTER_POLLS = 5;

export default function PaymentReturn() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const pending = loadPendingPayment();
    const callbackAttemptedRef = useRef(false);
    const callbackRetryAttemptedRef = useRef(false);

    const bookingId =
        searchParams.get('bookingId')
        ?? searchParams.get('booking_id')
        ?? pending?.bookingId
        ?? null;

    // payment_result=failed means payment-return.html callback POST failed
    const paymentResultParam = searchParams.get('payment_result');
    const callbackAlreadyFailed = paymentResultParam === 'failed';

    const { data: booking, isLoading, refetch, isFetching } = useBooking(bookingId);
    const { mutateAsync: initiatePayment, isPending: retrying } = useInitiatePayment();

    const [errorMsg, setErrorMsg] = useState('');
    const [pollCount, setPollCount] = useState(0);
    const [callbackDone, setCallbackDone] = useState(false);
    const [callbackFailed, setCallbackFailed] = useState(callbackAlreadyFailed);

    const isPaid = isBookingPaid(booking);
    const isFailed = isBookingPaymentFailed(booking);

    useEffect(() => {
        if (!bookingId) {
            navigate('/search', { replace: true });
            return;
        }
        appendPaymentCallbackAudit(
            buildCallbackPayloadFromReturn({ bookingId, searchParams }),
        );
        clearPaymentInitiationLock(bookingId);
    }, [bookingId, navigate, searchParams]);

    // Primary callback attempt on mount — skip if payment-return.html already reported failure
    // (it means the backend rejected the callback; we retry below after a few polls)
    useEffect(() => {
        if (!bookingId || callbackAttemptedRef.current) return undefined;

        callbackAttemptedRef.current = true;

        // If payment-return.html already failed, don't immediately retry — wait for polls first
        if (callbackAlreadyFailed) {
            setCallbackDone(true);
            refetch();
            return undefined;
        }

        confirmPaymentFromChapaReturn({ bookingId, searchParams }).then((result) => {
            setCallbackDone(true);
            if (result?.error) {
                setCallbackFailed(true);
                setErrorMsg(extractErrorMessage(result.error, 'Payment confirmation failed. Retrying…'));
            } else {
                setCallbackFailed(false);
                setErrorMsg('');
            }
            refetch();
        });

        return undefined;
    }, [bookingId, searchParams, refetch, callbackAlreadyFailed]);

    // Polling loop — runs independently, does not restart on pollCount change
    useEffect(() => {
        if (!bookingId || isPaid || isFailed || pollCount >= MAX_POLL_ATTEMPTS) return undefined;

        const interval = setInterval(() => {
            setPollCount((c) => c + 1);
            refetch();
        }, POLL_INTERVAL_MS);

        return () => clearInterval(interval);
    }, [bookingId, isPaid, isFailed, refetch]); // intentionally exclude pollCount

    // Retry callback once after CALLBACK_RETRY_AFTER_POLLS polls if booking is still pending
    useEffect(() => {
        if (
            !bookingId
            || isPaid
            || isFailed
            || pollCount < CALLBACK_RETRY_AFTER_POLLS
            || callbackRetryAttemptedRef.current
        ) return;

        callbackRetryAttemptedRef.current = true;
        // Force retry — bypass the dedup key
        confirmPaymentFromChapaReturn({ bookingId, searchParams, forceRetry: true }).then((result) => {
            if (result?.error) {
                setCallbackFailed(true);
                setErrorMsg(extractErrorMessage(result.error, 'Payment confirmation still pending.'));
            } else if (result?.attempted) {
                setCallbackFailed(false);
                setErrorMsg('');
                refetch();
            }
        });
    }, [bookingId, isPaid, isFailed, pollCount, searchParams, refetch]);

    useEffect(() => {
        if (!isPaid || !bookingId || !booking) return;
        queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
        queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        queryClient.invalidateQueries({ queryKey: tripKeys.all });
        queryClient.invalidateQueries({ queryKey: ticketKeys.byBooking(bookingId) });

        const receipt = buildPaymentReceipt({
            booking,
            bookingId,
            searchParams,
            pending,
        });
        savePaymentReceipt(receipt);
        clearBookingFlow();
        clearPendingPayment();
    }, [isPaid, bookingId, booking, searchParams, pending, queryClient]);

    const handleRetryPayment = async () => {
        if (!bookingId) return;
        setErrorMsg('');
        try {
            const result = await initiatePayment({
                method: 'CHAPA',
                bookingId,
                force: true,
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
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 max-w-lg w-full p-10 text-center">
                    <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-6" />
                    <h1 className="text-xl font-bold text-gray-900 mb-2">Payment successful</h1>
                    <p className="text-sm text-gray-500 mb-6">
                        Your payment has been confirmed. You can now continue to My Bookings.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() =>
                                navigate('/traveller/bookings', {
                                    replace: true,
                                    state: { paymentSuccess: true, bookingId },
                                })
                            }
                            className="w-full"
                        >
                            Go to My Bookings
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => navigate(`/booking/ticket/${bookingId}`)}
                            className="w-full"
                        >
                            View Ticket
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // Determine the right message based on what we know
    const pendingMessage = (() => {
        if (callbackFailed) {
            return 'The server could not confirm your payment automatically. If you completed payment on Chapa, click "Check status now" or wait a moment.';
        }
        if (callbackDone) {
            return 'Payment reported to the server. Waiting for booking confirmation…';
        }
        return 'If you paid on Chapa, confirmation may take a few seconds.';
    })();

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
                            This booking was not confirmed. You can try Chapa again or view your bookings.
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
                        {callbackFailed
                            ? <AlertCircle className="w-14 h-14 text-amber-500 mx-auto mb-6" />
                            : <Loader2 className="w-14 h-14 text-amber-500 animate-spin mx-auto mb-6" />
                        }
                        <h1 className="text-xl font-bold text-gray-900 mb-2">
                            {callbackFailed ? 'Confirmation pending' : 'Payment pending'}
                        </h1>
                        <p className="text-sm text-gray-500 mb-2">{pendingMessage}</p>
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
