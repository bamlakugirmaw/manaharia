import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { TRIPS, OPERATORS } from '../data/mock-db';
import { MapPin, TrendingUp, Users } from 'lucide-react';
import { useState } from 'react';

export default function RoutesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    // Extract unique routes from trips
    const getUniqueRoutes = () => {
        const routesMap = new Map();

        TRIPS.forEach(trip => {
            const routeKey = `${trip.from}-${trip.to}`;

            if (!routesMap.has(routeKey)) {
                routesMap.set(routeKey, {
                    from: trip.from,
                    to: trip.to,
                    distance: trip.distance || 0,
                    operators: new Set([trip.operatorId]),
                    prices: [trip.price],
                    trips: [trip]
                });
            } else {
                const route = routesMap.get(routeKey);
                route.operators.add(trip.operatorId);
                route.prices.push(trip.price);
                route.trips.push(trip);
            }
        });

        return Array.from(routesMap.values()).map(route => ({
            ...route,
            operatorCount: route.operators.size,
            cheapestPrice: Math.min(...route.prices),
            operators: undefined,
            prices: undefined
        }));
    };

    const routes = getUniqueRoutes();

    // Filter routes based on search
    const filteredRoutes = routes.filter(route => {
        const query = searchQuery.toLowerCase();
        return route.from.toLowerCase().includes(query) ||
            route.to.toLowerCase().includes(query);
    });

    const handleViewTrips = (from, to) => {
        navigate(`/routes/${encodeURIComponent(from)}/${encodeURIComponent(to)}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">All Routes</h1>
                    <p className="text-gray-400 text-xs font-bold mt-2 uppercase tracking-wider">Browse all available bus routes across Ethiopia</p>
                </div>

                {/* Search Bar */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Search routes by city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-14 px-6 bg-white border border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                    />
                </div>

                {/* Routes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRoutes.map((route, index) => (
                        <Card key={index} className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                            {/* Route Header */}
                            <div className="mb-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {route.from}
                                        </h3>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-13">
                                    <div className="w-px h-6 bg-gray-200"></div>
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-3 mt-2">
                                    <div className="w-10 h-10 bg-secondary/10 rounded-xl flex items-center justify-center">
                                        <MapPin className="w-5 h-5 text-secondary" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-bold text-gray-900">
                                            {route.to}
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Route Stats */}
                            <div className="space-y-3 mb-6">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" />
                                        Distance
                                    </span>
                                    <span className="text-gray-900 font-semibold">{route.distance} km</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-400 text-xs font-bold flex items-center gap-2">
                                        <Users className="w-4 h-4" />
                                        Operators
                                    </span>
                                    <span className="text-gray-900 font-semibold">{route.operatorCount} {route.operatorCount === 1 ? 'Operator' : 'Operators'}</span>
                                </div>
                            </div>

                            {/* Price and CTA */}
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">From</p>
                                        <p className="text-xl font-extrabold text-primary">
                                            <span className="text-xs font-semibold mr-1 opacity-60">ETB</span>
                                            {route.cheapestPrice}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    fullWidth
                                    onClick={() => handleViewTrips(route.from, route.to)}
                                    className="h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md shadow-primary/10 transition-all"
                                >
                                    View Trips
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredRoutes.length === 0 && (
                    <div className="text-center py-20">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">No routes found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Try adjusting your search query</p>
                    </div>
                )}
            </div>
        </div>
    );
}
