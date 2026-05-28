import { useState, useRef, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import {
    Search, AlertCircle, CheckCircle2, Clock, MessageSquare,
    Ticket, Calendar, Send, History, Bus, MapPin, ChevronLeft,
    ChevronRight, User, Hash,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useComplaints } from '../../contexts/ComplaintsContext';
import { useAuth } from '../../contexts/AuthContext';

// ─── Legacy hardcoded disputes (historical / demo data) ───────────────────────
const LEGACY_DISPUTES = [
    {
        id: 'DSP-001',
        user: { name: 'Tigist Alemu', avatar: 'TA' },
        route: 'Addis Ababa → Hawassa',
        date: 'Nov 28, 2025',
        issue: 'Refund request — bus never arrived',
        status: 'resolved',
        priority: 'medium',
        isLegacy: true,
        operatorId: 'OP-001',
    },
    {
        id: 'DSP-002',
        user: { name: 'Dawit Haile', avatar: 'DH' },
        route: 'Bahir Dar → Mekelle',
        date: 'Dec 02, 2025',
        issue: 'Overcharged for extra luggage (500 ETB)',
        status: 'in-progress',
        priority: 'low',
        isLegacy: true,
        operatorId: 'OP-002',
    },
];

// ─── Helper components ────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const map = {
        Open: 'bg-blue-100 text-blue-700',
        'In Progress': 'bg-orange-100 text-orange-700',
        Resolved: 'bg-green-100 text-green-700',
        pending: 'bg-yellow-100 text-yellow-700',
        'in-progress': 'bg-orange-100 text-orange-700',
        resolved: 'bg-green-100 text-green-700',
    };
    const icons = {
        Open: <AlertCircle size={10} />,
        'In Progress': <Clock size={10} />,
        Resolved: <CheckCircle2 size={10} />,
        pending: <Clock size={10} />,
        'in-progress': <AlertCircle size={10} />,
        resolved: <CheckCircle2 size={10} />,
    };
    const label = { 'in-progress': 'In Progress', pending: 'Pending', resolved: 'Resolved' }[status] || status;
    return (
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full', map[status] || 'bg-gray-100 text-gray-500')}>
            {icons[status]}
            {label}
        </span>
    );
}

function PriorityBadge({ priority }) {
    const map = {
        high: 'text-red-600 border-red-200 bg-red-50',
        medium: 'text-orange-600 border-orange-200 bg-orange-50',
        low: 'text-blue-600 border-blue-200 bg-blue-50',
    };
    return (
        <span className={cn('text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border rounded-full', map[priority] || '')}>
            {priority}
        </span>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OperatorDisputes() {
    const { complaints, addMessage, updateStatus } = useComplaints();
    const { user } = useAuth();
    
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeCmpId, setActiveCmpId] = useState(null);   // context complaint chat
    const [chatMsg, setChatMsg] = useState('');
    const chatEndRef = useRef(null);

    const activeComplaint = complaints.find(c => c.id === activeCmpId);

    useEffect(() => {
        if (chatEndRef.current)
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [activeComplaint?.messages?.length]);

    const handleSend = () => {
        if (!chatMsg.trim() || !activeCmpId) return;
        addMessage(activeCmpId, chatMsg, 'operator');
        setChatMsg('');
    };

    // Filter complaints to only those linked to this specific operator
    const operatorId = user?.operatorId || 'OP-001'; // Default to Selam Bus OP-001 for demo purposes
    const operatorComplaints = complaints.filter(c => c.operatorId === operatorId);
    const operatorLegacy = LEGACY_DISPUTES.filter(d => d.operatorId === operatorId);

    // ── OPERATOR CHAT VIEW ────────────────────────────────────────────────────
    if (activeCmpId && activeComplaint) {
        return (
            <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                style={{ height: 'calc(100vh - 152px)' }}>

                {/* Header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                    <button
                        onClick={() => { setActiveCmpId(null); setChatMsg(''); }}
                        className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <ChevronLeft size={17} className="text-gray-500" />
                    </button>
                    <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                        <MessageSquare size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                            {activeComplaint.busName} · {activeComplaint.route}
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono">
                            {activeComplaint.id} · Passenger: {activeComplaint.passengerName}
                        </p>
                    </div>

                    {/* Inline status selector for operator */}
                    <select
                        value={activeComplaint.status}
                        onChange={e => updateStatus(activeCmpId, e.target.value)}
                        className={cn(
                            'text-[10px] font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition-colors',
                            {
                                Open: 'bg-blue-100 text-blue-700',
                                'In Progress': 'bg-orange-100 text-orange-700',
                                Resolved: 'bg-green-100 text-green-700',
                            }[activeComplaint.status] || 'bg-gray-100 text-gray-600'
                        )}
                    >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                    </select>
                </div>

                {/* Trip context bar */}
                <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-wrap shrink-0">
                    {[
                        { icon: Ticket, val: activeComplaint.ticketId },
                        { icon: Hash,   val: `Seat ${activeComplaint.seatNumber}` },
                        { icon: MapPin, val: activeComplaint.route },
                        { icon: User,   val: activeComplaint.passengerName },
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
                                msg.sender === 'operator' ? 'ml-auto items-end' : 'items-start'
                            )}
                        >
                            <span className="text-[10px] text-gray-400 mb-1 px-1 font-medium">{msg.senderName}</span>
                            <div className={cn(
                                'px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm',
                                msg.sender === 'operator'
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

                {/* Input */}
                {activeComplaint.status === 'Resolved' ? (
                    <div className="px-5 py-3.5 bg-green-50 border-t border-green-100 text-center text-xs font-bold text-green-600 shrink-0">
                        ✓ Complaint marked as resolved
                    </div>
                ) : (
                    <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 items-center shrink-0">
                        <input
                            type="text"
                            placeholder="Reply to the passenger..."
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
    const openCount = operatorComplaints.filter(c => c.status === 'Open').length + operatorLegacy.filter(d => d.status === 'open').length;
    const inProgressCount = operatorComplaints.filter(c => c.status === 'In Progress').length + operatorLegacy.filter(d => d.status === 'in-progress').length;
    const resolvedCount = operatorComplaints.filter(c => c.status === 'Resolved').length + operatorLegacy.filter(d => d.status === 'resolved').length;

    const filteredComplaints = operatorComplaints.filter(c => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
            c.id.toLowerCase().includes(q) ||
            c.passengerName.toLowerCase().includes(q) ||
            c.route.toLowerCase().includes(q) ||
            c.busName.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' ||
            c.status.toLowerCase().replace(' ', '-') === statusFilter;
        return matchSearch && matchStatus;
    });

    const filteredLegacy = operatorLegacy.filter(d => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
            d.id.toLowerCase().includes(q) ||
            d.user.name.toLowerCase().includes(q) ||
            d.issue.toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchSearch && matchStatus;
    });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Disputes & Complaints</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    Manage complaints and chat directly with passengers to resolve travel issues.
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { icon: AlertCircle, label: 'Open', count: openCount, color: 'bg-red-50 text-red-600' },
                    { icon: History,     label: 'In Progress', count: inProgressCount, color: 'bg-blue-50 text-blue-600' },
                    { icon: CheckCircle2,label: 'Resolved', count: resolvedCount, color: 'bg-green-50 text-green-600' },
                ].map(({ icon: Icon, label, count, color }) => (
                    <Card key={label} className="p-5 bg-white border-none shadow-sm rounded-2xl flex items-center gap-4">
                        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', color)}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{count}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search + filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search complaints..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <select
                    className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium text-gray-600 w-full md:w-auto"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="all">All Status</option>
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                </select>
            </div>

            {/* ─ Live User Complaints ─ */}
            {filteredComplaints.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                        <h2 className="text-xs font-extrabold text-gray-500 uppercase tracking-widest">Live User Complaints</h2>
                    </div>

                    <div className="space-y-3">
                        {filteredComplaints.map(c => {
                            const lastMsg = c.messages[c.messages.length - 1];
                            return (
                                <Card
                                    key={c.id}
                                    className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-gray-200/60 transition-all duration-200"
                                >
                                    <div className="flex items-start gap-4">
                                        {/* Icon */}
                                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                            <User size={18} className="text-primary" />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                                <p className="font-bold text-gray-900 text-sm leading-tight">
                                                    Passenger: {c.passengerName}
                                                </p>
                                                <StatusBadge status={c.status} />
                                            </div>

                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Bus size={9} className="text-gray-400" />{c.busName}
                                                </span>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <MapPin size={9} className="text-gray-400" />{c.route}
                                                </span>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Ticket size={9} className="text-gray-400" />{c.ticketId}
                                                </span>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Hash size={9} className="text-gray-400" />Seat {c.seatNumber}
                                                </span>
                                            </div>

                                            {/* Latest message preview */}
                                            <p className="text-xs text-gray-500 truncate leading-relaxed">
                                                <span className={cn(
                                                    'font-semibold mr-1',
                                                    lastMsg.sender === 'operator' ? 'text-blue-500' : 'text-gray-600'
                                                )}>
                                                    {lastMsg.sender === 'operator' ? 'You:' : `${c.passengerName}:`}
                                                </span>
                                                {lastMsg.text}
                                            </p>

                                            <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                                {c.id} · {c.createdAt}
                                            </p>
                                        </div>

                                        {/* Reply button */}
                                        <button
                                            onClick={() => setActiveCmpId(c.id)}
                                            className="flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 mt-0.5"
                                        >
                                            Reply <ChevronRight size={13} />
                                        </button>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ─ Historical Disputes ─ */}
            {filteredLegacy.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest">Historical Disputes</h2>

                    <div className="space-y-3">
                        {filteredLegacy.map(d => (
                            <Card
                                key={d.id}
                                className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:border-gray-200/60 transition-all duration-200"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5 text-gray-500 font-bold text-xs">
                                        {d.user.avatar}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-1.5">
                                            <p className="font-bold text-gray-900 text-sm leading-tight">
                                                Passenger: {d.user.name}
                                            </p>
                                            <StatusBadge status={d.status} />
                                        </div>

                                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <MapPin size={9} className="text-gray-400" />{d.route}
                                            </span>
                                            <span className="text-gray-200">•</span>
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <Calendar size={9} className="text-gray-400" />{d.date}
                                            </span>
                                            <span className="text-gray-200">•</span>
                                            <PriorityBadge priority={d.priority} />
                                        </div>

                                        <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                                            Issue: <span className="font-normal text-gray-500">{d.issue}</span>
                                        </p>

                                        <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                            {d.id}
                                        </p>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Empty state */}
            {filteredComplaints.length === 0 && filteredLegacy.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-600">No disputes found</h3>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
    );
}
