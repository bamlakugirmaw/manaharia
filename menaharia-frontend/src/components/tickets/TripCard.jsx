import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Clock, Bus, Star, Heart, Scale } from 'lucide-react';

/**
 * TripCard — works with both backend API shape and legacy mock shape.
 *
 * Backend shape (from GET /v1/trips):
 *   trip.route.origin / trip.route.destination
 *   trip.bus.operator.companyName / trip.bus.operator.rating
 *   trip.availableSeatCount
 *   trip.departureTime / trip.arrivalTime  — full ISO strings
 *   trip.bus.totalSeats
 */
export default function TripCard({ trip, onSelect }) {
    // ── Operator ──────────────────────────────────────────────────────────────
    // Backend: trip.bus.operator  |  Legacy: trip.operator
    const operator = trip.bus?.operator ?? trip.operator ?? null;
    const operatorName = operator?.companyName ?? operator?.name ?? 'Unknown';
    const operatorRating = operator?.rating ?? null;

    // ── Route ─────────────────────────────────────────────────────────────────
    const from = trip.route?.origin      ?? trip.from ?? '';
    const to   = trip.route?.destination ?? trip.to   ?? '';

    // ── Seats ─────────────────────────────────────────────────────────────────
    // Backend returns availableSeatCount directly on the trip object
    const seatsAvailable = trip.availableSeatCount ?? trip.seatsAvailable ?? trip.availableSeats ?? 0;

    // ── Times ─────────────────────────────────────────────────────────────────
    // Backend returns full ISO strings; strip to HH:MM for display
    const fmtTime = (s) => {
        if (!s) return '—';
        const part = s.includes('T') ? s.split('T')[1] : s;
        const [h, m] = part.split(':');
        return `${h}:${m}`;
    };
    const departureTime = fmtTime(trip.departureTime);
    const arrivalTime   = fmtTime(trip.arrivalTime);

    // ── Bus type label ────────────────────────────────────────────────────────
    const busType = trip.busType ?? trip.bus?.make ?? 'Standard';

    return (
        <Card className="overflow-hidden bg-white border border-gray-100/90 shadow-[0_8px_30px_rgba(0,0,0,0.015)] rounded-[2rem] hover:shadow-md hover:border-gray-200/50 transition-all duration-300 group">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">

                    {/* Operator Section */}
                    <div className="flex items-center gap-4 min-w-[200px] w-full md:w-auto">
                        <div className="w-14 h-14 bg-blue-50/60 rounded-2xl flex items-center justify-center text-blue-500 shrink-0 shadow-sm border border-blue-50">
                            <Bus size={22} className="stroke-[1.5]" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-extrabold text-dark text-[17px] tracking-tight leading-tight mb-1">
                                {operatorName}
                            </span>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5 text-yellow-500">
                                    <Star size={12} fill="currentColor" className="text-yellow-400" />
                                    <span className="text-[11px] font-bold text-gray-600">
                                        {operatorRating != null ? operatorRating : '—'}
                                    </span>
                                </div>
                                <span className="px-2.5 py-0.5 rounded-full bg-gray-50 border border-gray-100/70 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                    {busType}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Section */}
                    <div className="flex-1 flex items-center justify-between gap-4 md:gap-8 px-2 md:px-6 w-full md:w-auto">
                        <div className="text-left md:text-center min-w-[90px]">
                            <div className="text-2xl font-black text-dark tracking-tight leading-none">{departureTime}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1.5">{from}</div>
                        </div>

                        <div className="flex-1 flex flex-col items-center max-w-[140px] px-1">
                            <span className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest mb-1.5">
                                {trip.duration ?? '—'}
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

                    {/* Pricing, Seats & Actions */}
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
                                {seatsAvailable} SEATS LEFT
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
                                <button className="hover:text-red-500 hover:scale-105 transition-all text-gray-400" title="Favorite">
                                    <Heart size={14} className="stroke-[1.8]" />
                                </button>
                                <button className="hover:text-blue-500 hover:scale-105 transition-all text-gray-400" title="Compare">
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
