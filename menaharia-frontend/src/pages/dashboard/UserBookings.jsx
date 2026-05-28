import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import {
    Eye, X, MessageSquare, Send, Bus, Calendar, Ticket,
    User, CreditCard, Phone, Hash, ArrowRight, AlertCircle,
    CheckCircle, Clock, ChevronLeft, MapPin, PlusCircle,
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintsContext';
import { cn } from '../../lib/utils';

// ─── Enhanced mock bookings with full trip data ───────────────────────────────
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
        departure: '14:00 PM',
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

// ─── Small reusable sub-components ───────────────────────────────────────────
function ComplaintStatusBadge({ status }) {
    const styles = {
        Open: 'bg-blue-100 text-blue-700',
        'In Progress': 'bg-orange-100 text-orange-700',
        Resolved: 'bg-green-100 text-green-700',
    };
    const icons = {
        Open: <AlertCircle size={10} />,
        'In Progress': <Clock size={10} />,
        Resolved: <CheckCircle size={10} />,
    };
    return (
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full', styles[status] || 'bg-gray-100 text-gray-500')}>
            {icons[status]}
            {status}
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
                accent === 'green' ? 'text-emerald-600' :
                    accent === 'blue' ? 'text-blue-600' : 'text-gray-800'
            )}>
                {value}
            </p>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function UserBookings() {
    const navigate = useNavigate();
    const { complaints, addComplaint, addMessage } = useComplaints();

    const [bookings, setBookings] = useState(() => {
        const local = localStorage.getItem('userBookings');
        if (local) {
            try {
                return JSON.parse(local);
            } catch (e) {
                console.error(e);
            }
        }
        localStorage.setItem('userBookings', JSON.stringify(MOCK_BOOKINGS));
        return MOCK_BOOKINGS;
    });

    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showChat, setShowChat] = useState(false);
    const [chatMsg, setChatMsg] = useState('');
    const [activeCmpId, setActiveCmpId] = useState(null);
    const chatEndRef = useRef(null);

    // Find an existing complaint for the currently selected booking
    const existingComplaint = selectedBooking
        ? complaints.find(c => c.tripId === selectedBooking.id) ?? null
        : null;

    // The complaint currently being displayed in the chat
    const activeComplaint = activeCmpId
        ? complaints.find(c => c.id === activeCmpId)
        : existingComplaint;

    // Auto-scroll chat to latest message
    useEffect(() => {
        if (showChat && chatEndRef.current)
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [activeComplaint?.messages?.length, showChat]);

    const openComplaintChat = () => {
        if (existingComplaint) setActiveCmpId(existingComplaint.id);
        setShowChat(true);
    };

    const handleSend = () => {
        if (!chatMsg.trim()) return;
        if (!activeComplaint) {
            // First message → create the complaint object
            const newId = addComplaint(
                {
                    tripId: selectedBooking.id,
                    busName: selectedBooking.busName,
                    operatorName: selectedBooking.operator,
                    operatorId: selectedBooking.operatorId,
                    seatNumber: selectedBooking.seatNumber,
                    ticketId: selectedBooking.ticketId,
                    route: selectedBooking.route,
                    travelDate: selectedBooking.date,
                    bookingDate: selectedBooking.bookingDate,
                    passengerName: selectedBooking.passengerName,
                    paymentStatus: selectedBooking.paymentStatus,
                },
                chatMsg
            );
            setActiveCmpId(newId);
        } else {
            addMessage(activeComplaint.id, chatMsg, 'user');
        }
        setChatMsg('');
    };

    const closeModal = () => {
        setSelectedBooking(null);
        setShowChat(false);
        setActiveCmpId(null);
        setChatMsg('');
    };

    const openBookingDetail = (booking) => {
        setSelectedBooking(booking);
        setShowChat(false);
        setActiveCmpId(null);
        setChatMsg('');
    };

    // ── Render ──────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="bg-[#EBFDF5] p-4 rounded-2xl text-[#10B981] shrink-0">
                        <Ticket size={24} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">12</div>
                        <div className="text-[13px] font-medium text-gray-400">Completed Trips</div>
                        <span className="bg-[#ECFDF5] text-[#10B981] px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit mt-1.5">
                            + 2 this month
                        </span>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="bg-[#FFF7ED] p-4 rounded-2xl text-[#F97316] shrink-0">
                        <CreditCard size={24} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-2xl font-bold text-gray-900 leading-none mb-1">ETB 8.5K</div>
                        <div className="text-[13px] font-medium text-gray-400">Total Spent</div>
                        <span className="bg-[#FFF7ED] text-[#F97316] px-2.5 py-0.5 rounded-full text-[10px] font-bold w-fit mt-1.5">
                            + 1.2K this month
                        </span>
                    </div>
                </Card>

                <Card 
                    onClick={() => navigate('/search')}
                    className="p-6 flex items-center gap-4 bg-white border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl cursor-pointer transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.05)] hover:scale-[1.01]"
                >
                    <div className="bg-[#EFF6FF] p-4 rounded-2xl text-[#3B82F6] shrink-0">
                        <PlusCircle size={24} />
                    </div>
                    <div className="flex flex-col">
                        <div className="text-base font-bold text-gray-900">Book New Trip</div>
                        <div className="text-[11px] font-medium text-gray-400 max-w-[160px] leading-tight mt-0.5">
                            Search routes and book your next journey in seconds.
                        </div>
                    </div>
                    <div className="ml-auto text-[#3B82F6] hover:translate-x-1 transition-transform duration-300">
                        <ArrowRight size={20} />
                    </div>
                </Card>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Operator</th>
                            <th className="px-6 py-4">Route</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
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
                                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'secondary'}>
                                        {booking.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    ETB {booking.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => openBookingDetail(booking)}
                                        className="inline-flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors"
                                    >
                                        <Eye size={14} /> View
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ═══════════════════════ MODAL ═══════════════════════ */}
            {selectedBooking && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">

                        {/* ── Modal Header ── */}
                        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 shrink-0">
                            {showChat && (
                                <button
                                    onClick={() => { setShowChat(false); setActiveCmpId(null); }}
                                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors mr-1"
                                >
                                    <ChevronLeft size={17} className="text-gray-500" />
                                </button>
                            )}
                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                {showChat
                                    ? <MessageSquare size={18} className="text-primary" />
                                    : <Bus size={18} className="text-primary" />
                                }
                            </div>
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-gray-900 text-sm leading-tight truncate">
                                    {showChat
                                        ? `Complaint — ${selectedBooking.busName}`
                                        : selectedBooking.busName
                                    }
                                </h2>
                                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                                    {showChat
                                        ? (activeComplaint?.id ?? 'New Complaint')
                                        : selectedBooking.ticketId
                                    }
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                {showChat && activeComplaint && (
                                    <ComplaintStatusBadge status={activeComplaint.status} />
                                )}
                                <button
                                    onClick={closeModal}
                                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={17} className="text-gray-500" />
                                </button>
                            </div>
                        </div>

                        {/* ── Modal Body ── */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0">

                            {/* ─ TRIP DETAIL VIEW ─ */}
                            {!showChat && (
                                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                                    {/* Route banner */}
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

                                    {/* Info grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        <InfoTile icon={Bus}        label="Bus Name"       value={selectedBooking.busName} />
                                        <InfoTile icon={User}       label="Operator"       value={selectedBooking.operator} />
                                        <InfoTile icon={Ticket}     label="Ticket ID"      value={selectedBooking.ticketId} />
                                        <InfoTile icon={Hash}       label="Seat Number"    value={selectedBooking.seatNumber} accent="blue" />
                                        <InfoTile icon={Calendar}   label="Travel Date"    value={selectedBooking.date} />
                                        <InfoTile icon={Calendar}   label="Booking Date"   value={selectedBooking.bookingDate} />
                                        <InfoTile icon={User}       label="Passenger"      value={selectedBooking.passengerName} />
                                        <InfoTile icon={Phone}      label="Phone"          value={selectedBooking.passengerPhone} />
                                        <InfoTile icon={CreditCard} label="Payment"        value={selectedBooking.paymentStatus} accent="green" />
                                        <InfoTile icon={CreditCard} label="Amount Paid"    value={`ETB ${selectedBooking.amount.toLocaleString()}`} />
                                        {selectedBooking.driverContact && (
                                            <InfoTile icon={Phone} label="Driver Contact" value={selectedBooking.driverContact} />
                                        )}
                                        <InfoTile icon={Hash}       label="Bus Plate"      value={selectedBooking.busPlate} />
                                    </div>

                                    {/* Existing complaint banner */}
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

                            {/* ─ COMPLAINT CHAT VIEW ─ */}
                            {showChat && (
                                <div className="flex-1 flex flex-col min-h-0 bg-[#F7F9FC]">

                                    {/* Trip context bar */}
                                    <div className="px-5 py-2.5 bg-white border-b border-gray-100 flex items-center gap-3 shrink-0">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                            <Ticket size={12} className="text-primary" />
                                        </div>
                                        <p className="text-xs font-bold text-gray-600 truncate">
                                            {selectedBooking.route} · Seat {selectedBooking.seatNumber} · {selectedBooking.date}
                                        </p>
                                    </div>

                                    {/* Messages area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                                        {!activeComplaint && (
                                            <div className="text-center py-10 px-6">
                                                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                    <MessageSquare size={22} className="text-primary" />
                                                </div>
                                                <p className="text-sm font-bold text-gray-700">Start a complaint</p>
                                                <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                                                    Send your first message below. A complaint ticket will be created automatically and forwarded to the operator.
                                                </p>
                                            </div>
                                        )}

                                        {activeComplaint?.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={cn('flex flex-col max-w-[78%]',
                                                    msg.sender === 'user' ? 'ml-auto items-end' : 'items-start'
                                                )}
                                            >
                                                <span className="text-[10px] text-gray-400 mb-1 px-1 font-medium">{msg.senderName}</span>
                                                <div className={cn(
                                                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                                                    msg.sender === 'user'
                                                        ? 'bg-primary text-white rounded-br-sm'
                                                        : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                                                )}>
                                                    {msg.text}
                                                </div>
                                                <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                                            </div>
                                        ))}
                                        <div ref={chatEndRef} />
                                    </div>

                                    {/* Chat input */}
                                    {activeComplaint?.status === 'Resolved' ? (
                                        <div className="px-5 py-3 bg-green-50 border-t border-green-100 text-center text-xs font-bold text-green-600 shrink-0">
                                            ✓ This complaint has been resolved
                                        </div>
                                    ) : (
                                        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
                                            <input
                                                type="text"
                                                placeholder={activeComplaint ? 'Send a reply...' : 'Describe your complaint to open a ticket...'}
                                                value={chatMsg}
                                                onChange={e => setChatMsg(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                                autoFocus
                                            />
                                            <button
                                                onClick={handleSend}
                                                disabled={!chatMsg.trim()}
                                                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 shadow-sm"
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* ── Modal Footer (detail view only) ── */}
                        {!showChat && (
                            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 bg-white">
                                <Button
                                    variant="outline"
                                    onClick={closeModal}
                                    className="h-10 px-5 rounded-xl text-sm font-semibold border-gray-200"
                                >
                                    Close
                                </Button>
                                <button
                                    onClick={openComplaintChat}
                                    className={cn(
                                        'h-10 px-5 rounded-xl text-sm font-bold flex items-center gap-2 text-white shadow-sm transition-all hover:opacity-90',
                                        existingComplaint
                                            ? 'bg-orange-500 shadow-orange-200/60'
                                            : 'bg-rose-500 shadow-rose-200/60'
                                    )}
                                >
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
