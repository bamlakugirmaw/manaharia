/**
 * Hooks barrel — import from here instead of individual files.
 *
 * Usage:
 *   import { useTrips, useBookings, useCreateBooking } from '../hooks';
 */

export { useTrips, useTrip, useAllTrips, useCreateTrip, useUpdateTrip, useRemoveTrip, tripKeys } from './useTrips';
export { useOperators, useOperator, useOperatorDashboard, usePublicOperators, usePublicOperator, useRemoveOperator, operatorKeys } from './useOperators';
export { useRoutes, useRoute, routeKeys, useCreateRoute, useUpdateRoute, useRemoveRoute } from './useRoutes';
export { useBuses, useBus, useRemoveBus, busKeys } from './useBuses';
export { useSeats, seatKeys } from './useSeats';
export { useBookings, useBooking, useCreateBooking, useCancelBooking, bookingKeys } from './useBookings';
export { usePayments, usePayment, useInitiatePayment, paymentKeys } from './usePayments';
export { useTickets, useTicketsByBooking, useTicket, ticketKeys } from './useTickets';
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
export { useConfirmDialog } from './useConfirmDialog.jsx';
export { useDisputes, useUpdateDispute, useRemoveDispute, DISPUTE_STATUS_LABEL } from './useDisputes';
