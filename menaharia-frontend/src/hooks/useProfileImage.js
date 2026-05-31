import { useAuth } from '../contexts/AuthContext';
import { useOperator } from './useOperators';

/**
 * Resolved profile / logo URL for the signed-in user.
 * Operators: company logo from GET /operators/:id.
 * Others: user.profilePicture via GET /auth/me.
 */
export function useProfileImage() {
    const { user } = useAuth();
    const operatorId = user?.role === 'operator' ? user?.operatorId : null;
    const { data: operator } = useOperator(operatorId);
    const op = operator?.data ?? operator;

    if (user?.role === 'operator') {
        return op?.logo ?? user?.avatarUrl ?? null;
    }
    return user?.avatarUrl ?? null;
}
