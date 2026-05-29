import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Download, Users, FileText, CheckCircle, XCircle, Printer, Filter, UserPlus, Plus, Ticket } from 'lucide-react';
import { TRIPS } from '../../data/mock-db';
import { cn } from '../../lib/utils';

const MOCK_MANIFEST = [
    // Trip 1
    { id: 'BK-101', tripId: 'trip-1', ticketNo: 'TKT-8821', passenger: 'Abebe Kebede', gender: 'Male', age: 34, seat: 'C1', phone: '0911223344', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-102', tripId: 'trip-1', ticketNo: 'TKT-8823', passenger: 'Kebede Balcha', gender: 'Male', age: 45, seat: 'D1', phone: '0933445566', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-103', tripId: 'trip-1', ticketNo: 'TKT-8824', passenger: 'Sara Tesfaye', gender: 'Female', age: 22, seat: 'D2', phone: '0944556677', status: 'No Show', payment: 'Paid' },
    { id: 'BK-104', tripId: 'trip-1', ticketNo: 'TKT-8899', passenger: 'Hanna Mekonnen', gender: 'Female', age: 29, seat: 'E2', phone: '0912345678', status: 'Pending', payment: 'Paid' },

    // Trip 2
    { id: 'BK-105', tripId: 'trip-2', ticketNo: 'TKT-8822', passenger: 'Marta Tadesse', gender: 'Female', age: 28, seat: 'C2', phone: '0922334455', status: 'Pending', payment: 'Paid' },
    { id: 'BK-106', tripId: 'trip-2', ticketNo: 'TKT-8901', passenger: 'Yonas Alemu', gender: 'Male', age: 31, seat: 'E1', phone: '0912121212', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-107', tripId: 'trip-2', ticketNo: 'TKT-8902', passenger: 'Tigist Haile', gender: 'Female', age: 26, seat: 'F2', phone: '0913131313', status: 'Pending', payment: 'Unpaid' },

    // Trip 3
    { id: 'BK-108', tripId: 'trip-3', ticketNo: 'TKT-8825', passenger: 'Dawit Alemu', gender: 'Male', age: 30, seat: 'E1', phone: '0955667788', status: 'Pending', payment: 'Unpaid' },
    { id: 'BK-109', tripId: 'trip-3', ticketNo: 'TKT-8903', passenger: 'Solomon Tefera', gender: 'Male', age: 40, seat: 'B1', phone: '0914141414', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-110', tripId: 'trip-3', ticketNo: 'TKT-8904', passenger: 'Hiwot Assefa', gender: 'Female', age: 24, seat: 'B2', phone: '0915151515', status: 'Boarded', payment: 'Paid' },

    // Trip 4
    { id: 'BK-111', tripId: 'trip-4', ticketNo: 'TKT-8905', passenger: 'Kassahun Bekele', gender: 'Male', age: 52, seat: 'A1', phone: '0916161616', status: 'Pending', payment: 'Paid' },
    { id: 'BK-112', tripId: 'trip-4', ticketNo: 'TKT-8906', passenger: 'Almaz Wolde', gender: 'Female', age: 48, seat: 'A2', phone: '0917171717', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-113', tripId: 'trip-4', ticketNo: 'TKT-8907', passenger: 'Meron Tadesse', gender: 'Female', age: 25, seat: 'C3', phone: '0918181818', status: 'Boarded', payment: 'Paid' },

    // Trip 5
    { id: 'BK-114', tripId: 'trip-5', ticketNo: 'TKT-8908', passenger: 'Elias Girma', gender: 'Male', age: 33, seat: 'D1', phone: '0919191919', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-115', tripId: 'trip-5', ticketNo: 'TKT-8909', passenger: 'Rahel Belay', gender: 'Female', age: 27, seat: 'D2', phone: '0920202020', status: 'No Show', payment: 'Paid' },
    { id: 'BK-116', tripId: 'trip-5', ticketNo: 'TKT-8910', passenger: 'Samuel Desta', gender: 'Male', age: 36, seat: 'E3', phone: '0921212121', status: 'Pending', payment: 'Unpaid' },

    // Trip 6
    { id: 'BK-117', tripId: 'trip-6', ticketNo: 'TKT-8911', passenger: 'Bethlehem Yilma', gender: 'Female', age: 23, seat: 'B1', phone: '0922222222', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-118', tripId: 'trip-6', ticketNo: 'TKT-8912', passenger: 'Abel Tesfaye', gender: 'Male', age: 29, seat: 'B2', phone: '0923232323', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-119', tripId: 'trip-6', ticketNo: 'TKT-8913', passenger: 'Lydia Getachew', gender: 'Female', age: 26, seat: 'C1', phone: '0924242424', status: 'Pending', payment: 'Paid' },

    // Trip 7
    { id: 'BK-120', tripId: 'trip-7', ticketNo: 'TKT-8914', passenger: 'Fikadu Alemu', gender: 'Male', age: 41, seat: 'A1', phone: '0925252525', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-121', tripId: 'trip-7', ticketNo: 'TKT-8915', passenger: 'Genet Kebede', gender: 'Female', age: 38, seat: 'A2', phone: '0926262626', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-122', tripId: 'trip-7', ticketNo: 'TKT-8916', passenger: 'Henok Tsegaye', gender: 'Male', age: 32, seat: 'B3', phone: '0927272727', status: 'No Show', payment: 'Paid' },

    // Trip 8
    { id: 'BK-123', tripId: 'trip-8', ticketNo: 'TKT-8917', passenger: 'Jerusalem Assefa', gender: 'Female', age: 30, seat: 'C1', phone: '0928282828', status: 'Pending', payment: 'Paid' },
    { id: 'BK-124', tripId: 'trip-8', ticketNo: 'TKT-8918', passenger: 'Kirubel Haile', gender: 'Male', age: 27, seat: 'C2', phone: '0929292929', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-125', tripId: 'trip-8', ticketNo: 'TKT-8919', passenger: 'Liya Bekele', gender: 'Female', age: 24, seat: 'D1', phone: '0930303030', status: 'Boarded', payment: 'Paid' },

    // Trip 9
    { id: 'BK-126', tripId: 'trip-9', ticketNo: 'TKT-8920', passenger: 'Michael Tefera', gender: 'Male', age: 35, seat: 'E1', phone: '0931313131', status: 'Pending', payment: 'Unpaid' },
    { id: 'BK-127', tripId: 'trip-9', ticketNo: 'TKT-8921', passenger: 'Nahom Girma', gender: 'Male', age: 28, seat: 'E2', phone: '0932323232', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-128', tripId: 'trip-9', ticketNo: 'TKT-8922', passenger: 'Rediet Belay', gender: 'Female', age: 25, seat: 'F1', phone: '0933333333', status: 'Boarded', payment: 'Paid' },

    // Trip 10
    { id: 'BK-129', tripId: 'trip-10', ticketNo: 'TKT-8923', passenger: 'Saron Desta', gender: 'Female', age: 22, seat: 'B1', phone: '0934343434', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-130', tripId: 'trip-10', ticketNo: 'TKT-8924', passenger: 'Tamrat Yilma', gender: 'Male', age: 44, seat: 'B2', phone: '0935353535', status: 'Pending', payment: 'Paid' },
    { id: 'BK-131', tripId: 'trip-10', ticketNo: 'TKT-8925', passenger: 'Wondwossen Tesfaye', gender: 'Male', age: 39, seat: 'C3', phone: '0936363636', status: 'Boarded', payment: 'Paid' }
];

export default function BookingManagement() {
    const [trips, setTrips] = useState(TRIPS);
    const [selectedTrip, setSelectedTrip] = useState(TRIPS[0]?.id || null);
    const [manifest, setManifest] = useState(MOCK_MANIFEST);
    const [activeSection, setActiveSection] = useState('manifest'); // 'manifest' | 'manual'

    // Add Trip Schedule Modal Form State
    const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
    const [addRoute, setAddRoute] = useState('Addis Ababa - Bahir Dar');
    const [manualRoute, setManualRoute] = useState('');
    const [addDate, setAddDate] = useState('');
    const [addTime, setAddTime] = useState('');
    const [addBus, setAddBus] = useState('Bus 101 (45 Seats)');
    const [addPrice, setAddPrice] = useState('');

    // Manual Booking Form State
    const [selectedSeat, setSelectedSeat] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [passengerGender, setPassengerGender] = useState('Male');
    const [passengerAge, setPassengerAge] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState('');

    const currentTripObj = trips.find(t => t.id === selectedTrip);
    const filteredManifest = manifest.filter(p => p.tripId === selectedTrip);
    
    // Stats calculation
    const totalSeats = currentTripObj?.totalSeats || 45;
    const bookedSeatsCount = filteredManifest.length;
    const emptySeatsCount = totalSeats - bookedSeatsCount;

    // Get list of occupied seats
    const occupiedSeats = filteredManifest.map(p => p.seat);

    // Save schedule handler
    const handleSaveTrip = (e) => {
        e.preventDefault();

        const finalRoute = addRoute === 'other' ? manualRoute : addRoute;
        const normalizedRoute = finalRoute.replace(/\s*[→-]\s*/g, ' - ');
        const parts = normalizedRoute.split(' - ');
        const from = parts[0] || 'Addis Ababa';
        const to = parts[1] || 'Bahir Dar';
        const busType = addBus.includes('45 Seats') ? 'Standard' : 'Luxury';
        const totalSeatsVal = addBus.includes('45 Seats') ? 45 : 50;

        const newTrip = {
            id: `trip-${Date.now()}`,
            operatorId: 'selam-bus',
            from,
            to,
            date: addDate,
            departureTime: addTime,
            arrivalTime: '18:00', // dummy
            price: Number(addPrice) || 1000,
            seatsAvailable: totalSeatsVal,
            totalSeats: totalSeatsVal,
            busType: busType,
            amenities: ["WiFi", "AC"],
            distance: 500,
        };

        const updatedTrips = [...trips, newTrip];
        setTrips(updatedTrips);
        setSelectedTrip(newTrip.id);
        setIsAddTripModalOpen(false);

        // Reset
        setAddRoute('Addis Ababa - Bahir Dar');
        setManualRoute('');
        setAddDate('');
        setAddTime('');
        setAddBus('Bus 101 (45 Seats)');
        setAddPrice('');
    };

    // Save manual booking handler
    const handleSaveManualBooking = (e) => {
        e.preventDefault();

        if (!selectedSeat) {
            alert('Please select a seat.');
            return;
        }

        const newBooking = {
            id: `BK-${Date.now().toString().slice(-3)}`,
            tripId: selectedTrip,
            ticketNo: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
            passenger: passengerName,
            gender: passengerGender,
            age: Number(passengerAge) || 30,
            seat: selectedSeat,
            phone: passengerPhone,
            status: 'Boarded',
            payment: 'Paid'
        };

        setManifest([...manifest, newBooking]);
        setBookingSuccess(`Successfully booked seat ${selectedSeat} for ${passengerName}!`);
        
        // Reset form
        setSelectedSeat('');
        setPassengerName('');
        setPassengerPhone('');
        setPassengerGender('Male');
        setPassengerAge('');

        // Automatically hide success alert after 4 seconds
        setTimeout(() => setBookingSuccess(''), 4000);
    };

    // Bus Layout definition matching standard 45-seater bus
    const BUS_LAYOUT = [
        [1, 1, 0, 1, 1], // Row A
        [1, 1, 0, 1, 1], // Row B
        [1, 1, 0, 1, 1], // Row C
        [1, 1, 0, 1, 1], // Row D
        [1, 1, 0, 1, 1], // Row E
        [1, 1, 0, 1, 1], // Row F
        [1, 1, 0, 1, 1], // Row G
        [1, 1, 0, 1, 1], // Row H
        [1, 1, 0, 1, 1], // Row I
        [1, 1, 1, 1, 1], // Row J (Last row 5 seats)
    ];

    const getSeatLabel = (rowIndex, colIndex) => {
        const rowChar = String.fromCharCode(65 + rowIndex); // A, B, C...
        const colNum = colIndex > 2 ? colIndex : colIndex + 1; // Adjust for aisle
        return `${rowChar}${colNum}`;
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        {currentTripObj
                            ? `${currentTripObj.from} → ${currentTripObj.to}`
                            : 'Bookings & Manifest'
                        }
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        {currentTripObj
                            ? `${new Date(currentTripObj.date).toDateString()} • ${currentTripObj.departureTime}`
                            : 'Manage passenger lists, tickets, and check-ins.'
                        }
                    </p>
                </div>
                <Button onClick={() => setIsAddTripModalOpen(true)} className="gap-2 bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl shadow-lg shadow-primary/10">
                    <Plus size={18} /> Add New Trip Schedule
                </Button>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Available Trips */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="font-bold text-gray-800 text-sm tracking-wide">Available Trips</div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold">{trips.length} Active</Badge>
                    </div>
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {trips.map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => setSelectedTrip(trip.id)}
                                className={cn(
                                    "p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative",
                                    selectedTrip === trip.id
                                        ? "bg-white border-primary shadow-lg shadow-primary/5"
                                        : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                                            {trip.busType}
                                        </div>
                                        <span className={cn("font-extrabold text-sm block", selectedTrip === trip.id ? "text-primary" : "text-gray-900")}>
                                            {trip.from.split(',')[0]} → {trip.to.split(',')[0]}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        selectedTrip === trip.id ? "border-primary bg-primary" : "border-gray-200 bg-white"
                                    )}>
                                        {selectedTrip === trip.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 mb-3">
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{new Date(trip.date).toLocaleDateString()}</span>
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{trip.departureTime}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-medium">{trip.plateNumber || 'B-12345'}</span>
                                    <span className="font-extrabold text-gray-900">{trip.price} ETB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main section: Tab switch and statistics/table/form */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 bg-white px-6 pt-2 rounded-2xl shadow-sm">
                        <button
                            onClick={() => setActiveSection('manifest')}
                            className={cn(
                                "pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer",
                                activeSection === 'manifest'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            )}
                        >
                            Passenger Manifest
                        </button>
                        <button
                            onClick={() => setActiveSection('manual')}
                            className={cn(
                                "pb-4 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                                activeSection === 'manual'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Ticket size={16} /> Manual In-Person Booking
                        </button>
                    </div>

                    <Card className="p-6 border-none shadow-sm min-h-[500px]">
                        {activeSection === 'manifest' ? (
                            <div className="space-y-6">
                                {/* Clean Statistics without 'Boarded' */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50/65 border border-blue-100 rounded-2xl text-blue-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Total Seats</span>
                                        <span className="text-3xl font-black">{totalSeats}</span>
                                    </div>
                                    <div className="p-4 bg-green-50/65 border border-green-100 rounded-2xl text-green-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Booked</span>
                                        <span className="text-3xl font-black">{bookedSeatsCount}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50/65 border border-gray-200 rounded-2xl text-gray-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Empty</span>
                                        <span className="text-3xl font-black">{emptySeatsCount}</span>
                                    </div>
                                </div>

                                {/* Manifest Table (Cleaned: No Status, No Action) */}
                                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                                            <tr>
                                                <th className="px-6 py-4">Ticket Info</th>
                                                <th className="px-6 py-4">Passenger Details</th>
                                                <th className="px-6 py-4">Seat</th>
                                                <th className="px-6 py-4">Contact</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-gray-700">
                                            {filteredManifest.map((p) => (
                                                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{p.ticketNo}</div>
                                                        <div className="text-xs text-gray-400">{p.id}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="font-bold text-gray-900">{p.passenger}</div>
                                                        <div className="text-xs text-gray-500">{p.gender}, {p.age} years</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-700 border border-gray-200 shadow-sm">
                                                            {p.seat}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 font-mono text-xs text-gray-600">{p.phone}</td>
                                                </tr>
                                            ))}
                                            {filteredManifest.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="text-center py-10 text-gray-400 font-medium">
                                                        No passengers booked for this trip yet.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Seat Map */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Choose Seat</h3>
                                    
                                    {/* Visual Seat Selector representing a bus */}
                                    <div className="flex flex-col items-center">
                                        {/* Front of Bus Indicator */}
                                        <div className="w-full max-w-[240px] h-14 border-x-4 border-t-4 border-gray-100 rounded-t-[50px] mb-10 relative bg-gray-50/30 flex items-center justify-center">
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.25em] mb-2">Driver Cabin</span>
                                            <div className="absolute top-4 right-6 w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center bg-white shadow-sm">
                                                <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                            </div>
                                        </div>

                                        {/* Seats Grid */}
                                        <div className="grid gap-y-4 gap-x-5 p-10 border-l-4 border-r-4 border-gray-100 bg-gray-50/20 rounded-[3rem] shadow-inner shadow-gray-100">
                                            {BUS_LAYOUT.map((row, rowIndex) => (
                                                <div key={rowIndex} className="flex gap-4">
                                                    {row.map((type, colIndex) => {
                                                        const isAisle = type === 0;
                                                        if (isAisle) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10" />;

                                                        const seatLabel = getSeatLabel(rowIndex, colIndex);
                                                        const isOccupied = occupiedSeats.includes(seatLabel);
                                                        const isSelected = selectedSeat === seatLabel;

                                                        return (
                                                            <button
                                                                key={seatLabel}
                                                                type="button"
                                                                disabled={isOccupied}
                                                                onClick={() => setSelectedSeat(seatLabel)}
                                                                className={cn(
                                                                    "w-10 h-10 rounded-t-lg rounded-b-md border flex items-center justify-center text-xs font-bold transition-all relative group cursor-pointer",
                                                                    isOccupied
                                                                        ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                                                                        : isSelected
                                                                            ? "bg-primary border-primary text-white transform scale-105 shadow-md"
                                                                            : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary"
                                                                )}
                                                                title={isOccupied ? "Occupied" : `Seat ${seatLabel}`}
                                                            >
                                                                {seatLabel}
                                                                <div className={cn(
                                                                    "absolute -bottom-1 w-[80%] h-1 rounded-sm",
                                                                    isOccupied ? "bg-gray-400" : isSelected ? "bg-blue-900 bg-opacity-40" : "bg-gray-400"
                                                                )}></div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Legend */}
                                        <div className="flex gap-8 mt-12 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-4 h-4 rounded-md border-2 border-gray-100 bg-white shadow-sm"></div>
                                                <span>Available</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-4 h-4 rounded-md bg-primary shadow-md shadow-primary/20"></div>
                                                <span>Selected</span>
                                            </div>
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-4 h-4 rounded-md bg-gray-200 border-2 border-gray-100"></div>
                                                <span>Booked</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Right Column: Passenger details Form */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Passenger Details</h3>
                                    
                                    <form onSubmit={handleSaveManualBooking} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Selected Seat</label>
                                            <div className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center font-bold text-gray-800">
                                                {selectedSeat ? `Seat ${selectedSeat}` : "None Selected (Click a seat on the left)"}
                                            </div>
                                        </div>
                                        
                                        <Input
                                            label="Passenger Name"
                                            placeholder="e.g. Abebe Kebede"
                                            value={passengerName}
                                            onChange={e => setPassengerName(e.target.value)}
                                            required
                                            className="rounded-xl h-11"
                                        />
                                        
                                        <Input
                                            label="Phone Number"
                                            placeholder="e.g. 0911223344"
                                            value={passengerPhone}
                                            onChange={e => setPassengerPhone(e.target.value)}
                                            required
                                            className="rounded-xl h-11"
                                        />
                                        
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                                <select
                                                    value={passengerGender}
                                                    onChange={e => setPassengerGender(e.target.value)}
                                                    className="w-full h-11 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                                                >
                                                    <option value="Male">Male</option>
                                                    <option value="Female">Female</option>
                                                </select>
                                            </div>
                                            
                                            <Input
                                                type="number"
                                                label="Age"
                                                placeholder="e.g. 30"
                                                value={passengerAge}
                                                onChange={e => setPassengerAge(e.target.value)}
                                                required
                                                className="rounded-xl h-11"
                                            />
                                        </div>
                                        
                                        <Button
                                            type="submit"
                                            disabled={!selectedSeat}
                                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl shadow-lg shadow-primary/10 mt-6"
                                        >
                                            Confirm & Save Booking
                                        </Button>
                                        
                                        {bookingSuccess && (
                                            <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm font-bold mt-4 animate-in fade-in">
                                                {bookingSuccess}
                                            </div>
                                        )}
                                    </form>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Add New Trip Schedule Modal */}
            <Modal
                isOpen={isAddTripModalOpen}
                onClose={() => setIsAddTripModalOpen(false)}
                title="Add New Trip Schedule"
            >
                <form onSubmit={handleSaveTrip} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Route</label>
                        <select
                            value={addRoute}
                            onChange={(e) => setAddRoute(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="Addis Ababa - Bahir Dar">Addis Ababa - Bahir Dar</option>
                            <option value="Bahir Dar - Addis Ababa">Bahir Dar - Addis Ababa</option>
                            <option value="Addis Ababa - Hawassa">Addis Ababa - Hawassa</option>
                            <option value="other">Custom Route (Enter Manually)...</option>
                        </select>
                        {addRoute === 'other' && (
                            <Input
                                label="Custom Route"
                                placeholder="e.g. Addis Ababa - Adama"
                                required
                                value={manualRoute}
                                onChange={(e) => setManualRoute(e.target.value)}
                                className="rounded-xl h-11 mt-3"
                            />
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            type="date"
                            label="Date"
                            required
                            value={addDate}
                            onChange={(e) => setAddDate(e.target.value)}
                            className="rounded-xl h-11"
                        />
                        <Input
                            type="time"
                            label="Departure Time"
                            required
                            value={addTime}
                            onChange={(e) => setAddTime(e.target.value)}
                            className="rounded-xl h-11"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Select Bus</label>
                        <select
                            value={addBus}
                            onChange={(e) => setAddBus(e.target.value)}
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none"
                        >
                            <option value="Bus 101 (45 Seats)">Bus 101 (45 Seats)</option>
                            <option value="Bus 102 (50 Seats)">Bus 102 (50 Seats)</option>
                        </select>
                    </div>

                    <Input
                        type="number"
                        label="Ticket Price (ETB)"
                        placeholder="e.g. 1500"
                        required
                        value={addPrice}
                        onChange={(e) => setAddPrice(e.target.value)}
                        className="rounded-xl h-11"
                    />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddTripModalOpen(false)}>Cancel</Button>
                        <Button type="submit" className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl">Save Schedule</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
