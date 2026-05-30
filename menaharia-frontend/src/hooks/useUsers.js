import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../api';

export const userKeys = {
    all: ['users'],
    list: (params) => ['users', 'list', params],
    detail: (id) => ['users', 'detail', id],
};

/**
 * @param {{
 *   page?: number,
 *   limit?: number,
 *   status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
 * }} params
 */
export function useUsers(params = {}) {
    return useQuery({
        queryKey: userKeys.list(params),
        queryFn: () => usersApi.listUsers(params),
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * @param {string | undefined} userId
 */
export function useUser(userId) {
    return useQuery({
        queryKey: userKeys.detail(userId),
        queryFn: () => usersApi.getUserById(userId),
        enabled: !!userId,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Mutation: update a user's status (ACTIVE | INACTIVE | SUSPENDED).
 */
export function useUpdateUserStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }) => usersApi.updateUserStatus(id, { status }),
        onSuccess: (_data, { id }) => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
            queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
        },
    });
}

/**
 * Mutation: soft delete a user.
 */
export function useRemoveUser() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => usersApi.removeUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: userKeys.all });
        },
    });
}
