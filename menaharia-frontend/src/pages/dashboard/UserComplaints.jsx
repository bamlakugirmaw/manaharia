import { useState, useRef, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import {
    AlertCircle, CheckCircle, Clock, MessageSquare,
    Send, X, Bus, Ticket, MapPin, ChevronRight,
} from 'lucide-react';
import { useComplaints } from '../../contexts/ComplaintsContext';
import { cn } from '../../lib/utils';

// ─── Shared status badge ───────────────────────────────────────────────────────
function StatusBadge({ status }) {
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
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full',
            styles[status] || 'bg-gray-100 text-gray-500'
        )}>
            {icons[status]}
            {status}
        </span>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function UserComplaints() {
    const { complaints, addMessage } = useComplaints();
    const [activeCmpId, setActiveCmpId] = useState(null);
    const [chatMsg, setChatMsg] = useState('');
    const chatEndRef = useRef(null);

    const activeComplaint = complaints.find(c => c.id === activeCmpId);

    useEffect(() => {
        if (chatEndRef.current)
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [activeComplaint?.messages?.length]);

    const handleSend = () => {
        if (!chatMsg.trim() || !activeCmpId) return;
        addMessage(activeCmpId, chatMsg, 'user');
        setChatMsg('');
    };

    // ── CHAT VIEW ─────────────────────────────────────────────────────────────
    if (activeCmpId && activeComplaint) {
        return (
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                style={{ height: 'calc(100vh - 152px)' }}>

                {/* Chat Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => { setActiveCmpId(null); setChatMsg(''); }}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                        title="Back to list"
                    >
                        <X size={16} className="text-gray-500" />
                    </button>
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <MessageSquare size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {activeComplaint.busName} · {activeComplaint.route}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                            {activeComplaint.id} · {activeComplaint.createdAt}
                        </p>
                    </div>
                    <StatusBadge status={activeComplaint.status} />
                </div>

                {/* Trip context bar */}
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-wrap shrink-0">
                    {[
                        { icon: Ticket, val: activeComplaint.ticketId },
                        { icon: MapPin, val: activeComplaint.route },
                        { label: 'Seat', val: activeComplaint.seatNumber },
                        { label: 'Travel', val: activeComplaint.travelDate },
                    ].map(({ icon: Icon, label, val }, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            {Icon && <Icon size={10} className="text-gray-400" />}
                            {label && <span className="text-gray-400">{label}:</span>}
                            {val}
                        </div>
                    ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F7F9FC]">
                    {activeComplaint.messages.map((msg, idx) => (
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

                {/* Input or Resolved Banner */}
                {activeComplaint.status === 'Resolved' ? (
                    <div className="px-5 py-3.5 bg-green-50 border-t border-green-100 text-center text-xs font-bold text-green-600 shrink-0">
                        ✓ This complaint has been resolved
                    </div>
                ) : (
                    <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
                        <input
                            type="text"
                            placeholder="Send a message..."
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
        );
    }

    // ── LIST VIEW ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    Track complaints and communicate with operators. File new complaints from{' '}
                    <span className="font-bold text-primary">My Bookings → View → File a Complaint</span>.
                </p>
            </div>

            {complaints.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-600">No complaints yet</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Go to My Bookings → click View on a trip → File a Complaint
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map(complaint => {
                        const lastMsg = complaint.messages[complaint.messages.length - 1];
                        return (
                            <Card
                                key={complaint.id}
                                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-gray-200/60 transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                        <Bus size={18} className="text-primary" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <p className="font-bold text-gray-900 text-sm leading-tight">{complaint.busName}</p>
                                            <StatusBadge status={complaint.status} />
                                        </div>

                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <MapPin size={9} />{complaint.route}
                                            </span>
                                            <span className="text-gray-200">•</span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <Ticket size={9} />{complaint.ticketId}
                                            </span>
                                        </div>

                                        {/* Latest message preview */}
                                        <p className="text-xs text-gray-500 truncate leading-relaxed">
                                            <span className={cn(
                                                'font-semibold mr-1',
                                                lastMsg.sender === 'user' ? 'text-blue-500' : 'text-gray-600'
                                            )}>
                                                {lastMsg.sender === 'user' ? 'You:' : `${complaint.operatorName}:`}
                                            </span>
                                            {lastMsg.text}
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                            {complaint.id} · {complaint.createdAt}
                                        </p>
                                    </div>

                                    {/* Open Chat button */}
                                    <button
                                        onClick={() => setActiveCmpId(complaint.id)}
                                        className="flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 mt-0.5"
                                    >
                                        Open Chat <ChevronRight size={13} />
                                    </button>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
