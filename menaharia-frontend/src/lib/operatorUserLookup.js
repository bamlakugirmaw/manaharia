import { api, unwrapEnvelope } from './api';

function unwrapUserList(payload) {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload.items)) return payload.items;
    if (Array.isArray(payload.data)) return payload.data;
    if (payload.id) return [payload];
    return [];
}

function pickUserMatch(users, { phone, email }) {
    if (!users?.length) return null;
    const phoneNorm = (phone ?? '').replace(/\D/g, '');
    const emailNorm = (email ?? '').trim().toLowerCase();

    if (emailNorm) {
        const byEmail = users.find(
            (u) => (u.email ?? '').trim().toLowerCase() === emailNorm,
        );
        if (byEmail) return byEmail;
    }
    if (phoneNorm) {
        const byPhone = users.find(
            (u) => (u.phone ?? '').replace(/\D/g, '') === phoneNorm,
        );
        if (byPhone) return byPhone;
    }
    return users[0] ?? null;
}

/**
 * Find an existing traveller account by phone or email (operator manual booking).
 * Tries common backend lookup patterns; returns null if not found.
 */
export async function searchUserByContact({ phone, email }) {
    const phoneVal = phone?.trim();
    const emailVal = email?.trim();
    if (!phoneVal && !emailVal) return null;

    const attempts = [
        () => api.get('/users/search', { params: { phone: phoneVal, email: emailVal } }),
        () => api.get('/users/lookup', { params: { phone: phoneVal, email: emailVal } }),
        () => api.get('/users', { params: { phone: phoneVal, limit: 20 } }),
        () => api.get('/users', { params: { email: emailVal, limit: 20 } }),
        () => api.get('/users', { params: { search: phoneVal || emailVal, limit: 20 } }),
    ];

    for (const request of attempts) {
        try {
            const res = await request();
            const payload = unwrapEnvelope(res);
            const users = unwrapUserList(payload);
            const match = pickUserMatch(users, { phone: phoneVal, email: emailVal });
            if (match) return normaliseSearchedUser(match);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404 || status === 405) continue;
            if (status === 403 || status === 401) throw err;
        }
    }

    return null;
}

export function normaliseSearchedUser(raw) {
    if (!raw) return null;
    return {
        id: raw.id,
        fullName: raw.fullName ?? raw.name ?? '',
        phone: raw.phone ?? '',
        email: raw.email ?? '',
    };
}

export function isEmailLike(value) {
    return (value ?? '').includes('@');
}
