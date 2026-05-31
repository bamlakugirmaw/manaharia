import { useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';
import { usePayments } from '../../hooks/usePayments';
import { useAuth } from '../../contexts/AuthContext';

const METHOD_LABEL = { TELEBIRR: 'Telebirr', CBE: 'CBE Birr', CHAPA: 'Chapa' };
const STATUS_MAP = { SUCCESS: 'Completed', PENDING: 'Pending', FAILED: 'Failed' };

function mapPayment(p) {
    const trip = p.booking?.trip ?? {};
    const route = trip.route ?? {};
    const from = trip.from ?? route.origin ?? '';
    const to = trip.to ?? route.destination ?? '';
    const description = from && to
        ? `Bus Ticket — ${from} to ${to}`
        : 'Bus ticket payment';

    return {
        id: p.id,
        date: p.createdAt
            ? new Date(p.createdAt).toLocaleDateString('en-US', {
                month: 'short', day: 'numeric', year: 'numeric',
            })
            : '—',
        amount: p.amount ?? 0,
        method: METHOD_LABEL[p.method] ?? p.method ?? '—',
        status: STATUS_MAP[p.status] ?? p.status ?? 'Pending',
        reference: p.gatewayReference ?? p.transactionCode ?? p.id,
        description,
    };
}

export default function UserPayments() {
    const { user } = useAuth();
    const { data: rawPayments = [], isLoading, isError } = usePayments({ limit: 100 });

    const payments = useMemo(() => {
        const list = Array.isArray(rawPayments) ? rawPayments : [];
        return list
            .filter((p) => {
                if (!user?.id) return true;
                const payUserId = p.userId ?? p.booking?.userId ?? p.booking?.user?.id;
                return !payUserId || payUserId === user.id;
            })
            .map(mapPayment);
    }, [rawPayments, user?.id]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Payment History</h1>
                <p className="text-sm text-gray-500">View your past transactions from GET /v1/payments.</p>
            </div>

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-600">Failed to load payment history.</p>
            )}

            {!isLoading && !isError && (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Transaction ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Description</th>
                                <th className="px-6 py-4 font-semibold">Method</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">
                                        {payment.id}
                                        <div className="text-xs text-gray-400 font-light mt-0.5">{payment.reference}</div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            {payment.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                                        {payment.description}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <CreditCard size={14} className="text-gray-400" />
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-gray-900">
                                        ETB {payment.amount.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={
                                            payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                            payment.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                            'bg-red-100 text-red-700'
                                        }>
                                            <span className="flex items-center gap-1">
                                                {payment.status === 'Completed' && <CheckCircle size={12} />}
                                                {payment.status === 'Failed' && <XCircle size={12} />}
                                                {payment.status === 'Pending' && <Clock size={12} />}
                                                {payment.status}
                                            </span>
                                        </Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {payments.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                        No payment history found.
                    </div>
                )}
            </div>
            )}
        </div>
    );
}
