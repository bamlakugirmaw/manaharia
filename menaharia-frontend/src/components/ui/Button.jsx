import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import React from 'react';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
    "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
    {
        variants: {
            variant: {
                default: "bg-primary text-white hover:bg-primary/90 shadow-sm",
                destructive: "bg-danger text-white hover:bg-danger/90 shadow-sm",
                outline: "border border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900 text-gray-700",
                secondary: "bg-secondary text-white hover:bg-secondary/80",
                ghost: "hover:bg-gray-100 hover:text-gray-900 text-gray-600",
                link: "text-primary underline-offset-4 hover:underline",
                accent: "bg-accent text-gray-900 hover:bg-accent/90 font-bold",
            },
            size: {
                default: "h-10 px-4 py-2",
                sm: "h-9 rounded-md px-3",
                lg: "h-11 rounded-md px-8 text-base",
                icon: "h-10 w-10",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
            fullWidth: false,
        },
    }
);

const Button = React.forwardRef(({ className, variant, size, fullWidth, isLoading, children, ...props }, ref) => {
    return (
        <button
            className={cn(buttonVariants({ variant, size, fullWidth, className }))}
            ref={ref}
            disabled={isLoading}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
});

Button.displayName = "Button";

export { Button, buttonVariants };
