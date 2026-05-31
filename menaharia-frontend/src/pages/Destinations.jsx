import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, TrendingUp, Users, Search, LogIn } from 'lucide-react';
import { useState, useMemo } from 'react';
import heroBg from '../assets/hero-bus-bg.png';
import { usePublicDestinations } from '../hooks/useDestinations';
import { useAllTrips } from '../hooks/useTrips';
import { tripOrigin, tripDest } from '../lib/tripHelpers';
import { useAuth } from '../contexts/AuthContext';

export default function Destinations() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');

    const { data: destPayload, isLoading: destLoading, isError: destError } = usePublicDestinations({ limit: 100 });
    const { data: trips = [], isLoading: tripsLoading } = useAllTrips({ limit: 200, status: 'SCHEDULED' });

    const apiDestinations = destPayload?.destinations ?? [];
    const needsAuth = destPayload?.needsAuth ?? false;

    const destinationsWithStats = useMemo(() => {
        return apiDestinations.map((dest) => {
            const cityTrips = trips.filter(
                (t) => tripOrigin(t) === dest.name || tripDest(t) === dest.name
            );
            const operatorIds = new Set(
                cityTrips.map((t) => t.bus?.operatorId ?? t.bus?.operator?.id).filter(Boolean)
            );
            const prices = cityTrips.map((t) => t.price).filter((p) => p != null);

            return {
                id: dest.id,
                name: dest.name,
                description: dest.description ?? '',
                image: dest.image ?? '/images/destinations/addis_ababa.jpg',
                highlights: dest.highlights ?? [],
                operatorCount: operatorIds.size,
                cheapestPrice: prices.length > 0 ? Math.min(...prices) : null,
                tripCount: cityTrips.length,
            };
        });
    }, [apiDestinations, trips]);

    const isLoading = destLoading || tripsLoading;

    const filteredDestinations = destinationsWithStats.filter((dest) => {
        const query = searchQuery.toLowerCase();
        return (
            dest.name.toLowerCase().includes(query) ||
            dest.description.toLowerCase().includes(query)
        );
    });

    const handleViewTrips = (destination) => {
        navigate(`/destinations/${destination.id}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div
                className="px-4 pt-20 pb-24 text-center rounded-b-[5rem] relative overflow-hidden"
                style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 55%' }}
            >
                <div className="absolute inset-0 bg-white/30" />

                <div className="relative max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl md:text-5xl font-black text-dark tracking-tight">
                        Explore Destinations
                    </h1>
                    <p className="text-lg text-dark/70 font-medium max-w-xl mx-auto">
                        Destination guides from the platform catalog, with live trip availability.
                    </p>

                    <div className="relative max-w-xl mx-auto mt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search destinations..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-primary/20 outline-none text-gray-800 placeholder:text-gray-400 font-medium transition-all bg-white/90 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {needsAuth && !isAuthenticated && (
                    <Card className="mb-6 p-6 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-left">
                            <p className="font-bold text-gray-900">Sign in to view destinations</p>
                            <p className="text-sm text-gray-600 mt-1">
                                Destination content is loaded from GET /v1/destinations and requires an account.
                            </p>
                        </div>
                        <Button className="gap-2 shrink-0" onClick={() => navigate('/login', { state: { from: { pathname: '/destinations' } } })}>
                            <LogIn size={18} /> Sign In
                        </Button>
                    </Card>
                )}

                {destError && (
                    <p className="text-center text-red-600 text-sm py-8">Failed to load destinations.</p>
                )}

                {isLoading && (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {!isLoading && !destError && filteredDestinations.map((destination) => (
                        <Card
                            key={destination.id}
                            className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group"
                        >
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

                            <div className="p-6">
                                <p className="text-sm text-gray-500 mb-6 line-clamp-2">{destination.description}</p>

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

                                <div className="pt-4 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">From</p>
                                            <p className="text-xl font-extrabold text-primary">
                                                <span className="text-xs font-semibold mr-1 opacity-60">ETB</span>
                                                {destination.cheapestPrice ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        fullWidth
                                        onClick={() => handleViewTrips(destination)}
                                        className="h-11 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl shadow-md shadow-primary/10 transition-all"
                                    >
                                        View Trips
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {!isLoading && !destError && filteredDestinations.length === 0 && !needsAuth && (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
                        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">No destinations found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            {searchQuery ? 'Try adjusting your search' : 'No destinations in the catalog yet'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
