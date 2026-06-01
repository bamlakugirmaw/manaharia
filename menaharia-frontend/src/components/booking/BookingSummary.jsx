import React from 'react';
import { MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';
import {
    buildSeatTypeMap,
    formatSeatTypeLabel,
    resolveSeatType,
    seatPriceForLabel,
    totalPriceForSelectedSeats,
} from '../../lib/seatPricing';

/**
 * BookingSummary
 *
 * Props:
 *   trip          — full trip object (from API or parent state)
 *   tripId        — optional display fallback when trip is loading
 *   selectedSeats — seat labels, or { label, seatType? } objects
 *   seatTypeMap   — optional label → seatType from tripSeats
 *   showEncryption — unused legacy prop, kept for API compatibility
 */
export default function BookingSummary({
    trip: tripProp,
    tripId,
    selectedSeats = [],
    seatTypeMap: seatTypeMapProp,
    showEncryption = false,
}) {
    const trip = tripProp;

    const operatorName = trip?.bus?.operator?.companyName
        ?? trip?.bus?.operator?.name
        ?? trip?.operator?.companyName
        ?? trip?.operator?.name
        ?? trip?.operatorName
        ?? 'Unknown Operator';

    const from = trip?.from ?? trip?.route?.origin ?? '';
    const to   = trip?.to   ?? trip?.route?.destination ?? '';

    if (!trip) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 text-sm text-slate-500">
                Loading trip summary…
            </div>
        );
    }

    const normalizedSeats = selectedSeats.map((s) =>
        typeof s === 'object'
            ? { label: s.label, seatType: s.seatType ?? null }
            : { label: s, seatType: null }
    );

    const seatTypeMap = seatTypeMapProp ?? buildSeatTypeMap(trip?.tripSeats ?? []);
    const basePrice = trip.price ?? 0;

    const seatLines = normalizedSeats.map((seat) => {
        const type = resolveSeatType(seat.label, seat.seatType ?? seatTypeMap[seat.label]);
        const price = seatPriceForLabel(basePrice, seat.label, type);
        return { ...seat, seatType: type, price };
    });

    const subtotal = totalPriceForSelectedSeats(basePrice, seatLines);
    const total = subtotal;

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8">
            <h3 className="text-2xl font-black text-indigo-950 mb-6 tracking-tight">Booking Summary</h3>

            <div className="mb-6 space-y-4">
                <h4 className="font-black text-lg text-slate-800">{operatorName}</h4>

                <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Route: {from} → {to}</span>
                </div>

                <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <Calendar className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Date: {trip.date
                        ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'
                    }</span>
                </div>

                <div className="flex items-start gap-3 text-sm font-semibold text-slate-600">
                    <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    <span>Departure: {trip.departureTime ?? '—'}</span>
                </div>

                <p className="text-xs text-slate-500 font-semibold">
                    Standard seats: ETB {basePrice.toLocaleString()} · VIP (A1–A4): +5%
                </p>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/10">
                        {seatLines.length}
                    </div>
                    <h5 className="font-black text-base text-indigo-950">Selected Seats</h5>
                </div>
                <div className="space-y-3">
                    {seatLines.map((seat) => (
                        <div key={seat.label} className="flex justify-between items-center border border-slate-100 bg-[#F8FAFC]/60 rounded-2xl p-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                                    seat.seatType === 'VIP'
                                        ? 'bg-amber-500 shadow-amber-500/20'
                                        : 'bg-blue-600 shadow-blue-600/10'
                                }`}>
                                    {seat.label}
                                </div>
                                <div>
                                    <span className="text-sm font-extrabold text-slate-700 block">
                                        Seat {seat.label}
                                    </span>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                                        seat.seatType === 'VIP' ? 'text-amber-600' : 'text-slate-400'
                                    }`}>
                                        {formatSeatTypeLabel(seat.seatType)}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ETB</span>
                                <span className="text-sm font-black text-slate-800 block">{seat.price.toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                        Subtotal ({seatLines.length} seat{seatLines.length !== 1 ? 's' : ''})
                    </span>
                    <span className="font-black text-slate-800">ETB {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Service Fee</span>
                    <span className="font-black text-emerald-600">Free</span>
                </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            <div className="flex justify-between items-center mb-6">
                <span className="font-black text-base text-indigo-950">Total Amount</span>
                <div className="flex items-baseline">
                    <span className="text-sm font-bold text-blue-600 mr-2">ETB</span>
                    <span className="text-3xl font-black text-blue-600">{total.toLocaleString()}</span>
                </div>
            </div>

            <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200/40">
                    <ShieldCheck className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                    <h4 className="font-extrabold text-sm text-indigo-950 mb-1">Cancellation Policy</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                        Free cancellation up to 24 hours before departure.
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-0.5">
                        50% refund within 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
