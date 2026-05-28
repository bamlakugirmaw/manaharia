import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Star, ArrowRight, BadgeCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorCard({ operator }) {
    const navigate = useNavigate();

    const handleViewTrips = () => {
        navigate(`/operators/${operator.id}`);
    };

    // Replace arrows with dash and display at most 2 routes
    const displayedRoutes = operator.routesServed.slice(0, 2).map(r => r.replace('→', '-'));
    const remainingCount = operator.routesServed.length - 2;

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/20 rounded-[2rem]">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                    src={operator.logo}
                    alt={operator.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold text-sm text-gray-900">{operator.rating}</span>
                </div>

                {/* Starting Price Badge */}
                <div className="absolute bottom-4 left-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-2xl shadow-lg">
                    <p className="text-[10px] font-medium opacity-90 leading-none mb-1">From</p>
                    <p className="text-lg font-black leading-none">{operator.startingPrice} <span className="text-xs font-bold">ETB</span></p>
                </div>
            </div>

            <CardContent className="p-6 flex flex-col justify-between min-h-[250px]">
                <div>
                    {/* Company Name with Verified Badge */}
                    <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                        <BadgeCheck className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0 stroke-[2]" />
                        {operator.name}
                    </h3>

                    {/* Routes Served */}
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
                </div>

                <div>
                    {/* Reliability Score - Text only, no visual progress bar */}
                    <div className="mb-5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">Reliability</span>
                            <span className="text-sm font-black text-emerald-500">{operator.reliabilityScore}%</span>
                        </div>
                    </div>

                    {/* View Trips Button - Styled as a clean outline button */}
                    <Button
                        onClick={handleViewTrips}
                        variant="outline"
                        className="w-full h-11 rounded-2xl border border-blue-500 hover:border-blue-600 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-none"
                    >
                        View Trips
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1 stroke-[2.5]" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
