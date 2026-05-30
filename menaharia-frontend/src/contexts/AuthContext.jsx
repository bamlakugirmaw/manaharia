import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/auth.api';
import { api } from '../lib/api';

const AuthContext = createContext();

// ─── Token helpers ────────────────────────────────────────────────────────────

const storeTokens = ({ accessToken, refreshToken }) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
};

const hasStoredToken = () => !!localStorage.getItem('accessToken');

// ─── Role normalisation ───────────────────────────────────────────────────────
// Backend returns roles as plain strings.
// Known values: "USER" | "ADMIN" | "BUS_OPERATOR"
// Map to frontend role strings used by ProtectedRoute.

const ROLE_MAP = {
    user:         'traveller',
    traveller:    'traveller',
    operator:     'operator',
    bus_operator: 'operator',   // ← backend sends "BUS_OPERATOR"
    admin:        'admin',
    superadmin:   'admin',
};

const ROLE_PRIORITY = ['admin', 'operator', 'traveller'];

const normaliseRole = (roles = []) => {
    if (!Array.isArray(roles) || roles.length === 0) return 'traveller';
    // Roles can be plain strings ["USER"] or objects [{ id, name }]
    const names = roles.map((r) =>
        (typeof r === 'string' ? r : r?.name ?? '').toLowerCase()
    );
    // Map backend role names to frontend role names
    const mapped = names.map((n) => ROLE_MAP[n] ?? n);
    return ROLE_PRIORITY.find((p) => mapped.includes(p)) ?? mapped[0] ?? 'traveller';
};

// ─── User shape normalisation ─────────────────────────────────────────────────
// Accepts the user object from any backend response shape.

const normaliseUser = (raw) => {
    if (!raw) return null;
    if (!raw.id && !raw._id) return null;
    return {
        id:         raw.id ?? raw._id,
        name:       raw.fullName ?? raw.name ?? '',
        email:      raw.email ?? '',
        phone:      raw.phone ?? '',
        role:       normaliseRole(raw.roles),
        operatorId: raw.operatorId ?? raw.operator?.id ?? null,
        roles:      raw.roles ?? [],
    };
};

// ─── Extract tokens + user from login/register response ───────────────────────
// Backend shape: { success, data: { user: {...}, tokens: { accessToken, refreshToken } } }

const extractFromResponse = (response) => {
    // Unwrap the outer { success, data, timestamp } envelope
    const payload = response?.data ?? response;

    // Tokens are nested under payload.tokens
    const tokens      = payload?.tokens ?? {};
    const accessToken  = tokens.accessToken  ?? payload?.accessToken  ?? null;
    const refreshToken = tokens.refreshToken ?? payload?.refreshToken ?? null;

    // User is at payload.user
    const rawUser = payload?.user ?? null;
    const user    = normaliseUser(rawUser);

    return { accessToken, refreshToken, user };
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }) {
    const [user,      setUser]      = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // ── Session restore on mount ──────────────────────────────────────────────
    // Backend me() shape: { success, data: { id, fullName, ... } }
    useEffect(() => {
        if (!hasStoredToken()) {
            setIsLoading(false);
            return;
        }

        authApi
            .me()
            .then(async (response) => {
                const raw = response?.data ?? response;
                let u = normaliseUser(raw);

                // For BUS_OPERATOR users, operatorId is not on the user object.
                // Fetch the operators list to resolve it.
                if (u?.role === 'operator' && !u.operatorId) {
                    try {
                        const opRes = await api.get('/operators', { params: { limit: 1 } });
                        const opPayload = opRes.data?.data ?? opRes.data;
                        const items = Array.isArray(opPayload) ? opPayload
                            : Array.isArray(opPayload?.items) ? opPayload.items
                            : [];
                        if (items.length > 0) {
                            u = { ...u, operatorId: items[0].id };
                        }
                    } catch { /* non-fatal */ }
                }

                setUser(u);
            })
            .catch(() => {
                clearTokens();
            })
            .finally(() => setIsLoading(false));
    }, []);

    // ── login ─────────────────────────────────────────────────────────────────
    const login = useCallback(async (identifier, password) => {
        try {
            const response = await authApi.login({ identifier, password });
            const { accessToken, refreshToken, user: loginUser } = extractFromResponse(response);

            if (!accessToken) {
                return {
                    success: false,
                    message: 'Login failed: server did not return a token. Please try again.',
                };
            }

            storeTokens({ accessToken, refreshToken });

            // If user wasn't in the login response, fetch it via /me
            let resolvedUser = loginUser;
            if (!resolvedUser?.id) {
                try {
                    const meResponse = await authApi.me();
                    const raw = meResponse?.data ?? meResponse;
                    resolvedUser = normaliseUser(raw);
                } catch {
                    clearTokens();
                    return {
                        success: false,
                        message: 'Could not load your profile. Please try again.',
                    };
                }
            }

            // For BUS_OPERATOR users the backend doesn't return operatorId on the
            // user object. Fetch the operators list and pick the first one.
            if (resolvedUser?.role === 'operator' && !resolvedUser.operatorId) {
                try {
                    const opRes = await api.get('/operators', { params: { limit: 1 } });
                    const opPayload = opRes.data?.data ?? opRes.data;
                    const items = Array.isArray(opPayload) ? opPayload
                        : Array.isArray(opPayload?.items) ? opPayload.items
                        : [];
                    if (items.length > 0) {
                        resolvedUser = { ...resolvedUser, operatorId: items[0].id };
                    }
                } catch {
                    // Non-fatal — operator dashboard will show empty state
                }
            }

            setUser(resolvedUser);
            return { success: true, user: resolvedUser };
        } catch (err) {
            const raw = err?.response?.data?.message?.message
                ?? err?.response?.data?.message
                ?? err?.message
                ?? 'Invalid credentials. Please try again.';
            const message = Array.isArray(raw) ? raw.join('. ') : raw;
            return { success: false, message };
        }
    }, []);

    // ── signup ────────────────────────────────────────────────────────────────
    const signup = useCallback(async (userData) => {
        try {
            const payload = {
                fullName: userData.name,
                phone:    userData.phone,
                password: userData.password,
            };
            // Only include email if the user actually provided one
            if (userData.email && userData.email.trim() !== '') {
                payload.email = userData.email.trim();
            }

            await authApi.register(payload);
            return { success: true, message: 'Account created successfully!' };
        } catch (err) {
            const raw = err?.response?.data?.message?.message
                ?? err?.response?.data?.message
                ?? 'Registration failed. Please try again.';
            const message = Array.isArray(raw) ? raw.join('. ') : raw;
            return { success: false, message };
        }
    }, []);

    // ── logout ────────────────────────────────────────────────────────────────
    const logout = useCallback(async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            authApi.logout({ refreshToken }).catch(() => {});
        }
        clearTokens();
        setUser(null);
    }, []);

    // ── updateProfile ─────────────────────────────────────────────────────────
    const updateProfile = useCallback(async (data) => {
        try {
            const response = await authApi.updateMe(data);
            const raw = response?.data ?? response;
            setUser(normaliseUser(raw));
            return { success: true };
        } catch (err) {
            const message = err?.response?.data?.message ?? 'Update failed.';
            return { success: false, message };
        }
    }, []);

    // ── changePassword ────────────────────────────────────────────────────────
    const changePassword = useCallback(async (data) => {
        try {
            await authApi.changePassword(data);
            return { success: true };
        } catch (err) {
            const message = err?.response?.data?.message ?? 'Password change failed.';
            return { success: false, message };
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                signup,
                updateProfile,
                changePassword,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
