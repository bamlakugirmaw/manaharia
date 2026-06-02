import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
    Search, Calendar, CreditCard, ChevronDown,
    X, Receipt, TrendingUp, Users, DollarSign,
    CheckCircle, Clock, XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOperatorPayments, PLATFORM_FEE } from '../../hooks/useOperatorPayments';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';

const PAGE_SIZE = 10;

const STATUS_CLASS = {
    completed: 'bg-green-100 text-green-700',
    pending:   'bg-orange-100 text-orange-700',
    failed:    'bg-red-100 text-red-700',
};

function fmtETB(n) { return `ETB ${Math.round(n).toLocaleString()}`; }

export default function OperatorPayouts() {
    const { rows, totalGross, totalNet, totalFee, isLoading } = useOperatorPayments();

    const [searchTerm,     setSearchTerm]     = useState('');
    const [startDate,      setStartDate]      = useState('');
    const [endDate,        setEndDate]        = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedPayout, setSelectedPayout] = useState(null);
    const [page,           setPage]           = useState(1);

    const filtered = useMemo(() => {
        const term = searchTerm.toLowerCase().trim();
        return rows.filter((r) => {
            const matchSearch = !term
                || r.reference?.toLowerCase().includes(term)
                || r.user?.toLowerCase().includes(term)
                || (r.userEmail ?? '').toLowerCase().includes(term)
                || r.route?.toLowerCase().includes(term)
                || r.gross.toString().includes(term)
                || r.method?.toLowerCase().includes(term);
            const d = r.dateIso ? new Date(r.dateIso) : null;
            const matchStart = !startDate || (d && d >= new Date(startDate));
            const matchEnd   = !endDate   || (d && d <= new Date(endDate + 'T23:59:59'));
            return matchSearch && matchStart && matchEnd;
        });
    }, [rows, searchTerm, startDate, endDate]);

    const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageRows    = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    const getStatusIcon = (s) => {
        if (s === 'completed') return <CheckCircle size={13} className="text-green-600" />;
        if (s === 'pending')   return <Clock       size={13} className="text-amber-500" />;
        return <XCircle size={13} className="text-red-500" />;
    };

    return (
        <div className="space-y-6">
            <OperatorScopeBanner />

            {/* Summary strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign size={20} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Net Earnings</p>
                        <p className="text-xl font-black text-gray-900 tabular-nums">{fmtETB(totalNet)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">After 5% platform fee</p>
                    </div>
                </Card>
                <Card className="p-5 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600"><TrendingUp size={20} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Gross Collected</p>
                        <p className="text-xl font-black text-gray-900 tabular-nums">{fmtETB(totalGross)}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Platform fee: {fmtETB(totalFee)}</p>
                    </div>
                </Card>
                <Card className="p-5 border-none shadow-sm flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-600"><Users size={20} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold uppercase tracking-wide">Transactions</p>
                        <p className="text-xl font-black text-gray-900 tabular-nums">{rows.length}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Confirmed payments</p>
                    </div>
                </Card>
            </div>

            <Card className="p-6 border-none shadow-sm space-y-5">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-3 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input type="text" placeholder="Search by passenger, route, reference or amount…"
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }} />
                    </div>
                    <div className="flex gap-2 items-center relative">
                        <Button variant="outline"
                            className={cn('flex items-center gap-2 text-sm font-semibold rounded-xl px-4 py-2.5 h-auto',
                                showDatePicker ? 'border-primary text-primary bg-primary/5' : 'border-gray-200 text-gray-600')}
                            onClick={() => setShowDatePicker((v) => !v)}>
                            <Calendar size={15} />
                            {startDate && endDate ? `${startDate} – ${endDate}` : 'Date Range'}
                            <ChevronDown size={13} className={cn('transition-transform', showDatePicker && 'rotate-180')} />
                        </Button>
                        {(startDate || endDate) && (
                            <Button variant="ghost" size="sm" onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }}
                                className="text-gray-400 hover:text-gray-600 px-2"><X size={14} /></Button>
                        )}
                        {showDatePicker && (
                            <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-100 shadow-2xl rounded-2xl p-5 w-72 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">From</label>
                                    <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">To</label>
                                    <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
                                </div>
                                <Button className="w-full h-9 text-xs font-bold" onClick={() => setShowDatePicker(false)}>Apply</Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-sm text-left">
                        <thead className="text-[11px] text-gray-500 uppercase bg-gray-50/70 border-b border-gray-100 font-bold tracking-wider">
                            <tr>
                                <th className="px-5 py-3.5">Transaction ID</th>
                                <th className="px-5 py-3.5">User</th>
                                <th className="px-5 py-3.5">Route</th>
                                <th className="px-5 py-3.5">Date</th>
                                <th className="px-5 py-3.5">Gross</th>
                                <th className="px-5 py-3.5 text-emerald-700">Net (−5%)</th>
                                <th className="px-5 py-3.5">Method</th>
                                <th className="px-5 py-3.5">Status</th>
                                <th className="px-5 py-3.5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan={9} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary mx-auto" />
                                    <p className="text-xs text-gray-400 mt-3">Loading payment history…</p>
                                </td></tr>
                            ) : pageRows.length === 0 ? (
                                <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500 text-sm">
                                    {rows.length === 0
                                        ? 'No confirmed payments yet. Payments appear once a booking is confirmed.'
                                        : 'No payments match the selected filters.'}
                                </td></tr>
                            ) : pageRows.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4 font-mono text-xs text-primary font-bold">{r.reference}</td>
                                    <td className="px-5 py-4">
                                        <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                                            {r._loadingUser ? <span className="inline-block w-24 h-3 bg-gray-200 rounded animate-pulse" /> : r.user}
                                        </p>
                                        {r.userEmail && <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{r.userEmail}</p>}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-600 max-w-[160px] truncate">{r.route}</td>
                                    <td className="px-5 py-4 text-gray-600 text-xs whitespace-nowrap">{r.dateDisplay}</td>
                                    <td className="px-5 py-4 text-gray-500 text-xs">{fmtETB(r.gross)}</td>
                                    <td className="px-5 py-4 font-bold text-emerald-700">{fmtETB(r.net)}</td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600 text-xs">
                                            <CreditCard size={13} className="text-gray-400 shrink-0" />{r.method}
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1.5">
                                            {getStatusIcon(r.status)}
                                            <Badge className={cn('text-[11px] font-bold px-2.5 py-1', STATUS_CLASS[r.status] ?? 'bg-gray-100 text-gray-600')}>
                                                {r.status}
                                            </Badge>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <Button variant="ghost" size="sm"
                                            className="text-primary hover:bg-primary/5 text-xs font-bold"
                                            onClick={() => setSelectedPayout(r)}>Details</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-gray-500">
                        Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} payments
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setPage((p) => p + 1)}>Next</Button>
                    </div>
                </div>
            </Card>

            {/* Detail Modal */}
            {selectedPayout && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedPayout(null)}>
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <div className="flex items-center gap-2">
                                <Receipt className="text-gray-400" size={18} />
                                <h3 className="font-bold text-base text-gray-900">Payment Details</h3>
                            </div>
                            <button onClick={() => setSelectedPayout(null)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg"><X size={18} /></button>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5 mb-5 text-center space-y-1">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gross Collected</p>
                            <p className="text-3xl font-black text-gray-900">{fmtETB(selectedPayout.gross)}</p>
                            <Badge className={cn('text-[11px] font-bold px-2.5 py-1 mt-1', STATUS_CLASS[selectedPayout.status] ?? 'bg-gray-100 text-gray-600')}>
                                {selectedPayout.status}
                            </Badge>
                        </div>
                        <div className="space-y-3 text-sm mb-5">
                            {[
                                ['Transaction ID',    selectedPayout.reference],
                                ['Passenger',         selectedPayout.user],
                                ...(selectedPayout.userEmail ? [['Email', selectedPayout.userEmail]] : []),
                                ['Route',             selectedPayout.route],
                                ['Payment Date',      selectedPayout.dateDisplay],
                                ['Payment Method',    selectedPayout.method],
                                ['Transaction Code',  selectedPayout.transactionCode],
                                ['Gross Amount',      fmtETB(selectedPayout.gross)],
                                ['Platform Fee (5%)', `− ${fmtETB(selectedPayout.gross * PLATFORM_FEE)}`],
                                ['Your Net Earnings', fmtETB(selectedPayout.net)],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-400 text-xs font-medium">{label}</span>
                                    <span className={cn('font-bold text-xs text-right',
                                        label === 'Your Net Earnings' ? 'text-emerald-700' :
                                        label === 'Platform Fee (5%)' ? 'text-red-500' : 'text-gray-900')}>{val}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold" onClick={() => setSelectedPayout(null)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
