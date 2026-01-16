import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, User, Ticket, Calendar, MoreVertical } from 'lucide-react';
import { cn } from '../../lib/utils';

const MOCK_BOOKINGS = [
    { id: 'BKG-1023', passenger: 'Abebe Kebede', email: 'abebe@example.com', trip: 'Addis Ababa → Bahir Dar', date: 'Dec 15, 2025', seat: '12A', amount: 'ETB 1,200', status: 'confirmed' },
    { id: 'BKG-1024', passenger: 'Tigist Alemu', email: 'tigist@example.com', trip: 'Addis Ababa → Hawassa', date: 'Dec 16, 2025', seat: '4B', amount: 'ETB 850', status: 'confirmed' },
    { id: 'BKG-1025', passenger: 'Dawit Haile', email: 'dawit@example.com', trip: 'Bahir Dar → Addis Ababa', date: 'Dec 17, 2025', seat: '5C', amount: 'ETB 1,200', status: 'pending' },
    { id: 'BKG-1026', passenger: 'Sara Tesfaye', email: 'sara@example.com', trip: 'Mekelle → Addis Ababa', date: 'Dec 18, 2025', seat: '1A', amount: 'ETB 1,500', status: 'cancelled' },
];

export default function AdminBookings() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredBookings = MOCK_BOOKINGS.filter(booking => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.trip.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Bookings</h1>
                    <p className="text-gray-500 text-sm">View and manage passenger reservations across all trips.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">Export Report</Button>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, Passenger or Trip..."
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
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Booking ID</th>
                                <th className="px-6 py-4 font-bold">Passenger</th>
                                <th className="px-6 py-4 font-bold">Trip Details</th>
                                <th className="px-6 py-4 font-bold">Seat</th>
                                <th className="px-6 py-4 font-bold">Amount</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredBookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors group text-sm">
                                    <td className="px-6 py-4 font-mono text-xs font-bold text-primary uppercase">
                                        {booking.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs">
                                                {booking.passenger.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-gray-900 text-sm">{booking.passenger}</span>
                                                <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">{booking.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium">{booking.trip}</span>
                                            <div className="flex items-center gap-1 text-[10px] text-gray-500 mt-1">
                                                <Calendar size={10} /> {booking.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200 font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                                            {booking.seat}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 text-sm">
                                        {booking.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                booking.status === 'confirmed' ? 'success' :
                                                    booking.status === 'pending' ? 'warning' : 'destructive'
                                            }
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No bookings found matching your search.
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

