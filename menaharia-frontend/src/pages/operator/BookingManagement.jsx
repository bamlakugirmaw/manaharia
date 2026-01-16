import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Search, Download, Users, FileText, CheckCircle, XCircle } from 'lucide-react';
import { TRIPS } from '../../data/mock-db';

const MOCK_MANIFEST = [
    { id: 'BK-101', passenger: 'Abebe Kebede', seat: '3A', phone: '0911223344', status: 'Boarded' },
    { id: 'BK-102', passenger: 'Marta Tadesse', seat: '3B', phone: '0922334455', status: 'Pending' },
    { id: 'BK-103', passenger: 'Kebede Balcha', seat: '4A', phone: '0933445566', status: 'Boarded' },
    { id: 'BK-104', passenger: 'Sara Tesfaye', seat: '4B', phone: '0944556677', status: 'No Show' },
    { id: 'BK-105', passenger: 'Dawit Alemu', seat: '5A', phone: '0955667788', status: 'Pending' }
];

export default function BookingManagement() {
    const [selectedTrip, setSelectedTrip] = useState(TRIPS[0]?.id || null);
    const [manifest, setManifest] = useState(MOCK_MANIFEST);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredManifest = manifest.filter(p =>
        p.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Bookings & Manifest</h1>
                    <p className="text-gray-500">Manage passenger lists and check-ins.</p>
                </div>
                <Button variant="outline" className="gap-2">
                    <Download size={18} /> Export Manifest
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Trip List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="font-semibold text-gray-700">Select Trip</div>
                    <div className="space-y-2 h-[500px] overflow-y-auto pr-2">
                        {TRIPS.map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => setSelectedTrip(trip.id)}
                                className={cn(
                                    "p-3 rounded-2xl border-2 cursor-pointer transition-all duration-300 group relative",
                                    selectedTrip === trip.id
                                        ? "bg-white border-primary shadow-lg shadow-primary/5 -translate-y-0.5"
                                        : "bg-white border-transparent hover:border-gray-100 hover:bg-gray-50/50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-1.5">
                                    <span className={cn("font-bold text-xs truncate max-w-[140px]", selectedTrip === trip.id ? "text-primary" : "text-gray-900")}>
                                        {trip.from.split(',')[0]} → {trip.to.split(',')[0]}
                                    </span>
                                    <div className={cn(
                                        "w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        selectedTrip === trip.id ? "border-primary bg-primary" : "border-gray-200 bg-white"
                                    )}>
                                        {selectedTrip === trip.id && <div className="w-1 h-1 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="text-[10px] font-semibold text-gray-400 mb-2.5 tracking-tight">
                                    {new Date(trip.date).toLocaleDateString()} • {trip.departureTime}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded-lg bg-gray-50 text-gray-500 text-[9px] font-bold uppercase tracking-wider group-hover:bg-white transition-colors text-center">
                                        {trip.busType}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-300 ml-auto group-hover:text-primary transition-colors">{trip.price} ETB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main: Passenger Details */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="p-4">
                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search passenger name or ID..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-1">
                                    <Users size={16} /> <strong>{manifest.length}</strong> Total
                                </div>
                                <div className="w-px h-4 bg-gray-300 mx-2"></div>
                                <div className="flex items-center gap-1 text-success">
                                    <CheckCircle size={16} /> <strong>{manifest.filter(m => m.status === 'Boarded').length}</strong> Boarded
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-lg border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium text-xs">
                                    <tr>
                                        <th className="px-6 py-3">Booking ID</th>
                                        <th className="px-6 py-3">Passenger</th>
                                        <th className="px-6 py-3">Seat</th>
                                        <th className="px-6 py-3">Contact</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredManifest.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-3 font-mono text-gray-600">{p.id}</td>
                                            <td className="px-6 py-3 font-medium">{p.passenger}</td>
                                            <td className="px-6 py-3">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded bg-gray-100 font-bold text-gray-700">
                                                    {p.seat}
                                                </span>
                                            </td>
                                            <td className="px-6 py-3 text-gray-600 font-mono text-xs">{p.phone}</td>
                                            <td className="px-6 py-3">
                                                <Badge
                                                    className={
                                                        p.status === 'Boarded' ? 'bg-success hover:bg-success' :
                                                            p.status === 'No Show' ? 'bg-danger hover:bg-danger' :
                                                                'bg-warning hover:bg-warning'
                                                    }
                                                >
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <Button size="sm" variant="outline" className="h-8 text-xs">Check In</Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
