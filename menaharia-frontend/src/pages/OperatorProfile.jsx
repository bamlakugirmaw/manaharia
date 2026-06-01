import { useParams, useNavigate } from 'react-router-dom';
import OperatorHeader from '../components/operators/OperatorHeader';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import {
    ArrowLeft, Clock, Bus, Users, MapPin, Info, Shield, Route, Star, TrendingUp, Calendar,
} from 'lucide-react';
import { usePublicOperator } from '../hooks/useOperators';
import OperatorReviewsSection from '../components/ratings/OperatorReviewsSection';

export default function OperatorProfile() {
    const { operatorId } = useParams();
    const navigate = useNavigate();
    const { data: operator, isLoading } = usePublicOperator(operatorId);

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
                    <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                        This operator has no scheduled trips on the platform right now.
                    </p>
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

                {/* Stats strip */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <StatCard icon={Star} label="Rating" value={operator.rating != null ? operator.rating.toFixed(1) : 'New'} />
                    <StatCard icon={TrendingUp} label="Reliability" value={operator.reliabilityScore != null ? `${operator.reliabilityScore}%` : '—'} />
                    <StatCard icon={Route} label="Routes" value={operator.routeDetails?.length ?? operator.routesServed?.length ?? 0} />
                    <StatCard icon={Calendar} label="Scheduled Trips" value={operator.scheduledTripCount ?? operator.upcomingTrips?.length ?? 0} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Routes */}
                        {(operator.routeDetails?.length > 0 || operator.routesServed?.length > 0) && (
                            <Card className="shadow-xl border-2 border-gray-100">
                                <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 text-white">
                                    <h2 className="text-2xl font-black flex items-center gap-3">
                                        <Route className="w-6 h-6" /> Routes Served
                                    </h2>
                                    <p className="text-white/70 text-sm mt-2">Destinations this operator currently schedules</p>
                                </div>
                                <CardContent className="p-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {(operator.routeDetails ?? operator.routesServed.map(label => ({ label }))).map((route, idx) => (
                                            <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                <MapPin className="w-4 h-4 text-primary shrink-0" />
                                                <div>
                                                    <p className="font-bold text-gray-900 text-sm">{route.label ?? route}</p>
                                                    {route.distance != null && (
                                                        <p className="text-xs text-gray-500 mt-0.5">{route.distance} km · {route.code ?? 'Route'}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Trips */}
                        <Card className="shadow-xl border-2 border-gray-100">
                            <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <Bus className="w-6 h-6" /> Available Trips
                                </h2>
                                <p className="text-white/80 text-sm mt-2 font-medium">Live scheduled trips from GET /trips</p>
                            </div>

                            <CardContent className="p-0">
                                {operator.upcomingTrips?.length > 0 ? (
                                    <>
                                        <div className="hidden md:block overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                                    <tr>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Route</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Date</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Departure</th>
                                                        <th className="text-left py-4 px-6 text-xs font-black text-gray-600 uppercase tracking-wider">Seats</th>
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
                                                            <td className="py-4 px-6 text-sm font-semibold text-gray-600">{trip.dateLabel}</td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                                    <span className="font-bold text-gray-700 text-sm">{trip.departure}</span>
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <Users className="w-4 h-4 text-gray-400" />
                                                                    <span className={`text-sm ${getSeatsColor(trip.seatsLeft)}`}>
                                                                        {trip.seatsLeft} left
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

                                        <div className="md:hidden divide-y divide-gray-200">
                                            {operator.upcomingTrips.map(trip => (
                                                <div key={trip.id} className="p-4 hover:bg-blue-50/50 transition-colors">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                                                            <span className="font-bold text-gray-900 text-sm">{trip.route}</span>
                                                        </div>
                                                        <Badge variant="outline" className="text-[10px]">{trip.dateLabel}</Badge>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                                        <div className="flex items-center gap-2">
                                                            <Clock className="w-4 h-4 text-gray-400" />
                                                            <span className="font-bold text-gray-700">{trip.departure}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Users className="w-4 h-4 text-gray-400" />
                                                            <span className={getSeatsColor(trip.seatsLeft)}>
                                                                {trip.seatsLeft} seats
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

                        <OperatorReviewsSection
                            operatorId={operator.id}
                            operatorRating={operator.rating}
                        />
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
                                        <p className="text-xs text-gray-500 mt-1">Est. {operator.established}</p>
                                    </div>
                                )}
                                {operator.startingPrice != null && (
                                    <div className="mt-4 bg-green-50 rounded-xl p-4 border border-green-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Starting from</p>
                                        <p className="text-2xl font-black text-green-700">{operator.startingPrice} <span className="text-sm">ETB</span></p>
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
                                    {operator.contact?.phone && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Phone</p>
                                            <p className="font-bold text-gray-900">{operator.contact.phone}</p>
                                        </div>
                                    )}
                                    {operator.contact?.email && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Email</p>
                                            <p className="font-bold text-gray-900 break-all">{operator.contact.email}</p>
                                        </div>
                                    )}
                                    {operator.contact?.address && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Address</p>
                                            <p className="font-bold text-gray-900">{operator.contact.address}</p>
                                        </div>
                                    )}
                                    {operator.responsibleName && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase mb-1">Contact Person</p>
                                            <p className="font-bold text-gray-900">{operator.responsibleName}</p>
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

function StatCard({ icon: Icon, label, value }) {
    return (
        <Card className="p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Icon size={18} />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-xl font-black text-gray-900">{value}</p>
                </div>
            </div>
        </Card>
    );
}
