import React from 'react';
import { MapPin, Calendar, Clock, ShieldCheck } from 'lucide-react';

/**
 * BookingSummary
 *
 * Props:
 *   trip          — full trip object (from API or parent state)
 *   tripId        — optional display fallback when trip is loading
 *   selectedSeats — array of seat labels or { label } objects
 *   showEncryption — unused legacy prop, kept for API compatibility
 */
export default function BookingSummary({ trip: tripProp, tripId, selectedSeats = [], showEncryption = false }) {
    const trip = tripProp;

    const operatorName = trip?.bus?.operator?.companyName
        ?? trip?.bus?.operator?.name
        ?? trip?.operator?.companyName
        ?? trip?.operator?.name
        ?? trip?.operatorName
        ?? 'Unknown Operator';

    // Route fields: backend uses route.origin/destination; mock uses from/to directly.
    const from = trip?.from ?? trip?.route?.origin ?? '';
    const to   = trip?.to   ?? trip?.route?.destination ?? '';

    if (!trip) {
        return (
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 text-sm text-slate-500">
                Loading trip summary…
            </div>
        );
    }

    const seatsToDisplay = selectedSeats.length > 0
        ? selectedSeats.map((s) => (typeof s === 'object' ? s.label : s))
        : [];
    const pricePerSeat   = trip.price ?? 0;
    const subtotal       = pricePerSeat * seatsToDisplay.length;
    const total          = subtotal; // service fee is free

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8">
            <h3 className="text-2xl font-black text-indigo-950 mb-6 tracking-tight">Booking Summary</h3>

            {/* Operator Info */}
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
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Selected Seats */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-7 h-7 bg-blue-600 text-white rounded-lg flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/10">
                        {seatsToDisplay.length}
                    </div>
                    <h5 className="font-black text-base text-indigo-950">Selected Seats</h5>
                </div>
                <div className="space-y-3">
                    {seatsToDisplay.map((seat, index) => (
                        <div key={index} className="flex justify-between items-center border border-slate-100 bg-[#F8FAFC]/60 rounded-2xl p-4">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-md shadow-blue-600/10">
                                    {typeof seat === 'object' ? seat.label : seat}
                                </div>
                                <span className="text-sm font-extrabold text-slate-700 ml-3">
                                    Seat {typeof seat === 'object' ? seat.label : seat}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ETB</span>
                                <span className="text-sm font-black text-slate-800 block">{pricePerSeat}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Price Breakdown */}
            <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">
                        Subtotal ({seatsToDisplay.length} seat{seatsToDisplay.length > 1 ? 's' : ''})
                    </span>
                    <span className="font-black text-slate-800">ETB {subtotal}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Service Fee</span>
                    <span className="font-black text-emerald-600">Free</span>
                </div>
            </div>

            <div className="border-t border-slate-100 my-6" />

            {/* Total */}
            <div className="flex justify-between items-center mb-6">
                <span className="font-black text-base text-indigo-950">Total Amount</span>
                <div className="flex items-baseline">
                    <span className="text-sm font-bold text-blue-600 mr-2">ETB</span>
                    <span className="text-3xl font-black text-blue-600">{total}</span>
                </div>
            </div>

            {/* Cancellation Policy */}
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
