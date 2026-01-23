import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, CreditCard, Wallet, Landmark, Download, MoreHorizontal, User, Calendar } from 'lucide-react';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';

const MOCK_PAYMENTS = [
    { id: 'PAY-8821', user: 'Abebe Kebede', amount: 'ETB 1,700', method: 'Telebirr', date: 'Dec 15, 2025, 10:30 AM', status: 'completed' },
    { id: 'PAY-8822', user: 'Tigist Alemu', amount: 'ETB 900', method: 'CBE Birr', date: 'Dec 15, 2025, 11:45 AM', status: 'completed' },
    { id: 'PAY-8823', user: 'Dawit Haile', amount: 'ETB 2,550', method: 'Chapa', date: 'Dec 15, 2025, 12:20 PM', status: 'pending' },
    { id: 'PAY-8824', user: 'Sara Tesfaye', amount: 'ETB 1,500', method: 'Telebirr', date: 'Dec 16, 2025, 09:15 AM', status: 'failed' },
];

export default function AdminPayments() {
    const [searchQuery, setSearchQuery] = useState('');
    const [methodFilter, setMethodFilter] = useState('all');
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredPayments = MOCK_PAYMENTS.filter(payment => {
        const matchesSearch =
            payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            payment.user.toLowerCase().includes(searchQuery.toLowerCase());

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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Payment Transactions</h1>
                    <p className="text-gray-500 text-sm">Monitor all platform payments and settlement statuses.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">
                        <Download size={16} className="mr-2" /> Export JSON
                    </Button>
                </div>
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

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Transaction ID</th>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Method</th>
                                <th className="px-6 py-4 font-bold">Date & Time</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPayments.map((payment) => (
                                <tr key={payment.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-[10px] font-mono font-bold text-gray-500 uppercase tracking-tighter">
                                        {payment.id}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {payment.user}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900">
                                        {payment.amount}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            {getMethodIcon(payment.method)}
                                            {payment.method}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs text-gray-500">
                                        {payment.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                payment.status === 'completed' ? 'success' :
                                                    payment.status === 'pending' ? 'warning' : 'failed'
                                            }
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {payment.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600" onClick={() => handleViewPayment(payment)}>
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Details Modal */}
            {selectedPayment && (
                <DetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Transaction ${selectedPayment.id}`}
                    footer={
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    }
                >
                    <div className="space-y-6">
                        <div className="p-6 bg-green-50 rounded-2xl text-center border border-green-100">
                            <span className="block text-3xl font-bold text-green-700 mb-1">{selectedPayment.amount}</span>
                            <span className="text-xs font-bold uppercase text-green-600 tracking-widest">Successful Payment</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            <ModalDataRow label="Paid By" value={selectedPayment.user} icon={User} />
                            <ModalDataRow label="Payment Method" value={selectedPayment.method} icon={Wallet} />
                            <ModalDataRow label="Transaction Time" value={selectedPayment.date} icon={Calendar} />
                            <ModalDataRow label="Reference ID" value={selectedPayment.id} />
                        </div>
                    </div>
                </DetailModal>
            )}
        </div>
    );
}

