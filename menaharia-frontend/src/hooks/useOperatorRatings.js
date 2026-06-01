import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorRatingsApi } from '../api/operatorRatings.api';
import { operatorKeys } from './useOperators';
import { unwrapRatingsList, normaliseOperatorRating } from '../lib/ratingHelpers';

export const ratingKeys = {
    all: ['operator-ratings'],
    list: (params) => ['operator-ratings', 'list', params],
    detail: (id) => ['operator-ratings', 'detail', id],
};

function unwrapList(response) {
    return unwrapRatingsList(response).map(normaliseOperatorRating).filter(Boolean);
}

function unwrapSingle(response) {
    const raw = response?.data ?? response;
    return normaliseOperatorRating(raw);
}

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   operatorId?: string,
 *   userId?: string,
 *   bookingId?: string,
 *   enabled?: boolean
 * }} params
 */
export function useOperatorRatings(params = {}) {
    const { enabled = true, publicBrowse = false, ...queryParams } = params;
    return useQuery({
        queryKey: ratingKeys.list({ ...queryParams, publicBrowse }),
        queryFn: async () => {
            const list = publicBrowse
                ? operatorRatingsApi.listOperatorRatingsPublic
                : operatorRatingsApi.listOperatorRatings;
            try {
                return unwrapList(await list(queryParams));
            } catch (err) {
                if (publicBrowse && err?.response?.status === 401) {
                    return [];
                }
                throw err;
            }
        },
        enabled,
        staleTime: 60 * 1000,
        retry: false,
    });
}

export function useOperatorRating(ratingId) {
    return useQuery({
        queryKey: ratingKeys.detail(ratingId),
        queryFn: async () => {
            const res = await operatorRatingsApi.getOperatorRatingById(ratingId);
            return unwrapSingle(res);
        },
        enabled: !!ratingId,
        staleTime: 0,
    });
}

function invalidateRatingCaches(qc) {
    qc.invalidateQueries({ queryKey: ratingKeys.all });
    qc.invalidateQueries({ queryKey: operatorKeys.all });
}

export function useCreateOperatorRating() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => operatorRatingsApi.createOperatorRating(data),
        onSuccess: () => invalidateRatingCaches(qc),
    });
}

export function useUpdateOperatorRating() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => operatorRatingsApi.updateOperatorRating(id, data),
        onSuccess: (_data, { id }) => {
            invalidateRatingCaches(qc);
            qc.invalidateQueries({ queryKey: ratingKeys.detail(id) });
        },
    });
}

export function useDeleteOperatorRating() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => operatorRatingsApi.deleteOperatorRating(id),
        onSuccess: () => invalidateRatingCaches(qc),
    });
}

/** Current user's ratings keyed by bookingId */
export function useMyRatingsByBooking(userId, options = {}) {
    const { enabled = true, limit = 100 } = options;
    const query = useOperatorRatings({
        userId,
        limit,
        enabled: enabled && !!userId,
    });

    const byBookingId = useMemo(
        () => {
            const map = {};
            for (const r of query.data ?? []) {
                if (r.bookingId) map[r.bookingId] = r;
            }
            return map;
        },
        [query.data],
    );

    return { ...query, byBookingId };
}
