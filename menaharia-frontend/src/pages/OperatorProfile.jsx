import { useParams, useNavigate } from 'react-router-dom';
import OperatorHeader from '../components/operators/OperatorHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { ArrowLeft, Clock, Bus, Users, MapPin, Info, Shield } from 'lucide-react';
import { useOperator } from '../hooks/useOperators';
import { getOperatorById } from '../data/operators-data';

export default function OperatorProfile() {
    const { operatorId } = useParams();
    const navigate = useNavigate();

    // GET /v1/operators/:id — requires auth.
    // Falls back to static data when unauthenticated.
    const { data: apiOperator, isLoading } = useOperator(operatorId);

    // Normalise: backend operator shape vs static shape
    const operator = apiOperator
        ? normaliseOperator(apiOperator)
        : getOperatorById(operatorId);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!operator) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-black text-gray-900 mb-4">Operator Not Found</h1>
                    <Button onClick={() => navigate('/operators')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Operators
                    </Button>
                </div>
            </div>
        );
    }

    const getSeatsColor = (seatsLeft) => {
        if (seatsLeft <= 5)  return 'text-danger font-bold';
        if (seatsLeft <= 10) return 'text-warning font-bold';
        return 'text-success font-bold';
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <Button variant="ghost" onClick={() => navigate('/operators')} className="font-bold">
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back to All Operators
                    </Button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <OperatorHeader operator={operator} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Trips Table */}
                    <div className="lg:col-span-2">
                        <Card className="shadow-xl border-2 border-gray-100">
                            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <Bus className="w-6 h-6" /> Available Trips
                                </h2>
                                <p className="text-white/80 text-sm mt-2 font-medium">Select a trip and book your seat</p>
                            </div>

                            <CardContent className="p-0">
                                {operator.upcomingTrips?.length > 0 ? (
                                    <>
                                        {/* Desktop Table */}
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                                    <tr>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Route</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Departure</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Seats Left</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Price</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-200">
                                                    {operator.upcomingTrips.map(trip => (
                                                        <tr key={trip.id} className="hover:bg-blue-50/50 transition-colors">
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                                                    <span className="font-bold text-gray-900 text-sm">{trip.route}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                    <span className="font-bold text-gray-700 text-sm">{trip.departure ?? trip.departureTime}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-gray-400" />
                                                                    <span className={`text-sm ${getSeatsColor(trip.seatsLeft ?? trip.seatsAvailable ?? 0)}`}>
                                                                        {trip.seatsLeft ?? trip.seatsAvailable ?? 0} left
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <span className="text-lg font-black text-gray-900">
                                                                    {trip.price} <span className="text-xs font-bold text-gray-500">ETB</span>
                                                                </span>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <Button onClick={() => navigate(`/booking/seats/${trip.id}`)} size="sm" className="bg-gradient-to-r from-primary to-primary/80 font-bold shadow-lg shadow-primary/20">
                                                                    Book
                                                                </Button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mobile Cards */}
                                        <div className="md:hidden divide-y divide-gray-200">
                                            {operator.upcomingTrips.map(trip => (
                                                <div key={trip.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                                            <span className="font-bold text-gray-900 text-sm">{trip.route}</span>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-bold text-gray-700">{trip.departure ?? trip.departureTime}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className={getSeatsColor(trip.seatsLeft ?? trip.seatsAvailable ?? 0)}>
                                                                {trip.seatsLeft ?? trip.seatsAvailable ?? 0} seats
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xl font-black text-gray-900">
                                                            {trip.price} <span className="text-xs font-bold text-gray-500">ETB</span>
                                                        </span>
                                                        <Button onClick={() => navigate(`/booking/seats/${trip.id}`)} size="sm" className="bg-gradient-to-r from-primary to-primary/80 font-bold">
                                                            Book Now
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center py-16 text-gray-400">
                                        <Bus className="w-12 h-12 mx-auto mb-4 opacity-30" />
                                        <p className="font-bold">No upcoming trips available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="shadow-lg border-2 border-gray-100">
                            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 text-white">
                                <h3 className="text-lg font-black flex items-center gap-2">
                                    <Info className="w-5 h-5" /> About {operator.name}
                                </h3>
                            </div>
                            <CardContent className="p-6">
                                <p className="text-gray-700 leading-relaxed mb-4 text-sm">{operator.about}</p>
                                {operator.established && (
                                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Years in Operation</p>
                                        <p className="text-2xl font-black text-primary">
                                            {new Date().getFullYear() - operator.established} Years
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {operator.safetyInfo && (
                            <Card className="shadow-lg border-2 border-success/20 bg-gradient-to-br from-success/5 to-white">
                                <div className="bg-gradient-to-r from-success to-success/80 p-4 text-white">
                                    <h3 className="text-lg font-black flex items-center gap-2">
                                        <Shield className="w-5 h-5" /> Safety & Quality
                                    </h3>
                                </div>
                                <CardContent className="p-6">
                                    <p className="text-gray-700 leading-relaxed text-sm">{operator.safetyInfo}</p>
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-lg border-2 border-gray-100">
                            <CardContent className="p-6">
                                <h3 className="text-lg font-black text-gray-900 mb-4">Contact Information</h3>
                                <div className="space-y-3 text-sm">
                                    {(operator.contact?.phone ?? operator.companyPhone) && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Phone</p>
                                            <p className="font-bold text-gray-900">{operator.contact?.phone ?? operator.companyPhone}</p>
                                        </div>
                                    )}
                                    {(operator.contact?.email ?? operator.companyEmail) && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p>
                                            <p className="font-bold text-gray-900">{operator.contact?.email ?? operator.companyEmail}</p>
                                        </div>
                                    )}
                                    {(operator.contact?.address ?? operator.address) && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Address</p>
                                            <p className="font-bold text-gray-900">{operator.contact?.address ?? operator.address}</p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Normalise a backend operator object to the shape the UI expects.
 * The static operators-data.js uses a nested `contact` object and `upcomingTrips`.
 * The backend returns flat fields (companyPhone, companyEmail, address) and may
 * embed trips differently.
 */
function normaliseOperator(op) {
    return {
        ...op,
        name: op.name ?? op.companyName,
        contact: op.contact ?? {
            phone:   op.companyPhone,
            email:   op.companyEmail,
            address: op.address,
        },
        // Backend may not embed upcomingTrips — fall back to empty array
        upcomingTrips: op.upcomingTrips ?? [],
    };
}
