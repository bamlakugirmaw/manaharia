import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
    Eye, X, MessageSquare, Send, Bus, Calendar, Ticket,
    User, CreditCard, Phone, Hash, ArrowRight, AlertCircle,
    CheckCircle, Clock, ChevronLeft, MapPin, PlusCircle, Star,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useBookings, useCancelBooking } from '../../hooks/useBookings';
import { useCreateDispute } from '../../hooks/useDisputes';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { cn } from '../../lib/utils';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise a backend booking object to the flat shape the UI modal expects.
 * Backend shape (simplified):
 *   { id, status, createdAt, trip: { route, departureTime, arrivalTime, date, bus, operator },
 *     travelers: [{ fullName, phone, seat: { seatNumber } }],
 *     payment: { status, amount, method } }
 */
function normaliseBooking(b) {
    const trip     = b.trip     ?? {};
    const traveler = b.travelers?.[0] ?? {};
    const payment  = b.payment  ?? {};
    const route    = trip.route ?? {};
    const operator = trip.operator ?? {};
    const bus      = trip.bus ?? {};

    const from = trip.from ?? route.origin ?? '';
    const to   = trip.to   ?? route.destination ?? '';

    return {
        id:             b.id,
        ticketId:       b.tickets?.[0]?.id ?? b.id,
        operator:       operator.name ?? operator.companyName ?? 'Unknown',
        operatorId:     operator.id ?? '',
        busName:        bus.make ?? `${operator.name ?? ''} Coach`,
        busPlate:       bus.plateNumber ?? '—',
        route:          `${from} → ${to}`,
        from,
        to,
        departure:      trip.departureTime ?? '',
        arrival:        trip.arrivalTime   ?? '',
        seatNumber:     traveler.seat?.seatNumber ?? traveler.seatNumber ?? '—',
        date:           trip.date
            ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        bookingDate:    b.createdAt
            ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        passengerName:  traveler.fullName ?? '',
        passengerPhone: traveler.phone    ?? '',
        status:         (b.status ?? '').toLowerCase(),
        paymentStatus:  payment.status === 'SUCCESS' ? 'Paid' : (payment.status ?? 'Pending'),
        amount:         payment.amount ?? trip.price ?? 0,
        driverContact:  null,
        // Keep raw for complaint context
        _raw: b,
    };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRating({ bookingId, ratings, setRatings }) {
    const [hovered, setHovered] = useState(null);
    const current = ratings[bookingId] ?? 0;

    const handleRate = (star) => {
        const updated = { ...ratings, [bookingId]: star };
        setRatings(updated);
        localStorage.setItem('bookingRatings', JSON.stringify(updated));
    };

    return (
        <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(null)}>
            {[1, 2, 3, 4, 5].map(star => {
                const filled = star <= (hovered ?? current);
                return (
                    <button key={star} type="button" onMouseEnter={() => setHovered(star)} onClick={() => handleRate(star)}
                        className="p-0.5 rounded transition-transform hover:scale-125 focus:outline-none"
                        title={`Rate ${star} star${star > 1 ? 's' : ''}`}>
                        <Star size={16} className={`transition-colors ${filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                    </button>
                );
            })}
            {current > 0 && hovered === null && (
                <span className="ml-1 text-[10px] font-bold text-amber-500">{current}.0</span>
            )}
        </div>
    );
}

function ComplaintStatusBadge({ status }) {
    const styles = { Open: 'bg-blue-100 text-blue-700', 'In Progress': 'bg-orange-100 text-orange-700', Resolved: 'bg-green-100 text-green-700' };
    const icons  = { Open: <AlertCircle size={10} />, 'In Progress': <Clock size={10} />, Resolved: <CheckCircle size={10} /> };
    return (
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full', styles[status] || 'bg-gray-100 text-gray-500')}>
            {icons[status]}{status}
        </span>
    );
}

function InfoTile({ icon: Icon, label, value, accent }) {
    return (
        <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100/70">
            <div className="flex items-center gap-1.5 mb-1.5">
                <Icon size={11} className="text-gray-400" />
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-[0.13em]">{label}</p>
            </div>
            <p className={cn('text-sm font-bold leading-snug break-all',
                accent === 'green' ? 'text-emerald-600' : accent === 'blue' ? 'text-blue-600' : 'text-gray-800')}>
                {value}
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function UserBookings() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { mutate: createDispute, isPending: filingDispute } = useCreateDispute();
    const { mutate: cancelBooking, isPending: cancelling } = useCancelBooking();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();

    // GET /v1/bookings — returns the authenticated traveller's bookings
    const { data: rawBookings = [], isLoading, isError, refetch } = useBookings(
        user?.id ? { userId: user.id, limit: 50, enabled: true } : { enabled: false }
    );

    // Normalise backend shape → flat UI shape
    const bookings = rawBookings.map(normaliseBooking);

    // Derived stats
    const pendingCount = bookings.filter((b) => b.status === 'pending').length;
    const totalSpent     = bookings.reduce((sum, b) => sum + (b.amount ?? 0), 0);

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showChat,        setShowChat]        = useState(false);
    const [chatMsg,         setChatMsg]         = useState('');
    const chatEndRef = useRef(null);

    const [ratings, setRatings] = useState(() => {
        try { return JSON.parse(localStorage.getItem('bookingRatings') ?? '{}'); }
        catch { return {}; }
    });

    const existingComplaint = null; // Disputes are now managed via /v1/disputes — see UserComplaints page
    const activeComplaint   = null;

    useEffect(() => {
        if (showChat && chatEndRef.current)
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [showChat]);

    const openComplaintChat = () => setShowChat(true);

    const handleSend = () => {
        if (!chatMsg.trim() || !selectedBooking) return;
        // File a new dispute via the backend
        createDispute({
            operatorId: selectedBooking.operatorId,
            bookingId:  selectedBooking._raw?.id ?? selectedBooking.id,
            subject:    `Issue with booking ${selectedBooking.id}`,
            message:    chatMsg,
        }, {
            onSuccess: () => {
                setChatMsg('');
                setShowChat(false);
                navigate('/traveller/complaints');
            },
        });
    };

    const closeModal = () => { setSelectedBooking(null); setShowChat(false); setChatMsg(''); };
    const openBookingDetail = (b) => { setSelectedBooking(b); setShowChat(false); setChatMsg(''); };

    const canCancelBooking = (b) =>
        ['pending', 'confirmed', 'paid'].includes((b.status ?? '').toLowerCase());

    const handleCancelBooking = async () => {
        if (!selectedBooking || !canCancelBooking(selectedBooking)) return;
        const ok = await confirm({
            title: 'Cancel this booking?',
            description: 'Refund rules may apply per operator policy.',
            confirmLabel: 'Cancel Booking',
        });
        if (!ok) return;
        cancelBooking(selectedBooking.id, {
            onSuccess: () => closeModal(),
        });
    };

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="bg-[#EBFDF5] p-4 rounded-2xl text-[#10B981] shrink-0"><Ticket size={24} /></div>
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {isLoading ? '—' : bookings.length}
                        </div>
                        <div className="text-[13px] font-medium text-gray-400">Total Bookings</div>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="bg-amber-50 p-4 rounded-2xl text-amber-500 shrink-0"><Clock size={24} /></div>
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {isLoading ? '—' : pendingCount}
                        </div>
                        <div className="text-[13px] font-medium text-gray-400">Pending Payment</div>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="bg-[#FFF7ED] p-4 rounded-2xl text-[#F97316] shrink-0"><CreditCard size={24} /></div>
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">
                            {isLoading ? '—' : `ETB ${totalSpent.toLocaleString()}`}
                        </div>
                        <div className="text-[13px] font-medium text-gray-400">Total Spent</div>
                    </div>
                </Card>

                <Card onClick={() => navigate('/search')}
                    className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:scale-[1.01]">
                    <div className="bg-[#EFF6FF] p-4 rounded-2xl text-[#3B82F6] shrink-0"><PlusCircle size={24} /></div>
                    <div className="flex flex-col">
                        <div className="text-base font-bold text-gray-900">Book New Trip</div>
                        <div className="text-[11px] font-medium text-gray-400 max-w-[160px] leading-tight mt-0.5">
                            Search routes and book your next journey in seconds.
                        </div>
                    </div>
                    <div className="ml-auto text-[#3B82F6]"><ArrowRight size={20} /></div>
                </Card>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto" />
                        <p className="text-gray-400 text-sm mt-4 font-medium">Loading your bookings…</p>
                    </div>
                ) : isError ? (
                    <div className="p-12 text-center">
                        <Ticket size={40} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">Could not load bookings</p>
                        <p className="text-gray-400 text-sm mt-1">Check your connection and try again.</p>
                        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="p-12 text-center">
                        <Ticket size={40} className="text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold">No bookings yet</p>
                        <Button className="mt-4" onClick={() => navigate('/search')}>Book a Trip</Button>
                    </div>
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium text-xs">
                            <tr>
                                <th className="px-6 py-4">Booking ID</th>
                                <th className="px-6 py-4">Operator</th>
                                <th className="px-6 py-4">Route</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Rating</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {bookings.map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-gray-500 text-xs">{booking.id}</td>
                                    <td className="px-6 py-4 font-medium">{booking.operator}</td>
                                    <td className="px-6 py-4 text-gray-600">{booking.route}</td>
                                    <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={cn(
                                                'text-[10px] font-bold uppercase px-2.5 py-1 rounded-full',
                                                booking.status === 'confirmed' || booking.status === 'paid'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : booking.status === 'cancelled'
                                                      ? 'bg-gray-100 text-gray-500'
                                                      : 'bg-amber-100 text-amber-700'
                                            )}
                                        >
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StarRating bookingId={booking.id} ratings={ratings} setRatings={setRatings} />
                                    </td>
                                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                                        ETB {(booking.amount ?? 0).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button onClick={() => openBookingDetail(booking)}
                                            className="inline-flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
                                            <Eye size={14} /> View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ═══════════════════════ MODAL ═══════════════════════ */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                        {/* Modal Header */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
                            {showChat && (
                                <button onClick={() => setShowChat(false)}
                                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mr-1">
                                    <ChevronLeft size={17} className="text-gray-500" />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                {showChat ? <MessageSquare size={18} className="text-primary" /> : <Bus size={18} className="text-primary" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">
                                    {showChat ? `Complaint — ${selectedBooking.busName}` : selectedBooking.busName}
                                </h2>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                    {showChat ? (activeComplaint?.id ?? 'New Complaint') : selectedBooking.ticketId}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {showChat && activeComplaint && <ComplaintStatusBadge status={activeComplaint.status} />}
                                <button onClick={closeModal} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                                    <X size={17} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                            {!showChat && (
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                                    {/* Route Banner */}
                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100/60">
                                        <p className="text-[9px] font-extrabold text-blue-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                                            <MapPin size={9} /> Route
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="text-2xl font-black text-gray-900 leading-none">{selectedBooking.departure}</p>
                                                <p className="text-sm font-bold text-blue-600 mt-1">{selectedBooking.from}</p>
                                            </div>
                                            <div className="flex-1 flex items-center gap-2">
                                                <div className="flex-1 h-px bg-blue-200/80" />
                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                                                    <ArrowRight size={13} className="text-blue-500" />
                                                </div>
                                                <div className="flex-1 h-px bg-blue-200/80" />
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-black text-gray-900 leading-none">{selectedBooking.arrival}</p>
                                                <p className="text-sm font-bold text-blue-600 mt-1">{selectedBooking.to}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <InfoTile icon={Bus}        label="Bus Name"     value={selectedBooking.busName} />
                                        <InfoTile icon={User}       label="Operator"     value={selectedBooking.operator} />
                                        <InfoTile icon={Ticket}     label="Ticket ID"    value={selectedBooking.ticketId} />
                                        <InfoTile icon={Hash}       label="Seat Number"  value={selectedBooking.seatNumber} accent="blue" />
                                        <InfoTile icon={Calendar}   label="Travel Date"  value={selectedBooking.date} />
                                        <InfoTile icon={Calendar}   label="Booking Date" value={selectedBooking.bookingDate} />
                                        <InfoTile icon={User}       label="Passenger"    value={selectedBooking.passengerName} />
                                        <InfoTile icon={Phone}      label="Phone"        value={selectedBooking.passengerPhone} />
                                        <InfoTile icon={CreditCard} label="Payment"      value={selectedBooking.paymentStatus} accent="green" />
                                        <InfoTile icon={CreditCard} label="Amount Paid"  value={`ETB ${(selectedBooking.amount ?? 0).toLocaleString()}`} />
                                        {selectedBooking.driverContact && (
                                            <InfoTile icon={Phone} label="Driver Contact" value={selectedBooking.driverContact} />
                                        )}
                                        <InfoTile icon={Hash} label="Bus Plate" value={selectedBooking.busPlate} />
                                    </div>

                                    {existingComplaint && (
                                        <div className="flex items-center gap-3 p-3.5 bg-amber-50 border border-amber-100 rounded-xl">
                                            <AlertCircle size={15} className="text-amber-500 shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-amber-700">Complaint filed for this trip</p>
                                                <p className="text-[10px] text-amber-500 font-mono truncate">{existingComplaint.id}</p>
                                            </div>
                                            <ComplaintStatusBadge status={existingComplaint.status} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {showChat && (
                                <div className="flex-1 flex flex-col min-h-0 bg-[#F7F9FC]">
                                    <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Ticket size={12} className="text-primary" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 truncate">
                                            {selectedBooking.route} · Seat {selectedBooking.seatNumber} · {selectedBooking.date}
                                        </p>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                                        <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare size={22} className="text-primary" />
                                        </div>
                                        <p className="text-sm font-bold text-gray-700">File a Dispute</p>
                                        <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                            Describe your issue below. A dispute will be filed with the operator and you can track it in <strong>My Disputes</strong>.
                                        </p>
                                    </div>

                                    <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
                                        <input type="text"
                                            placeholder="Describe your issue..."
                                            value={chatMsg}
                                            onChange={e => setChatMsg(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                            autoFocus
                                        />
                                        <button onClick={handleSend} disabled={!chatMsg.trim() || filingDispute}
                                            className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        {!showChat && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
                                <Button variant="outline" onClick={closeModal} className="h-10 px-5 rounded-xl text-sm font-semibold border-gray-200">
                                    Close
                                </Button>
                                {canCancelBooking(selectedBooking) && (
                                    <Button
                                        variant="outline"
                                        onClick={handleCancelBooking}
                                        disabled={cancelling}
                                        className="h-10 px-5 rounded-xl text-sm font-semibold border-rose-200 text-rose-600 hover:bg-rose-50"
                                    >
                                        {cancelling ? 'Cancelling…' : 'Cancel Booking'}
                                    </Button>
                                )}
                                <button onClick={openComplaintChat}
                                    className={cn('h-10 px-5 rounded-xl text-sm font-bold flex items-center gap-2 text-white shadow-sm transition-all hover:opacity-90',
                                        existingComplaint ? 'bg-orange-500 shadow-orange-200/60' : 'bg-rose-500 shadow-rose-200/60')}>
                                    <MessageSquare size={14} />
                                    {existingComplaint ? 'Open Complaint Chat' : 'File a Complaint'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
