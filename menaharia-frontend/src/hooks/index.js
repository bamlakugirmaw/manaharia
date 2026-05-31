/**
 * Hooks barrel — import from here instead of individual files.
 *
 * Usage:
 *   import { useTrips, useBookings, useCreateBooking } from '../hooks';
 */

export { useTrips, useTrip, tripKeys } from './useTrips';
export { useOperators, useOperator, useOperatorDashboard, operatorKeys } from './useOperators';
export { useRoutes, useRoute, routeKeys } from './useRoutes';
export { useSeats, seatKeys } from './useSeats';
export { useBookings, useBooking, useCreateBooking, useCancelBooking, bookingKeys } from './useBookings';
export { usePayments, usePayment, useInitiatePayment, paymentKeys } from './usePayments';
export { useTickets, useTicketsByBooking, useTicket, ticketKeys } from './useTickets';
export { useUsers, useUser, useUpdateUserStatus, useRemoveUser, userKeys } from './useUsers';
export { useAdminDashboard, adminKeys } from './useAdminDashboard';
export { useRoles, useBusOperatorRoleId, roleKeys } from './useRoles';
export { useCreateRoute, useUpdateRoute } from './useRoutes';
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
