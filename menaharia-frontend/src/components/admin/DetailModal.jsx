import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';

export default function DetailModal({ isOpen, onClose, title, children, footer }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="px-6 py-8 max-h-[70vh] overflow-y-auto">
                    {children}
                </div>

                {/* Footer */}
                {footer ? (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                        {footer}
                    </div>
                ) : (
                    <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                        <Button onClick={onClose} variant="outline">Close</Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-component for data rows
export function ModalDataRow({ label, value, icon: Icon }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-50 last:border-0">
            <div className="w-full sm:w-1/3 flex items-center gap-2 text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1 sm:mb-0">
                {Icon && <Icon size={12} />}
                {label}
            </div>
            <div className="w-full sm:w-2/3 text-gray-900 font-semibold text-sm">
                {value || 'N/A'}
            </div>
        </div>
    );
}
