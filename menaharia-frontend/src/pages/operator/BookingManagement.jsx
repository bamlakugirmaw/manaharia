import { useState, useMemo } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Plus, Ticket } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { useTrips } from '../../hooks/useTrips';
import { useBuses } from '../../hooks/useBuses';
import { useRoutes } from '../../hooks/useRoutes';
import { tripsApi } from '../../api/trips.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// ─── helpers ──────────────────────────────────────────────────────────────────
const tripFrom = (t) => t?.from ?? t?.route?.origin ?? '';
const tripTo   = (t) => t?.to   ?? t?.route?.destination ?? '';

function useCreateTrip() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => tripsApi.createTrip(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
    });
}

// Bus Layout definition matching standard 45-seater bus
const BUS_LAYOUT = [
    [1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],
    [1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[1,1,0,1,1],[1,1,1,1,1],
];
const getSeatLabel = (r, c) => `${String.fromCharCode(65+r)}${c > 2 ? c : c+1}`;

export default function BookingManagement() {
    const { user } = useAuth();
    const operatorId = user?.operatorId ?? null;

    // ── Data ──────────────────────────────────────────────────────────────────
    const { data: trips = [], isLoading: tripsLoading } = useTrips({ limit: 100 });
    const { data: bookings = [], isLoading: bookingsLoading } = useBookings({ limit: 500 });
    const { data: buses = [] } = useBuses(operatorId ? { operatorId, limit: 50 } : {});
    const { data: routes = [] } = useRoutes({ limit: 100 });
    const { mutate: createTrip, isPending: creatingTrip, error: createTripError } = useCreateTrip();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [activeSection, setActiveSection] = useState('manifest');
    const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);
    const [selectedSeat, setSelectedSeat] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [passengerGender, setPassengerGender] = useState('Male');
    const [passengerAge, setPassengerAge] = useState('');

    // Add trip form
    const [addRouteId, setAddRouteId] = useState('');
    const [addBusId, setAddBusId] = useState('');
    const [addDate, setAddDate] = useState('');
    const [addTime, setAddTime] = useState('');
    const [addArrival, setAddArrival] = useState('');
    const [addPrice, setAddPrice] = useState('');

    // ── Derived ───────────────────────────────────────────────────────────────
    const currentTripObj = trips.find(t => t.id === selectedTrip) ?? trips[0] ?? null;
    const effectiveTripId = selectedTrip ?? currentTripObj?.id ?? null;

    const filteredManifest = useMemo(() => {
        if (!effectiveTripId) return [];
        return bookings.filter(b => b.trip?.id === effectiveTripId || b.tripId === effectiveTripId);
    }, [bookings, effectiveTripId]);

    const totalSeats = currentTripObj?.bus?.totalSeats ?? currentTripObj?.totalSeats ?? 45;
    const bookedSeatsCount = filteredManifest.length;
    const emptySeatsCount = totalSeats - bookedSeatsCount;
    const occupiedSeats = filteredManifest.map(b => b.travelers?.[0]?.seat?.seatNumber ?? b.travelers?.[0]?.seatNumber ?? '');

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleSaveTrip = (e) => {
        e.preventDefault();
        if (!addRouteId || !addBusId || !addDate || !addTime || !addArrival || !addPrice) return;
        createTrip({
            routeId: addRouteId,
            busId: addBusId,
            date: addDate,
            departureTime: addTime,
            arrivalTime: addArrival,
            price: Number(addPrice),
            status: 'SCHEDULED',
        }, {
            onSuccess: () => {
                setIsAddTripModalOpen(false);
                setAddRouteId(''); setAddBusId(''); setAddDate('');
                setAddTime(''); setAddArrival(''); setAddPrice('');
            },
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        {currentTripObj ? `${tripFrom(currentTripObj)} → ${tripTo(currentTripObj)}` : 'Bookings & Manifest'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        {currentTripObj
                            ? `${new Date(currentTripObj.date).toDateString()} • ${currentTripObj.departureTime}`
                            : 'Manage passenger lists, tickets, and check-ins.'}
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
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
                        {tripsLoading ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading trips…</div>
                        ) : trips.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No trips found</div>
                        ) : trips.map(trip => (
                            <div key={trip.id} onClick={() => setSelectedTrip(trip.id)}
                                className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative",
                                    (selectedTrip ?? trips[0]?.id) === trip.id
                                        ? "bg-white border-primary shadow-lg shadow-primary/5"
                                        : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50")}>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                                            {trip.bus?.make ?? 'Standard'}
                                        </div>
                                        <span className={cn("font-extrabold text-sm block",
                                            (selectedTrip ?? trips[0]?.id) === trip.id ? "text-primary" : "text-gray-900")}>
                                            {tripFrom(trip).split(',')[0]} → {tripTo(trip).split(',')[0]}
                                        </span>
                                    </div>
                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        (selectedTrip ?? trips[0]?.id) === trip.id ? "border-primary bg-primary" : "border-gray-200 bg-white")}>
                                        {(selectedTrip ?? trips[0]?.id) === trip.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 mb-3">
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{new Date(trip.date).toLocaleDateString()}</span>
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{trip.departureTime}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400 font-medium">{trip.bus?.plateNumber ?? '—'}</span>
                                    <span className="font-extrabold text-gray-900">{trip.price} ETB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main section */}
                <div className="lg:col-span-3 space-y-6">
                    {/* Tab Navigation */}
                    <div className="flex border-b border-gray-200 bg-white px-6 pt-2 rounded-2xl shadow-sm">
                        <button onClick={() => setActiveSection('manifest')}
                            className={cn("pb-4 px-4 font-bold text-sm border-b-2 transition-all cursor-pointer",
                                activeSection === 'manifest' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900")}>
                            Passenger Manifest
                        </button>
                        <button onClick={() => setActiveSection('manual')}
                            className={cn("pb-4 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 cursor-pointer",
                                activeSection === 'manual' ? "border-primary text-primary" : "border-transparent text-gray-500 hover:text-gray-900")}>
                            <Ticket size={16} /> Manual In-Person Booking
                        </button>
                    </div>

                    <Card className="p-6 border-none shadow-sm min-h-[500px]">
                        {activeSection === 'manifest' ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="p-4 bg-blue-50/65 border border-blue-100 rounded-2xl text-blue-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Total Seats</span>
                                        <span className="text-3xl font-black">{totalSeats}</span>
                                    </div>
                                    <div className="p-4 bg-green-50/65 border border-green-100 rounded-2xl text-green-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Booked</span>
                                        <span className="text-3xl font-black">{bookingsLoading ? '—' : bookedSeatsCount}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50/65 border border-gray-200 rounded-2xl text-gray-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Empty</span>
                                        <span className="text-3xl font-black">{bookingsLoading ? '—' : emptySeatsCount}</span>
                                    </div>
                                </div>
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
                                            {bookingsLoading ? (
                                                <tr><td colSpan={4} className="text-center py-10 text-gray-400">Loading…</td></tr>
                                            ) : filteredManifest.length === 0 ? (
                                                <tr><td colSpan={4} className="text-center py-10 text-gray-400 font-medium">No passengers booked for this trip yet.</td></tr>
                                            ) : filteredManifest.map((b) => {
                                                const t = b.travelers?.[0];
                                                const seat = t?.seat?.seatNumber ?? t?.seatNumber ?? '—';
                                                return (
                                                    <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900 font-mono text-xs">{b.id?.slice(0,12)}…</div>
                                                            <div className="text-xs text-gray-400">{b.status}</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="font-bold text-gray-900">{t?.fullName ?? '—'}</div>
                                                            <div className="text-xs text-gray-500">Passenger</div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-700 border border-gray-200 shadow-sm">
                                                                {seat}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 font-mono text-xs text-gray-600">{t?.phone ?? '—'}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Seat Map */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Choose Seat</h3>
                                    <div className="flex flex-col items-center">
                                        <div className="w-full max-w-[240px] h-14 border-x-4 border-t-4 border-gray-100 rounded-t-[50px] mb-10 relative bg-gray-50/30 flex items-center justify-center">
                                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.25em] mb-2">Driver Cabin</span>
                                            <div className="absolute top-4 right-6 w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center bg-white shadow-sm">
                                                <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                                            </div>
                                        </div>
                                        <div className="grid gap-y-4 gap-x-5 p-10 border-l-4 border-r-4 border-gray-100 bg-gray-50/20 rounded-[3rem] shadow-inner shadow-gray-100">
                                            {BUS_LAYOUT.map((row, rowIndex) => (
                                                <div key={rowIndex} className="flex gap-4">
                                                    {row.map((type, colIndex) => {
                                                        if (type === 0) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10" />;
                                                        const seatLabel = getSeatLabel(rowIndex, colIndex);
                                                        const isOccupied = occupiedSeats.includes(seatLabel);
                                                        const isSelected = selectedSeat === seatLabel;
                                                        return (
                                                            <button key={seatLabel} type="button" disabled={isOccupied}
                                                                onClick={() => setSelectedSeat(seatLabel)}
                                                                className={cn("w-10 h-10 rounded-t-lg rounded-b-md border flex items-center justify-center text-xs font-bold transition-all relative group cursor-pointer",
                                                                    isOccupied ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                                                                        : isSelected ? "bg-primary border-primary text-white transform scale-105 shadow-md"
                                                                        : "bg-white border-gray-300 text-gray-700 hover:border-primary hover:text-primary")}
                                                                title={isOccupied ? "Occupied" : `Seat ${seatLabel}`}>
                                                                {seatLabel}
                                                                <div className={cn("absolute -bottom-1 w-[80%] h-1 rounded-sm",
                                                                    isOccupied ? "bg-gray-400" : isSelected ? "bg-blue-900 bg-opacity-40" : "bg-gray-400")}></div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex gap-8 mt-12 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                                            <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md border-2 border-gray-100 bg-white shadow-sm"></div><span>Available</span></div>
                                            <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md bg-primary shadow-md shadow-primary/20"></div><span>Selected</span></div>
                                            <div className="flex items-center gap-2.5"><div className="w-4 h-4 rounded-md bg-gray-200 border-2 border-gray-100"></div><span>Booked</span></div>
                                        </div>
                                    </div>
                                </div>
                                {/* Passenger Form */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Passenger Details</h3>
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                                        Manual in-person bookings require a seat reservation ID from the system. Please direct walk-in passengers to complete booking through the main booking flow, or contact platform support.
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Selected Seat</label>
                                        <div className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center font-bold text-gray-800">
                                            {selectedSeat ? `Seat ${selectedSeat}` : "None Selected (Click a seat on the left)"}
                                        </div>
                                    </div>
                                    <Input label="Passenger Name" placeholder="e.g. Abebe Kebede" value={passengerName} onChange={e => setPassengerName(e.target.value)} className="rounded-xl h-11" />
                                    <Input label="Phone Number" placeholder="e.g. 0911223344" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)} className="rounded-xl h-11" />
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                            <select value={passengerGender} onChange={e => setPassengerGender(e.target.value)}
                                                className="w-full h-11 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:ring-primary focus:border-primary focus:outline-none">
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <Input type="number" label="Age" placeholder="e.g. 30" value={passengerAge} onChange={e => setPassengerAge(e.target.value)} className="rounded-xl h-11" />
                                    </div>
                                    <Button type="button" disabled className="w-full bg-gray-300 text-gray-500 font-bold h-11 rounded-xl mt-6 cursor-not-allowed">
                                        Confirm & Save Booking (Requires System Integration)
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Add New Trip Schedule Modal */}
            <Modal isOpen={isAddTripModalOpen} onClose={() => setIsAddTripModalOpen(false)} title="Add New Trip Schedule">
                <form onSubmit={handleSaveTrip} className="space-y-4">
                    {createTripError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                            {createTripError?.response?.data?.message ?? 'Failed to create trip.'}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Route *</label>
                        <select value={addRouteId} onChange={e => setAddRouteId(e.target.value)} required
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none">
                            <option value="">Select a route…</option>
                            {routes.map(r => (
                                <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
                            ))}
                        </select>
                        {routes.length === 0 && <p className="text-xs text-amber-600 mt-1">No routes available. Ask admin to create routes first.</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bus *</label>
                        <select value={addBusId} onChange={e => setAddBusId(e.target.value)} required
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none">
                            <option value="">Select a bus…</option>
                            {buses.map(b => (
                                <option key={b.id} value={b.id}>{b.plateNumber} — {b.make} ({b.totalSeats} seats)</option>
                            ))}
                        </select>
                        {buses.length === 0 && <p className="text-xs text-amber-600 mt-1">No buses registered. Add buses in Bus Management first.</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Date *" required value={addDate} onChange={e => setAddDate(e.target.value)} className="rounded-xl h-11" />
                        <Input type="time" label="Departure Time *" required value={addTime} onChange={e => setAddTime(e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <Input type="time" label="Arrival Time *" required value={addArrival} onChange={e => setAddArrival(e.target.value)} className="rounded-xl h-11" />
                    <Input type="number" label="Ticket Price (ETB) *" placeholder="e.g. 1500" required value={addPrice} onChange={e => setAddPrice(e.target.value)} className="rounded-xl h-11" />
                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => setIsAddTripModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={creatingTrip} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl">
                            {creatingTrip ? 'Saving…' : 'Save Schedule'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
