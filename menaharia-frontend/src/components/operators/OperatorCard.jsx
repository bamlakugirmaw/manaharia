import React from 'react';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MapPin, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OperatorCard({ operator }) {
    const navigate = useNavigate();

    const handleViewTrips = () => {
        navigate(`/operators/${operator.id}`);
    };

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-primary/20">
            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                <img
                    src={operator.logo}
                    alt={operator.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span className="font-bold text-sm text-gray-900">{operator.rating}</span>
                </div>

                {/* Starting Price Badge */}
                <div className="absolute bottom-4 left-4 bg-primary text-white px-4 py-2 rounded-xl shadow-lg">
                    <p className="text-xs font-medium opacity-90">From</p>
                    <p className="text-xl font-black">{operator.startingPrice} <span className="text-xs font-bold">ETB</span></p>
                </div>
            </div>

            <CardContent className="p-6">
                {/* Company Name */}
                <h3 className="text-2xl font-black text-gray-900 mb-3 group-hover:text-primary transition-colors">
                    {operator.name}
                </h3>

                {/* Routes Served */}
                <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Routes Served</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {operator.routesServed.slice(0, 3).map((route, idx) => (
                            <Badge
                                key={idx}
                                variant="outline"
                                className="text-xs font-medium text-gray-700 border-gray-200 bg-gray-50"
                            >
                                {route}
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Reliability Score */}
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-bold text-gray-500">Reliability</span>
                            <span className="text-sm font-black text-success">{operator.reliabilityScore}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                            <div
                                className="bg-gradient-to-r from-success to-primary h-full rounded-full transition-all duration-500"
                                style={{ width: `${operator.reliabilityScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* View Trips Button */}
                <Button
                    onClick={handleViewTrips}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 font-bold text-base shadow-lg shadow-primary/20 group-hover:shadow-xl group-hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
                >
                    View Trips
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
            </CardContent>
        </Card>
    );
}
