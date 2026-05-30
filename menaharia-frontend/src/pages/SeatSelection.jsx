import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BusLayout from '../components/seat-map/BusLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Check } from 'lucide-react';
import BookingSummary from '../components/booking/BookingSummary';
import ProgressStepper from '../components/booking/ProgressStepper';
import { useAuth } from '../contexts/AuthContext';
import { useTrip } from '../hooks/useTrips';
import { useSeats } from '../hooks/useSeats';

export default function SeatSelection() {
    const { isAuthenticated } = useAuth();
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]); // array of { label, tripSeatId }

    // ── Fetch trip from backend ───────────────────────────────────────────────
    // GET /v1/trips/:id (public)
    const { data: trip, isLoading: tripLoading, isError: tripError } = useTrip(tripId);

    // ── Fetch seats for this bus ──────────────────────────────────────────────
    // GET /v1/seats?busId=  (public)
    // The backend materialises TripSeats when a trip is created.
    // We need the tripSeatId per seat label to pass to POST /v1/bookings.
    const busId = trip?.bus?.id ?? trip?.busId;
    const { data: seatsResponse } = useSeats(busId);

    // Build a map: seatNumber (label) → tripSeatId
    // The backend seat object: { id, seatNumber, seatType, busId, ... }
    const seatIdMap = useMemo(() => {
        const seats = Array.isArray(seatsResponse)
            ? seatsResponse
            : (seatsResponse?.data ?? []);
        const map = {};
        seats.forEach(s => { map[s.seatNumber] = s.id; });
        return map;
    }, [seatsResponse]);

    // Seats that are already booked (status !== AVAILABLE)
    const bookedSeats = useMemo(() => {
        const seats = Array.isArray(seatsResponse)
            ? seatsResponse
            : (seatsResponse?.data ?? []);
        return seats
            .filter(s => s.status && s.status !== 'AVAILABLE')
            .map(s => s.seatNumber);
    }, [seatsResponse]);

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
                    <p className="text-gray-500 mb-6">Trip ID: {tripId}</p>
                    <Button onClick={() => navigate('/search')}>Back to Search</Button>
                </div>
            </div>
        );
    }

    const handleToggleSeat = (seatLabel) => {
        const alreadySelected = selectedSeats.some(s => s.label === seatLabel);
        if (alreadySelected) {
            setSelectedSeats(prev => prev.filter(s => s.label !== seatLabel));
        } else {
            if (selectedSeats.length >= 5) {
                alert('You can select up to 5 seats only.');
                return;
            }
            // tripSeatId may be undefined if seats haven't loaded yet — that's OK,
            // PassengerDetails will still work; Payment will use the label as fallback.
            const tripSeatId = seatIdMap[seatLabel] ?? null;
            setSelectedSeats(prev => [...prev, { label: seatLabel, tripSeatId }]);
        }
    };

    // BusLayout expects an array of label strings for selectedSeats and bookedSeats
    const selectedLabels = selectedSeats.map(s => s.label);
    const totalPrice     = selectedSeats.length * (trip.price ?? 0);

    const handleContinue = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: { pathname: `/booking/seats/${tripId}` } } });
            return;
        }
        navigate('/booking/passenger', {
            state: { trip, tripId, selectedSeats, totalPrice },
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={2} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Seat Map */}
                    <div className="lg:col-span-3">
                        <Card className="p-10 flex flex-col items-center bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[3rem]">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Choose Your Seats</h2>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-12">
                                Click on available seats to select them
                            </p>
                            <BusLayout
                                selectedSeats={selectedLabels}
                                onToggleSeat={handleToggleSeat}
                                bookedSeats={bookedSeats}
                            />
                        </Card>
                    </div>

                    {/* Summary + CTA */}
                    <div className="lg:col-span-2 space-y-6">
                        <BookingSummary
                            trip={trip}
                            selectedSeats={selectedLabels}
                        />
                        <Button
                            fullWidth
                            className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-xl shadow-primary/20 transition-all transform hover:scale-[1.02] active:scale-95 disabled:hover:scale-100"
                            disabled={selectedSeats.length === 0}
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
