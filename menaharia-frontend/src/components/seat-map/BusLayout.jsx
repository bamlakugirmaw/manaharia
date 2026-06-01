import { useMemo } from 'react';
import { cn } from '../../lib/utils';
import {
    DEFAULT_BUS_LAYOUT,
    DEFAULT_GRID_LABELS,
    getSeatLabel,
} from '../../lib/seatLayout';
import { resolveSeatType, seatPriceForLabel } from '../../lib/seatPricing';
import { isTripSeatAvailable, isTripSeatOccupied } from '../../lib/tripSeats';

/**
 * Interactive bus seat map.
 *
 * When `tripSeats` is provided (from GET /v1/trips/:id), only seats in that
 * inventory are selectable; others on the grid are hidden or disabled.
 */
export default function BusLayout({
    selectedSeats,
    onToggleSeat,
    bookedSeats = [],
    tripSeats = null,
    disabled = false,
    basePrice = null,
}) {
    const seatByLabel = useMemo(() => {
        if (!tripSeats?.length) return null;
        const map = {};
        tripSeats.forEach((s) => {
            if (s.seatNumber) map[s.seatNumber] = s;
        });
        return map;
    }, [tripSeats]);

    const overflowSeats = useMemo(() => {
        if (!tripSeats?.length) return [];
        return tripSeats.filter((s) => s.seatNumber && !DEFAULT_GRID_LABELS.has(s.seatNumber));
    }, [tripSeats]);

    const renderSeat = (rowIndex, colIndex, isAisle) => {
        if (isAisle) return <div key={`aisle-${rowIndex}-${colIndex}`} className="w-10" />;

        const seatLabel = getSeatLabel(rowIndex, colIndex);
        const tripSeat = seatByLabel?.[seatLabel];

        if (seatByLabel && !tripSeat) {
            return <div key={`empty-${seatLabel}`} className="w-10 h-10" aria-hidden />;
        }

        const isBooked = tripSeat
            ? isTripSeatOccupied(tripSeat)
            : bookedSeats.includes(seatLabel);
        const isSelected = selectedSeats.includes(seatLabel);
        const canClick = !disabled && !isBooked && (!tripSeat || isTripSeatAvailable(tripSeat));
        const seatType = resolveSeatType(seatLabel, tripSeat?.seatType);
        const isVip = seatType === 'VIP';
        const seatPrice = basePrice != null ? seatPriceForLabel(basePrice, seatLabel, seatType) : null;

        return (
            <button
                key={seatLabel}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onToggleSeat(seatLabel)}
                className={cn(
                    'w-10 h-10 rounded-t-lg rounded-b-md border flex items-center justify-center text-xs font-bold transition-all relative',
                    isBooked
                        ? 'bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed'
                        : isSelected
                          ? isVip
                              ? 'bg-amber-500 border-amber-600 text-white scale-105 shadow-md shadow-amber-200/60'
                              : 'bg-secondary border-secondary text-white scale-105 shadow-md'
                          : canClick
                            ? isVip
                                ? 'bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500 hover:bg-amber-100'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-secondary hover:text-secondary'
                            : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                )}
                title={
                    isBooked
                        ? tripSeat?.status
                            ? `Unavailable (${tripSeat.status})`
                            : 'Unavailable'
                        : seatPrice != null
                          ? `Seat ${seatLabel} · ${isVip ? 'VIP' : 'Standard'} · ETB ${seatPrice.toLocaleString()}`
                          : `Seat ${seatLabel} · ${isVip ? 'VIP' : 'Standard'}`
                }
            >
                {seatLabel}
                {isVip && !isBooked && (
                    <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                )}
                <div
                    className={cn(
                        'absolute -bottom-1 w-[80%] h-1 rounded-sm',
                        isBooked ? 'bg-gray-400' : isSelected ? 'bg-pink-700' : 'bg-gray-400'
                    )}
                />
            </button>
        );
    };

    const renderOverflowSeat = (tripSeat) => {
        const label = tripSeat.seatNumber;
        const isBooked = isTripSeatOccupied(tripSeat);
        const isSelected = selectedSeats.includes(label);
        const canClick = !disabled && !isBooked && isTripSeatAvailable(tripSeat);
        const seatType = resolveSeatType(label, tripSeat?.seatType);
        const isVip = seatType === 'VIP';

        return (
            <button
                key={label}
                type="button"
                disabled={!canClick}
                onClick={() => canClick && onToggleSeat(label)}
                className={cn(
                    'w-10 h-10 rounded-lg border text-xs font-bold',
                    isBooked
                        ? 'bg-gray-300 border-gray-400 text-gray-500'
                        : isSelected
                          ? isVip
                              ? 'bg-amber-500 border-amber-600 text-white'
                              : 'bg-secondary border-secondary text-white'
                          : isVip
                            ? 'bg-amber-50 border-amber-300 text-amber-800 hover:border-amber-500'
                            : 'bg-white border-gray-300 hover:border-secondary'
                )}
            >
                {label}
            </button>
        );
    };

    return (
        <div className="flex flex-col items-center">
            <div className="w-full max-w-[240px] h-14 border-x-4 border-t-4 border-gray-100 rounded-t-[50px] mb-10 relative bg-gray-50/30 flex items-center justify-center">
                <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.25em] mb-2">
                    Driver Cabin
                </span>
            </div>

            <div className="grid gap-y-4 gap-x-5 p-10 border-l-4 border-r-4 border-gray-100 bg-gray-50/20 rounded-[3rem] shadow-inner shadow-gray-100">
                {DEFAULT_BUS_LAYOUT.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex gap-4">
                        {row.map((type, colIndex) => renderSeat(rowIndex, colIndex, type === 0))}
                    </div>
                ))}
            </div>

            {overflowSeats.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-2 justify-center max-w-md">
                    <p className="w-full text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Additional seats
                    </p>
                    {overflowSeats.map(renderOverflowSeat)}
                </div>
            )}

            <div className="flex gap-8 mt-12 text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 flex-wrap justify-center">
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md border-2 border-gray-100 bg-white shadow-sm" />
                    <span>Standard</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md border-2 border-amber-300 bg-amber-50 shadow-sm relative">
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                    </div>
                    <span>VIP (+5%)</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-secondary shadow-md shadow-secondary/20" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-md bg-gray-200 border-2 border-gray-100" />
                    <span>Unavailable</span>
                </div>
            </div>
        </div>
    );
}
