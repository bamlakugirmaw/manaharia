import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, AlertCircle, CheckCircle2, Clock, MessageSquare, Ticket, User, Calendar, Send, MoreVertical, X, Shield, History, Ban } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';

// Enhanced Mock Data
const MOCK_DISPUTES = [
    {
        id: 'DSP-001',
        user: { name: 'Abebe Kebede', id: 'USR-1092', avatar: 'AK' },
        trip: { id: 'TRIP-8821', route: 'Addis Ababa → Bahir Dar', date: 'Nov 30, 2025' },
        issue: 'Seat mismatch on Trip #TRIP-8821',
        description: 'I booked seat 12A (Window) but was forced to sit in 12C (Aisle). The bus operator claimed the seat system was glitched.',
        date: 'Nov 30, 2025',
        status: 'pending',
        priority: 'high',
        messages: [
            { sender: 'user', text: 'I booked seat 12A but was given 12C. This is unacceptable.', time: '10:30 AM' },
        ]
    },
    {
        id: 'DSP-002',
        user: { name: 'Tigist Alemu', id: 'USR-2281', avatar: 'TA' },
        trip: { id: 'TRIP-9922', route: 'Addis Ababa → Hawassa', date: 'Nov 28, 2025' },
        issue: 'Refund request for cancelled trip',
        description: 'The bus never arrived. I waited for 2 hours. I want a full refund immediately.',
        date: 'Nov 28, 2025',
        status: 'resolved',
        priority: 'medium',
        messages: [
            { sender: 'user', text: 'Where is the bus?', time: '08:00 AM' },
            { sender: 'operator', text: 'We apologize. The bus had a breakdown. We are processing your refund.', time: '08:45 AM' },
        ]
    },
    {
        id: 'DSP-003',
        user: { name: 'Dawit Haile', id: 'USR-3392', avatar: 'DH' },
        trip: { id: 'TRIP-7721', route: 'Bahir Dar → Mekelle', date: 'Dec 02, 2025' },
        issue: 'Overcharged for extra luggage',
        description: 'The conductor charged me 500 ETB for a small bag. The policy says 1 bag is free.',
        date: 'Dec 02, 2025',
        status: 'in-progress',
        priority: 'low',
        messages: [
            { sender: 'user', text: 'Why was I charged 500 ETB?', time: '2:15 PM' },
            { sender: 'operator', text: 'Can you provide the luggage ticket number?', time: '2:30 PM' },
            { sender: 'user', text: 'It is #LUG-9921', time: '2:35 PM' },
        ]
    },
];

export default function OperatorDisputes() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [replyText, setReplyText] = useState('');

    const filteredDisputes = MOCK_DISPUTES.filter(dispute => {
        const matchesSearch =
            dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dispute.issue.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewDetail = (dispute) => {
        setSelectedDispute(dispute);
        setIsDetailOpen(true);
    };

    const handleSendMessage = () => {
        if (!replyText.trim()) return;
        // In a real app, this would send an API request
        const newMessage = { sender: 'operator', text: replyText, time: 'Just Now' };
        // Ideally update state immutably, effectively mocking it here
        selectedDispute.messages.push(newMessage);
        setReplyText('');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Disputes & Resolution</h1>
                    <p className="text-gray-500 text-sm">Handle customer complaints and maintain service quality.</p>
                </div>
                <Button variant="outline" size="sm" className="bg-white gap-2">
                    <Shield size={16} /> Dispute Policy Guidelines
                </Button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 bg-white border-none shadow-sm rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Pending Action</p>
                        <h3 className="text-2xl font-bold text-gray-900">5</h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-none shadow-sm rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                        <History size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">In Progress</p>
                        <h3 className="text-2xl font-bold text-gray-900">12</h3>
                    </div>
                </Card>
                <Card className="p-6 bg-white border-none shadow-sm rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                        <CheckCircle2 size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">Resolved (30d)</p>
                        <h3 className="text-2xl font-bold text-gray-900">148</h3>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search disputes..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto">
                    <Button variant="ghost" size="sm" className="text-gray-500">
                        <Filter size={16} className="mr-2" /> Filter
                    </Button>
                    <select
                        className="bg-gray-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full md:w-32 font-medium text-gray-600"
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
                                <th className="px-6 py-4 font-bold">Details</th>
                                <th className="px-6 py-4 font-bold">Related Trip</th>
                                <th className="px-6 py-4 font-bold">Priority</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredDisputes.map((dispute) => (
                                <tr key={dispute.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => handleViewDetail(dispute)}>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs flex-shrink-0">
                                                {dispute.user.avatar}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{dispute.issue}</div>
                                                <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{dispute.description}</div>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-mono tracking-tighter">{dispute.id}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">{dispute.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-700">{dispute.trip.route}</span>
                                            <span className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                                                <Calendar size={10} /> {dispute.trip.date}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant="outline"
                                            className={cn(
                                                "font-bold text-[10px] uppercase tracking-widest px-2 py-0.5 border",
                                                dispute.priority === 'high' ? 'text-red-600 border-red-200 bg-red-50' :
                                                    dispute.priority === 'medium' ? 'text-orange-600 border-orange-200 bg-orange-50' :
                                                        'text-blue-600 border-blue-200 bg-blue-50'
                                            )}
                                        >
                                            {dispute.priority}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {dispute.status === 'pending' && <Clock size={14} className="text-yellow-500" />}
                                            {dispute.status === 'in-progress' && <AlertCircle size={14} className="text-blue-500" />}
                                            {dispute.status === 'resolved' && <CheckCircle2 size={14} className="text-green-500" />}
                                            <span className="text-xs font-bold text-gray-700 capitalize">{dispute.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button size="sm" variant="outline" className="text-xs font-bold">Review</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detailed Dispute Modal / Drawer */}
            {selectedDispute && (
                <DetailModal
                    isOpen={isDetailOpen}
                    onClose={() => setIsDetailOpen(false)}
                    title="Dispute Resolution Center"
                    width="max-w-4xl"
                    footer={
                        <div className="flex justify-between w-full">
                            <Button variant="outline" className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600">
                                Escalated to Admin
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Close</Button>
                                <Button className="bg-green-600 hover:bg-green-700 text-white">Mark as Resolved</Button>
                            </div>
                        </div>
                    }
                >
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[500px]">
                        {/* Left Column: Context & Info */}
                        <div className="lg:col-span-1 border-r border-gray-100 pr-6 space-y-6 overflow-y-auto">
                            <div>
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Customer Info</h4>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {selectedDispute.user.avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-gray-900">{selectedDispute.user.name}</div>
                                        <div className="text-xs text-gray-500 font-mono">{selectedDispute.user.id}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Trip Context</h4>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Ticket size={14} className="text-gray-400" />
                                        <span className="text-xs font-bold text-gray-700">{selectedDispute.trip.id}</span>
                                    </div>
                                    <div className="text-xs font-medium text-gray-900 mb-1">{selectedDispute.trip.route}</div>
                                    <div className="text-[10px] text-gray-500">{selectedDispute.trip.date}</div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initial Complaint</h4>
                                <p className="text-xs text-gray-600 bg-red-50 p-3 rounded-xl border border-red-50 leading-relaxed">
                                    "{selectedDispute.description}"
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Chat Interface */}
                        <div className="lg:col-span-2 flex flex-col h-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                            <div className="p-3 bg-white border-b border-gray-100 flex justify-between items-center">
                                <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                                    <MessageSquare size={14} /> Resolution Thread
                                </div>
                                <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Active Session</span>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                {selectedDispute.messages.map((msg, idx) => (
                                    <div key={idx} className={cn("flex flex-col max-w-[80%]", msg.sender === 'operator' ? "ml-auto items-end" : "items-start")}>
                                        <div className={cn(
                                            "p-3 rounded-2xl text-sm",
                                            msg.sender === 'operator'
                                                ? "bg-primary text-white rounded-br-none"
                                                : "bg-white border border-gray-200 text-gray-700 rounded-bl-none shadow-sm"
                                        )}>
                                            {msg.text}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 px-1">{msg.time}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a response..."
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-primary/10 outline-none"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <Button size="icon" className="rounded-xl shrink-0" onClick={handleSendMessage}>
                                    <Send size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </DetailModal>
            )}
        </div>
    );
}

