import { useState } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Calendar, MapPin, Bus } from 'lucide-react';
import { cn } from '../../lib/utils';

const MOCK_TRIPS = [
    { id: 'TRIP-001', operator: 'Selam Bus', route: 'Addis Ababa → Bahir Dar', date: 'Dec 15, 2025', occupancy: '70%', revenue: 'ETB 23,800', status: 'scheduled' },
    { id: 'TRIP-002', operator: 'Sky Bus', route: 'Addis Ababa → Hawassa', date: 'Dec 15, 2025', occupancy: '85%', revenue: 'ETB 19,500', status: 'scheduled' },
    { id: 'TRIP-003', operator: 'Golden Bus', route: 'Bahir Dar → Mekelle', date: 'Dec 16, 2025', occupancy: '45%', revenue: 'ETB 15,600', status: 'completed' },
    { id: 'TRIP-004', operator: 'Selam Bus', route: 'Addis Ababa → Jimma', date: 'Dec 17, 2025', occupancy: '90%', revenue: 'ETB 28,200', status: 'scheduled' },
    { id: 'TRIP-005', operator: 'Sky Bus', route: 'Hawassa → Addis Ababa', date: 'Dec 17, 2025', occupancy: '0%', revenue: 'ETB 0', status: 'cancelled' },
];

export default function AdminTrips() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredTrips = MOCK_TRIPS.filter(trip => {
        const matchesSearch =
            trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.route.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">All Trips</h1>
                    <p className="text-gray-500 text-sm">Monitor and manage all scheduled and completed bus trips.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="bg-white">Export CSV</Button>
                    <Button size="sm">Create New Trip</Button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Trip ID, Operator or Route..."
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
                        <option value="scheduled">Scheduled</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">Trip Details</th>
                                <th className="px-6 py-4 font-bold">Operator</th>
                                <th className="px-6 py-4 font-bold">Date & Time</th>
                                <th className="px-6 py-4 font-bold text-center">Occupancy</th>
                                <th className="px-6 py-4 font-bold">Revenue</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredTrips.map((trip) => (
                                <tr key={trip.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-mono text-primary font-bold mb-1 uppercase tracking-tighter">{trip.id}</span>
                                            <span className="text-sm font-semibold text-gray-900">{trip.route}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                                <Bus size={14} />
                                            </div>
                                            <span className="text-sm text-gray-700">{trip.operator}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            {trip.date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-full max-w-[100px]">
                                            <div className="flex justify-between text-[9px] mb-1">
                                                <span className="text-gray-400 font-bold uppercase tracking-widest">Filled</span>
                                                <span className="font-bold text-gray-600">{trip.occupancy}</span>
                                            </div>
                                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full",
                                                        parseInt(trip.occupancy) > 80 ? "bg-green-500" :
                                                            parseInt(trip.occupancy) > 40 ? "bg-primary" : "bg-orange-400"
                                                    )}
                                                    style={{ width: trip.occupancy }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{trip.revenue}</span>
                                            <span className="text-[10px] text-gray-400">Total Net</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={
                                                trip.status === 'scheduled' ? 'blue' :
                                                    trip.status === 'completed' ? 'success' : 'destructive'
                                            }
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {trip.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                            Manage
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {filteredTrips.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No trips found matching your criteria.
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

