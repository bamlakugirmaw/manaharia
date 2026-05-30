import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chapaLogo from '../assets/chapa-logo.jpg';
import { Button } from '../components/ui/Button';
import { ArrowRight } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { bookingsApi } from '../api/bookings.api';
import { paymentsApi } from '../api/payments.api';

// Payment method → backend enum value
const METHOD_MAP = {
    chapa: 'CHAPA',
    telebirr: 'TELEBIRR',
    cbe: 'CBE',
};

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const {
        trip,
        tripId: stateTripId,
        selectedSeats = [],   // array of { label, tripSeatId } or plain strings
        totalPrice,
        passengerDetails,
    } = location.state || {};

    const tripId = stateTripId ?? trip?.id;

    const [loading,       setLoading]       = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('chapa');
    const [errorMsg,      setErrorMsg]      = useState('');

    if (!tripId) {
        navigate('/');
        return null;
    }

    const paymentMethods = [
        {
            id: 'chapa',
            name: 'Chapa',
            description: 'Pay securely with your Card, Telebirr, CBE Birr, and more via Chapa',
            iconUrl: chapaLogo,
        },
    ];

    const handlePayment = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            // ── Step 1: Build travelers array ─────────────────────────────────
            // Each seat needs a tripSeatId. If it's null (seats API didn't load),
            // we still send the request — the backend will reject with a clear error.
            const travelers = selectedSeats.map(seat => {
                const seatLabel   = typeof seat === 'object' ? seat.label   : seat;
                const tripSeatId  = typeof seat === 'object' ? seat.tripSeatId : null;
                return {
                    tripSeatId:       tripSeatId,
                    fullName:         passengerDetails?.fullName         ?? '',
                    email:            passengerDetails?.email            ?? '',
                    phone:            passengerDetails?.phone            ?? '',
                    emergencyContact: passengerDetails?.emergencyContact ?? '',
                    // Keep seatLabel for display purposes (not sent to backend)
                    _seatLabel: seatLabel,
                };
            });

            // ── Step 2: Create booking ────────────────────────────────────────
            // POST /v1/bookings — reserves seats, creates booking, inits payment
            const bookingPayload = {
                tripId,
                paymentMethod: METHOD_MAP[paymentMethod] ?? 'CHAPA',
                travelers: travelers.map(({ _seatLabel, ...t }) => t),
            };

            const booking = await bookingsApi.createBooking(bookingPayload);
            const bookingId = booking.id ?? booking.bookingId;

            // ── Step 3: Initiate payment ──────────────────────────────────────
            // POST /v1/payments/initiate — returns a payment URL or reference
            let paymentUrl = null;
            try {
                const paymentResult = await paymentsApi.initiatePayment({
                    method:    METHOD_MAP[paymentMethod] ?? 'CHAPA',
                    bookingId: bookingId,
                });
                paymentUrl = paymentResult?.paymentUrl ?? paymentResult?.checkoutUrl ?? null;
            } catch (payErr) {
                // Payment initiation failed but booking was created.
                // Navigate to ticket page anyway — the booking exists as PENDING.
                console.warn('Payment initiation failed:', payErr);
            }

            // ── Step 4: Navigate ──────────────────────────────────────────────
            // If the gateway returned a redirect URL, open it.
            // Otherwise go straight to the ticket confirmation page.
            if (paymentUrl) {
                window.location.href = paymentUrl;
            } else {
                navigate(`/booking/ticket/${bookingId}`, {
                    state: {
                        bookingId,
                        booking,
                        trip,
                        tripId,
                        selectedSeats,
                        passengerDetails,
                        totalPrice,
                    },
                });
            }
        } catch (err) {
            const msg =
                err?.response?.data?.message ??
                (Array.isArray(err?.response?.data?.message)
                    ? err.response.data.message.join('. ')
                    : null) ??
                'Payment failed. Please try again.';
            setErrorMsg(Array.isArray(msg) ? msg.join('. ') : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={4} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Payment Panel */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h1>

                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {errorMsg}
                                </div>
                            )}

                            <div className="space-y-4 mb-8">
                                {paymentMethods.map(method => {
                                    const isSelected = paymentMethod === method.id;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${
                                                isSelected
                                                    ? 'border-[#0EA5E9] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                            }`}
                                        >
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#0B1536] overflow-hidden shadow-sm border border-gray-100 p-1">
                                                <img src={method.iconUrl} alt={method.name} className="w-full h-full object-contain" />
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 text-base">{method.name}</div>
                                                <div className="text-sm text-gray-600">{method.description}</div>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0EA5E9]' : 'border-gray-300'}`}>
                                                {isSelected && <div className="w-3 h-3 rounded-full bg-[#0EA5E9]" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Instructions */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-base text-gray-900 mb-4">Payment Instructions</h3>
                                <div className="space-y-3">
                                    {[
                                        'Click "Proceed to Payment" below',
                                        `You will be redirected to ${paymentMethods.find(m => m.id === paymentMethod)?.name} payment page`,
                                        'Complete your transaction securely on the Chapa gateway',
                                        'You will receive confirmation via SMS and email',
                                    ].map((step, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-gray-700 pt-0.5">{step}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                fullWidth
                                className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-6"
                                onClick={handlePayment}
                                disabled={loading}
                                isLoading={loading}
                            >
                                {loading ? 'Processing Payment...' : `Pay ETB ${totalPrice?.toLocaleString() ?? 0}`}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>

                    {/* Booking Summary Sidebar */}
                    <div className="lg:col-span-2">
                        <BookingSummary
                            trip={trip}
                            tripId={tripId}
                            selectedSeats={selectedSeats.map(s => (typeof s === 'object' ? s.label : s))}
                            showEncryption
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
