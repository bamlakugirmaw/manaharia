import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BusLayout from '../components/seat-map/BusLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS } from '../data/mock-db';
import { Check } from 'lucide-react';
import BookingSummary from '../components/booking/BookingSummary';
import ProgressStepper from '../components/booking/ProgressStepper';

import { useAuth } from '../contexts/AuthContext';

export default function SeatSelection() {
    const { isAuthenticated } = useAuth();
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Find trip details
    const trip = TRIPS.find(t => t.id === tripId);

    // Debug: Log the tripId to see what's being passed
    console.log('Trip ID from URL:', tripId);
    console.log('Found trip:', trip);
    console.log('All trip IDs:', TRIPS.map(t => t.id));

    if (!trip) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Trip Not Found</h1>
                    <p className="text-gray-500 mb-6">Trip ID: {tripId}</p>
                    <Button onClick={() => navigate('/routes')}>Back to Routes</Button>
                </div>
            </div>
        );
    }

    // Mock booked seats
    const BOOKED_SEATS = ['A1', 'A2', 'C4', 'D3'];

    const handleToggleSeat = (seatId) => {
        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(id => id !== seatId));
        } else {
            if (selectedSeats.length >= 5) {
                alert("You can select up to 5 seats only.");
                return;
            }
            setSelectedSeats([...selectedSeats, seatId]);
        }
    };

    const totalPrice = selectedSeats.length * trip.price;

    const handleContinue = () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        navigate('/booking/passenger', {
            state: {
                tripId,
                selectedSeats,
                totalPrice
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <ProgressStepper currentStep={2} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left Column: Seat Map */}
                    <div className="lg:col-span-3">
                        {/* Seat Selection Card */}
                        <Card className="p-10 flex flex-col items-center bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[3rem]">
                            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight mb-2">Choose Your Seats</h2>
                            <p className="text-[11px] text-gray-400 font-bold uppercase tracking-[0.2em] mb-12">Click on available seats to select them</p>
                            <BusLayout
                                selectedSeats={selectedSeats}
                                onToggleSeat={handleToggleSeat}
                                bookedSeats={BOOKED_SEATS}
                            />
                        </Card>
                    </div>

                    {/* Right Column: Trip Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <BookingSummary
                            tripId={tripId}
                            selectedSeats={selectedSeats}
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
