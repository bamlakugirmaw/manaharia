import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
    Search, AlertCircle, CheckCircle2, Clock, MessageSquare,
    Ticket, MapPin, History, Bus, ChevronLeft, ChevronRight,
    User, XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';
import { useDisputes, useUpdateDispute, DISPUTE_STATUS_LABEL } from '../../hooks/useDisputes';

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const styles = {
        PENDING:   'bg-yellow-100 text-yellow-700',
        IN_REVIEW: 'bg-orange-100 text-orange-700',
        RESOLVED:  'bg-green-100 text-green-700',
        REJECTED:  'bg-red-100 text-red-700',
    };
    const icons = {
        PENDING:   <Clock size={10} />,
        IN_REVIEW: <AlertCircle size={10} />,
        RESOLVED:  <CheckCircle2 size={10} />,
        REJECTED:  <XCircle size={10} />,
    };
    return (
        <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full',
            styles[status] || 'bg-gray-100 text-gray-500')}>
            {icons[status]}
            {DISPUTE_STATUS_LABEL[status] ?? status}
        </span>
    );
}

// ─── Detail / Response view ───────────────────────────────────────────────────
function DisputeDetail({ dispute, onBack }) {
    const [response, setResponse] = useState(dispute.response ?? '');
    const [status, setStatus] = useState(dispute.status);
    const { mutate: updateDispute, isPending } = useUpdateDispute();

    const handleSave = () => {
        updateDispute({ id: dispute.id, status, response: response || undefined },
            { onSuccess: onBack });
    };

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ minHeight: 'calc(100vh - 152px)' }}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                <button onClick={onBack}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <ChevronLeft size={17} className="text-gray-500" />
                </button>
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{dispute.subject}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                        {dispute.id} · User: {dispute.user?.fullName ?? dispute.userId ?? '—'}
                    </p>
                </div>
                {/* Status selector */}
                <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className={cn('text-[10px] font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer',
                        { PENDING: 'bg-yellow-100 text-yellow-700', IN_REVIEW: 'bg-orange-100 text-orange-700', RESOLVED: 'bg-green-100 text-green-700', REJECTED: 'bg-red-100 text-red-700' }[status] || 'bg-gray-100 text-gray-600'
                    )}
                >
                    <option value="PENDING">Pending</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* Context bar */}
            <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-wrap shrink-0">
                {dispute.booking && (
                    <>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            <Ticket size={10} className="text-gray-400" />{dispute.booking.id}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            <MapPin size={10} className="text-gray-400" />
                            {dispute.booking.trip?.route?.origin ?? ''} → {dispute.booking.trip?.route?.destination ?? ''}
                        </div>
                    </>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                    <User size={10} className="text-gray-400" />
                    {dispute.user?.fullName ?? dispute.userId ?? '—'}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F9FC]">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">User's Complaint</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{dispute.message}</p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Your Response</p>
                    <textarea
                        rows={4}
                        placeholder="Write your response to the user..."
                        value={response}
                        onChange={e => setResponse(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none"
                    />
                </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={onBack} className="h-9 px-4 rounded-xl text-sm font-semibold border-gray-200">
                    Cancel
                </Button>
                <Button onClick={handleSave} disabled={isPending} className="h-9 px-5 rounded-xl text-sm font-bold">
                    {isPending ? 'Saving…' : 'Save Response'}
                </Button>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function OperatorDisputes() {
    const { operatorId, scopeReady } = useOperatorScope();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeId, setActiveId] = useState(null);

    const { data: disputes = [], isLoading, isError } = useDisputes({
        operatorId: operatorId ?? undefined,
        limit: 100,
        enabled: scopeReady,
    });

    const activeDispute = disputes.find(d => d.id === activeId);

    if (activeId && activeDispute) {
        return <DisputeDetail dispute={activeDispute} onBack={() => setActiveId(null)} />;
    }

    const filtered = disputes.filter(d => {
        const q = searchQuery.toLowerCase();
        const matchSearch = !q ||
            d.id.toLowerCase().includes(q) ||
            d.subject.toLowerCase().includes(q) ||
            (d.user?.fullName ?? '').toLowerCase().includes(q);
        const matchStatus = statusFilter === 'all' || d.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const counts = {
        PENDING:   disputes.filter(d => d.status === 'PENDING').length,
        IN_REVIEW: disputes.filter(d => d.status === 'IN_REVIEW').length,
        RESOLVED:  disputes.filter(d => d.status === 'RESOLVED').length,
    };

    return (
        <div className="space-y-6">
            <OperatorScopeBanner />
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { icon: AlertCircle,  label: 'Pending',   count: counts.PENDING,   color: 'bg-yellow-50 text-yellow-600' },
                    { icon: History,      label: 'In Review', count: counts.IN_REVIEW, color: 'bg-orange-50 text-orange-600' },
                    { icon: CheckCircle2, label: 'Resolved',  count: counts.RESOLVED,  color: 'bg-green-50 text-green-600' },
                ].map(({ icon: Icon, label, count, color }) => (
                    <Card key={label} className="p-5 bg-white border-none shadow-sm rounded-2xl flex items-center gap-4">
                        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center shrink-0', color)}>
                            <Icon size={22} />
                        </div>
                        <div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{isLoading ? '—' : count}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Search + filter */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search disputes..."
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select
                    className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none font-medium text-gray-600 w-full md:w-auto"
                    value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="REJECTED">Rejected</option>
                </select>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-gray-400 text-sm mt-3">Loading disputes…</p>
                </div>
            ) : isError ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
                    <AlertCircle className="w-10 h-10 text-red-200 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Could not load disputes</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-600">No disputes found</h3>
                    <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(d => (
                        <Card key={d.id}
                            className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-gray-200/60 transition-all duration-200">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <User size={18} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{d.subject}</p>
                                        <StatusBadge status={d.status} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                            <User size={9} className="text-gray-400" />
                                            {d.user?.fullName ?? d.userId ?? '—'}
                                        </span>
                                        {d.booking && (
                                            <>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Ticket size={9} className="text-gray-400" />{d.booking.id}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate leading-relaxed">{d.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                        {d.id} · {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <button onClick={() => setActiveId(d.id)}
                                    className="flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 mt-0.5">
                                    Respond <ChevronRight size={13} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
