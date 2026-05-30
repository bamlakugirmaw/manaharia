import { api, unwrap } from '../lib/api';

/**
 * Admin API  (all endpoints require auth — admin only)
 *
 * dashboard — GET /v1/admin/dashboard
 */

/**
 * Get platform-wide KPI metrics.
 * @param {{ from?: string, to?: string }} params  ISO date strings
 * @returns {{ totalRevenue, totalBookings, activeOperators, activeUsers, avgOccupancy, ... }}
 */
export const getAdminDashboard = (params = {}) =>
    api.get('/admin/dashboard', { params }).then(unwrap);

export const adminApi = { getAdminDashboard };
