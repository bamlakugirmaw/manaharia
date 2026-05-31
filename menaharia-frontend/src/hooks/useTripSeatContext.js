import { useMemo } from 'react';
import { useTrip } from './useTrips';
import { useSeats } from './useSeats';
import { normaliseTripSeats, overflowTripSeats } from '../lib/seatLayout';
import {
    normaliseBusSeats,
    buildTripSeatIdMap,
    seatsUnavailableMessage,
    isTripSeatAvailable,
    occupiedSeatLabels,
} from '../lib/tripSeats';

/**
 * Trip seat inventory for booking UIs.
 * Source of truth: GET /v1/trips/:id → tripSeats[] (materialized on POST /v1/trips).
 */
export function useTripSeatContext(tripId) {
    const {
        data: trip,
        isLoading: tripLoading,
        isError: tripError,
        refetch: refetchTrip,
        isFetching: tripFetching,
    } = useTrip(tripId, { refetchOnMount: 'always', staleTime: 0 });

    const busId = trip?.busId ?? trip?.bus?.id ?? null;
    const { data: busSeatsRaw = [], isLoading: busSeatsLoading } = useSeats(busId, { limit: 100 });

    const tripSeats = useMemo(() => normaliseTripSeats(trip), [trip]);
    const busSeats = useMemo(() => normaliseBusSeats(busSeatsRaw), [busSeatsRaw]);
    const seatIdMap = useMemo(() => buildTripSeatIdMap(tripSeats), [tripSeats]);
    const bookableSeats = useMemo(() => tripSeats.filter(isTripSeatAvailable), [tripSeats]);
    const overflowSeats = useMemo(() => overflowTripSeats(tripSeats), [tripSeats]);

    const bookedSeats = useMemo(() => occupiedSeatLabels(tripSeats), [tripSeats]);
    const canSelectSeats = bookableSeats.length > 0;
    const unavailableMessage = seatsUnavailableMessage(tripSeats, busSeats);
    const needsNewTrip = tripSeats.length === 0 && busSeats.length > 0;

    return {
        trip,
        tripLoading: tripLoading || (!!busId && busSeatsLoading),
        tripFetching,
        tripError,
        refetchTrip,
        tripSeats,
        bookableSeats,
        overflowSeats,
        busSeats,
        seatIdMap,
        bookedSeats,
        canSelectSeats,
        unavailableMessage,
        needsNewTrip,
        availableCount: bookableSeats.length,
        totalTripSeats: tripSeats.length,
    };
}
