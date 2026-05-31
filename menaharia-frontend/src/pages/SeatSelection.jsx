import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BusLayout from '../components/seat-map/BusLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check, AlertCircle, RefreshCw } from 'lucide-react';
import BookingSummary from '../components/booking/BookingSummary';
import ProgressStepper from '../components/booking/ProgressStepper';
import { useAuth } from '../contexts/AuthContext';
import { useTripSeatContext } from '../hooks/useTripSeatContext';
import { resolveSelectedSeats } from '../lib/tripSeats';
import { saveBookingFlow } from '../lib/bookingFlow';

export default function SeatSelection() {
    const { isAuthenticated } = useAuth();
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);

    const {
        trip,
        tripLoading,
        tripError,
        tripFetching,
        refetchTrip,
        tripSeats,
        seatIdMap,
        bookedSeats,
        canSelectSeats,
        unavailableMessage,
        needsNewTrip,
        availableCount,
    } = useTripSeatContext(tripId);

    useEffect(() => {
        if (trip?.id) {
            saveBookingFlow({ tripId: trip.id, trip, step: 'seats' });
        }
    }, [trip]);

    if (tripLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (tripError || !trip) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Trip Not Found</h1>
                    <Button onClick={() => navigate('/search')}>Back to Search</Button>
                </div>
            </div>
        );
    }

    const handleToggleSeat = (seatLabel) => {
        if (!canSelectSeats) return;

        const alreadySelected = selectedSeats.some((s) => s.label === seatLabel);
        if (alreadySelected) {
            setSelectedSeats((prev) => prev.filter((s) => s.label !== seatLabel));
        } else {
            if (selectedSeats.length >= 5) {
                alert('You can select up to 5 seats only.');
                return;
            }
            const tripSeatId = seatIdMap[seatLabel] ?? null;
            if (!tripSeatId) return;
            setSelectedSeats((prev) => [...prev, { label: seatLabel, tripSeatId }]);
        }
    };

    const selectedLabels = selectedSeats.map((s) => s.label);
    const totalPrice = selectedSeats.length * (trip.price ?? 0);

    const handleContinue = () => {
        if (!canSelectSeats) return;

        const resolved = resolveSelectedSeats(selectedSeats, seatIdMap);
        if (resolved.some((s) => !s.tripSeatId)) {
            alert('Some seats are no longer available. Refresh and try again.');
            refetchTrip();
            return;
        }

        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/booking/seats/${tripId}` } } });
            return;
        }

        const payload = { trip, tripId, selectedSeats: resolved, totalPrice };
        saveBookingFlow({ ...payload, step: 'passenger' });
        navigate('/booking/passenger', { state: payload });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={2} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                {!canSelectSeats && unavailableMessage && (
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex gap-3 text-amber-900 text-sm">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <div>
                            <p>{unavailableMessage}</p>
                            {needsNewTrip && (
                                <p className="mt-2 text-xs font-semibold">
                                    Operator steps: Fleet → Generate seats on bus → Bookings → Add New Trip Schedule.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {canSelectSeats && (
                    <div className="mb-4 flex items-center justify-between text-sm text-gray-500">
                        <span>{availableCount} seat(s) available on this trip</span>
                        <button
                            type="button"
                            onClick={() => refetchTrip()}
                            className="inline-flex items-center gap-1 text-primary font-bold text-xs"
                            disabled={tripFetching}
                        >
                            <RefreshCw size={14} className={tripFetching ? 'animate-spin' : ''} />
                            Refresh availability
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <Card className="p-10 flex flex-col items-center bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[3rem]">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">
                                Choose Your Seats
                            </h2>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-12">
                                Seats are reserved when you confirm booking
                            </p>
                            <BusLayout
                                selectedSeats={selectedLabels}
                                onToggleSeat={handleToggleSeat}
                                bookedSeats={bookedSeats}
                                tripSeats={tripSeats}
                                disabled={!canSelectSeats}
                            />
                        </Card>
                    </div>

                    <div className="lg:col-span-2 space-y-6">
                        <BookingSummary trip={trip} selectedSeats={selectedLabels} />
                        <Button
                            fullWidth
                            className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base"
                            disabled={selectedSeats.length === 0 || !canSelectSeats}
                            onClick={handleContinue}
                        >
                            Continue to Details <Check className="ml-3 h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
