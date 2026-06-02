import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { usePayments } from './usePayments';
import { useOperatorScope } from './useOperatorScope';
import { bookingsApi } from '../api/bookings.api';
import { bookingKeys } from './useBookings';
import { tripOrigin, tripDest } from '../lib/tripHelpers';

export const PLATFORM_FEE = 0.05;

const METHOD_LABEL = {
    CHAPA: 'Chapa', TELEBIRR: 'Telebirr',
    SANTIM: 'Santim', CBE: 'CBE Birr', MANUAL: 'Manual',
};

function toStatusLabel(s) {
    const u = (s ?? '').toUpperCase();
    if (u === 'SUCCESS' || u === 'COMPLETED' || u === 'PAID') return 'completed';
    if (u === 'FAILED') return 'failed';
    return 'pending';
}

function extractUserName(b) {
    if (!b) return null;
    return b.user?.fullName ?? b.user?.name
        ?? b.travelers?.[0]?.fullName
        ?? b.bookingTravelers?.[0]?.fullName
        ?? b.user?.email ?? null;
}

function extractUserEmail(b) {
    if (!b) return null;
    return b.user?.email ?? b.travelers?.[0]?.email ?? null;
}

/**
 * Fetch operator payments and enrich with booking details.
 *
 * The backend scopes GET /v1/payments to the authenticated operator automatically —
 * no client-side filtering required. We enable the query as soon as the user is
 * authenticated (role === 'operator'), independent of operatorId resolution.
 */
export function useOperatorPayments() {
    const { user, isLoading: authLoading } = useAuth();

    // Enable payments fetch as soon as user is authenticated as operator —
    // don't wait for operatorId to be resolved
    const isOperator = user?.role === 'operator';

    // Also get trips count and scope data for KPI cards
    const { trips, tripsQuery } = useOperatorScope({ limit: 10 });

    // ── Fetch payments ────────────────────────────────────────────────────────
    const { data: rawPayments = [], isLoading: paymentsLoading } = usePayments({
        limit: 100,
        enabled: !authLoading && isOperator,
    });

    const payments = useMemo(
        () => (Array.isArray(rawPayments) ? rawPayments : []),
        [rawPayments],
    );

    // ── Fetch booking details for user names + routes ─────────────────────────
    const bookingQueries = useQueries({
        queries: payments.map((p) => ({
            queryKey: bookingKeys.detail(p.bookingId),
            queryFn:  () => bookingsApi.getBookingById(p.bookingId),
            enabled:  !authLoading && isOperator && !!p.bookingId,
            staleTime: 5 * 60 * 1000,
        })),
    });

    const bookingMap = useMemo(() => {
        const map = {};
        payments.forEach((p, i) => {
            if (p.bookingId) map[p.bookingId] = bookingQueries[i]?.data ?? null;
        });
        return map;
    }, [payments, bookingQueries]);

    // ── Build rows — no filtering, backend already scoped to this operator ────
    const rows = useMemo(() => {
        return payments.map((p) => {
            const b       = bookingMap[p.bookingId] ?? null;
            const name    = extractUserName(b) ?? '—';
            const email   = extractUserEmail(b) ?? null;
            const gross   = Number(p.amount ?? 0);
            const net     = gross * (1 - PLATFORM_FEE);
            const from    = b?.trip ? tripOrigin(b.trip) : '';
            const to      = b?.trip ? tripDest(b.trip)   : '';
            const route   = from && to ? `${from} → ${to}` : '—';
            const dateIso = p.paidAt ?? p.updatedAt ?? p.createdAt ?? '';

            return {
                id:              p.id,
                bookingId:       p.bookingId ?? null,
                reference:       b?.bookingReference ?? p.bookingId?.slice(0, 12) ?? p.id.slice(0, 12),
                user:            name,
                userEmail:       email,
                route,
                dateIso,
                dateDisplay: dateIso ? new Date(dateIso).toLocaleString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                }) : '—',
                gross,
                net,
                method:          METHOD_LABEL[p.method] ?? p.method ?? 'Chapa',
                status:          toStatusLabel(p.status),
                transactionCode: p.transactionCode ?? p.gatewayReference ?? '—',
                _loadingUser:    !!p.bookingId && !b,
            };
        }).sort((a, b) => new Date(b.dateIso || 0) - new Date(a.dateIso || 0));
    }, [payments, bookingMap]);

    // ── Aggregates ────────────────────────────────────────────────────────────
    const totalGross    = useMemo(() => rows.reduce((s, r) => s + r.gross, 0), [rows]);
    const totalNet      = useMemo(() => rows.reduce((s, r) => s + r.net,   0), [rows]);
    const completedRows = useMemo(() => rows.filter((r) => r.status === 'completed'), [rows]);
    const pendingRows   = useMemo(() => rows.filter((r) => r.status === 'pending'),   [rows]);

    const revenueData = useMemo(() => {
        const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const map = {};
        for (const r of completedRows) {
            if (!r.dateIso) continue;
            const label = DAY[new Date(r.dateIso).getDay()];
            map[label] = (map[label] ?? 0) + r.net;
        }
        return Object.entries(map).map(([name, revenue]) => ({ name, revenue: Math.round(revenue) }));
    }, [completedRows]);

    return {
        rows,
        completedRows,
        pendingRows,
        totalGross,
        totalNet,
        totalFee:       totalGross - totalNet,
        activeBookings: completedRows.length,
        scheduledTrips: (trips ?? []).length,
        revenueData,
        isLoading:      paymentsLoading,
        trips,
        PLATFORM_FEE,
    };
}
