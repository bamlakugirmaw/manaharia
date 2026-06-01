import { operatorsApi } from '../api/operators.api';

function unwrapOperatorList(response) {
    const body = response?.data ?? response;
    const payload = body?.success !== undefined && body?.data !== undefined
        ? body.data
        : body;
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.data)) return payload.data;
    return [];
}

/** Normalise phone for loose matching (+251… vs 09…). */
export function normalizePhone(value) {
    if (!value) return '';
    const digits = String(value).replace(/\D/g, '');
    if (digits.length >= 9) return digits.slice(-9);
    return digits;
}

/**
 * Resolve the transport operator record for a BUS_OPERATOR user.
 * Never picks an arbitrary operator — matches company email/phone to the user account.
 */
export async function resolveOperatorIdForUser(user) {
    if (!user || user.role !== 'operator') return null;

    if (user.operatorId) return user.operatorId;

    const fromProfile =
        user.operator?.id
        ?? user.busOperator?.id
        ?? user.busOperatorId
        ?? null;
    if (fromProfile) return fromProfile;

    const email = (user.email ?? '').toLowerCase().trim();
    const phone = normalizePhone(user.phone);

    if (!email && !phone) return null;

    try {
        const res = await operatorsApi.listOperators({ limit: 100, status: 'ACTIVE' });
        const operators = unwrapOperatorList(res);

        const match = operators.find((op) => {
            const opEmail = (op.companyEmail ?? '').toLowerCase().trim();
            const opPhone = normalizePhone(op.companyPhone ?? op.phone);
            if (email && opEmail && email === opEmail) return true;
            if (phone && opPhone && phone === opPhone) return true;
            return false;
        });

        return match?.id ?? null;
    } catch {
        return null;
    }
}

export function operatorStorageKey(userId) {
    return userId ? `menaharia.operatorId.${userId}` : null;
}

export function readCachedOperatorId(userId) {
    const key = operatorStorageKey(userId);
    if (!key) return null;
    try {
        return localStorage.getItem(key) || null;
    } catch {
        return null;
    }
}

export function writeCachedOperatorId(userId, operatorId) {
    const key = operatorStorageKey(userId);
    if (!key || !operatorId) return;
    try {
        localStorage.setItem(key, operatorId);
    } catch { /* ignore */ }
}

export function clearCachedOperatorId(userId) {
    const key = operatorStorageKey(userId);
    if (!key) return;
    try {
        localStorage.removeItem(key);
    } catch { /* ignore */ }
}

/**
 * Full resolve: profile fields → cache → API match by email/phone.
 */
export async function attachOperatorIdToUser(user) {
    if (!user || user.role !== 'operator') return user;

    if (user.operatorId) {
        writeCachedOperatorId(user.id, user.operatorId);
        return user;
    }

    const cached = readCachedOperatorId(user.id);
    if (cached) return { ...user, operatorId: cached };

    const resolved = await resolveOperatorIdForUser(user);
    if (resolved) {
        writeCachedOperatorId(user.id, resolved);
        return { ...user, operatorId: resolved };
    }

    return user;
}
