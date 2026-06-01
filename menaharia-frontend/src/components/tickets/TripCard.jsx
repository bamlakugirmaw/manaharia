import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Clock, Bus, Star, Heart, Scale } from 'lucide-react';
import { tripCityLabel } from '../../lib/tripHelpers';

/**
 * Trip search result card — expects trips from useAllTrips / prepareTripsList
 * (GET /v1/trips with route, bus, operator embedded).
 */
export default function TripCard({ trip, onSelect }) {
    const operatorName = trip.operatorName ?? trip.bus?.operator?.companyName ?? 'Unknown';
    const operatorRating = trip.operatorRating ?? trip.bus?.operator?.rating ?? null;
    const from = tripCityLabel(trip.from ?? trip.route?.origin ?? '');
    const to = tripCityLabel(trip.to ?? trip.route?.destination ?? '');
    const departureTime = trip.departureDisplay ?? '—';
    const arrivalTime = trip.arrivalDisplay ?? '—';
    const duration = trip.duration ?? '—';
    const seatsAvailable = trip.seatsAvailable ?? 0;
    const busLabel = trip.busMake ?? trip.bus?.make ?? 'Standard';
    const plate = trip.busPlate ?? trip.bus?.plateNumber ?? '';

    return (
        <Card className="overflow-hidden bg-white border border-gray-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.015)] rounded-[2rem] hover:shadow-md hover:border-gray-200/50 transition-all duration-300 group">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">

                    <div className="flex items-center gap-4 min-w-[200px] w-full md:w-auto">
                        <div className="w-14 h-14 bg-blue-50/60 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-50">
                            <Bus size={22} className="stroke-[1.5]" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-dark text-[17px] tracking-tight leading-tight mb-1 truncate">
                                {operatorName}
                            </span>
                            <div className="flex items-center gap-2 flex-wrap">
                                <div className="flex items-center gap-0.5 text-yellow-500">
                                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                                    <span className="text-[11px] font-bold text-gray-600">
                                        {operatorRating != null ? Number(operatorRating).toFixed(1) : 'New'}
                                    </span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-50 border border-gray-100/70 text-[9px] font-bold text-gray-500 uppercase tracking-widest truncate max-w-[140px]">
                                    {busLabel}
                                    {plate ? ` · ${plate}` : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-between gap-4 md:gap-8 px-2 md:px-6 w-full md:w-auto">
                        <div className="text-left md:text-center min-w-[90px]">
                            <div className="text-2xl font-black text-dark tracking-tight leading-none">{departureTime}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{from}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center max-w-[140px] px-1">
                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">
                                {duration}
                            </span>
                            <div className="w-full h-px bg-gray-200 relative flex items-center justify-center">
                                <div className="absolute left-0 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300" />
                                <div className="absolute right-0 -translate-y-1/2 w-1 h-1 rounded-full bg-gray-300" />
                                <div className="bg-white px-2.5 z-10">
                                    <Clock size={14} className="text-gray-400 stroke-[1.8]" />
                                </div>
                            </div>
                        </div>

                        <div className="text-right md:text-center min-w-[90px]">
                            <div className="text-2xl font-black text-dark tracking-tight leading-none">{arrivalTime}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{to}</div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 md:gap-8 w-full md:w-auto justify-between md:justify-end pl-0 md:pl-8 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0">
                        <div className="text-left md:text-right min-w-[110px] flex flex-col items-start md:items-end">
                            <div className="text-[9px] text-gray-400 font-extrabold uppercase tracking-[0.18em] mb-1">FROM (STANDARD)</div>
                            <div className="text-2xl font-extrabold text-blue-600 tracking-tight flex items-baseline leading-none">
                                <span className="text-[10px] font-black text-blue-400/80 mr-1 uppercase">ETB</span>
                                {(trip.price ?? 0).toLocaleString()}
                            </div>
                            <div className="text-[9px] font-bold mt-1 text-amber-600 uppercase tracking-wider">
                                VIP A1–A4 +5%
                            </div>
                            <div className="text-[9px] font-extrabold mt-2 uppercase tracking-wider text-emerald-500">
                                {seatsAvailable} SEAT{seatsAvailable === 1 ? '' : 'S'} LEFT
                            </div>
                        </div>

                        <div className="flex flex-col items-center shrink-0">
                            <Button
                                onClick={() => onSelect(trip.id)}
                                className="h-11 px-7 rounded-2xl bg-primary hover:bg-primary/90 text-white font-extrabold text-xs shadow-md shadow-primary/10 transition-all hover:scale-[1.01] active:scale-95 border-none"
                            >
                                Select Seat
                            </Button>
                            <div className="flex justify-center gap-4 text-gray-300 mt-2.5">
                                <button type="button" className="hover:text-red-500 hover:scale-105 transition-all text-gray-400" title="Favorite">
                                    <Heart size={14} className="stroke-[1.8]" />
                                </button>
                                <button type="button" className="hover:text-blue-500 hover:scale-105 transition-all text-gray-400" title="Compare">
                                    <Scale size={14} className="stroke-[1.8]" />
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </Card>
    );
}
