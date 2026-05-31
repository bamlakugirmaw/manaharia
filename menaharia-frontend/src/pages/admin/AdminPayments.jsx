import { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, CreditCard, Wallet, Landmark, MoreHorizontal, User, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';
import { usePayments } from '../../hooks/usePayments';

const METHOD_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE Birr', CHAPA: 'Chapa' };

function normalisePaymentRow(p) {
    const statusMap = { SUCCESS: 'completed', PENDING: 'pending', FAILED: 'failed' };
    return {
        id: p.id,
        user: p.booking?.travelers?.[0]?.fullName ?? p.user?.fullName ?? p.userId ?? '—',
        amount: `ETB ${(p.amount ?? 0).toLocaleString()}`,
        method: METHOD_LABEL[p.method] ?? p.method ?? '—',
        date: p.createdAt
            ? new Date(p.createdAt).toLocaleString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
            })
            : '—',
        status: statusMap[p.status] ?? (p.status ?? '').toLowerCase(),
        _raw: p,
    };
}

export default function AdminPayments() {
    const [searchQuery, setSearchQuery] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: rawPayments = [], isLoading, isError } = usePayments({ limit: 100 });

    const payments = useMemo(
        () => (Array.isArray(rawPayments) ? rawPayments : []).map(normalisePaymentRow),
        [rawPayments]
    );

    const filteredPayments = payments.filter((payment) => {
        const matchesSearch =
            payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(payment.user).toLowerCase().includes(searchQuery.toLowerCase());

        const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;

        return matchesSearch && matchesMethod;
    });

    const getMethodIcon = (method) => {
        switch (method) {
            case 'Telebirr': return <Wallet size={14} className="text-blue-500" />;
            case 'CBE Birr': return <Landmark size={14} className="text-purple-500" />;
            case 'Chapa': return <CreditCard size={14} className="text-green-500" />;
            default: return <CreditCard size={14} className="text-gray-500" />;
        }
    };

    const handleViewPayment = (payment) => {
        setSelectedPayment(payment);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">

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
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Transaction ID</th>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Method</th>
                                <th className="px-6 py-4 font-bold">Date</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter">{payment.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={14} />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-900">{payment.user}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{payment.amount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            {getMethodIcon(payment.method)}
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {payment.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                payment.status === 'completed' ? 'success' :
                                                    payment.status === 'pending' ? 'blue' : 'destructive'
                                            }
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {payment.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewPayment(payment)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No payments found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {selectedPayment && (
                <DetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Payment ${selectedPayment.id}`}
                    footer={
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    }
                >
                    <div className="space-y-4">
                        <ModalDataRow label="User" value={selectedPayment.user} />
                        <ModalDataRow label="Amount" value={selectedPayment.amount} />
                        <ModalDataRow label="Method" value={selectedPayment.method} />
                        <ModalDataRow label="Date" value={selectedPayment.date} />
                        <ModalDataRow label="Status" value={selectedPayment.status} />
                    </div>
                </DetailModal>
            )}
        </div>
    );
}
