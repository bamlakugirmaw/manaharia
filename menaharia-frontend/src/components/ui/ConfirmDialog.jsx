import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

/**
 * Styled confirmation dialog — drop-in replacement for window.confirm on destructive actions.
 */
export default function ConfirmDialog({
    open,
    title = 'Are you sure?',
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'destructive',
    loading = false,
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && open && !loading) onCancel?.();
        };
        if (open) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [open, loading, onCancel]);

    if (!open) return null;

    const isDestructive = variant === 'destructive';

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => !loading && onCancel?.()}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="confirm-dialog-title"
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            'w-12 h-12 rounded-2xl flex items-center justify-center shrink-0',
                            isDestructive ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600',
                        )}>
                            <AlertTriangle size={22} />
                        </div>
                        <div className="flex-1 min-w-0 pt-0.5">
                            <h3 id="confirm-dialog-title" className="text-lg font-bold text-gray-900 leading-tight">
                                {title}
                            </h3>
                            {description && (
                                <p className="text-sm text-gray-500 mt-2 leading-relaxed">{description}</p>
                            )}
                        </div>
                        {!loading && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 -mt-1 -mr-1 p-1 rounded-lg hover:bg-gray-100"
                                aria-label="Close"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 bg-gray-50/80 border-t border-gray-100">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-xl h-11 font-semibold border-gray-200"
                        disabled={loading}
                        onClick={onCancel}
                    >
                        {cancelLabel}
                    </Button>
                    <Button
                        type="button"
                        variant={isDestructive ? 'destructive' : 'default'}
                        className="flex-1 rounded-xl h-11 font-semibold"
                        isLoading={loading}
                        disabled={loading}
                        onClick={onConfirm}
                    >
                        {confirmLabel}
                    </Button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
