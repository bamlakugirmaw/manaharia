import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import chapaLogo from '../assets/chapa-logo.jpg';
import { Button } from '../components/ui/Button';
import { CreditCard, Smartphone, Wallet, ArrowRight } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { TRIPS, OPERATORS } from '../data/mock-db';

const MOCK_BOOKINGS = [
    {
        id: 'MEN-2025-12-15-A3B4',
        ticketId: 'TKT-2025-A3B4',
        operator: 'Selam Bus',
        operatorId: 'OP-001',
        busName: 'Selam Coach',
        busPlate: '3-AA-55678',
        route: 'Addis Ababa → Bahir Dar',
        from: 'Addis Ababa',
        to: 'Bahir Dar',
        departure: '08:00 AM',
        arrival: '04:30 PM',
        seatNumber: '3-A',
        date: 'Dec 15, 2025',
        bookingDate: 'Dec 10, 2025',
        passengerName: 'Abebe Kebede',
        passengerPhone: '+251 911 234 567',
        status: 'confirmed',
        paymentStatus: 'Paid',
        amount: 1700,
        driverContact: '+251 922 111 222',
    },
    {
        id: 'MEN-2025-12-20-B5C6',
        ticketId: 'TKT-2025-B5C6',
        operator: 'Sky Bus',
        operatorId: 'OP-002',
        busName: 'Sky Express',
        busPlate: '4-AA-32901',
        route: 'Bahir Dar → Addis Ababa',
        from: 'Bahir Dar',
        to: 'Addis Ababa',
        departure: '02:00 PM',
        arrival: '10:30 PM',
        seatNumber: '5-C',
        date: 'Dec 20, 2025',
        bookingDate: 'Dec 18, 2025',
        passengerName: 'Abebe Kebede',
        passengerPhone: '+251 911 234 567',
        status: 'confirmed',
        paymentStatus: 'Paid',
        amount: 900,
        driverContact: '+251 933 444 555',
    },
    {
        id: 'MEN-2025-11-10-X9Y2',
        ticketId: 'TKT-2025-X9Y2',
        operator: 'Golden Bus',
        operatorId: 'OP-003',
        busName: 'Golden Star Coach',
        busPlate: '2-AA-11234',
        route: 'Addis Ababa → Mekelle',
        from: 'Addis Ababa',
        to: 'Mekelle',
        departure: '06:00 AM',
        arrival: '06:00 PM',
        seatNumber: '7-B',
        date: 'Nov 10, 2025',
        bookingDate: 'Nov 05, 2025',
        passengerName: 'Abebe Kebede',
        passengerPhone: '+251 911 234 567',
        status: 'completed',
        paymentStatus: 'Paid',
        amount: 2100,
        driverContact: null,
    },
];

const formatTime12h = (time24) => {
    if (!time24) return '';
    const [hoursStr, minutesStr] = time24.split(':');
    const hours = parseInt(hoursStr, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours.toString().padStart(2, '0')}:${minutesStr} ${ampm}`;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const year = parts[0];
    const monthIdx = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    return `${months[monthIdx]} ${day}, ${year}`;
};

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, selectedSeats, totalPrice, passengerDetails } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('chapa');

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
            color: 'bg-[#0B1536]'
        }
    ];

    const handlePayment = () => {
        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            // Generate a Mock Booking ID with date-time format
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
            const bookingId = `MEN-${dateStr}-${randomId}`;

            // Create booking records and store them in localStorage
            try {
                const trip = TRIPS.find(t => t.id === tripId);
                const operator = OPERATORS.find(op => op.id === trip?.operatorId);
                const operatorName = operator ? operator.name : 'Unknown Operator';
                const busName = `${operatorName} Coach`;
                const route = trip ? `${trip.from} → ${trip.to}` : '';

                const newBookings = (selectedSeats || []).map((seat) => {
                    const suffix = selectedSeats.length > 1 ? `-${seat}` : '';
                    const seatBookingId = `${bookingId}${suffix}`;
                    const seatTicketId = `TKT-${dateStr.replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

                    return {
                        id: seatBookingId,
                        ticketId: seatTicketId,
                        operator: operatorName,
                        operatorId: trip?.operatorId || 'OP-001',
                        busName: busName,
                        busPlate: `3-AA-${Math.floor(10000 + Math.random() * 90000)}`,
                        route: route,
                        from: trip?.from || '',
                        to: trip?.to || '',
                        departure: formatTime12h(trip?.departureTime),
                        arrival: formatTime12h(trip?.arrivalTime),
                        seatNumber: seat,
                        date: formatDate(trip?.date),
                        bookingDate: formatDate(dateStr),
                        passengerName: passengerDetails?.fullName || 'Abebe Kebede',
                        passengerPhone: passengerDetails?.phone || '+251 911 234 567',
                        status: 'confirmed',
                        paymentStatus: 'Paid',
                        amount: trip?.price || 0,
                        driverContact: '+251 922 111 222',
                    };
                });

                let currentBookings = [];
                const local = localStorage.getItem('userBookings');
                if (local) {
                    try {
                        currentBookings = JSON.parse(local);
                    } catch (e) {
                        console.error(e);
                        currentBookings = [...MOCK_BOOKINGS];
                    }
                } else {
                    currentBookings = [...MOCK_BOOKINGS];
                }

                const updatedBookings = [...newBookings, ...currentBookings];
                localStorage.setItem('userBookings', JSON.stringify(updatedBookings));
            } catch (err) {
                console.error('Error saving booking to localStorage:', err);
            }

            navigate(`/booking/ticket/${bookingId}`, {
                state: {
                    bookingId,
                    tripId,
                    selectedSeats,
                    passengerDetails,
                    totalPrice
                }
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Progress Stepper */}
            <ProgressStepper currentStep={4} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Main Content - Payment */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h1>

                            <div className="space-y-4 mb-8">
                                {paymentMethods.map((method) => {
                                    const isSelected = paymentMethod === method.id;

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${isSelected
                                                    ? 'border-[#0EA5E9] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-[#0B1536] overflow-hidden shadow-sm border border-gray-100 p-1">
                                                <img src={method.iconUrl} alt="Chapa Logo" className="w-full h-full object-contain" />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 text-base">{method.name}</div>
                                                <div className="text-sm text-gray-600">{method.description}</div>
                                            </div>

                                            {/* Radio Button */}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0EA5E9]' : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-base text-gray-900 mb-4">Payment Instructions</h3>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            1
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            Click "Proceed to Payment" below
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            2
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            You will be redirected to {paymentMethods.find(m => m.id === paymentMethod)?.name} payment page
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            3
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            Complete your transaction securely on the Chapa gateway
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            4
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            You will receive confirmation via SMS and email
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                fullWidth
                                className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-6"
                                onClick={handlePayment}
                                disabled={loading}
                                isLoading={loading}
                            >
                                {loading ? 'Processing Payment...' : `Pay ETB ${totalPrice?.toLocaleString() || 0}`}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar - Final Summary */}
                    <div className="lg:col-span-2">
                        <BookingSummary
                            tripId={tripId}
                            selectedSeats={selectedSeats}
                            showEncryption={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
