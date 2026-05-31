import { Navigate } from 'react-router-dom';

/** Trip scheduling is handled on the Bookings page. */
export default function ScheduleManagement() {
    return <Navigate to="/operator/bookings" replace />;
}
