import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS, OPERATORS } from '../data/mock-db';
import { MapPin, ArrowLeft, Clock, Users, DollarSign, Bus } from 'lucide-react';
import { useState } from 'react';

export default function RouteDetail() {
    const { from, to } = useParams();
    const navigate = useNavigate();
    const [busTypeFilter, setBusTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('price');

    // Get all trips for this route
    const routeTrips = TRIPS.filter(trip =>
        trip.from === from && trip.to === to
    );

    if (routeTrips.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">No trips found for this route</h1>
                    <Button onClick={() => navigate('/routes')}>Back to Routes</Button>
                </div>
            </div>
        );
    }

    const distance = routeTrips[0]?.distance || 0;

    // Filter trips
    let filteredTrips = routeTrips;
    if (busTypeFilter !== 'all') {
        filteredTrips = filteredTrips.filter(trip => trip.busType === busTypeFilter);
    }

    // Sort trips
    const sortedTrips = [...filteredTrips].sort((a, b) => {
        switch (sortBy) {
            case 'price':
                return a.price - b.price;
            case 'time':
                return a.departureTime.localeCompare(b.departureTime);
            case 'seats':
                return b.seatsAvailable - a.seatsAvailable;
            default:
                return 0;
        }
    });

    const handleBook = (tripId) => {
        navigate(`/booking/seats/${tripId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 text-gray-500 hover:text-primary transition-colors text-xs font-bold"
                    onClick={() => navigate('/routes')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Routes
                </Button>

                {/* Route Header */}
                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-8 mb-8">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900">{from}</h1>
                                </div>
                            </div>
                            <div className="text-gray-400 text-2xl font-bold">→</div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-6 h-6 text-secondary" />
                                </div>
                                <div>
                                    <h1 className="text-2xl font-extrabold text-gray-900">{to}</h1>
                                </div>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Distance</p>
                            <p className="text-xl font-extrabold text-gray-900">{distance} <span className="text-sm font-medium text-gray-400">km</span></p>
                        </div>
                    </div>
                </Card>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-700">Bus Type:</label>
                        <select
                            value={busTypeFilter}
                            onChange={(e) => setBusTypeFilter(e.target.value)}
                            className="h-10 px-4 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            <option value="all">All Types</option>
                            <option value="Standard">Standard</option>
                            <option value="VIP">VIP</option>
                            <option value="Luxury">Luxury</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-bold text-gray-700">Sort By:</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="h-10 px-4 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                        >
                            <option value="price">Price (Low to High)</option>
                            <option value="time">Departure Time</option>
                            <option value="seats">Seats Available</option>
                        </select>
                    </div>
                </div>

                {/* Trips Table */}
                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-extrabold text-gray-900">Available Trips</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{sortedTrips.length} {sortedTrips.length === 1 ? 'trip' : 'trips'} available</p>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Operator</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Departure</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Bus Type</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seats Left</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {sortedTrips.map((trip) => {
                                    const operator = OPERATORS.find(op => op.id === trip.operatorId);
                                    return (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                        <Bus className="w-5 h-5 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{operator?.name}</p>
                                                        <p className="text-xs text-gray-400">★ {operator?.rating}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-900">{trip.departureTime}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${trip.busType === 'Luxury' ? 'bg-purple-100 text-purple-700' :
                                                    trip.busType === 'VIP' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {trip.busType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className={`font-bold ${trip.seatsAvailable < 5 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                        {trip.seatsAvailable}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-400 font-semibold">ETB</span>
                                                    <span className="text-lg font-extrabold text-primary">{trip.price}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Button
                                                    onClick={() => handleBook(trip.id)}
                                                    className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md shadow-primary/10 transition-all"
                                                >
                                                    Book
                                                </Button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="md:hidden divide-y divide-gray-100">
                        {sortedTrips.map((trip) => {
                            const operator = OPERATORS.find(op => op.id === trip.operatorId);
                            return (
                                <div key={trip.id} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                                <Bus className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">{operator?.name}</p>
                                                <p className="text-xs text-gray-400">★ {operator?.rating}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${trip.busType === 'Luxury' ? 'bg-purple-100 text-purple-700' :
                                            trip.busType === 'VIP' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                            {trip.busType}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Departure</p>
                                            <p className="font-semibold text-gray-900">{trip.departureTime}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Seats Left</p>
                                            <p className={`font-semibold ${trip.seatsAvailable < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                {trip.seatsAvailable}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold mb-1">Price</p>
                                            <p className="text-lg font-extrabold text-primary">
                                                <span className="text-xs mr-1">ETB</span>{trip.price}
                                            </p>
                                        </div>
                                        <Button
                                            onClick={() => handleBook(trip.id)}
                                            className="h-10 px-6 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                                        >
                                            Book
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Empty State */}
                {sortedTrips.length === 0 && (
                    <div className="text-center py-20">
                        <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">No trips match your filters</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Try adjusting your filters</p>
                    </div>
                )}
            </div>
        </div>
    );
}
