import { useState, useMemo, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useCreateBookingForUser } from '../../hooks/useBookings';
import { authApi } from '../../api/auth.api';
import { useRemoveTrip } from '../../hooks/useTrips';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { tripOrigin, tripDest, tripCityLabel, parseTripDateTime, buildArrivalDateTime, parseAmenities, toTripDateISO } from '../../lib/tripHelpers';
import { formatTripTime } from '../../lib/operatorHelpers';
import { useTripManifest } from '../../hooks/useTripManifest';
import { useRoutes } from '../../hooks/useRoutes';
import { tripsApi } from '../../api/trips.api';
import { routesApi } from '../../api/routes.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { extractErrorMessage } from '../../lib/api';
import BusLayout from '../../components/seat-map/BusLayout';
import { useTripSeatContext } from '../../hooks/useTripSeatContext';
import { useSeats } from '../../hooks/useSeats';
import { ensureBusSeatsReady } from '../../lib/tripSeats';
import { buildSeatTypeMap, resolveSeatType, seatPriceForLabel } from '../../lib/seatPricing';

// ─── helpers ──────────────────────────────────────────────────────────────────
const tripFrom = (t) => tripOrigin(t);
const tripTo = (t) => tripDest(t);

/** Auto-generate a route code from origin + destination city names.
 *  "Addis Ababa" + "Bahir Dar" → "ADD-BAH"
 *  Falls back to a timestamp suffix if names are too short. */
const autoCode = (origin = '', destination = '') => {
    const abbr = (s) => s.trim().toUpperCase().replace(/\s+/g, '').slice(0, 3).padEnd(3, 'X');
    if (!origin && !destination) return '';
    return `${abbr(origin)}-${abbr(destination)}`;
};

function useCreateRoute() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => routesApi.createRoute(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['routes'] }),
    });
}


export default function BookingManagement() {
    const {
        operatorId,
        scopeReady,
        buses,
        operatorBusIds,
        trips: tripList,
        tripsQuery,
        bookings,
        bookingsQuery,
    } = useOperatorScope({ limit: 500 });
    const tripsLoading = tripsQuery.isLoading;
    const bookingsLoading = bookingsQuery.isLoading;
    const firstTripId = tripList?.[0]?.id ?? null;
    const { data: routes = [] } = useRoutes({ limit: 100 });
    const [creatingTrip, setCreatingTrip] = useState(false);
    const { mutate: createRoute, isPending: creatingRoute } = useCreateRoute();
    const { mutateAsync: createBookingForUser } = useCreateBookingForUser();
    const queryClient = useQueryClient();
    const { mutate: removeTrip, isPending: removingTrip } = useRemoveTrip();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();

    // ── UI state ──────────────────────────────────────────────────────────────
    const [selectedTrip, setSelectedTrip] = useState(null);

    // Keep selection on this operator's trips only
    useEffect(() => {
        if (tripList.length === 0) {
            setSelectedTrip(null);
            return;
        }
        if (!selectedTrip || !tripList.some((t) => t.id === selectedTrip)) {
            setSelectedTrip(tripList[0].id);
        }
    }, [tripList, selectedTrip]);
    const [activeSection, setActiveSection] = useState('manifest');
    const [isAddTripModalOpen, setIsAddTripModalOpen] = useState(false);

    // Add trip form
    const [addRouteId, setAddRouteId] = useState('');
    const [addBusId, setAddBusId] = useState('');
    const [addDate, setAddDate] = useState('');
    const [addTime, setAddTime] = useState('');
    const [addArrival, setAddArrival] = useState('');
    const [addPrice, setAddPrice] = useState('');
    const [addAmenities, setAddAmenities] = useState('WiFi,AC');
    const { data: selectedBusSeats = [], isLoading: selectedBusSeatsLoading } = useSeats(addBusId || null, { limit: 100 });

    // Inline route creation (shown when no routes exist or user wants a new one)
    const [showNewRoute, setShowNewRoute] = useState(false);
    const [newRoute, setNewRoute] = useState({ code: '', origin: '', destination: '', distance: '' });
    const [routeError, setRouteError] = useState('');
    const [tripError, setTripError] = useState('');

    // Manual booking seat map state
    const [selectedSeat, setSelectedSeat] = useState('');
    const [passengerName, setPassengerName] = useState('');
    const [passengerPhone, setPassengerPhone] = useState('');
    const [passengerEmail, setPassengerEmail] = useState('');
    const [emergencyContact, setEmergencyContact] = useState('');
    const [passengerUserId, setPassengerUserId] = useState('');
    const [walkInPayment, setWalkInPayment] = useState('chapa');
    const [walkInError, setWalkInError] = useState('');
    const [walkInSaving, setWalkInSaving] = useState(false);

    // ── Derived ───────────────────────────────────────────────────────────────
    const currentTripObj = tripList.find((t) => t.id === selectedTrip) ?? tripList?.[0] ?? null;
    const highlightedTripId = selectedTrip ?? firstTripId;
    const effectiveTripId = selectedTrip ?? currentTripObj?.id ?? null;
    const seatContextTripId = isAddTripModalOpen || creatingTrip ? null : effectiveTripId;

    const {
        tripSeats,
        seatIdMap,
        bookedSeats: tripBookedLabels,
        canSelectSeats: canWalkInBook,
        unavailableMessage: walkInSeatMessage,
        refetchTrip: refetchTripSeats,
    } = useTripSeatContext(seatContextTripId);

    const {
        rows: manifestRows,
        bookedSeatCount: manifestBookedSeats,
        isLoading: manifestLoading,
        refetch: refetchManifest,
    } = useTripManifest({
        tripId: effectiveTripId,
        operatorId,
        operatorBusIds,
        bookings,
        tripSeats,
        enabled: !!effectiveTripId && scopeReady,
    });

    const totalSeats = tripSeats.length > 0
        ? tripSeats.length
        : currentTripObj?.bus?.totalSeats ?? 45;
    const bookedSeatsCount = manifestBookedSeats;
    const emptySeatsCount = Math.max(0, totalSeats - bookedSeatsCount);

    const bookedSeatLabels = manifestRows
        .map((r) => r.seatLabel)
        .filter((s) => s && s !== '—');
    const occupiedSeats = [...new Set([...bookedSeatLabels, ...tripBookedLabels])];
    const walkInTripPrice = currentTripObj?.price ?? 0;
    const walkInSeatTypeMap = buildSeatTypeMap(tripSeats);
    const selectedSeatPrice = selectedSeat
        ? seatPriceForLabel(walkInTripPrice, selectedSeat, walkInSeatTypeMap[selectedSeat])
        : null;
    const selectedSeatType = selectedSeat
        ? resolveSeatType(selectedSeat, walkInSeatTypeMap[selectedSeat])
        : null;

    const PAYMENT_MAP = { chapa: 'CHAPA', telebirr: 'TELEBIRR', santim: 'SANTIM', cash: 'CHAPA' };

    const resolveWalkInUserId = async () => {
        if (passengerUserId.trim()) return passengerUserId.trim();
        const tempPassword = `Walk@${Date.now().toString(36).slice(-8)}1!`;
        const email =
            passengerEmail.trim() ||
            `walkin.${passengerPhone.replace(/\D/g, '') || Date.now()}@menaharia.local`;
        const regResponse = await authApi.register({
            fullName: passengerName,
            phone: passengerPhone,
            email,
            password: tempPassword,
        });
        const payload = regResponse?.data ?? regResponse;
        const uid = payload?.user?.id ?? payload?.id;
        if (!uid) throw new Error('Could not create passenger account.');
        return uid;
    };

    const handleWalkInBooking = async () => {
        setWalkInError('');
        if (!effectiveTripId || !selectedSeat) {
            setWalkInError('Select a trip and an available seat.');
            return;
        }
        if (!passengerName.trim() || !passengerPhone.trim()) {
            setWalkInError('Passenger name and phone are required.');
            return;
        }
        if (!emergencyContact.trim()) {
            setWalkInError('Emergency contact is required.');
            return;
        }
        const tripSeatId = seatIdMap[selectedSeat];
        if (!tripSeatId) {
            setWalkInError(
                'No trip seat ID for this label. Add bus seats (Fleet) and create a new trip so trip seats are materialized.'
            );
            return;
        }

        setWalkInSaving(true);
        try {
            const userId = await resolveWalkInUserId();
            const method = PAYMENT_MAP[walkInPayment.toLowerCase()] ?? 'CHAPA';
            await createBookingForUser({
                tripId: effectiveTripId,
                userId,
                paymentMethod: method,
                travelers: [{
                    tripSeatId,
                    fullName: passengerName.trim(),
                    email: passengerEmail.trim() || `walkin.${passengerPhone.replace(/\D/g, '')}@menaharia.local`,
                    phone: passengerPhone.trim(),
                    emergencyContact: emergencyContact.trim(),
                }],
            });
            await queryClient.invalidateQueries({ queryKey: ['bookings'] });
            await queryClient.invalidateQueries({ queryKey: ['travelers'] });
            await queryClient.invalidateQueries({ queryKey: ['trips'] });
            refetchManifest();
            setSelectedSeat('');
            setPassengerName('');
            setPassengerPhone('');
            setPassengerEmail('');
            setEmergencyContact('');
            setPassengerUserId('');
            setActiveSection('manifest');
        } catch (err) {
            const msg = extractErrorMessage(err, 'Walk-in booking failed.');
            if (msg.toLowerCase().includes('phone') || msg.toLowerCase().includes('email')) {
                setWalkInError(`${msg} Enter the passenger's User ID if they already have an account.`);
            } else {
                setWalkInError(msg);
            }
        } finally {
            setWalkInSaving(false);
        }
    };

    const handleSaveTrip = async (e) => {
        e.preventDefault();
        setTripError('');
        if (!addRouteId || !addBusId || !addDate || !addTime || !addArrival || !addPrice) return;

        setCreatingTrip(true);
        try {
            const departureISO = parseTripDateTime(addDate, addTime);
            const arrivalISO = buildArrivalDateTime(addDate, addArrival, departureISO);
            const bus = buses.find((b) => b.id === addBusId);
            await ensureBusSeatsReady(addBusId, bus?.totalSeats ?? 45);
            const created = await tripsApi.createTrip({
                routeId:       addRouteId,
                busId:         addBusId,
                date:          toTripDateISO(addDate),
                departureTime: departureISO,
                arrivalTime:   arrivalISO,
                price:         Number(addPrice),
                amenities:     parseAmenities(addAmenities),
                status:        'SCHEDULED',
            });

            setIsAddTripModalOpen(false);
            setShowNewRoute(false);
            setAddRouteId('');
            setAddBusId('');
            setAddDate('');
            setAddTime('');
            setAddArrival('');
            setAddPrice('');
            setTripError('');
            if (created?.id) setSelectedTrip(created.id);
            queryClient.invalidateQueries({ queryKey: ['trips'] });
            if (addBusId) {
                queryClient.invalidateQueries({ queryKey: ['seats'] });
            }
        } catch (err) {
            if (err?.code === 'NO_BUS_SEATS') {
                setTripError(err.message);
            } else {
                const msg = extractErrorMessage(err, 'Failed to create trip.');
                const status = err?.response?.status;
                setTripError(
                    status
                        ? `Could not create trip (${status}): ${msg}`
                        : msg
                );
            }
        } finally {
            setCreatingTrip(false);
        }
    };

    const handleDeleteTrip = async (tripId, e) => {
        e?.stopPropagation?.();
        const ok = await confirm({
            title: 'Delete this trip?',
            description: 'This schedule will be removed. Existing bookings may be affected.',
            confirmLabel: 'Delete Trip',
        });
        if (!ok) return;
        removeTrip(tripId, {
            onSuccess: () => {
                if (selectedTrip === tripId) setSelectedTrip(null);
                queryClient.invalidateQueries({ queryKey: ['trips'] });
            },
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
            <OperatorScopeBanner />
            {/* Header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-gray-100 pb-5">
                <div>
                    <h1 className="text-2xl font-black text-gray-900">
                        {currentTripObj ? `${tripFrom(currentTripObj)} → ${tripTo(currentTripObj)}` : 'Bookings & Manifest'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">
                        {currentTripObj
                            ? `${new Date(currentTripObj.date).toDateString()} • ${formatTripTime(currentTripObj.departureTime)}`
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
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 font-bold">{tripList.length} Active</Badge>
                    </div>
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2">
                        {tripsLoading ? (
                            <div className="text-center py-8 text-gray-400 text-sm">Loading trips…</div>
                        ) : tripList.length === 0 ? (
                            <div className="text-center py-8 text-gray-400 text-sm">No trips found</div>
                        ) : tripList.map(trip => (
                            <div key={trip.id} onClick={() => setSelectedTrip(trip.id)}
                                className={cn("p-4 rounded-2xl border-2 cursor-pointer transition-all duration-200 group relative",
                                    highlightedTripId === trip.id
                                        ? "bg-white border-primary shadow-lg shadow-primary/5"
                                        : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50")}>
                                <button
                                    type="button"
                                    title="Delete trip"
                                    disabled={removingTrip}
                                    onClick={(e) => handleDeleteTrip(trip.id, e)}
                                    className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-red-50 text-red-500 opacity-0 group-hover:opacity-100 hover:bg-red-100 flex items-center justify-center transition-opacity z-10"
                                >
                                    <Trash2 size={12} />
                                </button>
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                                            {trip.bus?.make ?? 'Standard'}
                                        </div>
                                        <span className={cn("font-extrabold text-sm block",
                                            highlightedTripId === trip.id ? "text-primary" : "text-gray-900")}>
                                            {tripCityLabel(tripFrom(trip))} → {tripCityLabel(tripTo(trip))}
                                        </span>
                                    </div>
                                    <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        highlightedTripId === trip.id ? "border-primary bg-primary" : "border-gray-200 bg-white")}>
                                        {highlightedTripId === trip.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 mb-3">
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{new Date(trip.date).toLocaleDateString()}</span>
                                    <span className="bg-gray-100 px-2.5 py-1 rounded-lg">{formatTripTime(trip.departureTime)}</span>
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
                                        <span className="text-3xl font-black">{manifestLoading ? '—' : bookedSeatsCount}</span>
                                    </div>
                                    <div className="p-4 bg-gray-50/65 border border-gray-200 rounded-2xl text-gray-700 flex flex-col justify-between">
                                        <span className="text-xs font-extrabold uppercase tracking-wider opacity-70 mb-1">Empty</span>
                                        <span className="text-3xl font-black">{manifestLoading ? '—' : emptySeatsCount}</span>
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-bold text-[10px] tracking-wider">
                                            <tr>
                                                <th className="px-5 py-4">Ticket / Booking</th>
                                                <th className="px-5 py-4">Passenger</th>
                                                <th className="px-5 py-4">Seat</th>
                                                <th className="px-5 py-4">Contact</th>
                                                <th className="px-5 py-4">Payment</th>
                                                <th className="px-5 py-4">Booked by</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50 text-gray-700">
                                            {bookingsLoading || manifestLoading ? (
                                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading manifest…</td></tr>
                                            ) : manifestRows.length === 0 ? (
                                                <tr><td colSpan={6} className="text-center py-10 text-gray-400 font-medium">No passengers booked for this trip yet.</td></tr>
                                            ) : manifestRows.map((row) => (
                                                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-gray-900 font-mono text-xs">
                                                            {row.ticketId ? `${String(row.ticketId).slice(0, 8)}…` : `${row.bookingId?.slice(0, 8)}…`}
                                                        </div>
                                                        {row.bookingReference && (
                                                            <div className="text-[10px] text-gray-500 font-mono">{row.bookingReference}</div>
                                                        )}
                                                        <div className="text-xs text-gray-400 mt-0.5">{row.bookingDate}</div>
                                                        <span className={cn(
                                                            'inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
                                                            row.bookingStatus === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700'
                                                                : row.bookingStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-500'
                                                                    : 'bg-amber-100 text-amber-700',
                                                        )}>
                                                            {row.bookingStatus}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-bold text-gray-900">{row.passengerName}</div>
                                                        {row.channel !== '—' && (
                                                            <span className={cn(
                                                                'inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full',
                                                                row.channel === 'Walk-in' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700',
                                                            )}>
                                                                {row.channel}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="inline-flex items-center justify-center min-w-8 h-8 px-1 rounded-lg bg-gray-100 font-bold text-gray-700 border border-gray-200 shadow-sm">
                                                            {row.seatLabel}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <div className="font-mono text-xs text-gray-800">{row.passengerPhone}</div>
                                                        {row.passengerEmail && row.passengerEmail !== '—' && (
                                                            <div className="text-[10px] text-gray-500 truncate max-w-[140px]" title={row.passengerEmail}>
                                                                {row.passengerEmail}
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={cn(
                                                            'text-xs font-bold',
                                                            row.isPaid ? 'text-emerald-600' : row.paymentStatus === 'Failed' ? 'text-red-600' : 'text-amber-600',
                                                        )}>
                                                            {row.paymentStatus}
                                                        </span>
                                                        <div className="text-[10px] text-gray-500 mt-0.5">{row.paymentMethod}</div>
                                                        <div className="text-xs font-bold text-gray-800 mt-0.5">{row.amount}</div>
                                                    </td>
                                                    <td className="px-5 py-4 text-xs text-gray-700">
                                                        <div className="font-semibold text-gray-900">{row.bookedBy}</div>
                                                        <div className="text-[10px] text-gray-400 mt-0.5">Account holder</div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Seat Map */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Choose Seat</h3>
                                    {walkInSeatMessage && (
                                        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                                            {walkInSeatMessage}
                                        </p>
                                    )}
                                    <BusLayout
                                        selectedSeats={selectedSeat ? [selectedSeat] : []}
                                        onToggleSeat={(label) => setSelectedSeat((prev) => (prev === label ? '' : label))}
                                        bookedSeats={occupiedSeats}
                                        tripSeats={tripSeats}
                                        disabled={!canWalkInBook}
                                        basePrice={walkInTripPrice}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => refetchTripSeats()}
                                        className="text-xs font-bold text-primary"
                                    >
                                        Refresh seat availability
                                    </button>
                                </div>
                                {/* Passenger Form */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900">Passenger Details</h3>
                                    <p className="text-xs text-gray-500">
                                        Walk-in booking uses POST /v1/bookings/for-user. A guest account is created automatically unless you provide an existing User ID.
                                    </p>
                                    {walkInError && (
                                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{walkInError}</div>
                                    )}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Selected Seat</label>
                                        <div className="h-11 px-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center font-bold text-gray-800">
                                            {selectedSeat
                                                ? `Seat ${selectedSeat}${selectedSeatType ? ` · ${selectedSeatType}` : ''}${selectedSeatPrice != null ? ` · ETB ${selectedSeatPrice.toLocaleString()}` : ''}${seatIdMap[selectedSeat] ? '' : ' (no trip seat — recreate trip after adding bus seats)'}`
                                                : 'None selected'}
                                        </div>
                                    </div>
                                    <Input label="Passenger Name *" placeholder="e.g. Abebe Kebede" value={passengerName} onChange={e => setPassengerName(e.target.value)} className="rounded-xl h-11" />
                                    <Input label="Phone Number *" placeholder="e.g. 0911223344" value={passengerPhone} onChange={e => setPassengerPhone(e.target.value)} className="rounded-xl h-11" />
                                    <Input label="Email" placeholder="optional" value={passengerEmail} onChange={e => setPassengerEmail(e.target.value)} className="rounded-xl h-11" />
                                    <Input label="Emergency Contact *" placeholder="e.g. 0911000000" value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} className="rounded-xl h-11" />
                                    <Input label="Existing User ID (optional)" placeholder="UUID if passenger already registered" value={passengerUserId} onChange={e => setPassengerUserId(e.target.value)} className="rounded-xl h-11 font-mono text-xs" />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                        <select value={walkInPayment} onChange={e => setWalkInPayment(e.target.value)}
                                            className="w-full h-11 rounded-xl border border-gray-300 px-3 text-sm focus:ring-primary focus:border-primary outline-none">
                                            <option value="chapa">Chapa</option>
                                            <option value="telebirr">Telebirr</option>
                                            <option value="santim">Santim</option>
                                        </select>
                                    </div>
                                    <Button
                                        type="button"
                                        disabled={walkInSaving || !selectedSeat || !seatIdMap[selectedSeat]}
                                        onClick={handleWalkInBooking}
                                        className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-11 rounded-xl mt-4"
                                    >
                                        {walkInSaving ? 'Booking…' : 'Confirm Walk-in Booking'}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            </div>

            {/* Add New Trip Schedule Modal */}
            <Modal isOpen={isAddTripModalOpen} onClose={() => { setIsAddTripModalOpen(false); setShowNewRoute(false); setRouteError(''); setTripError(''); }} title="Add New Trip Schedule">
                <form onSubmit={handleSaveTrip} className="space-y-4">
                    {tripError && (
                        <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{tripError}</div>
                    )}

                    {/* ── Route selector ── */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-semibold text-gray-700">Route *</label>
                            <button type="button" onClick={() => { setShowNewRoute(v => !v); setRouteError(''); }}
                                className="text-xs font-bold text-primary hover:underline">
                                {showNewRoute ? '← Select existing' : '+ Create new route'}
                            </button>
                        </div>

                        {showNewRoute ? (
                            /* ── Inline route creation form ── */
                            <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">New Route — matches POST /v1/routes</p>
                                {routeError && <p className="text-xs text-red-600">{routeError}</p>}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Origin *</label>
                                        <input placeholder="e.g. Addis Ababa" required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newRoute.origin}
                                            onChange={e => {
                                                const origin = e.target.value;
                                                const code = autoCode(origin, newRoute.destination);
                                                setNewRoute(p => ({ ...p, origin, code }));
                                            }} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Destination *</label>
                                        <input placeholder="e.g. Bahir Dar" required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newRoute.destination}
                                            onChange={e => {
                                                const destination = e.target.value;
                                                const code = autoCode(newRoute.origin, destination);
                                                setNewRoute(p => ({ ...p, destination, code }));
                                            }} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">
                                            Route Code *
                                            <span className="ml-1 text-gray-400 font-normal">(auto-generated)</span>
                                        </label>
                                        <input placeholder="e.g. ADD-BAH" required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none bg-gray-50"
                                            value={newRoute.code}
                                            onChange={e => setNewRoute(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-600 mb-1 block">Distance (km) *</label>
                                        <input type="number" placeholder="e.g. 510" required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={newRoute.distance} onChange={e => setNewRoute(p => ({ ...p, distance: e.target.value }))} />
                                    </div>
                                </div>
                                <Button type="button" size="sm" disabled={creatingRoute}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg"
                                    onClick={() => {
                                        setRouteError('');
                                        if (!newRoute.code || !newRoute.origin || !newRoute.destination || !newRoute.distance) {
                                            setRouteError('All route fields are required.'); return;
                                        }
                                        createRoute({
                                            code: newRoute.code,
                                            origin: newRoute.origin,
                                            destination: newRoute.destination,
                                            distance: Number(newRoute.distance),
                                        }, {
                                            onSuccess: (res) => {
                                                const created = res?.data ?? res;
                                                if (created?.id) setAddRouteId(created.id);
                                                setShowNewRoute(false);
                                                setNewRoute({ code: '', origin: '', destination: '', distance: '' });
                                            },
                                            onError: (err) => {
                                                setRouteError(extractErrorMessage(err, 'Failed to create route.'));
                                            },
                                        });
                                    }}>
                                    {creatingRoute ? 'Creating Route…' : 'Create Route & Select'}
                                </Button>
                            </div>
                        ) : (
                            /* ── Existing route dropdown ── */
                            <div>
                                <select value={addRouteId} onChange={e => setAddRouteId(e.target.value)} required
                                    className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none">
                                    <option value="">Select a route…</option>
                                    {routes.map(r => (
                                        <option key={r.id} value={r.id}>{r.origin} → {r.destination} ({r.code})</option>
                                    ))}
                                </select>
                                {routes.length === 0 && (
                                    <p className="text-xs text-amber-600 mt-1">No routes yet — click "Create new route" above to add one.</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Bus selector ── */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Bus *</label>
                        <select value={addBusId} onChange={e => setAddBusId(e.target.value)} required
                            className="w-full rounded-md border border-gray-300 p-2.5 text-sm focus:ring-primary focus:border-primary focus:outline-none">
                            <option value="">Select a bus…</option>
                            {buses.map(b => (
                                <option key={b.id} value={b.id}>{b.plateNumber} — {b.make} ({b.totalSeats} seats)</option>
                            ))}
                        </select>
                        {buses.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">No buses registered. Add buses in Bus Management first.</p>
                        )}
                        {addBusId && !selectedBusSeatsLoading && selectedBusSeats.length === 0 && (
                            <p className="text-xs text-amber-600 mt-1">
                                This bus has no seat layout yet. Add the bus in Fleet Management first (seats are created automatically).
                            </p>
                        )}
                    </div>

                    {/* ── Date / Time ── */}
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Date *" required value={addDate} onChange={e => setAddDate(e.target.value)} className="rounded-xl h-11" />
                        <Input type="time" label="Departure Time *" required value={addTime} onChange={e => setAddTime(e.target.value)} className="rounded-xl h-11" />
                    </div>
                    <Input type="time" label="Arrival Time *" required value={addArrival} onChange={e => setAddArrival(e.target.value)} className="rounded-xl h-11" />
                    <Input type="number" label="Ticket Price (ETB) *" placeholder="e.g. 1500" required value={addPrice} onChange={e => setAddPrice(e.target.value)} className="rounded-xl h-11" />

                    <div className="flex justify-end gap-3 mt-6">
                        <Button type="button" variant="outline" onClick={() => { setIsAddTripModalOpen(false); setShowNewRoute(false); setRouteError(''); setTripError(''); }}>Cancel</Button>
                        <Button type="submit" disabled={creatingTrip || showNewRoute} className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-5 rounded-xl">
                            {creatingTrip ? 'Saving…' : 'Save Schedule'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
