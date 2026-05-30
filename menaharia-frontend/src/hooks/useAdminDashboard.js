import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api';

export const adminKeys = {
    dashboard: (params) => ['admin', 'dashboard', params],
};

/**
 * Fetch platform-wide KPI metrics for the admin dashboard.
 *
 * @param {{ from?: string, to?: string }} params  ISO date strings
 */
export function useAdminDashboard(params = {}) {
    return useQuery({
        queryKey: adminKeys.dashboard(params),
        queryFn: () => adminApi.getAdminDashboard(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
