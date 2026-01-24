import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Search, Download, Users, FileText, CheckCircle, XCircle, Printer, Filter, UserPlus } from 'lucide-react';
import { TRIPS } from '../../data/mock-db';
import { cn } from '../../lib/utils';

const MOCK_MANIFEST = [
    // Trip 1
    { id: 'BK-101', tripId: 'trip-1', ticketNo: 'TKT-8821', passenger: 'Abebe Kebede', gender: 'Male', age: 34, seat: '3A', phone: '0911223344', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-102', tripId: 'trip-1', ticketNo: 'TKT-8823', passenger: 'Kebede Balcha', gender: 'Male', age: 45, seat: '4A', phone: '0933445566', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-103', tripId: 'trip-1', ticketNo: 'TKT-8824', passenger: 'Sara Tesfaye', gender: 'Female', age: 22, seat: '4B', phone: '0944556677', status: 'No Show', payment: 'Paid' },
    { id: 'BK-104', tripId: 'trip-1', ticketNo: 'TKT-8899', passenger: 'Hanna Mekonnen', gender: 'Female', age: 29, seat: '5B', phone: '0912345678', status: 'Pending', payment: 'Paid' },

    // Trip 2
    { id: 'BK-105', tripId: 'trip-2', ticketNo: 'TKT-8822', passenger: 'Marta Tadesse', gender: 'Female', age: 28, seat: '3B', phone: '0922334455', status: 'Pending', payment: 'Paid' },
    { id: 'BK-106', tripId: 'trip-2', ticketNo: 'TKT-8901', passenger: 'Yonas Alemu', gender: 'Male', age: 31, seat: '5A', phone: '0912121212', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-107', tripId: 'trip-2', ticketNo: 'TKT-8902', passenger: 'Tigist Haile', gender: 'Female', age: 26, seat: '6B', phone: '0913131313', status: 'Pending', payment: 'Unpaid' },

    // Trip 3
    { id: 'BK-108', tripId: 'trip-3', ticketNo: 'TKT-8825', passenger: 'Dawit Alemu', gender: 'Male', age: 30, seat: '5A', phone: '0955667788', status: 'Pending', payment: 'Unpaid' },
    { id: 'BK-109', tripId: 'trip-3', ticketNo: 'TKT-8903', passenger: 'Solomon Tefera', gender: 'Male', age: 40, seat: '2A', phone: '0914141414', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-110', tripId: 'trip-3', ticketNo: 'TKT-8904', passenger: 'Hiwot Assefa', gender: 'Female', age: 24, seat: '2B', phone: '0915151515', status: 'Boarded', payment: 'Paid' },

    // Trip 4
    { id: 'BK-111', tripId: 'trip-4', ticketNo: 'TKT-8905', passenger: 'Kassahun Bekele', gender: 'Male', age: 52, seat: '1A', phone: '0916161616', status: 'Pending', payment: 'Paid' },
    { id: 'BK-112', tripId: 'trip-4', ticketNo: 'TKT-8906', passenger: 'Almaz Wolde', gender: 'Female', age: 48, seat: '1B', phone: '0917171717', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-113', tripId: 'trip-4', ticketNo: 'TKT-8907', passenger: 'Meron Tadesse', gender: 'Female', age: 25, seat: '3C', phone: '0918181818', status: 'Boarded', payment: 'Paid' },

    // Trip 5
    { id: 'BK-114', tripId: 'trip-5', ticketNo: 'TKT-8908', passenger: 'Elias Girma', gender: 'Male', age: 33, seat: '4A', phone: '0919191919', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-115', tripId: 'trip-5', ticketNo: 'TKT-8909', passenger: 'Rahel Belay', gender: 'Female', age: 27, seat: '4B', phone: '0920202020', status: 'No Show', payment: 'Paid' },
    { id: 'BK-116', tripId: 'trip-5', ticketNo: 'TKT-8910', passenger: 'Samuel Desta', gender: 'Male', age: 36, seat: '5C', phone: '0921212121', status: 'Pending', payment: 'Unpaid' },

    // Trip 6
    { id: 'BK-117', tripId: 'trip-6', ticketNo: 'TKT-8911', passenger: 'Bethlehem Yilma', gender: 'Female', age: 23, seat: '2A', phone: '0922222222', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-118', tripId: 'trip-6', ticketNo: 'TKT-8912', passenger: 'Abel Tesfaye', gender: 'Male', age: 29, seat: '2B', phone: '0923232323', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-119', tripId: 'trip-6', ticketNo: 'TKT-8913', passenger: 'Lydia Getachew', gender: 'Female', age: 26, seat: '3A', phone: '0924242424', status: 'Pending', payment: 'Paid' },

    // Trip 7
    { id: 'BK-120', tripId: 'trip-7', ticketNo: 'TKT-8914', passenger: 'Fikadu Alemu', gender: 'Male', age: 41, seat: '1A', phone: '0925252525', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-121', tripId: 'trip-7', ticketNo: 'TKT-8915', passenger: 'Genet Kebede', gender: 'Female', age: 38, seat: '1B', phone: '0926262626', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-122', tripId: 'trip-7', ticketNo: 'TKT-8916', passenger: 'Henok Tsegaye', gender: 'Male', age: 32, seat: '2C', phone: '0927272727', status: 'No Show', payment: 'Paid' },

    // Trip 8
    { id: 'BK-123', tripId: 'trip-8', ticketNo: 'TKT-8917', passenger: 'Jerusalem Assefa', gender: 'Female', age: 30, seat: '3A', phone: '0928282828', status: 'Pending', payment: 'Paid' },
    { id: 'BK-124', tripId: 'trip-8', ticketNo: 'TKT-8918', passenger: 'Kirubel Haile', gender: 'Male', age: 27, seat: '3B', phone: '0929292929', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-125', tripId: 'trip-8', ticketNo: 'TKT-8919', passenger: 'Liya Bekele', gender: 'Female', age: 24, seat: '4A', phone: '0930303030', status: 'Boarded', payment: 'Paid' },

    // Trip 9
    { id: 'BK-126', tripId: 'trip-9', ticketNo: 'TKT-8920', passenger: 'Michael Tefera', gender: 'Male', age: 35, seat: '5A', phone: '0931313131', status: 'Pending', payment: 'Unpaid' },
    { id: 'BK-127', tripId: 'trip-9', ticketNo: 'TKT-8921', passenger: 'Nahom Girma', gender: 'Male', age: 28, seat: '5B', phone: '0932323232', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-128', tripId: 'trip-9', ticketNo: 'TKT-8922', passenger: 'Rediet Belay', gender: 'Female', age: 25, seat: '6A', phone: '0933333333', status: 'Boarded', payment: 'Paid' },

    // Trip 10
    { id: 'BK-129', tripId: 'trip-10', ticketNo: 'TKT-8923', passenger: 'Saron Desta', gender: 'Female', age: 22, seat: '2A', phone: '0934343434', status: 'Boarded', payment: 'Paid' },
    { id: 'BK-130', tripId: 'trip-10', ticketNo: 'TKT-8924', passenger: 'Tamrat Yilma', gender: 'Male', age: 44, seat: '2B', phone: '0935353535', status: 'Pending', payment: 'Paid' },
    { id: 'BK-131', tripId: 'trip-10', ticketNo: 'TKT-8925', passenger: 'Wondwossen Tesfaye', gender: 'Male', age: 39, seat: '3C', phone: '0936363636', status: 'Boarded', payment: 'Paid' }
];

export default function BookingManagement() {
    const [selectedTrip, setSelectedTrip] = useState(TRIPS[0]?.id || null);
    const [manifest, setManifest] = useState(MOCK_MANIFEST);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredManifest = manifest.filter(p =>
        p.tripId === selectedTrip &&
        (p.passenger.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.ticketNo.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleStatus = (id) => {
        setManifest(manifest.map(p => {
            if (p.id === id) {
                return { ...p, status: p.status === 'Boarded' ? 'Pending' : 'Boarded' };
            }
            return p;
        }));
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">
                        {selectedTrip
                            ? `Manifest: ${TRIPS.find(t => t.id === selectedTrip)?.from} → ${TRIPS.find(t => t.id === selectedTrip)?.to}`
                            : 'Bookings & Manifest'
                        }
                    </h1>
                    <p className="text-gray-500">
                        {selectedTrip
                            ? `${new Date(TRIPS.find(t => t.id === selectedTrip)?.date).toDateString()} • ${TRIPS.find(t => t.id === selectedTrip)?.departureTime}`
                            : 'Manage passenger lists, tickets, and check-ins.'
                        }
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar: Trip List */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-700">Available Trips</div>
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600">{TRIPS.length} Active</Badge>
                    </div>
                    <div className="space-y-2 h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                        {TRIPS.map(trip => (
                            <div
                                key={trip.id}
                                onClick={() => setSelectedTrip(trip.id)}
                                className={cn(
                                    "p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 group relative",
                                    selectedTrip === trip.id
                                        ? "bg-white border-primary shadow-lg shadow-primary/10"
                                        : "bg-white border-transparent hover:border-gray-200 hover:bg-gray-50"
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                                            {trip.busType}
                                        </div>
                                        <span className={cn("font-bold text-sm block", selectedTrip === trip.id ? "text-primary" : "text-gray-900")}>
                                            {trip.from.split(',')[0]} → {trip.to.split(',')[0]}
                                        </span>
                                    </div>
                                    <div className={cn(
                                        "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
                                        selectedTrip === trip.id ? "border-primary bg-primary" : "border-gray-200 bg-white"
                                    )}>
                                        {selectedTrip === trip.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-xs font-medium text-gray-500 mb-3">
                                    <span className="bg-gray-100 px-2 py-1 rounded">{new Date(trip.date).toLocaleDateString()}</span>
                                    <span className="bg-gray-100 px-2 py-1 rounded">{trip.departureTime}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-400">{trip.plateNumber || 'B-12345'}</span>
                                    <span className="font-bold text-gray-900">{trip.price} ETB</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main: Passenger Details */}
                <div className="lg:col-span-3 space-y-4">
                    <Card className="p-6 border-none shadow-sm h-full">
                        {/* Summary Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-700">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">Total Seats</div>
                                <div className="text-xl font-bold">45</div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg text-green-700">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">Booked</div>
                                <div className="text-xl font-bold">{manifest.length}</div>
                            </div>
                            <div className="p-3 bg-orange-50 rounded-lg text-orange-700">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">Boarded</div>
                                <div className="text-xl font-bold">{manifest.filter(m => m.status === 'Boarded').length}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg text-gray-700">
                                <div className="text-xs font-bold uppercase opacity-70 mb-1">Empty</div>
                                <div className="text-xl font-bold">40</div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search passenger, ticket, or phone..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-100">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-500 uppercase font-bold text-[10px] tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Ticket Info</th>
                                        <th className="px-6 py-4">Passenger Details</th>
                                        <th className="px-6 py-4">Seat</th>
                                        <th className="px-6 py-4">Contact</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {filteredManifest.map((p) => (
                                        <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{p.ticketNo}</div>
                                                <div className="text-xs text-gray-400">{p.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{p.passenger}</div>
                                                <div className="text-xs text-gray-500">{p.gender}, {p.age}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 font-bold text-gray-700 border border-gray-200 shadow-sm">
                                                    {p.seat}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono text-xs text-gray-600">{p.phone}</td>
                                            <td className="px-6 py-4">
                                                <Badge
                                                    className={cn("cursor-pointer select-none transition-all",
                                                        p.status === 'Boarded' ? 'bg-success hover:bg-success/90' :
                                                            p.status === 'No Show' ? 'bg-danger hover:bg-danger/90' :
                                                                'bg-warning hover:bg-warning/90'
                                                    )}
                                                    onClick={() => toggleStatus(p.id)}
                                                >
                                                    {p.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-gray-400 hover:text-primary">
                                                        <FileText size={16} />
                                                    </Button>
                                                </div>
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
