import { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
    Search, CreditCard, Wallet, Landmark, User, Calendar,
    Eye, CheckCircle, Clock, XCircle, DollarSign, TrendingUp,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOperatorPayments, PLATFORM_FEE } from '../../hooks/useOperatorPayments';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';

function fmtETB(n) { return `ETB ${Math.round(n).toLocaleString()}`; }

export default function OperatorRevenue() {
    const { rows, totalGross, totalNet, completedRows, pendingRows, isLoading } = useOperatorPayments();

    const [searchQuery,  setSearchQuery]  = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedRow,  setSelectedRow]  = useState(null);
    const [isModalOpen,  setIsModalOpen]  = useState(false);

    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return rows.filter((r) => {
            const matchSearch = !q
                || r.reference?.toLowerCase().includes(q)
                || r.user.toLowerCase().includes(q)
                || (r.userEmail ?? '').toLowerCase().includes(q)
                || r.route.toLowerCase().includes(q)
                || r.gross.toString().includes(q);
            const matchMethod = methodFilter === 'all' || r.method === methodFilter;
            const matchStatus = statusFilter === 'all' || r.status === statusFilter;
            return matchSearch && matchMethod && matchStatus;
        });
    }, [rows, searchQuery, methodFilter, statusFilter]);

    const getMethodIcon = (m) => {
        if (m === 'Telebirr') return <Wallet   size={14} className="text-blue-500"   />;
        if (m === 'CBE Birr') return <Landmark size={14} className="text-purple-500" />;
        return <CreditCard size={14} className="text-green-500" />;
    };
    const getStatusIcon = (s) => {
        if (s === 'completed') return <CheckCircle size={13} className="text-green-600" />;
        if (s === 'pending')   return <Clock       size={13} className="text-amber-500" />;
        return <XCircle size={13} className="text-red-500" />;
    };

    return (
        <div className="space-y-6">
            <OperatorScopeBanner />

            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Net Earnings',    value: fmtETB(totalNet),    sub: 'After 5% fee', icon: <DollarSign size={18} />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                    { label: 'Gross Collected', value: fmtETB(totalGross),  sub: null,            icon: <TrendingUp size={18} />, color: 'text-blue-600',    bg: 'bg-blue-50'    },
                    { label: 'Completed',       value: completedRows.length, sub: null,           icon: <CheckCircle size={18} />, color: 'text-green-600', bg: 'bg-green-50'  },
                    { label: 'Pending',         value: pendingRows.length,   sub: null,           icon: <Clock size={18} />,      color: 'text-amber-600',  bg: 'bg-amber-50'  },
                ].map(({ label, value, sub, icon, color, bg }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                        <div className={cn('p-2.5 rounded-xl', bg, color)}>{icon}</div>
                        <div>
                            <p className="text-xs text-gray-400 font-medium">{label}</p>
                            <p className={cn('text-base font-black tabular-nums', color)}>{value}</p>
                            {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input type="text" placeholder="Search by passenger, route, reference…"
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm outline-none flex-1 md:w-36"
                        value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)}>
                        <option value="all">All Methods</option>
                        <option value="Chapa">Chapa</option>
                        <option value="Telebirr">Telebirr</option>
                        <option value="Manual">Manual</option>
                    </select>
                    <select className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm outline-none flex-1 md:w-36"
                        value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                        <option value="all">All Statuses</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Transaction ID</th>
                                    <th className="px-6 py-4 font-bold">User</th>
                                    <th className="px-6 py-4 font-bold">Route</th>
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold text-emerald-700">Net (−5%)</th>
                                    <th className="px-6 py-4 font-bold">Method</th>
                                    <th className="px-6 py-4 font-bold">Date & Time</th>
                                    <th className="px-6 py-4 font-bold">Status</th>
                                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-[10px] text-primary font-bold">{row.reference}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0"><User size={14} /></div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                                                        {row._loadingUser ? <span className="inline-block w-24 h-3 bg-gray-200 rounded animate-pulse" /> : row.user}
                                                    </p>
                                                    {row.userEmail && <p className="text-[10px] text-gray-400 truncate max-w-[160px]">{row.userEmail}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[160px] truncate">{row.route}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-gray-900">{fmtETB(row.gross)}</td>
                                        <td className="px-6 py-4 text-sm font-bold text-emerald-700">{fmtETB(row.net)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">{getMethodIcon(row.method)}{row.method}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={13} className="text-gray-400 shrink-0" />{row.dateDisplay}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(row.status)}
                                                <Badge variant={row.status === 'completed' ? 'success' : row.status === 'pending' ? 'blue' : 'destructive'}
                                                    className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">{row.status}</Badge>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="outline" size="sm"
                                                onClick={() => { setSelectedRow(row); setIsModalOpen(true); }}
                                                className="text-xs font-bold gap-1.5 h-8 px-3 border-gray-200 text-gray-700 hover:text-primary hover:border-primary">
                                                <Eye size={13} /> View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr><td colSpan={9} className="px-6 py-12 text-center text-gray-500 text-sm">
                                        {rows.length === 0 ? 'No payment records yet. They appear once bookings are confirmed.' : 'No records match your search.'}
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {rows.length} payment records
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRow && isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <h3 className="font-bold text-base text-gray-900">Payment Details</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg">✕</button>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-5 mb-5 text-center">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gross Amount</p>
                            <p className="text-3xl font-black text-gray-900 mt-1">{fmtETB(selectedRow.gross)}</p>
                            <Badge variant={selectedRow.status === 'completed' ? 'success' : selectedRow.status === 'pending' ? 'blue' : 'destructive'}
                                className="font-bold text-[10px] uppercase px-2 py-0.5 mt-2">{selectedRow.status}</Badge>
                        </div>
                        <div className="space-y-3 text-sm mb-5">
                            {[
                                ['Reference',         selectedRow.reference],
                                ['Passenger',         selectedRow.user],
                                ...(selectedRow.userEmail ? [['Email', selectedRow.userEmail]] : []),
                                ['Route',             selectedRow.route],
                                ['Payment Date',      selectedRow.dateDisplay],
                                ['Method',            selectedRow.method],
                                ['Transaction Code',  selectedRow.transactionCode],
                                ['Gross Amount',      fmtETB(selectedRow.gross)],
                                ['Platform Fee (5%)', `− ${fmtETB(selectedRow.gross * PLATFORM_FEE)}`],
                                ['Your Net Earnings', fmtETB(selectedRow.net)],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-400 text-xs font-medium">{label}</span>
                                    <span className={cn('font-bold text-xs text-right',
                                        label === 'Your Net Earnings' ? 'text-emerald-700' :
                                        label === 'Platform Fee (5%)' ? 'text-red-500' : 'text-gray-900')}>{val}</span>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full text-xs font-bold" onClick={() => setIsModalOpen(false)}>Close</Button>
                    </div>
                </div>
            )}
        </div>
    );
}
