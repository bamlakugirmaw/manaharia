import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { MapPin, ArrowLeft, Clock, Users, Bus, Info, LogIn } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useAllTrips } from '../hooks/useTrips';
import { usePublicDestination, usePublicDestinations } from '../hooks/useDestinations';
import { tripOrigin, tripDest, tripOperatorName, tripSeatsLeft } from '../lib/tripHelpers';
import { useAuth } from '../contexts/AuthContext';

const formatTime = (iso) => {
    if (!iso) return '—';
    try {
        return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return iso;
    }
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function DestinationDetail() {
    const { id: routeParam } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const [directionFilter, setDirectionFilter] = useState('all');

    const param = decodeURIComponent(routeParam ?? '');
    const isUuid = UUID_RE.test(param);

    const { data: detailPayload, isLoading: detailLoading, isError: detailError } = usePublicDestination(
        isUuid ? param : undefined
    );
    const { data: listPayload, isLoading: listLoading } = usePublicDestinations({ limit: 100 });

    const destination = useMemo(() => {
        if (isUuid && detailPayload?.destination) {
            return detailPayload.destination;
        }
        const list = listPayload?.destinations ?? [];
        return list.find((d) => d.id === param || d.name === param) ?? null;
    }, [isUuid, param, detailPayload, listPayload]);

    const needsAuth = (isUuid ? detailPayload?.needsAuth : listPayload?.needsAuth) ?? false;
    const cityName = destination?.name ?? '';

    const { data: rawTrips = [], isLoading: tripsLoading, isError: tripsError } = useAllTrips({
        limit: 200,
        status: 'SCHEDULED',
    });

    const cityTrips = useMemo(() => {
        if (!cityName) return [];
        return rawTrips.filter((t) => tripOrigin(t) === cityName || tripDest(t) === cityName);
    }, [rawTrips, cityName]);

    const filteredTrips = useMemo(() => {
        if (directionFilter === 'from') {
            return cityTrips.filter((t) => tripOrigin(t) === cityName);
        }
        if (directionFilter === 'to') {
            return cityTrips.filter((t) => tripDest(t) === cityName);
        }
        return cityTrips;
    }, [cityTrips, directionFilter, cityName]);

    const isLoading = (isUuid ? detailLoading : listLoading) || tripsLoading;

    if (!param) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Destination not found</h1>
                    <Button onClick={() => navigate('/destinations')}>Back to Destinations</Button>
                </div>
            </div>
        );
    }

    if (needsAuth && !isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-lg text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Sign in required</h1>
                    <p className="text-gray-600 mb-6">
                        Destination details are loaded from GET /v1/destinations/:id and require an account.
                    </p>
                    <Button className="gap-2" onClick={() => navigate('/login', { state: { from: { pathname: `/destinations/${param}` } } })}>
                        <LogIn size={18} /> Sign In
                    </Button>
                    <Button variant="ghost" className="mt-4 block mx-auto" onClick={() => navigate('/destinations')}>
                        Back to Destinations
                    </Button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (detailError || tripsError || !destination) {
        return (
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="container mx-auto px-4 max-w-6xl text-center">
                    <h1 className="text-2xl font-extrabold text-gray-900 mb-4">Destination not found</h1>
                    <Button onClick={() => navigate('/destinations')}>Back to Destinations</Button>
                </div>
            </div>
        );
    }

    const highlights = Array.isArray(destination.highlights) ? destination.highlights : [];

    const handleBook = (tripId) => {
        navigate(`/booking/seats/${tripId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 text-gray-400 hover:text-primary transition-colors text-xs font-bold"
                    onClick={() => navigate('/destinations')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Destinations
                </Button>

                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden mb-8">
                    <div className="relative h-64 overflow-hidden">
                        <img
                            src={destination.image ?? '/images/destinations/addis_ababa.jpg'}
                            alt={destination.name}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute bottom-8 left-8 right-8">
                            <h1 className="text-4xl font-extrabold text-white mb-2 shadow-sm">{destination.name}</h1>
                            <p className="text-white/90 text-sm max-w-2xl font-medium shadow-sm">{destination.description}</p>
                        </div>
                    </div>

                    {highlights.length > 0 && (
                        <div className="p-8">
                            <div className="flex items-center gap-2 mb-4">
                                <Info className="w-5 h-5 text-primary" />
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Popular Attractions</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {highlights.map((highlight, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-semibold rounded-full border border-gray-100"
                                    >
                                        {highlight}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

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

                <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-extrabold text-gray-900">Available Trips</h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
                            {filteredTrips.length} {filteredTrips.length === 1 ? 'trip' : 'trips'} available
                        </p>
                    </div>

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
                                    const seatsLeft = tripSeatsLeft(trip);
                                    return (
                                        <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{tripOrigin(trip)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-gray-900">{tripDest(trip)}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                        <Bus className="w-4 h-4 text-primary" />
                                                    </div>
                                                    <p className="font-semibold text-gray-900 text-sm">{tripOperatorName(trip)}</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-900">{formatTime(trip.departureTime)}</span>
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
                                                    <span className={`font-semibold ${seatsLeft < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                        {seatsLeft}
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

                    <div className="md:hidden divide-y divide-gray-100">
                        {filteredTrips.map((trip) => {
                            const seatsLeft = tripSeatsLeft(trip);
                            return (
                                <div key={trip.id} className="p-6">
                                    <p className="text-sm font-semibold text-gray-900">
                                        {tripOrigin(trip)} → {tripDest(trip)}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">{tripOperatorName(trip)}</p>
                                    <div className="grid grid-cols-2 gap-4 my-4">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Departure</p>
                                            <p className="font-semibold text-gray-900">{formatTime(trip.departureTime)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Seats Left</p>
                                            <p className={`font-semibold ${seatsLeft < 5 ? 'text-red-600' : 'text-green-600'}`}>
                                                {seatsLeft}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-lg font-extrabold text-primary">
                                            <span className="text-xs mr-1">ETB</span>{trip.price}
                                        </p>
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
