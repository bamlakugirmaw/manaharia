import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chapaLogo from '../assets/chapa-logo.jpg';
import { Button } from '../components/ui/Button';
import { ArrowRight, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { useCreateBooking } from '../hooks/useBookings';
import { useInitiatePayment } from '../hooks/usePayments';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../lib/api';
import { fetchTripSeatContext, resolveSelectedSeats } from '../lib/tripSeats';
import {
    loadBookingFlow,
    savePendingPayment,
} from '../lib/bookingFlow';
import { getChapaReturnPageUrl } from '../lib/appUrl';
import { buildSeatTypeMap, totalPriceForSelectedSeats } from '../lib/seatPricing';

/** Backend payment_method enum on CreateBookingDto / InitiatePaymentDto */
const PAYMENT_METHOD = 'CHAPA';

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
    } = state;

    const tripId = stateTripId ?? trip?.id;

    const { mutateAsync: createBooking, isPending: creating } = useCreateBooking();
    const { mutateAsync: initiatePayment, isPending: initiating } = useInitiatePayment();

    const [errorMsg, setErrorMsg] = useState('');
    const [step, setStep] = useState('idle'); // idle | reserving | redirecting
    const [reservation, setReservation] = useState(null);

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
            navigate(`/booking/seats/${tripId}`);
        }
    }, [tripId, isAuthenticated, navigate, state, selectedSeats, passengerDetails]);

    if (!tripId) {
        return null;
    }

    const computedTotal = totalPriceForSelectedSeats(
        trip?.price ?? 0,
        selectedSeats,
        buildSeatTypeMap(trip?.tripSeats ?? [])
    );
    const displayTotal = computedTotal || totalPrice || 0;

    const loading = creating || initiating || step !== 'idle';

    const handlePayWithChapa = async () => {
        setErrorMsg('');
        setStep('reserving');

        try {
            const ctx = await fetchTripSeatContext(tripId);
            const resolved = resolveSelectedSeats(selectedSeats, ctx.seatIdMap);
            const seatTypeMap = buildSeatTypeMap(ctx.tripSeats);
            const amount = totalPriceForSelectedSeats(
                ctx.trip?.price ?? trip?.price ?? 0,
                resolved,
                seatTypeMap
            );

            const missing = resolved.filter((s) => !s.tripSeatId);
            if (missing.length > 0) {
                setStep('idle');
                setErrorMsg(
                    ctx.unavailableMessage ??
                        'Selected seats are no longer available. Go back and choose different seats.'
                );
                return;
            }

            const travelers = resolved.map((seat) => ({
                tripSeatId: seat.tripSeatId,
                fullName: passengerDetails?.fullName ?? '',
                email: passengerDetails?.email ?? '',
                phone: passengerDetails?.phone ?? '',
                emergencyContact: passengerDetails?.emergencyContact ?? '',
            }));

            const result = await createBooking({
                tripId,
                paymentMethod: PAYMENT_METHOD,
                travelers,
            });

            const bookingId = result?.bookingId;
            if (!bookingId) {
                throw new Error('Booking was created but no booking ID was returned.');
            }

            setReservation({
                bookingId,
                booking: result.booking,
                payment: result.payment,
                reservedUntil: result.reservedUntil,
                totalAmount: result.totalAmount ?? amount,
            });

            savePendingPayment({
                bookingId,
                tripId,
                trip: ctx.trip ?? trip,
                selectedSeats: resolved,
                passengerDetails,
                totalPrice: result.totalAmount ?? amount,
                returnPageUrl: getChapaReturnPageUrl(bookingId),
            });

            if (import.meta.env.DEV) {
                console.info(
                    '[Chapa] Backend FRONTEND_URL should point to:',
                    getChapaReturnPageUrl(bookingId),
                );
            }

            setStep('redirecting');

            const checkout = await initiatePayment({
                method: PAYMENT_METHOD,
                bookingId,
                customerReference: passengerDetails?.email ?? undefined,
            });

            if (!checkout?.paymentUrl) {
                setStep('idle');
                setErrorMsg(
                    checkout?.message ??
                        'Booking reserved, but Chapa checkout URL was not returned. Try again from My Bookings.'
                );
                navigate(`/booking/payment/return?bookingId=${bookingId}`, { replace: false });
                return;
            }

            window.location.href = checkout.paymentUrl;
        } catch (err) {
            setStep('idle');
            setErrorMsg(extractErrorMessage(err, 'Could not complete booking. Please try again.'));
        }
    };

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
                                We reserve your seats first, then redirect you to Chapa&apos;s secure checkout to
                                complete payment in ETB.
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
                                                Seats held briefly while you pay
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {reservation && (
                                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-emerald-800">
                                    <p className="font-semibold">Booking reserved</p>
                                    <p className="mt-1 font-mono text-xs">
                                        {reservation.booking?.bookingReference ?? reservation.bookingId}
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
                                onClick={handlePayWithChapa}
                                disabled={loading || !isAuthenticated}
                                isLoading={loading}
                            >
                                {step === 'reserving'
                                    ? 'Reserving seats…'
                                    : step === 'redirecting'
                                      ? 'Opening Chapa checkout…'
                                      : (
                                        <>
                                            Pay ETB {displayTotal.toLocaleString()} with Chapa
                                            <ExternalLink className="w-4 h-4 ml-2" />
                                        </>
                                    )}
                            </Button>

                            <p className="text-xs text-gray-400 text-center mt-4">
                                By continuing you agree to complete payment on Chapa. Unpaid reservations may be
                                released automatically.
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
