import React, { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Download, Search, Calendar, CreditCard, ChevronDown, X, Receipt } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePayments } from '../../hooks/usePayments';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';

// ─── Map backend payment to display shape ─────────────────────────────────────
function mapPayment(p) {
    const statusMap = { SUCCESS: 'Completed', PENDING: 'Pending', FAILED: 'Failed' };
    const bankMap   = { TELEBIRR: 'Telebirr', CBE: 'CBE', CHAPA: 'Chapa' };
    return {
        id:      p.id,
        date:    p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        rawDate: p.createdAt ?? '',
        amount:  p.amount ?? 0,
        status:  statusMap[p.status] ?? p.status ?? 'Pending',
        method:  p.method ?? '—',
        bank:    bankMap[p.method] ?? p.method ?? '—',
        account: '—',
    };
}

export default function OperatorPayouts() {
    const { bookings, scopeReady, bookingsQuery } = useOperatorScope({ limit: 500 });
    const operatorBookingIds = useMemo(
        () => new Set(bookings.map((b) => b.id).filter(Boolean)),
        [bookings],
    );

    const [searchTerm,      setSearchTerm]      = useState('');
    const [startDate,       setStartDate]       = useState('');
    const [endDate,         setEndDate]         = useState('');
    const [showDatePicker,  setShowDatePicker]  = useState(false);
    const [selectedStart,   setSelectedStart]   = useState({ month: 'may', day: 12 });
    const [selectedEnd,     setSelectedEnd]     = useState({ month: 'june', day: 20 });
    const [selectedPayout,  setSelectedPayout]  = useState(null);

    const { data: rawPayments = [], isLoading: paymentsLoading } = usePayments({
        limit: 200,
        enabled: scopeReady,
    });
    const isLoading = paymentsLoading || bookingsQuery.isLoading;
    const payments = useMemo(
        () => rawPayments
            .filter((p) => p.bookingId && operatorBookingIds.has(p.bookingId))
            .map(mapPayment),
        [rawPayments, operatorBookingIds],
    );

    // ── Filter logic ──────────────────────────────────────────────────────────
    const filteredPayouts = useMemo(() => {
        return payments.filter(p => {
            const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.amount.toString().includes(searchTerm);
            const payoutDate = new Date(p.rawDate);
            const start = startDate ? new Date(startDate) : null;
            const end   = endDate   ? new Date(endDate)   : null;
            let matchesDate = true;
            if (start) matchesDate = matchesDate && payoutDate >= start;
            if (end) {
                const endOfDay = new Date(end);
                endOfDay.setHours(23, 59, 59, 999);
                matchesDate = matchesDate && payoutDate <= endOfDay;
            }
            return matchesSearch && matchesDate;
        });
    }, [payments, searchTerm, startDate, endDate]);

    // ── Calendar helpers ──────────────────────────────────────────────────────
    const handleDayClick = (month, day) => {
        if (!selectedStart || (selectedStart && selectedEnd)) {
            setSelectedStart({ month, day }); setSelectedEnd(null);
        } else {
            const isAfter = (month === 'june' && selectedStart.month === 'may') ||
                (month === selectedStart.month && day >= selectedStart.day);
            if (isAfter) setSelectedEnd({ month, day });
            else { setSelectedStart({ month, day }); setSelectedEnd(null); }
        }
    };
    const isDaySelected = (month, day) =>
        (selectedStart?.month === month && selectedStart?.day === day) ||
        (selectedEnd?.month === month && selectedEnd?.day === day);
    const isDayHighlighted = (month, day) => {
        if (!selectedStart || !selectedEnd) return false;
        if (selectedStart.month === selectedEnd.month)
            return month === selectedStart.month && day > selectedStart.day && day < selectedEnd.day;
        if (month === 'may') return day > selectedStart.day;
        if (month === 'june') return day < selectedEnd.day;
        return false;
    };
    const formatDateDisplay = (d) => {
        if (!d) return 'Select date';
        return `${d.month === 'may' ? 'May' : 'June'} ${d.day}, 2025`;
    };
    const handleApply = () => {
        if (selectedStart && selectedEnd) {
            setStartDate(`2025-${selectedStart.month === 'may' ? '05' : '06'}-${String(selectedStart.day).padStart(2,'0')}`);
            setEndDate(`2025-${selectedEnd.month === 'may' ? '05' : '06'}-${String(selectedEnd.day).padStart(2,'0')}`);
        }
        setShowDatePicker(false);
    };

    const statusClass = (s) =>
        s === 'Completed' ? 'bg-green-100 text-green-700' :
        s === 'Processing' ? 'bg-blue-100 text-blue-700' :
        s === 'Failed' ? 'bg-red-100 text-red-700' :
        'bg-orange-100 text-orange-700';

    return (
        <div className="space-y-6">
            <OperatorScopeBanner />
            <Card className="p-6 border-none shadow-sm space-y-6">
                {/* Filters */}
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input type="text" placeholder="Search by ID or amount..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="flex gap-2 relative">
                            <Button variant="outline"
                                className={cn("flex items-center gap-2 border transition-all text-sm font-semibold rounded-lg px-4 py-2",
                                    showDatePicker ? "border-primary text-primary bg-primary/5" : "border-gray-200 text-gray-600 hover:bg-gray-50")}
                                onClick={() => setShowDatePicker(!showDatePicker)}>
                                <Calendar size={16} />
                                {startDate && endDate
                                    ? `${new Date(startDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})} - ${new Date(endDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}`
                                    : 'Date Range'}
                                <ChevronDown size={14} className={cn("transition-transform", showDatePicker && "rotate-180")} />
                            </Button>
                            {(startDate || endDate) && (
                                <Button variant="ghost" size="sm" className="text-gray-500"
                                    onClick={() => { setStartDate(''); setEndDate(''); setSelectedStart({month:'may',day:12}); setSelectedEnd({month:'june',day:20}); }}>
                                    Clear
                                </Button>
                            )}
                            {showDatePicker && (
                                <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl p-6 flex flex-row gap-6 text-gray-800 w-[840px] animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="flex flex-row justify-between items-center px-2">
                                            <button type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">&lt;</button>
                                            <div className="flex justify-around w-full">
                                                <span className="font-bold text-sm text-gray-900 ml-12">May 2025</span>
                                                <span className="font-bold text-sm text-gray-900 mr-12">June 2025</span>
                                            </div>
                                            <button type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">&gt;</button>
                                        </div>
                                        <div className="flex flex-row gap-6">
                                            {[{month:'may',days:31,offset:4},{month:'june',days:30,offset:0}].map(({month,days,offset}) => (
                                                <div key={month} className="flex-1 flex flex-col gap-2">
                                                    <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d=><span key={d}>{d}</span>)}
                                                    </div>
                                                    <div className="grid grid-cols-7 gap-y-1 text-xs text-center font-semibold">
                                                        {Array.from({length:offset},(_,i)=><span key={`e${i}`} className="h-8"/>)}
                                                        {Array.from({length:days},(_,i)=>{
                                                            const day=i+1;
                                                            const isSel=isDaySelected(month,day);
                                                            const isHi=isDayHighlighted(month,day);
                                                            return (
                                                                <div key={`${month}-${day}`} className={cn("h-8 flex items-center justify-center relative",isHi&&"bg-blue-50 text-blue-600")}>
                                                                    <button type="button" onClick={()=>handleDayClick(month,day)}
                                                                        className={cn("h-8 w-8 flex items-center justify-center rounded-full transition-all focus:outline-none",
                                                                            isSel?"bg-blue-600 text-white font-bold":"hover:bg-gray-100 text-gray-700")}>
                                                                        {day}
                                                                    </button>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="w-52 border-l border-gray-100 pl-4 flex flex-col gap-4 text-left">
                                        <h4 className="font-bold text-xs text-gray-900">Selected Range</h4>
                                        <div className="space-y-3">
                                            {[{label:'From',val:selectedStart},{label:'To',val:selectedEnd}].map(({label,val})=>(
                                                <div key={label} className="space-y-1">
                                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</label>
                                                    <div className="flex items-center justify-between border border-gray-200 rounded-lg p-2 bg-gray-50 text-xs font-semibold text-gray-700">
                                                        <span>{formatDateDisplay(val)}</span>
                                                        <Calendar size={14} className="text-gray-400" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <Button type="button" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm" onClick={handleApply}>Apply</Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Payout ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Method</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                                </td></tr>
                            ) : filteredPayouts.length > 0 ? filteredPayouts.map(payout => (
                                <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 font-mono text-xs">{payout.id?.slice(0,16)}…</td>
                                    <td className="px-6 py-4 text-gray-600">{payout.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">ETB {payout.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <span>{payout.bank}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={statusClass(payout.status)}>{payout.status}</Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50" onClick={() => setSelectedPayout(payout)}>Details</Button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-500">No payouts found for the selected criteria.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Showing {filteredPayouts.length} of {payments.length} payouts</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm" disabled>Next</Button>
                    </div>
                </div>
            </Card>

            {/* Detail Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
                            <div className="flex items-center gap-2">
                                <Receipt className="text-gray-400" size={20} />
                                <h3 className="font-bold text-lg text-gray-900">Payout Details</h3>
                            </div>
                            <button onClick={() => setSelectedPayout(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg transition-colors"><X size={20} /></button>
                        </div>
                        <div className="text-center py-6 bg-gray-50 rounded-2xl mb-6 flex flex-col items-center justify-center">
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Payout Amount</p>
                            <h4 className="text-3xl font-extrabold text-gray-900 mb-3">ETB {selectedPayout.amount.toLocaleString()}</h4>
                            <Badge className={statusClass(selectedPayout.status)}>{selectedPayout.status}</Badge>
                        </div>
                        <div className="space-y-4 text-sm mb-6">
                            {[
                                ['Payout ID',           selectedPayout.id],
                                ['Date Initiated',      selectedPayout.date],
                                ['Transfer Method',     selectedPayout.method],
                                ['Bank/Wallet Provider',selectedPayout.bank],
                                ['Account Details',     selectedPayout.account],
                                ['Transaction Reference',`TXN-${selectedPayout.id?.slice(-8) ?? '—'}`],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-1">
                                    <span className="text-gray-400 font-medium">{label}</span>
                                    <span className="font-mono font-bold text-gray-900 text-xs">{val}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 flex items-center justify-center gap-2 py-2.5 font-bold text-xs" onClick={() => setSelectedPayout(null)}>Close</Button>
                            <Button className="flex-1 bg-primary hover:bg-primary/95 text-white flex items-center justify-center gap-2 py-2.5 font-bold text-xs shadow-sm">
                                <Download size={14} /> Download Receipt
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
