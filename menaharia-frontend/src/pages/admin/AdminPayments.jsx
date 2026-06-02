import { useState, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
    Search, CreditCard, Wallet, Landmark, User, Calendar,
    Eye, CheckCircle, Clock, XCircle,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';
import { usePayments } from '../../hooks/usePayments';
import { bookingsApi } from '../../api/bookings.api';
import { bookingKeys } from '../../hooks/useBookings';

const METHOD_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE Birr', CHAPA: 'Chapa' };
const STATUS_MAP   = { SUCCESS: 'completed', PENDING: 'pending', FAILED: 'failed' };

/** Extract the best user name from a booking object. */
function userNameFromBooking(booking) {
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

function userEmailFromBooking(booking) {
    if (!booking) return null;
    return (
        booking.user?.email
        ?? booking.travelers?.[0]?.email
        ?? null
    );
}

/** Extract operator/company name for a payment row. */
function operatorNameFromBooking(booking) {
    if (!booking) return null;
    return (
        booking.trip?.bus?.operator?.companyName
        ?? booking.trip?.bus?.operator?.name
        ?? booking.trip?.operator?.companyName
        ?? booking.trip?.operator?.name
        ?? booking.operator?.companyName
        ?? booking.operator?.name
        ?? null
    );
}

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

export default function AdminPayments() {
    const [searchQuery,     setSearchQuery]     = useState('');
    const [methodFilter,    setMethodFilter]    = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen,     setIsModalOpen]     = useState(false);

    // Step 1: fetch the payment list
    const { data: rawPayments = [], isLoading: paymentsLoading, isError } =
        usePayments({ limit: 100 });

    const payments = useMemo(
        () => Array.isArray(rawPayments) ? rawPayments : [],
        [rawPayments],
    );

    // Step 2: for every payment that has a bookingId, fetch the booking in parallel
    const bookingQueries = useQueries({
        queries: payments.map((p) => ({
            queryKey: bookingKeys.detail(p.bookingId),
            queryFn: () => bookingsApi.getBookingById(p.bookingId),
            enabled: !!p.bookingId,
            staleTime: 5 * 60 * 1000,
        })),
    });

    // Step 3: build a bookingId → booking map from the parallel results
    const bookingMap = useMemo(() => {
        const map = {};
        payments.forEach((p, i) => {
            if (p.bookingId) {
                map[p.bookingId] = bookingQueries[i]?.data ?? null;
            }
        });
        return map;
    }, [payments, bookingQueries]);

    // Step 4: normalise each payment row, enriching with booking user data
    const rows = useMemo(() => payments.map((p) => {
        const booking = bookingMap[p.bookingId] ?? null;

        const userName =
            userNameFromBooking(booking)
            ?? p.booking?.user?.fullName
            ?? p.user?.fullName
            ?? p.user?.name
            ?? '—';

        const userEmail =
            userEmailFromBooking(booking)
            ?? p.user?.email
            ?? null;

        const bookingRef =
            booking?.bookingReference
            ?? p.booking?.bookingReference
            ?? (p.bookingId ? p.bookingId.slice(0, 8) : null);

        const operator =
            operatorNameFromBooking(booking)
            ?? operatorNameFromBooking(p.booking)
            ?? p.operator?.companyName
            ?? p.operator?.name
            ?? '—';

        return {
            id:              p.id,
            bookingId:       p.bookingId ?? null,
            user:            userName,
            userEmail,
            operator,
            bookingRef,
            amount:          `ETB ${(p.amount ?? 0).toLocaleString()}`,
            amountRaw:       p.amount ?? 0,
            method:          METHOD_LABEL[p.method] ?? p.method ?? '—',
            date:            fmtDate(p.createdAt),
            status:          STATUS_MAP[p.status] ?? (p.status ?? '').toLowerCase(),
            transactionCode: p.transactionCode ?? p.gatewayReference ?? '—',
        };
    }), [payments, bookingMap]);

    const isLoading = paymentsLoading;

    // Filters
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        return rows.filter((r) => {
            const matchSearch =
                !q
                || r.id.toLowerCase().includes(q)
                || r.user.toLowerCase().includes(q)
                || (r.userEmail ?? '').toLowerCase().includes(q)
                || (r.bookingRef ?? '').toLowerCase().includes(q)
                || (r.operator ?? '').toLowerCase().includes(q);
            const matchMethod = methodFilter === 'all' || r.method === methodFilter;
            return matchSearch && matchMethod;
        });
    }, [rows, searchQuery, methodFilter]);

    // Summary counts
    const completedCount = useMemo(() => rows.filter((r) => r.status === 'completed').length, [rows]);
    const pendingCount   = useMemo(() => rows.filter((r) => r.status === 'pending').length,   [rows]);
    const totalVolume    = useMemo(() =>
        rows.filter((r) => r.status === 'completed').reduce((s, r) => s + r.amountRaw, 0),
        [rows],
    );

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

            {/* Summary strip */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Completed',    value: completedCount,                        color: 'text-green-600' },
                    { label: 'Pending',      value: pendingCount,                          color: 'text-amber-600' },
                    { label: 'Total Volume', value: `ETB ${totalVolume.toLocaleString()}`, color: 'text-primary'   },
                ].map(({ label, value, color }) => (
                    <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4">
                        <p className="text-xs text-gray-400 font-medium">{label}</p>
                        <p className={cn('text-lg font-black tabular-nums mt-0.5', color)}>{value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Transaction ID or User..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Method:</span>
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-40"
                        value={methodFilter}
                        onChange={(e) => setMethodFilter(e.target.value)}
                    >
                        <option value="all">All Methods</option>
                        <option value="Telebirr">Telebirr</option>
                        <option value="CBE Birr">CBE Birr</option>
                        <option value="Chapa">Chapa</option>
                    </select>
                </div>
            </div>

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-center text-red-500 text-sm py-8">Failed to load payments.</p>
            )}

            {!isLoading && !isError && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-bold">Transaction ID</th>
                                    <th className="px-6 py-4 font-bold">User</th>
                                    <th className="px-6 py-4 font-bold">Operator</th>
                                    <th className="px-6 py-4 font-bold">Amount</th>
                                    <th className="px-6 py-4 font-bold">Method</th>
                                    <th className="px-6 py-4 font-bold">Date</th>
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
                                                {row.id}
                                            </span>
                                            {row.bookingRef && (
                                                <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                                    Ref: {row.bookingRef}
                                                </div>
                                            )}
                                        </td>

                                        {/* User */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                    <User size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                                                        {/* Show skeleton while booking is still loading */}
                                                        {row.user === '—' && row.bookingId
                                                            ? <span className="inline-block w-24 h-3 bg-gray-200 rounded animate-pulse" />
                                                            : row.user
                                                        }
                                                    </p>
                                                    {row.userEmail && (
                                                        <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                                                            {row.userEmail}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Operator */}
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]">
                                                {row.operator}
                                            </p>
                                        </td>

                                        {/* Amount */}
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-900">{row.amount}</span>
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
                                                <Calendar size={14} className="text-gray-400" />
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
                                                onClick={() => { setSelectedPayment(row); setIsModalOpen(true); }}
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
                                        <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                            No payments found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {selectedPayment && (
                <DetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Payment ${selectedPayment.id.slice(0, 18)}…`}
                    footer={
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    }
                >
                    <div className="space-y-4">
                        <ModalDataRow label="User"             value={selectedPayment.user} />
                        {selectedPayment.userEmail && (
                            <ModalDataRow label="Email"        value={selectedPayment.userEmail} />
                        )}
                        <ModalDataRow label="Operator"         value={selectedPayment.operator} />
                        {selectedPayment.bookingRef && (
                            <ModalDataRow label="Booking Ref"  value={selectedPayment.bookingRef} />
                        )}
                        <ModalDataRow label="Amount"           value={selectedPayment.amount} />
                        <ModalDataRow label="Method"           value={selectedPayment.method} />
                        <ModalDataRow label="Date"             value={selectedPayment.date} />
                        <ModalDataRow label="Status"           value={selectedPayment.status} />
                        <ModalDataRow label="Transaction Code" value={selectedPayment.transactionCode} />
                    </div>
                </DetailModal>
            )}
        </div>
    );
}
