import { api, unwrap } from '../lib/api';

/**
 * Users API  (all endpoints require auth — admin only)
 *
 * list         — GET    /v1/users
 * getById      — GET    /v1/users/:id
 * updateStatus — PATCH  /v1/users/:id/status
 * remove       — DELETE /v1/users/:id
 * addRole      — POST   /v1/users/:id/roles
 * removeRole   — DELETE /v1/users/:id/roles
 */

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} params
 */
export const listUsers = (params = {}) =>
    api.get('/users', { params }).then(unwrap);

/**
 * @param {string} id
 */
export const getUserById = (id) =>
    api.get(`/users/${id}`).then(unwrap);

/**
 * @param {string} id
 * @param {{ status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }} data
 */
export const updateUserStatus = (id, data) =>
    api.patch(`/users/${id}/status`, data).then(unwrap);

/**
 * Soft delete a user.
 * @param {string} id
 */
export const removeUser = (id) =>
    api.delete(`/users/${id}`).then(unwrap);

/**
 * @param {string} id
 * @param {{ roleId: string }} data
 */
export const addUserRole = (id, data) =>
    api.post(`/users/${id}/roles`, data).then(unwrap);

/**
 * @param {string} id
 * @param {{ roleId: string }} data
 */
export const removeUserRole = (id, data) =>
    api.delete(`/users/${id}/roles`, { data }).then(unwrap);

export const usersApi = {
    listUsers,
    getUserById,
    updateUserStatus,
    removeUser,
    addUserRole,
    removeUserRole,
};
