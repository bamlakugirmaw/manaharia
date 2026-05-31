import { cn } from '../../lib/utils';

const SIZE_CLASSES = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-14 h-14 text-base',
    lg: 'w-24 h-24 text-2xl',
};

/**
 * Circular avatar — image URL or initials fallback.
 */
export default function ProfileAvatar({
    src,
    name = '',
    size = 'md',
    className,
    alt = 'Profile',
}) {
    const initials = (name || '?')
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('') || '?';

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-bold overflow-hidden shrink-0',
                'bg-blue-100 text-primary border border-gray-200',
                SIZE_CLASSES[size] ?? SIZE_CLASSES.md,
                className,
            )}
        >
            {src
                ? <img src={src} alt={alt} className="w-full h-full object-cover" />
                : initials
            }
        </div>
    );
}
