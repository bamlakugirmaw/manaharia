import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://menaharia-backend.onrender.com';

/** Used by public/payment-return.html before the SPA loads. */
if (typeof window !== 'undefined') {
    try {
        localStorage.setItem('menaharia.api.baseUrl', BASE_URL.replace(/\/$/, ''));
    } catch {
        /* private mode */
    }
}

/**
 * Central Axios instance.
 * All API modules import this — never create a second instance.
 */
export const api = axios.create({
    baseURL: `${BASE_URL}/v1`,
    headers: { 'Content-Type': 'application/json' },
    timeout: 15000,
});

// ─── Request interceptor ─────────────────────────────────────────────────────
// Attach the stored access token to every outgoing request.
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ─── Response interceptor ────────────────────────────────────────────────────
// On 401, attempt a silent token refresh ONLY for authenticated requests
// (i.e. requests that had a token attached). Never intercept auth endpoints
// themselves — login/register/refresh errors must pass through as-is so the
// UI can display the correct error message.
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const original = error.config;
        const status   = error.response?.status;

        // Never intercept auth endpoints — let their errors reach the caller.
        const isAuthEndpoint = original?.url?.includes('/auth/');
        if (isAuthEndpoint) {
            return Promise.reject(error);
        }

        // Only attempt refresh on 401 and only once per request.
        if (status === 401 && !original._retry) {
            original._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (!refreshToken) {
                if (original.skipAuthRedirect) {
                    return Promise.reject(error);
                }
                return handleAuthFailure();
            }

            try {
                // Use a plain axios call (not the intercepted instance) to avoid
                // triggering this interceptor again on the refresh request itself.
                const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, {
                    refreshToken,
                });

                // Backend envelope: { success, data: { tokens: { accessToken, refreshToken } } }
                const payload      = data?.data ?? data;
                const tokens       = payload?.tokens ?? payload;
                const newAccess    = tokens.accessToken  ?? payload.accessToken  ?? null;
                const newRefresh   = tokens.refreshToken ?? payload.refreshToken ?? null;

                if (!newAccess) throw new Error('No access token in refresh response');

                localStorage.setItem('accessToken',  newAccess);
                if (newRefresh) localStorage.setItem('refreshToken', newRefresh);

                // Retry the original request with the new token.
                original.headers.Authorization = `Bearer ${newAccess}`;
                return api(original);
            } catch {
                if (original.skipAuthRedirect) {
                    return Promise.reject(error);
                }
                return handleAuthFailure();
            }
        }

        return Promise.reject(error);
    }
);

/** Dashboard routes that require a valid session. */
function isProtectedPath(pathname) {
    return (
        pathname.startsWith('/traveller')
        || pathname.startsWith('/operator')
        || pathname.startsWith('/admin')
    );
}

/**
 * Clear stored tokens; redirect to login only on protected dashboard routes.
 * Public pages (operators, search, booking) must not hard-navigate — that breaks
 * client-side routing on static hosts (e.g. Vercel 404 on /login).
 */
function handleAuthFailure() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    const path = window.location.pathname;
    if (isProtectedPath(path) && path !== '/login') {
        window.location.href = '/login';
    }
    return Promise.reject(new Error('Session expired. Please log in again.'));
}

/** Backend caps page size (requests above this return 400). */
export const API_MAX_LIMIT = 100;

/**
 * Strip empty values and internal hook flags; clamp `limit` to API_MAX_LIMIT.
 */
export function sanitizeListParams(params = {}) {
    const { enabled, _all, ...rest } = params;
    const clean = {};
    for (const [key, value] of Object.entries(rest)) {
        if (value !== undefined && value !== null && value !== '') {
            clean[key] = value;
        }
    }
    if (clean.limit != null) {
        const n = Number(clean.limit);
        clean.limit = Math.min(Math.max(1, Number.isFinite(n) ? n : 1), API_MAX_LIMIT);
    }
    return clean;
}

/**
 * Convenience helper — raw Axios body (often `{ success, data, timestamp }`).
 */
export const unwrap = (response) => response.data;

/**
 * Inner `data` from the standard API envelope.
 * Usage: const booking = await api.post('/bookings', body).then(unwrapEnvelope);
 */
export function unwrapEnvelope(response) {
    const body = unwrap(response);
    if (body && typeof body === 'object' && body.data !== undefined && body.success !== undefined) {
        return body.data;
    }
    return body?.data ?? body;
}

/**
 * Extract a human-readable error message from any Axios error.
 * Handles NestJS nested error shape: { message: { message, error, statusCode } }
 * and flat shape: { message: "string" } or { message: ["a", "b"] }
 */
/**
 * Extract a human-readable error message from any Axios error.
 * Handles NestJS nested error shape: { message: { message, error, statusCode } }
 * and flat shape: { message: "string" } or { message: ["a", "b"] }
 */
export const extractErrorMessage = (err, fallback = 'An error occurred.') => {
    const data = err?.response?.data;
    const raw = data?.message ?? err?.message;
    if (!raw) return fallback;

    if (typeof raw === 'string') return raw;
    if (Array.isArray(raw)) return raw.join('. ');
    // NestJS nested: { message: "...", error: "...", statusCode: 400 }
    if (typeof raw === 'object' && raw.message) {
        return typeof raw.message === 'string' ? raw.message : JSON.stringify(raw.message);
    }
    return JSON.stringify(raw);
};
