import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
    Search, CreditCard, Wallet, Landmark, User, Calendar,
    Eye, CheckCircle, Clock, XCircle, DollarSign, TrendingUp, Users,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import { bookingsApi } from '../../api/bookings.api';
import { bookingKeys } from '../../hooks/useBookings';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';
import { tripOrigin, tripDest } from '../../lib/tripHelpers';

const PLATFORM_FEE  = 0.05;
const METHOD_LABEL  = { CHAPA: 'Chapa', TELEBIRR: 'Telebirr', SANTIM: 'Santim', CBE: 'CBE Birr', MANUAL: 'Manual' };
const STATUS_MAP    = { SUCCESS: 'completed', PENDING: 'pending', FAILED: 'failed', COMPLETED: 'completed', PAID: 'completed' };

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function fmtETB(n) {
    return `ETB ${Math.round(n).toLocaleString()}`;
}

/** Pull user name out of a booking detail response. */
function resolveUserName(booking) {
    if (!booking) return null;
    return (
        booking.user?.fullName
        ?? booking.user?.name
        ?? booking.travelers?.[0]?.fullName
        ?? booking.bookingTravelers?.[0]?.fullName
        ?? booking.user?.email
        ?? null
    );
}

function resolveUserEmail(booking) {
    if (!booking) return null;
    return (
        booking.user?.email
        ?? booking.travelers?.[0]?.email
        ?? null
    );
}

export default function OperatorRevenue() {
    const {
        bookings: scopeBookings,
        bookingsQuery,
        scopeReady,
    } = useOperatorScope({ limit: 200 });

    const [searchQuery,     setSearchQuery]     = useState('');
    const [methodFilter,    setMethodFilter]    = useState('all');
    const [statusFilter,    setStatusFilter]    = useState('all');
    const [selectedRow,     setSelectedRow]     = useState(null);
    const [isModalOpen,     setIsModalOpen]     = useState(false);

    // ── Filter scope bookings to only those with a payment ───────────────────
    const paidBookings = useMemo(() =>
        (scopeBookings ?? []).filter((b) => {
            const bs = (b.status ?? '').toUpperCase();
            const payment = b.payment ?? (Array.isArray(b.payments) ? b.payments[0] : null);
            const ps = (payment?.status ?? '').toUpperCase();
            return bs === 'CONFIRMED' || ps === 'SUCCESS' || ps === 'COMPLETED' || ps === 'PAID';
        }),
        [scopeBookings],
    );

    // ── For each booking, fetch full detail to get user name ─────────────────
    const detailQueries = useQueries({
        queries: paidBookings.map((b) => ({
            queryKey: bookingKeys.detail(b.id),
            queryFn:  () => bookingsApi.getBookingById(b.id),
            enabled:  scopeReady && !!b.id,
            staleTime: 5 * 60 * 1000,
        })),
    });

    const detailMap = useMemo(() => {
        const map = {};
        paidBookings.forEach((b, i) => {
            map[b.id] = detailQueries[i]?.data ?? null;
        });
        return map;
    }, [paidBookings, detailQueries]);

    // ── Build display rows ────────────────────────────────────────────────────
    const rows = useMemo(() => paidBookings.map((b) => {
        const detail  = detailMap[b.id];
        const payment = b.payment ?? (Array.isArray(b.payments) ? b.payments[0] : null) ?? {};

        const userName  = resolveUserName(detail) ?? resolveUserName(b) ?? '—';
        const userEmail = resolveUserEmail(detail) ?? resolveUserEmail(b) ?? null;

        const gross  = Number(payment.amount ?? b.totalAmount ?? b.trip?.price ?? 0);
        const net    = gross * (1 - PLATFORM_FEE);

        const statusRaw   = (payment.status ?? b.status ?? '').toUpperCase();
        const statusLabel = STATUS_MAP[statusRaw] ?? 'completed';

        const method = METHOD_LABEL[payment.method] ?? payment.method ?? 'Chapa';

        const from  = b.trip ? tripOrigin(b.trip) : '';
        const to    = b.trip ? tripDest(b.trip)   : '';
        const route = from && to ? `${from} → ${to}` : '—';

        return {
            id:              b.id,
            reference:       b.bookingReference ?? b.id?.slice(0, 8),
            user:            userName,
            userEmail,
            gross,
            net,
            method,
            route,
            date:            fmtDate(payment.paidAt ?? payment.updatedAt ?? b.updatedAt ?? b.createdAt),
            status:          statusLabel,
            transactionCode: payment.transactionCode ?? payment.gatewayReference ?? '—',
            _loadingUser:    !detail && !!b.id,
        };
    }), [paidBookings, detailMap]);

    const isLoading = bookingsQuery.isLoading;

    // ── Summary stats ─────────────────────────────────────────────────────────
    const totalGross    = useMemo(() => rows.reduce((s, r) => s + r.gross, 0), [rows]);
    const totalNet      = useMemo(() => rows.reduce((s, r) => s + r.net,   0), [rows]);
    const completedCnt  = useMemo(() => rows.filter((r) => r.status === 'completed').length, [rows]);
    const pendingCnt    = useMemo(() => rows.filter((r) => r.status === 'pending').length,   [rows]);

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return rows.filter((r) => {
            const matchSearch =
                !q
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

    // ── Icons ─────────────────────────────────────────────────────────────────
    const getMethodIcon = (method) => {
        if (method === 'Telebirr') return <Wallet   size={14} className="text-blue-500"   />;
        if (method === 'CBE Birr') return <Landmark size={14} className="text-purple-500" />;
        return <CreditCard size={14} className="text-green-500" />;
    };

    const getStatusIcon = (status) => {
        if (status === 'completed') return <CheckCircle size={13} className="text-green-600" />;
        if (status === 'pending')   return <Clock       size={13} className="text-amber-500" />;
        return <XCircle size={13} className="text-red-500" />;
    };

    return (
        <div className="space-y-6">
            <OperatorScopeBanner />

            {/* Summary strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600"><DollarSign size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Net Earnings</p>
                        <p className="text-base font-black text-emerald-600 tabular-nums">{fmtETB(totalNet)}</p>
                        <p className="text-[10px] text-gray-400">After 5% fee</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600"><TrendingUp size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Gross Collected</p>
                        <p className="text-base font-black text-gray-900 tabular-nums">{fmtETB(totalGross)}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-green-50 text-green-600"><CheckCircle size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Completed</p>
                        <p className="text-base font-black text-green-600 tabular-nums">{completedCnt}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600"><Clock size={18} /></div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Pending</p>
                        <p className="text-base font-black text-amber-600 tabular-nums">{pendingCnt}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by passenger, route, reference…"
                        className="w-full pl-9 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none flex-1 md:w-36"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        <option value="all">All Methods</option>
                        <option value="Chapa">Chapa</option>
                        <option value="Telebirr">Telebirr</option>
                        <option value="Manual">Manual</option>
                    </select>
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none flex-1 md:w-36"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
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
                                        {/* Transaction ID */}
                                        <td className="px-6 py-4">
                                            <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter">
                                                {row.reference}
                                            </span>
                                        </td>

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                                                        {row._loadingUser
                                                            ? <span className="inline-block w-24 h-3 bg-gray-200 rounded animate-pulse" />
                                                            : row.user
                                                        }
                                                    </p>
                                                    {row.userEmail && (
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[160px]">
                                                            {row.userEmail}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Route */}
                                        <td className="px-6 py-4 text-xs text-gray-600 max-w-[160px] truncate">
                                            {row.route}
                                        </td>

                                        {/* Gross */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">{fmtETB(row.gross)}</span>
                                        </td>

                                        {/* Net */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-emerald-700">{fmtETB(row.net)}</span>
                                        </td>

                                        {/* Method */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                {getMethodIcon(row.method)}
                                                {row.method}
                                            </div>
                                        </td>

                                        {/* Date */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={13} className="text-gray-400 shrink-0" />
                                                {row.date}
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                {getStatusIcon(row.status)}
                                                <Badge
                                                    variant={
                                                        row.status === 'completed' ? 'success' :
                                                        row.status === 'pending'   ? 'blue'    : 'destructive'
                                                    }
                                                    className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                                >
                                                    {row.status}
                                                </Badge>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => { setSelectedRow(row); setIsModalOpen(true); }}
                                                className="text-xs font-bold gap-1.5 h-8 px-3 border-gray-200 text-gray-700 hover:text-primary hover:border-primary"
                                            >
                                                <Eye size={13} />
                                                View Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                                {filtered.length === 0 && (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center text-gray-500 text-sm">
                                            {rows.length === 0
                                                ? 'No payment records yet. They appear once bookings are confirmed.'
                                                : 'No records match your search.'}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer count */}
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                        Showing {filtered.length} of {rows.length} payment records
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedRow && isModalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in fade-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-5">
                            <h3 className="font-bold text-base text-gray-900">Payment Details</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-lg text-lg leading-none"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Amount block */}
                        <div className="bg-gray-50 rounded-2xl p-5 mb-5 text-center space-y-1">
                            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Gross Amount</p>
                            <p className="text-3xl font-black text-gray-900">{fmtETB(selectedRow.gross)}</p>
                            <div className="flex items-center justify-center gap-2 pt-1">
                                <Badge
                                    variant={
                                        selectedRow.status === 'completed' ? 'success' :
                                        selectedRow.status === 'pending'   ? 'blue'    : 'destructive'
                                    }
                                    className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                >
                                    {selectedRow.status}
                                </Badge>
                            </div>
                        </div>

                        {/* Detail rows */}
                        <div className="space-y-3 text-sm mb-5">
                            {[
                                ['Booking Reference', selectedRow.reference],
                                ['Passenger',         selectedRow.user],
                                ...(selectedRow.userEmail ? [['Email', selectedRow.userEmail]] : []),
                                ['Route',             selectedRow.route],
                                ['Payment Date',      selectedRow.date],
                                ['Payment Method',    selectedRow.method],
                                ['Transaction Code',  selectedRow.transactionCode],
                                ['Gross Amount',      fmtETB(selectedRow.gross)],
                                ['Platform Fee (5%)', `− ${fmtETB(selectedRow.gross * PLATFORM_FEE)}`],
                                ['Your Net Earnings', fmtETB(selectedRow.net)],
                            ].map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center py-0.5 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-400 text-xs font-medium">{label}</span>
                                    <span className={cn(
                                        'font-bold text-xs text-right max-w-[200px] break-all',
                                        label === 'Your Net Earnings' ? 'text-emerald-700' :
                                        label === 'Platform Fee (5%)' ? 'text-red-500'     : 'text-gray-900',
                                    )}>
                                        {val}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="outline"
                            className="w-full text-xs font-bold"
                            onClick={() => setIsModalOpen(false)}
                        >
                            Close
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
