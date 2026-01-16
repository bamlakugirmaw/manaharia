import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Wifi, Sun, Clock, Bus, MapPin, Star } from 'lucide-react';
import { OPERATORS } from '../../data/mock-db';

export default function TripCard({ trip, onSelect }) {
    const operator = OPERATORS.find(op => op.id === trip.operatorId);

    return (
        <Card className="overflow-hidden bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl hover:shadow-md transition-shadow group">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center gap-8">

                    {/* Operator Section */}
                    <div className="flex items-center gap-4 min-w-[200px]">
                        <div className="w-12 h-12 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center text-primary shadow-sm group-hover:bg-white transition-colors">
                            <Bus size={20} />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-gray-900 text-[17px] tracking-tight leading-tight">{operator?.name || "Unknown"}</span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="flex items-center gap-0.5 text-yellow-500">
                                    <Star size={12} fill="currentColor" />
                                    <span className="text-[11px] font-bold">{operator?.rating}</span>
                                </div>
                                <span className="text-gray-300">|</span>
                                <span className="text-[11px] text-gray-400 font-semibold">{trip.busType}</span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="flex-1 flex items-center justify-between gap-6 px-4">
                        <div className="text-center">
                            <div className="text-xl font-extrabold text-gray-900 tracking-tight">{trip.departureTime}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">{trip.from}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center max-w-[120px]">
                            <span className="text-[10px] text-gray-300 font-bold uppercase tracking-tighter mb-1">8h 30m</span>
                            <div className="w-full h-px bg-gray-100 relative">
                                <div className="absolute top-1/2 left-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-200" />
                                <div className="absolute top-1/2 right-0 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-gray-200" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                    <Clock size={14} className="text-gray-300" />
                                </div>
                            </div>
                        </div>

                        <div className="text-center">
                            <div className="text-xl font-extrabold text-gray-900 tracking-tight">{trip.arrivalTime}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mt-1">{trip.to}</div>
                        </div>
                    </div>

                    {/* Info & Action Section */}
                    <div className="flex items-center gap-8 pl-8 border-l border-gray-50">
                        <div className="text-right">
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none mb-1.5">Total Price</div>
                            <div className="text-2xl font-extrabold text-primary tracking-tighter">
                                <span className="text-[10px] font-bold mr-1 italic opacity-40">ETB</span>
                                {trip.price.toLocaleString()}
                            </div>
                            <div className="text-[9px] text-emerald-500 font-bold mt-1.5 uppercase tracking-widest">
                                {trip.seatsAvailable} Seats Left
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={() => onSelect(trip.id)}
                                className="h-12 px-8 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/10 transition-all transform hover:scale-[1.05] active:scale-95"
                            >
                                Select Seat
                            </Button>
                            <div className="flex justify-center gap-3 text-gray-300">
                                <Wifi size={14} title="WiFi Available" />
                                <Sun size={14} title="A/C Available" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Card>
    );
}
