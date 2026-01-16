import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS, OPERATORS, DESTINATIONS } from '../data/mock-db';
import { MapPin, ArrowLeft, Clock, Users, Bus, Info } from 'lucide-react';
import { useState } from 'react';

export default function DestinationDetail() {
    const { cityName } = useParams();
    const navigate = useNavigate();
    const [directionFilter, setDirectionFilter] = useState('all');

    const destination = DESTINATIONS.find(d => d.name === cityName);

    // Get all trips to/from this city
    const cityTrips = TRIPS.filter(trip =>
        trip.from === cityName || trip.to === cityName
    );

    // Filter by direction
    let filteredTrips = cityTrips;
    if (directionFilter === 'from') {
        filteredTrips = cityTrips.filter(trip => trip.from === cityName);
    } else if (directionFilter === 'to') {
        filteredTrips = cityTrips.filter(trip => trip.to === cityName);
    }

    if (!destination) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Destination not found</h1>
                    <Button onClick={() => navigate('/destinations')}>Back to Destinations</Button>
                </div>
            </div>
        );
    }

    const handleBook = (tripId) => {
        navigate(`/booking/seats/${tripId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 text-gray-400 hover:text-primary transition-colors text-xs font-bold"
                    onClick={() => navigate('/destinations')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
                </Button>

                {/* Destination Header */}
                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden mb-8">
                    {/* Banner */}
                    {/* Banner */}
                    <div className="relative h-64 overflow-hidden">
                        <img
                            src={destination.image}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                            <h1 className="text-4xl font-extrabold text-white mb-2 shadow-sm">{destination.name}</h1>
                            <p className="text-white/90 text-sm max-w-2xl font-medium shadow-sm">{destination.description}</p>
                        </div>
                    </div>

                    {/* Highlights */}
                    {destination.highlights && destination.highlights.length > 0 && (
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Popular Attractions</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {destination.highlights.map((highlight, index) => (
                                    <span key={index} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-100">
                                        {highlight}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-6">
                    <label className="text-xs font-bold text-gray-700">Direction:</label>
                    <select
                        value={directionFilter}
                        onChange={(e) => setDirectionFilter(e.target.value)}
                        className="h-10 px-4 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
                    >
                        <option value="all">All Trips</option>
                        <option value="from">From {cityName}</option>
                        <option value="to">To {cityName}</option>
                    </select>
                </div>

                {/* Trips Table */}
                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-extrabold text-gray-900">Available Trips</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">{filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} available</p>
                    </div>

                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">From</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">To</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Operator</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Departure</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Seats</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredTrips.map((trip) => {
                                    const operator = OPERATORS.find(op => op.id === trip.operatorId);
                                    return (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{trip.from}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{trip.to}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <Bus className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm">{operator?.name}</p>
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
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-gray-400 font-semibold">ETB</span>
                                                    <span className="text-lg font-extrabold text-primary">{trip.price}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4 text-gray-400" />
                                                    <span className={`font-semibold ${trip.seatsAvailable < 5 ? 'text-red-600' : 'text-green-600'
                                                        }`}>
                                                        {trip.seatsAvailable}
                                                    </span>
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
                        {filteredTrips.map((trip) => {
                            const operator = OPERATORS.find(op => op.id === trip.operatorId);
                            return (
                                <div key={trip.id} className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-sm font-semibold text-gray-900">{trip.from} → {trip.to}</p>
                                            <p className="text-xs text-gray-400 mt-1">{operator?.name} • ★ {operator?.rating}</p>
                                        </div>
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

                    {/* Empty State */}
                    {filteredTrips.length === 0 && (
                        <div className="text-center py-20">
                            <Bus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-extrabold text-gray-900 mb-2">No trips available</h3>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Try changing your filter</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
