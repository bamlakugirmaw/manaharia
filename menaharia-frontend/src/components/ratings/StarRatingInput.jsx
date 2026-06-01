import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../lib/utils';

/**
 * Interactive 1–5 star control (display-only when disabled).
 */
export default function StarRatingInput({
    value = 0,
    onChange,
    disabled = false,
    size = 16,
    className,
}) {
    const [hovered, setHovered] = useState(null);
    const display = hovered ?? value;

    return (
        <div
            className={cn('flex items-center gap-0.5', className)}
            onMouseLeave={() => !disabled && setHovered(null)}
            role={disabled ? 'img' : 'group'}
            aria-label={disabled ? `Rated ${value} out of 5` : 'Rate from 1 to 5 stars'}
        >
            {[1, 2, 3, 4, 5].map((star) => {
                const filled = star <= display;
                return (
                    <button
                        key={star}
                        type="button"
                        disabled={disabled}
                        onMouseEnter={() => !disabled && setHovered(star)}
                        onClick={() => !disabled && onChange?.(star)}
                        className={cn(
                            'p-0.5 rounded transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                            disabled ? 'cursor-default' : 'hover:scale-110 cursor-pointer',
                        )}
                        title={disabled ? undefined : `Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                        <Star
                            size={size}
                            className={cn(
                                'transition-colors',
                                filled ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200',
                            )}
                        />
                    </button>
                );
            })}
            {value > 0 && hovered === null && (
                <span className="ml-1 text-[10px] font-bold text-amber-600 tabular-nums">
                    {value}.0
                </span>
            )}
        </div>
    );
}
