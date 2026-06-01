import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chapaLogo from '../assets/chapa-logo.jpg';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { useInitiatePayment } from '../hooks/usePayments';
import { useAuth } from '../contexts/AuthContext';
import { bookingsApi } from '../api/bookings.api';
import { extractErrorMessage } from '../lib/api';
import { isBookingPaid } from '../lib/bookingUi';
import { reserveBooking, DEFAULT_PAYMENT_METHOD } from '../lib/bookingCheckout';
import {
    loadBookingFlow,
    savePendingPayment,
    saveBookingFlow,
} from '../lib/bookingFlow';
import { getChapaReturnPageUrl } from '../lib/appUrl';
import { buildSeatTypeMap, totalPriceForSelectedSeats } from '../lib/seatPricing';
import { clearPaymentInitiationLock } from '../lib/paymentInitiation';

export default function Payment() {
    const loc = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const saved = loadBookingFlow();
    const state = loc.state ?? saved ?? {};
    const {
        trip,
        tripId: stateTripId,
        selectedSeats = [],
        totalPrice,
        passengerDetails,
        bookingId: stateBookingId,
        bookingReference: stateBookingRef,
        reservedUntil: stateReservedUntil,
    } = state;

    const tripId = stateTripId ?? trip?.id;
    const preCreatedBookingId = stateBookingId ?? saved?.bookingId ?? null;

    const { mutateAsync: initiatePayment, isPending: initiating } = useInitiatePayment();

    const [errorMsg, setErrorMsg] = useState('');
    const [step, setStep] = useState('idle'); // idle | redirecting
    const [reservation, setReservation] = useState(
        preCreatedBookingId
            ? {
                bookingId: preCreatedBookingId,
                bookingReference: stateBookingRef,
                reservedUntil: stateReservedUntil,
                totalAmount: totalPrice,
            }
            : null,
    );
    const checkoutLock = useRef(false);
    const autoStarted = useRef(false);

    useEffect(() => {
        if (!tripId) {
            navigate('/search');
            return;
        }
        if (!isAuthenticated) {
            navigate('/login', {
                state: { from: { pathname: '/booking/payment', state } },
            });
            return;
        }
        if (!selectedSeats?.length || !passengerDetails) {
            navigate(`/booking/passenger`, {
                state: { trip, tripId, selectedSeats, totalPrice, passengerDetails },
            });
        }
    }, [tripId, isAuthenticated, navigate, state, selectedSeats, passengerDetails, trip, totalPrice]);

    useEffect(() => {
        if (!preCreatedBookingId || reservation?.booking) return;
        bookingsApi.getBookingById(preCreatedBookingId)
            .then((booking) => {
                if (isBookingPaid(booking)) {
                    navigate(`/booking/payment/return?bookingId=${preCreatedBookingId}`, { replace: true });
                    return;
                }
                setReservation({
                    bookingId: preCreatedBookingId,
                    booking,
                    bookingReference: booking?.bookingReference ?? stateBookingRef,
                    reservedUntil: booking?.reservedUntil ?? stateReservedUntil,
                    totalAmount: booking?.totalAmount ?? totalPrice,
                });
            })
            .catch(() => {});
    }, [preCreatedBookingId, reservation?.booking, navigate, stateBookingRef, stateReservedUntil, totalPrice]);

    const startChapaCheckout = async () => {
        if (checkoutLock.current) return;
        checkoutLock.current = true;
        setErrorMsg('');
        setStep('redirecting');

        try {
            let bookingId = preCreatedBookingId ?? reservation?.bookingId;
            let bookingRecord = reservation?.booking;
            let reservedUntil = reservation?.reservedUntil;
            let amount = reservation?.totalAmount ?? totalPrice;

            if (!bookingId) {
                setStep('idle');
                const result = await reserveBooking({
                    tripId,
                    trip,
                    selectedSeats,
                    passengerDetails,
                });
                bookingId = result.bookingId;
                bookingRecord = result.booking;
                reservedUntil = result.reservedUntil;
                amount = result.totalAmount;
            }

            if (!bookingId) {
                throw new Error('Booking ID is missing. Go back and try again.');
            }

            setReservation({
                bookingId,
                booking: bookingRecord,
                bookingReference: bookingRecord?.bookingReference ?? stateBookingRef,
                reservedUntil,
                totalAmount: amount,
            });

            savePendingPayment({
                bookingId,
                tripId,
                trip,
                selectedSeats,
                passengerDetails,
                totalPrice: amount,
                returnPageUrl: getChapaReturnPageUrl(bookingId),
            });

            saveBookingFlow({
                trip,
                tripId,
                selectedSeats,
                totalPrice: amount,
                passengerDetails,
                bookingId,
                step: 'payment',
            });

            const checkout = await initiatePayment({
                method: DEFAULT_PAYMENT_METHOD,
                bookingId,
            });

            if (checkout?.gatewayReference) {
                savePendingPayment({
                    bookingId,
                    tripId,
                    trip,
                    selectedSeats,
                    passengerDetails,
                    totalPrice: amount,
                    gatewayReference: checkout.gatewayReference,
                    returnPageUrl: getChapaReturnPageUrl(bookingId),
                });
            }

            if (!checkout?.paymentUrl) {
                clearPaymentInitiationLock(bookingId);
                setStep('idle');
                setErrorMsg(
                    checkout?.message ??
                        'Booking reserved, but Chapa checkout URL was not returned. Retry from My Bookings.',
                );
                navigate(`/booking/payment/return?bookingId=${bookingId}`, { replace: false });
                return;
            }

            window.location.href = checkout.paymentUrl;
        } catch (err) {
            setStep('idle');
            setErrorMsg(extractErrorMessage(err, 'Could not start payment. Please try again.'));
        } finally {
            checkoutLock.current = false;
        }
    };

    useEffect(() => {
        if (!preCreatedBookingId || autoStarted.current) return;
        autoStarted.current = true;
        startChapaCheckout();
        // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when arriving with bookingId
    }, [preCreatedBookingId]);

    if (!tripId) {
        return null;
    }

    const computedTotal = totalPriceForSelectedSeats(
        trip?.price ?? 0,
        selectedSeats,
        buildSeatTypeMap(trip?.tripSeats ?? [])
    );
    const displayTotal = reservation?.totalAmount ?? computedTotal ?? totalPrice ?? 0;
    const loading = initiating || step === 'redirecting';

    const reservedUntilLabel = reservation?.reservedUntil
        ? new Date(reservation.reservedUntil).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        })
        : null;

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={4} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Pay with Chapa</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                Your seats are reserved. Complete payment on Chapa&apos;s secure checkout in ETB.
                            </p>

                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="border-2 border-[#0EA5E9] bg-blue-50/50 rounded-2xl p-5 mb-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[#0B1536] flex items-center justify-center shrink-0 p-2">
                                        <img
                                            src={chapaLogo}
                                            alt="Chapa"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="font-bold text-gray-900 text-lg">Chapa</h2>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Cards, mobile money, and bank transfer — powered by Chapa.
                                        </p>
                                        <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                                                Encrypted checkout on chapa.co
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <Clock size={14} className="text-amber-600 shrink-0" />
                                                Seats held while payment is pending
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {reservation && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
                                    <p className="font-semibold">Booking reserved — payment pending</p>
                                    <p className="mt-1 font-mono text-xs">
                                        {reservation.bookingReference ?? reservation.bookingId}
                                    </p>
                                    {reservedUntilLabel && (
                                        <p className="mt-1 text-xs">
                                            Pay before {reservedUntilLabel} to keep your seats.
                                        </p>
                                    )}
                                </div>
                            )}

                            <Button
                                fullWidth
                                className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg"
                                onClick={startChapaCheckout}
                                disabled={loading || !isAuthenticated}
                                isLoading={loading}
                            >
                                {step === 'redirecting'
                                    ? 'Opening Chapa checkout…'
                                    : (
                                        <>
                                            Pay ETB {displayTotal.toLocaleString()} with Chapa
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                            </Button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                Payment is confirmed only after Chapa notifies our server. Your booking stays pending until then.
                            </p>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <BookingSummary
                            trip={trip}
                            tripId={tripId}
                            selectedSeats={selectedSeats}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
