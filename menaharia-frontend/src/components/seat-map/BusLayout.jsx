import { useState } from 'react';
import { cn } from '../../lib/utils';
import { MousePointer2 } from 'lucide-react';

// Mock seat configuration for a standard 45-seater bus
// 0 = aisle, 1 = seat
const BUS_LAYOUT = [
    [1, 1, 0, 1, 1], // Row 1
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 0, 1, 1],
    [1, 1, 1, 1, 1], // Last row often 5 seats
];

const SEAT_PRICE = 1700;

export default function BusLayout({ selectedSeats, onToggleSeat, bookedSeats = [] }) {

    const getSeatLabel = (rowIndex, colIndex) => {
        const rowChar = String.fromCharCode(65 + rowIndex); // A, B, C...
        const colNum = colIndex > 2 ? colIndex : colIndex + 1; // Adjust for aisle
        return `${rowChar}${colNum}`;
    };

    const renderSeat = (rowIndex, colIndex, isAisle) => {
        if (isAisle) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10" />;

        const seatLabel = getSeatLabel(rowIndex, colIndex);
        const isBooked = bookedSeats.includes(seatLabel);
        const isSelected = selectedSeats.includes(seatLabel);

        return (
            <button
                key={seatLabel}
                disabled={isBooked}
                onClick={() => onToggleSeat(seatLabel)}
                className={cn(
                    "w-10 h-10 rounded-t-lg rounded-b-md border flex items-center justify-center text-xs font-bold transition-all relative group",
                    isBooked
                        ? "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
                        : isSelected
                            ? "bg-secondary border-secondary text-white transform scale-105 shadow-md"
                            : "bg-white border-gray-300 text-gray-700 hover:border-secondary hover:text-secondary"
                )}
                title={isBooked ? "Booked" : `Seat ${seatLabel}`}
            >
                {seatLabel}
                {/* Seat styling details */}
                <div className={cn(
                    "absolute -bottom-1 w-[80%] h-1 rounded-sm",
                    isBooked ? "bg-gray-400" : isSelected ? "bg-pink-700" : "bg-gray-400"
                )}></div>
            </button>
        );
    };

    return (
        <div className="flex flex-col items-center">
            {/* Front of Bus Indicator */}
            <div className="w-full max-w-[240px] h-14 border-x-4 border-t-4 border-gray-100 rounded-t-[50px] mb-10 relative bg-gray-50/30 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.25em] mb-2">Driver Cabin</span>
                <div className="absolute top-4 right-6 w-10 h-10 rounded-full border-2 border-gray-100 flex items-center justify-center bg-white shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-gray-100"></div>
                </div>
            </div>

            {/* Seats Grid */}
            <div className="grid gap-y-4 gap-x-5 p-10 border-l-4 border-r-4 border-gray-100 bg-gray-50/20 rounded-[3rem] shadow-inner shadow-gray-100">
                {BUS_LAYOUT.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4">
                        {row.map((type, colIndex) => renderSeat(rowIndex, colIndex, type === 0))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex gap-8 mt-12 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md border-2 border-gray-100 bg-white shadow-sm"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-secondary shadow-md shadow-secondary/20"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-gray-200 border-2 border-gray-100"></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    );
}
