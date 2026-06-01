import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import StarRatingInput from './StarRatingInput';
import {
    useCreateOperatorRating,
    useUpdateOperatorRating,
    useDeleteOperatorRating,
} from '../../hooks/useOperatorRatings';
import { extractErrorMessage } from '../../lib/api';
import { cn } from '../../lib/utils';

/**
 * Rate an operator for a completed booking (POST/PATCH /v1/operator-ratings).
 */
export default function BookingOperatorRating({
    bookingId,
    operatorId,
    operatorName,
    existingRating = null,
    canRate = false,
    compact = false,
    showComment = false,
    className,
}) {
    const [comment, setComment] = useState(existingRating?.comment ?? '');
    const [error, setError] = useState('');
    const [savedFlash, setSavedFlash] = useState(false);

    useEffect(() => {
        setComment(existingRating?.comment ?? '');
    }, [existingRating?.id, existingRating?.comment]);

    const { mutate: createRating, isPending: creating } = useCreateOperatorRating();
    const { mutate: updateRating, isPending: updating } = useUpdateOperatorRating();
    const { mutate: removeRating, isPending: removing } = useDeleteOperatorRating();

    const busy = creating || updating || removing;
    const currentStars = existingRating?.rating ?? 0;

    const handleStars = (stars) => {
        if (!canRate || !operatorId || busy) return;
        setError('');
        setSavedFlash(false);

        const payload = {
            operatorId,
            bookingId,
            rating: stars,
            ...(comment.trim() ? { comment: comment.trim() } : {}),
        };

        if (existingRating?.id) {
            updateRating(
                { id: existingRating.id, rating: stars, comment: comment.trim() || undefined },
                {
                    onSuccess: () => {
                        setSavedFlash(true);
                        setTimeout(() => setSavedFlash(false), 2000);
                    },
                    onError: (err) => setError(extractErrorMessage(err, 'Could not update rating.')),
                },
            );
        } else {
            createRating(payload, {
                onSuccess: () => {
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 2000);
                },
                onError: (err) => setError(extractErrorMessage(err, 'Could not submit rating.')),
            });
        }
    };

    const saveCommentOnly = () => {
        if (!existingRating?.id || !canRate || busy) return;
        setError('');
        updateRating(
            { id: existingRating.id, comment: comment.trim() || undefined },
            {
                onSuccess: () => {
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 2000);
                },
                onError: (err) => setError(extractErrorMessage(err, 'Could not save feedback.')),
            },
        );
    };

    const handleRemove = () => {
        if (!existingRating?.id || busy) return;
        setError('');
        removeRating(existingRating.id, {
            onError: (err) => setError(extractErrorMessage(err, 'Could not remove rating.')),
        });
    };

    if (!operatorId) {
        return (
            <span className="text-[10px] text-gray-400 font-medium">Operator unavailable</span>
        );
    }

    if (!canRate) {
        if (currentStars > 0) {
            return <StarRatingInput value={currentStars} disabled size={compact ? 14 : 16} />;
        }
        return (
            <span className="text-[10px] text-gray-400 font-medium" title="Pay and confirm booking to rate">
                After payment
            </span>
        );
    }

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-center gap-2 flex-wrap">
                <StarRatingInput
                    value={currentStars}
                    onChange={handleStars}
                    disabled={busy}
                    size={compact ? 14 : 16}
                />
                {busy && <Loader2 size={14} className="animate-spin text-gray-400" />}
                {savedFlash && !busy && (
                    <span className="text-[10px] font-bold text-emerald-600">Saved</span>
                )}
            </div>

            {showComment && (
                <>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={`Optional feedback for ${operatorName || 'this operator'}…`}
                        rows={2}
                        disabled={busy}
                        className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                    />
                    {existingRating?.id && comment.trim() !== (existingRating.comment ?? '') && (
                        <button
                            type="button"
                            onClick={saveCommentOnly}
                            disabled={busy}
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            Save feedback
                        </button>
                    )}
                </>
            )}

            {existingRating?.id && (
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={busy}
                    className="text-[10px] font-bold text-gray-400 hover:text-rose-600 transition-colors"
                >
                    Remove rating
                </button>
            )}

            {error && (
                <p className="text-[10px] text-rose-600 font-medium">{error}</p>
            )}
        </div>
    );
}
