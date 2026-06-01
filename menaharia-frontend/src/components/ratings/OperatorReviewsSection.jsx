import { Star, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { useOperatorRatings } from '../../hooks/useOperatorRatings';
import { averageFromRatings, formatRatingDate } from '../../lib/ratingHelpers';
import StarRatingInput from './StarRatingInput';
import { cn } from '../../lib/utils';

/**
 * Public list of traveller reviews for an operator profile.
 */
export default function OperatorReviewsSection({
    operatorId,
    operatorRating = null,
    limit = 15,
    className,
}) {
    const { data: reviews = [], isLoading, isError } = useOperatorRatings({
        operatorId,
        limit,
        enabled: !!operatorId,
        publicBrowse: true,
    });

    const computedAvg = averageFromRatings(reviews);
    const displayRating = operatorRating ?? computedAvg;
    const count = reviews.length;

    return (
        <Card className={cn('shadow-xl border-2 border-gray-100', className)}>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                <h2 className="text-2xl font-black flex items-center gap-3">
                    <Star className="w-6 h-6 fill-white" /> Customer Reviews
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-black tabular-nums">
                            {displayRating != null ? Number(displayRating).toFixed(1) : '—'}
                        </span>
                        <div>
                            <StarRatingInput
                                value={displayRating != null ? Math.round(displayRating) : 0}
                                disabled
                                size={18}
                            />
                            <p className="text-white/80 text-xs font-medium mt-1">
                                {isLoading ? 'Loading…' : `${count} review${count === 1 ? '' : 's'}`}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <CardContent className="p-0">
                {isLoading ? (
                    <div className="py-12 text-center text-gray-400 text-sm">Loading reviews…</div>
                ) : isError ? (
                    <div className="py-12 text-center text-gray-500 text-sm">Reviews could not be loaded.</div>
                ) : reviews.length === 0 ? (
                    <div className="py-12 text-center text-gray-400">
                        <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p className="font-bold text-gray-600">No reviews yet</p>
                        <p className="text-sm mt-1">Be the first to rate this operator after your trip.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {reviews.map((review) => (
                            <li key={review.id} className="px-6 py-5 hover:bg-gray-50/50 transition-colors">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-gray-900 text-sm">
                                                {review.reviewerName}
                                            </p>
                                            <StarRatingInput value={review.rating} disabled size={14} />
                                        </div>
                                        {review.comment && (
                                            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                                                {review.comment}
                                            </p>
                                        )}
                                    </div>
                                    {review.createdAt && (
                                        <time className="text-[10px] font-bold text-gray-400 uppercase tracking-wide shrink-0">
                                            {formatRatingDate(review.createdAt)}
                                        </time>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
}
