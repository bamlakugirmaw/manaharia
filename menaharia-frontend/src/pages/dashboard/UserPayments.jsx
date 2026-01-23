import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, Download, ExternalLink, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function UserPayments() {
    // Mock data for payments
    const payments = [
        {
            id: 'PAY-839201',
            date: 'Dec 12, 2025',
            amount: 1700,
            method: 'Chapa',
            status: 'Completed',
            reference: 'TXN-98234-XYS',
            description: 'Bus Ticket - Addis Ababa to Bahir Dar'
        },
        {
            id: 'PAY-839205',
            date: 'Dec 18, 2025',
            amount: 900,
            method: 'CBE Birr',
            status: 'Completed',
            reference: 'TXN-99934-ABC',
            description: 'Bus Ticket - Bahir Dar to Addis Ababa'
        },
        {
            id: 'PAY-839210',
            date: 'Jan 05, 2026',
            amount: 1200,
            method: 'Telebirr',
            status: 'Failed',
            reference: 'TXN-00123-FAIL',
            description: 'Bus Ticket - Addis Ababa to Hawassa'
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Payment History</h1>
                <p className="text-sm text-gray-500">View and download your past transaction receipts.</p>
            </div>

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
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
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
                                        <Badge className={`
                                            ${payment.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                payment.status === 'Pending' ? 'bg-orange-100 text-orange-700' :
                                                    'bg-red-100 text-red-700'}
                                        `}>
                                            <span className="flex items-center gap-1">
                                                {payment.status === 'Completed' && <CheckCircle size={12} />}
                                                {payment.status === 'Failed' && <XCircle size={12} />}
                                                {payment.status}
                                            </span>
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {payment.status === 'Completed' && (
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-blue-50" title="Download Receipt">
                                                    <Download size={16} />
                                                </Button>
                                            )}
                                        </div>
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
        </div>
    );
}
