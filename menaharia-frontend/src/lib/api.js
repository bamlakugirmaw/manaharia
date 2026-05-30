import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://menaharia-backend.onrender.com';

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
                return handleAuthFailure();
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Clear stored tokens and redirect to login.
 * Called when a refresh attempt fails or no refresh token is present.
 */
function handleAuthFailure() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // Avoid redirect loops if already on the login page.
    if (window.location.pathname !== '/login') {
        window.location.href = '/login';
    }
    return Promise.reject(new Error('Session expired. Please log in again.'));
}

/**
 * Convenience helper — extract the data payload from an Axios response.
 * Usage: const data = await api.get('/trips').then(unwrap)
 */
export const unwrap = (response) => response.data;
