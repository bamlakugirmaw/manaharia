import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, MessageSquare } from 'lucide-react';

const MOCK_DISPUTES = [
    { id: 'DSP-001', user: 'Abebe Kebede', issue: 'Seat mismatch on Trip #TRIP-001', date: 'Nov 30, 2025', status: 'pending', priority: 'high' },
    { id: 'DSP-002', user: 'Tigist Alemu', issue: 'Refund request for cancelled trip', date: 'Nov 28, 2025', status: 'resolved', priority: 'medium' },
    { id: 'DSP-003', user: 'Dawit Haile', issue: 'Overcharged for extra luggage', date: 'Dec 02, 2025', status: 'in-progress', priority: 'low' },
];

export default function AdminDisputes() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredDisputes = MOCK_DISPUTES.filter(dispute => {
        const matchesSearch =
            dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.issue.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Disputes & Support</h1>
                    <p className="text-gray-500 text-sm">Manage passenger complaints and refund requests.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">Dispute Policy</Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, User or Issue..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <span className="text-sm text-gray-500 whitespace-nowrap">Status:</span>
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-40"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Dispute ID</th>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Issue Details</th>
                                <th className="px-6 py-4 font-bold">Priority</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDisputes.map((dispute) => (
                                <tr key={dispute.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-[10px] font-bold text-primary uppercase tracking-tighter">
                                        {dispute.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-semibold text-gray-900">{dispute.user}</div>
                                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{dispute.date}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-start gap-2 max-w-xs">
                                            <MessageSquare size={14} className="text-gray-400 mt-1 flex-shrink-0" />
                                            <span className="text-sm text-gray-600 line-clamp-2">{dispute.issue}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-bold text-[10px] uppercase tracking-widest px-2 py-0.5",
                                                dispute.priority === 'high' ? 'text-red-600 border-red-100 bg-red-50' :
                                                    dispute.priority === 'medium' ? 'text-orange-600 border-orange-100 bg-orange-50' :
                                                        'text-blue-600 border-blue-100 bg-blue-50'
                                            )}
                                        >
                                            {dispute.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {dispute.status === 'pending' && <Clock size={12} className="text-yellow-500" />}
                                            {dispute.status === 'in-progress' && <AlertCircle size={12} className="text-blue-500" />}
                                            {dispute.status === 'resolved' && <CheckCircle2 size={12} className="text-green-500" />}
                                            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-600">{dispute.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" className="bg-primary hover:bg-primary/90 text-white font-medium px-4 h-8 text-xs">
                                            Respond
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredDisputes.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No disputes found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

