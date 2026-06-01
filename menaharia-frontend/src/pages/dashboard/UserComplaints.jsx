import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import {
    AlertCircle, CheckCircle, Clock, MessageSquare,
    X, Bus, Ticket, MapPin, ChevronRight, XCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useDisputes, useRemoveDispute, DISPUTE_STATUS_LABEL } from '../../hooks/useDisputes';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { cn } from '../../lib/utils';

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
        RESOLVED:  <CheckCircle size={10} />,
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

// ─── Detail view ──────────────────────────────────────────────────────────────
function DisputeDetail({ dispute, onBack }) {
    const { mutate: removeDispute, isPending: removing } = useRemoveDispute();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();

    const handleWithdraw = async () => {
        const ok = await confirm({
            title: 'Withdraw this dispute?',
            description: 'Your complaint will be removed. This action cannot be undone.',
            confirmLabel: 'Withdraw',
        });
        if (!ok) return;
        removeDispute(dispute.id, { onSuccess: onBack });
    };

    return (
        <div className="flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
            style={{ minHeight: 'calc(100vh - 152px)' }}>
            <ConfirmDialogHost />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100 shrink-0">
                <button onClick={onBack}
                    className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <X size={16} className="text-gray-500" />
                </button>
                <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                    <MessageSquare size={16} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{dispute.subject}</p>
                    <p className="text-[10px] text-gray-400 font-mono">
                        {dispute.id} · {new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>
                <StatusBadge status={dispute.status} />
            </div>

            {/* Context bar */}
            <div className="px-5 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-4 flex-wrap shrink-0">
                {dispute.booking && (
                    <>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            <Ticket size={10} className="text-gray-400" />
                            {dispute.booking.id}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                            <MapPin size={10} className="text-gray-400" />
                            {dispute.booking.trip?.route?.origin ?? ''} → {dispute.booking.trip?.route?.destination ?? ''}
                        </div>
                    </>
                )}
                {dispute.operator && (
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-semibold">
                        <Bus size={10} className="text-gray-400" />
                        {dispute.operator.name ?? dispute.operator.companyName}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#F7F9FC]">
                {/* Original message */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Your Complaint</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{dispute.message}</p>
                </div>

                {/* Operator response */}
                {dispute.response && (
                    <div className="bg-blue-50 rounded-2xl border border-blue-100 p-5">
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">
                            Operator Response
                        </p>
                        <p className="text-sm text-blue-800 leading-relaxed">{dispute.response}</p>
                    </div>
                )}

                {!dispute.response && dispute.status === 'PENDING' && (
                    <div className="text-center py-8 text-gray-400">
                        <Clock size={32} className="mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-bold">Awaiting operator response</p>
                        <p className="text-xs mt-1">You'll be notified when the operator replies.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            {dispute.status === 'PENDING' && (
                <div className="px-5 py-4 bg-white border-t border-gray-100 flex justify-end shrink-0">
                    <button
                        onClick={handleWithdraw}
                        disabled={removing}
                        className="text-xs font-bold text-red-500 hover:text-red-700 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                        {removing ? 'Withdrawing...' : 'Withdraw Dispute'}
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function UserComplaints() {
    const { user } = useAuth();
    const [activeId, setActiveId] = useState(null);

    const { data: rawDisputes = [], isLoading, isError } = useDisputes({ limit: 100 });

    const disputes = rawDisputes.filter((d) => {
        if (!user?.id) return true;
        const uid = d.userId ?? d.user?.id;
        return !uid || uid === user.id;
    });

    const activeDispute = disputes.find(d => d.id === activeId);

    if (activeId && activeDispute) {
        return <DisputeDetail dispute={activeDispute} onBack={() => setActiveId(null)} />;
    }

    return (
        <div className="space-y-5">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">My Disputes</h1>
                <p className="text-sm text-gray-400 mt-0.5">
                    Track disputes filed against operators. File new disputes from{' '}
                    <span className="font-bold text-primary">My Bookings → View → File a Complaint</span>.
                </p>
            </div>

            {isLoading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-gray-400 text-sm mt-3">Loading disputes…</p>
                </div>
            ) : isError ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-red-200">
                    <AlertCircle className="w-10 h-10 text-red-200 mx-auto mb-3" />
                    <p className="font-bold text-gray-600">Could not load disputes</p>
                    <p className="text-sm text-gray-400 mt-1">Check your connection and try again.</p>
                </div>
            ) : disputes.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                    <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                    <h3 className="font-bold text-gray-600">No disputes yet</h3>
                    <p className="text-sm text-gray-400 mt-1">
                        Go to My Bookings → click View on a trip → File a Complaint
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {disputes.map(dispute => (
                        <Card key={dispute.id}
                            className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5 hover:shadow-md hover:border-gray-200/60 transition-all duration-200">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                                    <Bus size={18} className="text-primary" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-3 mb-1.5">
                                        <p className="font-bold text-gray-900 text-sm leading-tight">{dispute.subject}</p>
                                        <StatusBadge status={dispute.status} />
                                    </div>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        {dispute.operator && (
                                            <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                <Bus size={9} />
                                                {dispute.operator.name ?? dispute.operator.companyName}
                                            </span>
                                        )}
                                        {dispute.booking && (
                                            <>
                                                <span className="text-gray-200">•</span>
                                                <span className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                    <Ticket size={9} />{dispute.booking.id}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate leading-relaxed">{dispute.message}</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-mono">
                                        {dispute.id} · {new Date(dispute.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                </div>
                                <button onClick={() => setActiveId(dispute.id)}
                                    className="flex items-center gap-1.5 text-primary text-xs font-bold px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors shrink-0 mt-0.5">
                                    View <ChevronRight size={13} />
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
