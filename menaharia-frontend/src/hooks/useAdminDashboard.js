import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api';

export const adminKeys = {
    dashboard: (params) => ['admin', 'dashboard', params],
};

/**
 * Fetch platform-wide KPI metrics for the admin dashboard.
 * Backend envelope: { success, data: { users, operators, buses, routes, trips,
 *   bookings: { pending, confirmed, cancelled },
 *   payments: { successful, revenue } }, timestamp }
 *
 * @param {{ from?: string, to?: string }} params  ISO date strings
 */
export function useAdminDashboard(params = {}) {
    return useQuery({
        queryKey: adminKeys.dashboard(params),
        queryFn: async () => {
            const response = await adminApi.getAdminDashboard(params);
            // Unwrap { success, data: {...} } envelope
            return response?.data ?? response;
        },
        staleTime: 5 * 60 * 1000,
    });
}
