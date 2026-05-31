import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Star, ArrowRight, BadgeCheck, Bus, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorCard({ operator }) {
    const navigate = useNavigate();

    const handleViewTrips = () => {
        navigate(`/operators/${operator.id}`);
    };

    const routes = operator.routesServed ?? [];
    const displayedRoutes = routes.slice(0, 2).map(r => String(r).replace('→', '-'));
    const remainingCount = Math.max(0, routes.length - 2);
    const ratingLabel = operator.rating != null ? Number(operator.rating).toFixed(1) : 'New';
    const priceLabel = operator.startingPrice != null ? operator.startingPrice : '—';
    const tripCount = operator.scheduledTripCount ?? operator.upcomingTrips?.length ?? 0;

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/20 rounded-[2rem]">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                    src={operator.logo}
                    alt={operator.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => { e.currentTarget.src = '/images/Enhanced_Bus_Images/Selam_Bus1.jpg'; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm text-gray-900">{ratingLabel}</span>
                </div>

                {operator.startingPrice != null && (
                    <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-2xl shadow-lg">
                        <p className="text-[10px] font-medium opacity-90 leading-none mb-1">From</p>
                        <p className="text-lg font-black leading-none">{priceLabel} <span className="text-xs font-bold">ETB</span></p>
                    </div>
                )}

                {operator.status === 'ACTIVE' && (
                    <div className="absolute top-4 left-4 bg-green-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        Active
                    </div>
                )}
            </div>

            <CardContent className="p-6 flex flex-col justify-between min-h-[250px]">
                <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors flex items-center gap-2">
                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0 stroke-[2]" />
                        {operator.name}
                    </h3>

                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold mb-4">
                        <span className="flex items-center gap-1">
                            <Bus size={12} /> {tripCount} trip{tripCount !== 1 ? 's' : ''}
                        </span>
                        {routes.length > 0 && (
                            <span className="flex items-center gap-1">
                                <MapPin size={12} /> {routes.length} route{routes.length !== 1 ? 's' : ''}
                            </span>
                        )}
                        {operator.reliabilityScore != null && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} /> {operator.reliabilityScore}% reliable
                            </span>
                        )}
                    </div>

                    {routes.length > 0 && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <MapPin className="w-4 h-4 text-gray-400 stroke-[2]" />
                                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Routes Served</span>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                {displayedRoutes.map((route, idx) => (
                                    <Badge
                                        key={idx}
                                        variant="outline"
                                        className="text-xs font-bold text-gray-700 border-gray-200 bg-gray-50/50 rounded-full px-3 py-1"
                                    >
                                        {route}
                                    </Badge>
                                ))}
                                {remainingCount > 0 && (
                                    <Badge
                                        variant="outline"
                                        className="text-xs font-bold text-gray-400 border-gray-100 bg-gray-50/20 rounded-full px-3 py-1"
                                    >
                                        +{remainingCount} more
                                    </Badge>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <Button
                    onClick={handleViewTrips}
                    variant="outline"
                    className="w-full h-11 rounded-2xl border border-blue-500 hover:border-blue-600 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-none"
                >
                    View Profile & Trips
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
                </Button>
            </CardContent>
        </Card>
    );
}
