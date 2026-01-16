import React from 'react';
import { MapPin, Calendar, Clock, AlertCircle } from 'lucide-react';
import { TRIPS, OPERATORS } from '../../data/mock-db';

export default function BookingSummary({ tripId, selectedSeats = [], showEncryption = false }) {
    // Use first trip as fallback for development/testing
    const trip = TRIPS.find(t => t.id === tripId) || TRIPS[0];
    const operator = OPERATORS.find(op => op.id === trip?.operatorId);

    // If no trip data at all, return null
    if (!trip) {
        console.error('BookingSummary: No trip data available');
        return null;
    }

    // Use mock seats if none selected (for development)
    const seatsToDisplay = selectedSeats.length > 0 ? selectedSeats : ['3-A', '3-B'];

    const pricePerSeat = trip.price;
    const subtotal = pricePerSeat * seatsToDisplay.length;
    const serviceFee = 0; // Free
    const processingFee = 0; // Free
    const total = subtotal + serviceFee + processingFee;

    return (
        <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Booking Summary</h3>

            {/* Operator Info */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-base text-gray-900">{operator?.name || 'Selam Bus'}</h4>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">VIP</span>
                </div>

                {/* Route */}
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Route: {trip.from} → {trip.to}</span>
                </div>

                {/* Date */}
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Date: {new Date(trip.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                    })}</span>
                </div>

                {/* Departure Time */}
                <div className="flex items-start gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span>Departure: {trip.departureTime}</span>
                </div>
            </div>

            {/* Selected Seats */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-5 h-5 bg-[#0EA5E9] rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">{seatsToDisplay.length}</span>
                    </div>
                    <h5 className="font-bold text-base text-gray-900">Selected Seats</h5>
                </div>
                <div className="space-y-2">
                    {seatsToDisplay.map((seat, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-[#0EA5E9] text-white rounded-lg flex items-center justify-center font-bold text-xs">
                                    {seat}
                                </div>
                                <span className="text-sm font-medium text-gray-700">Seat {seat}</span>
                            </div>
                            <span className="font-bold text-sm text-gray-900">ETB<br />{pricePerSeat}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="border-t border-gray-200 pt-4 mb-4">
                <div className="space-y-2 mb-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal ({seatsToDisplay.length} {seatsToDisplay.length === 1 ? 'seat' : 'seats'})</span>
                        <span className="font-semibold text-gray-900">ETB {subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Service Fee</span>
                        <span className="font-semibold text-[#0EA5E9]">Free</span>
                    </div>
                </div>

                {/* Total */}
                <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-base text-gray-900">Total Amount</span>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{total}</div>
                            <div className="text-xs text-gray-500">ETB</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Cancellation Policy */}
            <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-gray-600">
                        <p className="font-semibold mb-1">Cancellation Policy</p>
                        <p>Free cancellation up to 24 hours before departure. 50% refund within 24 hours.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
