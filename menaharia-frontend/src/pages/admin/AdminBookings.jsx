import { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, User, Ticket, Calendar, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';
import { useBookings } from '../../hooks/useBookings';
import { tripOrigin, tripDest } from '../../lib/tripHelpers';

function normaliseBookingRow(b) {
    const trip = b.trip ?? {};
    const traveler = b.travelers?.[0] ?? {};
    const from = tripOrigin(trip);
    const to = tripDest(trip);
    return {
        id: b.id,
        passenger: traveler.fullName ?? '—',
        email: traveler.email ?? b.user?.email ?? '—',
        trip: `${from} → ${to}`,
        date: trip.date
            ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        seat: traveler.seat?.seatNumber ?? traveler.seatNumber ?? '—',
        amount: `ETB ${(b.payment?.amount ?? trip.price ?? 0).toLocaleString()}`,
        status: (b.status ?? 'PENDING').toLowerCase(),
        _raw: b,
    };
}

export default function AdminBookings() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: rawBookings = [], isLoading, isError } = useBookings({ limit: 100 });

    const bookings = useMemo(
        () => (Array.isArray(rawBookings) ? rawBookings : []).map(normaliseBookingRow),
        [rawBookings]
    );

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.passenger.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.trip.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleViewBooking = (booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">

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

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-center text-red-500 text-sm py-8">Failed to load bookings. Please try again.</p>
            )}

            {!isLoading && !isError && (
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
                                <tr key={booking.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-tighter">{booking.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <User size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-gray-900">{booking.passenger}</p>
                                                <p className="text-xs text-gray-400">{booking.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-semibold text-gray-900">{booking.trip}</span>
                                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                                <Calendar size={12} /> {booking.date}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono font-bold text-gray-700">{booking.seat}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{booking.amount}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                booking.status === 'confirmed' ? 'success' :
                                                    booking.status === 'pending' ? 'blue' : 'destructive'
                                            }
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {booking.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleViewBooking(booking)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreHorizontal size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No bookings found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            )}

            {selectedBooking && (
                <DetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title={`Booking ${selectedBooking.id}`}
                    footer={
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                    }
                >
                    <div className="space-y-4">
                        <ModalDataRow label="Passenger" value={selectedBooking.passenger} />
                        <ModalDataRow label="Email" value={selectedBooking.email} />
                        <ModalDataRow label="Trip" value={selectedBooking.trip} />
                        <ModalDataRow label="Travel Date" value={selectedBooking.date} />
                        <ModalDataRow label="Seat" value={selectedBooking.seat} />
                        <ModalDataRow label="Amount" value={selectedBooking.amount} />
                        <ModalDataRow label="Status" value={selectedBooking.status} />
                    </div>
                </DetailModal>
            )}
        </div>
    );
}
