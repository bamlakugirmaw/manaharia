import { useState, useMemo } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Search, Calendar, Bus, MoreHorizontal } from 'lucide-react';
import { cn } from '../../lib/utils';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';
import { useAllTrips, useUpdateTrip } from '../../hooks/useTrips';
import { tripOrigin, tripDest, tripOperatorName } from '../../lib/tripHelpers';

const STATUS_UI_TO_API = {
    scheduled: 'SCHEDULED',
    completed: 'COMPLETED',
    cancelled: 'CANCELLED',
};

function normaliseTripRow(t) {
    const total = t.bus?.totalSeats ?? 0;
    const available = t.availableSeatCount ?? 0;
    const filled = total > 0 ? Math.round(((total - available) / total) * 100) : 0;
    return {
        id: t.id,
        operator: tripOperatorName(t),
        route: `${tripOrigin(t)} → ${tripDest(t)}`,
        date: t.date
            ? new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        occupancy: `${filled}%`,
        revenue: `ETB ${((total - available) * (t.price ?? 0)).toLocaleString()}`,
        status: (t.status ?? 'SCHEDULED').toLowerCase(),
        _raw: t,
    };
}

export default function AdminTrips() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const { data: rawTrips = [], isLoading, isError } = useAllTrips({ limit: 200 });
    const { mutate: updateTrip, isPending: updating } = useUpdateTrip();

    const trips = useMemo(
        () => (Array.isArray(rawTrips) ? rawTrips : []).map(normaliseTripRow),
        [rawTrips]
    );

    const filteredTrips = trips.filter((trip) => {
        const matchesSearch =
            trip.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.operator.toLowerCase().includes(searchQuery.toLowerCase()) ||
            trip.route.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || trip.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleManage = (trip) => {
        setSelectedTrip(trip);
        setIsManageModalOpen(true);
    };

    const updateStatus = (statusUi) => {
        if (!selectedTrip) return;
        const apiStatus = STATUS_UI_TO_API[statusUi];
        updateTrip(
            { id: selectedTrip.id, status: apiStatus },
            {
                onSuccess: () => {
                    setSelectedTrip({ ...selectedTrip, status: statusUi });
                },
            }
        );
    };

    return (
        <div className="space-y-6 relative">

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

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-center text-red-500 text-sm py-8">Failed to load trips.</p>
            )}

            {!isLoading && !isError && (
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
                                        <div className="w-full max-w-[100px] mx-auto">
                                            <div className="flex justify-between text-[9px] mb-1">
                                                <span className="text-gray-400 font-bold uppercase tracking-widest">Filled</span>
                                                <span className="font-bold text-gray-600">{trip.occupancy}</span>
                                            </div>
                                            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={cn(
                                                        'h-full rounded-full',
                                                        parseInt(trip.occupancy, 10) > 80 ? 'bg-green-500' :
                                                            parseInt(trip.occupancy, 10) > 40 ? 'bg-primary' : 'bg-orange-400'
                                                    )}
                                                    style={{ width: trip.occupancy }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-gray-900">{trip.revenue}</span>
                                            <span className="text-[10px] text-gray-400">Est. gross</span>
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
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleManage(trip)}
                                            className="text-gray-400 hover:text-gray-600"
                                        >
                                            <MoreHorizontal size={16} />
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
            )}

            {selectedTrip && (
                <DetailModal
                    isOpen={isManageModalOpen}
                    onClose={() => setIsManageModalOpen(false)}
                    title={`Manage Trip ${selectedTrip.id}`}
                    footer={
                        <Button variant="outline" onClick={() => setIsManageModalOpen(false)}>Close</Button>
                    }
                >
                    <div className="space-y-6">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-lg mb-1">{selectedTrip.route}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Bus size={14} /> {selectedTrip.operator}
                                <span className="text-gray-300">|</span>
                                <Calendar size={14} /> {selectedTrip.date}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Update Status</h4>
                            <div className="flex gap-2 flex-wrap">
                                <Button size="sm" disabled={updating} variant={selectedTrip.status === 'scheduled' ? 'default' : 'outline'} onClick={() => updateStatus('scheduled')}>Scheduled</Button>
                                <Button size="sm" disabled={updating} variant={selectedTrip.status === 'completed' ? 'success' : 'outline'} onClick={() => updateStatus('completed')}>Completed</Button>
                                <Button size="sm" disabled={updating} variant={selectedTrip.status === 'cancelled' ? 'destructive' : 'outline'} onClick={() => updateStatus('cancelled')}>Cancelled</Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <ModalDataRow label="Revenue (est.)" value={selectedTrip.revenue} />
                            <ModalDataRow label="Occupancy" value={selectedTrip.occupancy} />
                        </div>
                    </div>
                </DetailModal>
            )}
        </div>
    );
}
