import { api, unwrap } from '../lib/api';

/**
 * Auth API
 *
 * register   — POST /v1/auth/register
 * login      — POST /v1/auth/login
 * refresh    — POST /v1/auth/refresh
 * logout     — POST /v1/auth/logout
 * me         — GET  /v1/auth/me
 * updateMe   — PATCH /v1/auth/me
 * changePassword — POST /v1/auth/change-password
 */

/**
 * @param {{ fullName: string, phone: string, email?: string, password: string }} data
 * @returns {{ accessToken: string, refreshToken: string, user: object }}
 */
export const register = (data) => {
    // Backend RegisterDto marks email as required.
    // Only include it if a non-empty value was provided.
    const payload = { ...data };
    if (!payload.email || payload.email.trim() === '') {
        delete payload.email;
    }
    return api.post('/auth/register', payload).then(unwrap);
};

/**
 * @param {{ identifier: string, password: string }} data
 *   identifier — email or phone number
 * @returns {{ accessToken: string, refreshToken: string, user: object }}
 */
export const login = (data) =>
    api.post('/auth/login', data).then(unwrap);

/**
 * @param {{ refreshToken: string }} data
 * @returns {{ accessToken: string, refreshToken: string }}
 */
export const refresh = (data) =>
    api.post('/auth/refresh', data).then(unwrap);

/**
 * Revokes the current refresh token server-side.
 * @param {{ refreshToken: string }} data
 */
export const logout = (data) =>
    api.post('/auth/logout', data).then(unwrap);

/**
 * Returns the authenticated user's profile.
 * @returns {object} user
 */
export const me = () =>
    api.get('/auth/me').then(unwrap);

/**
 * @param {{ fullName?: string, email?: string, phone?: string }} data
 * @returns {object} updated user
 */
export const updateMe = (data) =>
    api.patch('/auth/me', data).then(unwrap);

/**
 * @param {{ currentPassword: string, newPassword: string }} data
 */
export const changePassword = (data) =>
    api.post('/auth/change-password', data).then(unwrap);

export const authApi = { register, login, refresh, logout, me, updateMe, changePassword };
