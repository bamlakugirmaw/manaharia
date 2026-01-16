import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';

export function Logo({ className, textClassName, iconOnly = false, light = false }) {
    return (
        <Link
            to="/"
            className={cn(
                "flex items-center gap-2 hover:opacity-80 transition-all duration-300 group",
                className
            )}
        >
            <div className={cn(
                "w-8 h-8 flex items-center justify-center rounded-lg shadow-md shrink-0 group-hover:scale-105 transition-transform",
                light ? "bg-white/20 text-white shadow-white/5 border border-white/10" : "bg-primary text-white shadow-primary/20"
            )}>
                <span className="font-bold text-lg">M</span>
            </div>
            {!iconOnly && (
                <span className={cn(
                    "font-bold text-xl tracking-tight transition-colors",
                    light ? "text-white" : "text-gray-900",
                    textClassName
                )}>
                    Menaharia
                </span>
            )}
        </Link>
    );
}
