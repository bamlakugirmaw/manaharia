/**
 * Hooks barrel — import from here instead of individual files.
 *
 * Usage:
 *   import { useTrips, useBookings, useCreateBooking } from '../hooks';
 */

export { useTrips, useTrip, useAllTrips, useOperatorTrips, useCreateTrip, useUpdateTrip, useRemoveTrip, tripKeys } from './useTrips';
export { useOperators, useOperator, useOperatorDashboard, usePublicOperators, usePublicOperator, useRemoveOperator, operatorKeys } from './useOperators';
export { useRoutes, useRoute, routeKeys, useCreateRoute, useUpdateRoute, useRemoveRoute } from './useRoutes';
export { useBuses, useBus, useRemoveBus, busKeys } from './useBuses';
export { useSeats, seatKeys } from './useSeats';
export { useBookings, useOperatorBookings, useBooking, useCreateBooking, useCancelBooking, bookingKeys } from './useBookings';
export { useEnrichedBooking } from './useEnrichedBooking';
export { useTripManifest } from './useTripManifest';
export { useTravelersByBooking, travelerKeys } from './useTravelers';
export { usePayments, usePayment, useInitiatePayment, paymentKeys } from './usePayments';
export { useTickets, useTicketsByBooking, useTicket, useValidateTicket, ticketKeys } from './useTickets';
export { useUsers, useUser, useUpdateUserStatus, useRemoveUser, useHardRemoveUser, useRemoveUserRole, userKeys } from './useUsers';
export { useAdminDashboard, adminKeys } from './useAdminDashboard';
export { useRoles, useBusOperatorRoleId, useRevokeRole, roleKeys } from './useRoles';
export { useCreateBookingForUser } from './useBookings';
export {
    useDestinations,
    useDestination,
    usePublicDestinations,
    usePublicDestination,
    useCreateDestination,
    useUpdateDestination,
    useRemoveDestination,
    destinationKeys,
} from './useDestinations';
export { useCreateSeatBatch } from './useSeats';
export { useProfileImage } from './useProfileImage';
export { useOperatorScope } from './useOperatorScope';
export { useConfirmDialog } from './useConfirmDialog.jsx';
export { useDisputes, useUpdateDispute, useRemoveDispute, DISPUTE_STATUS_LABEL } from './useDisputes';
export {
    useOperatorRatings,
    useOperatorRating,
    useCreateOperatorRating,
    useUpdateOperatorRating,
    useDeleteOperatorRating,
    useMyRatingsByBooking,
    ratingKeys,
} from './useOperatorRatings';
