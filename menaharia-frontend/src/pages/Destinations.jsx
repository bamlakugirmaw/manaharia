import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS, OPERATORS, DESTINATIONS } from '../data/mock-db';
import { MapPin, TrendingUp, Users, Search } from 'lucide-react';
import { useState } from 'react';

export default function Destinations() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Calculate stats for each destination
    const getDestinationStats = (cityName) => {
        const cityTrips = TRIPS.filter(trip =>
            trip.from === cityName || trip.to === cityName
        );

        const operators = new Set(cityTrips.map(trip => trip.operatorId));
        const prices = cityTrips.map(trip => trip.price);

        return {
            operatorCount: operators.size,
            cheapestPrice: prices.length > 0 ? Math.min(...prices) : 0,
            tripCount: cityTrips.length
        };
    };

    const destinationsWithStats = DESTINATIONS.map(dest => ({
        ...dest,
        ...getDestinationStats(dest.name)
    }));

    // Filter destinations based on search
    const filteredDestinations = destinationsWithStats.filter(dest => {
        const query = searchQuery.toLowerCase();
        return dest.name.toLowerCase().includes(query) ||
            dest.description.toLowerCase().includes(query);
    });

    const handleViewTrips = (cityName) => {
        navigate(`/destinations/${encodeURIComponent(cityName)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Search Section */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary px-4 pt-20 pb-24 text-center rounded-b-[3rem] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Explore Destinations
                    </h1>
                    <p className="text-lg text-white/90 font-medium max-w-xl mx-auto">
                        Discover amazing cities across Ethiopia. From historical wonders to vibrant metropolises.
                    </p>

                    <div className="relative max-w-xl mx-auto mt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search destinations..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-white/20 outline-none text-gray-800 placeholder:text-gray-400 font-medium transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Destinations Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDestinations.map((destination) => (
                        <Card key={destination.id} className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
                            {/* Destination Image */}
                            <div className="relative h-48 overflow-hidden group">
                                <img
                                    src={destination.image}
                                    alt={destination.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="text-2xl font-extrabold text-white shadow-sm">{destination.name}</h3>
                                </div>
                            </div>

                            {/* Destination Info */}
                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{destination.description}</p>

                                {/* Stats */}
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4" />
                                            Available Trips
                                        </span>
                                        <span className="text-gray-900 font-semibold">{destination.tripCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                            <Users className="w-4 h-4" />
                                            Operators
                                        </span>
                                        <span className="text-gray-900 font-semibold">{destination.operatorCount}</span>
                                    </div>
                                </div>

                                {/* Price and CTA */}
                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">From</p>
                                            <p className="text-xl font-extrabold text-primary">
                                                <span className="text-xs font-semibold mr-1 opacity-60">ETB</span>
                                                {destination.cheapestPrice || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        fullWidth
                                        onClick={() => handleViewTrips(destination.name)}
                                        className="h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md shadow-primary/10 transition-all"
                                    >
                                        View Trips
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredDestinations.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">No destinations found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Try adjusting your search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
