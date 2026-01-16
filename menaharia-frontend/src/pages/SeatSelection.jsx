import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BusLayout from '../components/seat-map/BusLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS, OPERATORS } from '../data/mock-db';
import { ArrowLeft, Check } from 'lucide-react';
import BookingSummary from '../components/booking/BookingSummary';
import ProgressStepper from '../components/booking/ProgressStepper';

export default function SeatSelection() {
    const { tripId } = useParams();
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);

    // Find trip details
    const trip = TRIPS.find(t => t.id === tripId);
    const operator = OPERATORS.find(op => op.id === trip?.operatorId);

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
                <Button variant="ghost" className="mb-6 pl-0 text-gray-500 hover:text-primary transition-colors text-xs font-bold" onClick={() => navigate(-1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

                    {/* Left Column: Seat Map */}
                    <div className="lg:col-span-3">
                        {/* Trip Info Header */}
                        <Card className="p-6 mb-6 bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <h2 className="text-2xl font-extrabold text-gray-900 mb-4">{operator?.name}</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Route</p>
                                            <p className="font-semibold text-gray-900">{trip?.from} → {trip?.to}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Date</p>
                                            <p className="font-semibold text-gray-900">{trip?.date ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Departure</p>
                                            <p className="font-semibold text-gray-900">{trip?.departureTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Arrival</p>
                                            <p className="font-semibold text-gray-900">{trip?.arrivalTime}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="ml-6">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${trip?.busType === 'Luxury' ? 'bg-purple-100 text-purple-700' :
                                        trip?.busType === 'VIP' ? 'bg-blue-100 text-blue-700' :
                                            'bg-gray-100 text-gray-700'
                                        }`}>
                                        {trip?.busType}
                                    </span>
                                </div>
                            </div>
                        </Card>

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
