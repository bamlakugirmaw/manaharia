import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Download, Search, Filter, Calendar, CreditCard, ChevronDown } from 'lucide-react';

export default function OperatorPayouts() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock payout data
    const payouts = [
        {
            id: 'PO-2025-001',
            date: 'Dec 01, 2025',
            amount: 45000,
            status: 'Completed',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-002',
            date: 'Dec 08, 2025',
            amount: 52000,
            status: 'Completed',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-003',
            date: 'Dec 15, 2025',
            amount: 48500,
            status: 'Processing',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-004',
            date: 'Dec 22, 2025',
            amount: 61000,
            status: 'Pending',
            method: 'Telebirr',
            bank: 'Wallet',
            account: '+251911...'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Payout Analysis</h1>
                    <p className="text-gray-500">Track and manage your earnings withdrawals</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Download size={16} /> Request Withdrawal
                </Button>
            </div>

            <Card className="p-6 border-none shadow-sm space-y-6">
                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by ID or amount..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" className="flex items-center gap-2">
                            <Calendar size={16} /> Date Range
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2">
                            <Filter size={16} /> Filter
                        </Button>
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
                            {payouts.map((payout) => (
                                <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{payout.id}</td>
                                    <td className="px-6 py-4 text-gray-600">{payout.date}</td>
                                    <td className="px-6 py-4 font-bold text-gray-900">ETB {payout.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <CreditCard size={14} className="text-gray-400" />
                                            <span>{payout.bank} •••• {payout.account.slice(-4)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge className={`
                                            ${payout.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                payout.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-orange-100 text-orange-700'}
                                        `}>
                                            {payout.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50">
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">Showing 1-4 of 24 payouts</span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
