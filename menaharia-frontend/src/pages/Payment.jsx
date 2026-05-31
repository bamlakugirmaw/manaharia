import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chapaLogo from '../assets/chapa-logo.jpg';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { useCreateBooking } from '../hooks/useBookings';
import { useAuth } from '../contexts/AuthContext';
import { extractErrorMessage } from '../lib/api';
import { fetchTripSeatContext, resolveSelectedSeats } from '../lib/tripSeats';
import { loadBookingFlow, clearBookingFlow } from '../lib/bookingFlow';

const METHOD_MAP = {
    chapa: 'CHAPA',
    telebirr: 'TELEBIRR',
    cbe: 'CBE',
};

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

    const { mutateAsync: createBooking, isPending: loading } = useCreateBooking();

    const [paymentMethod, setPaymentMethod] = useState('chapa');
    const [errorMsg, setErrorMsg] = useState('');

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

    const paymentMethods = [
        {
            id: 'chapa',
            name: 'Chapa',
            description: 'Payment gateway coming soon — seats reserved on confirm (pending payment)',
            iconUrl: chapaLogo,
        },
    ];

    const handleConfirmBooking = async () => {
        setErrorMsg('');

        try {
            const ctx = await fetchTripSeatContext(tripId);
            const resolved = resolveSelectedSeats(selectedSeats, ctx.seatIdMap);
            const missing = resolved.filter((s) => !s.tripSeatId);

            if (missing.length > 0) {
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

            const booking = await createBooking({
                tripId,
                paymentMethod: METHOD_MAP[paymentMethod] ?? 'CHAPA',
                travelers,
            });

            const bookingId = booking?.id ?? booking?.bookingId;
            if (!bookingId) {
                throw new Error('Booking was saved but no booking ID was returned.');
            }

            clearBookingFlow();

            navigate(`/booking/ticket/${bookingId}`, {
                state: {
                    bookingId,
                    booking,
                    trip: ctx.trip ?? trip,
                    tripId,
                    selectedSeats: resolved,
                    passengerDetails,
                    totalPrice,
                    paymentSkipped: true,
                },
            });
        } catch (err) {
            setErrorMsg(extractErrorMessage(err, 'Could not complete booking. Please try again.'));
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={4} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your Booking</h1>
                            <p className="text-sm text-gray-500 mb-6">
                                POST /bookings reserves your seats and creates a pending booking. Payment gateway
                                integration will complete the flow later.
                            </p>

                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                {paymentMethods.map((method) => {
                                    const isSelected = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            type="button"
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                                                isSelected
                                                    ? 'border-[#0EA5E9] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#0B1536] overflow-hidden shadow-sm border border-gray-100 p-1">
                                                <img
                                                    src={method.iconUrl}
                                                    alt={method.name}
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 text-base">{method.name}</div>
                                                <div className="text-sm text-gray-600">{method.description}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-sm text-amber-800 mb-6">
                                Stale reservations are released by the backend job{' '}
                                <code className="text-xs">POST /jobs/expire-seat-reservations</code>. Complete payment
                                when the gateway is enabled.
                            </div>

                            <Button
                                fullWidth
                                className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg"
                                onClick={handleConfirmBooking}
                                disabled={loading || !isAuthenticated}
                                isLoading={loading}
                            >
                                {loading ? 'Reserving seats…' : `Confirm Booking — ETB ${totalPrice?.toLocaleString() ?? 0}`}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <BookingSummary
                            trip={trip}
                            tripId={tripId}
                            selectedSeats={selectedSeats.map((s) => (typeof s === 'object' ? s.label : s))}
                            showEncryption
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
