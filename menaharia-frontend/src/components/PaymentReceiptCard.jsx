import { Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

const METHOD_LABEL = { TELEBIRR: 'Telebirr', SANTIM: 'Santim', CHAPA: 'Chapa' };

function Row({ label, value, mono }) {
    if (!value) return null;
    return (
        <div className="flex justify-between gap-4 text-sm">
            <span className="text-gray-500 shrink-0">{label}</span>
            <span className={cn('font-bold text-gray-900 text-right break-all', mono && 'font-mono text-xs')}>
                {value}
            </span>
        </div>
    );
}

/**
 * Displays a persisted Chapa / gateway payment receipt.
 * @param {{ receipt: object, compact?: boolean, className?: string }} props
 */
export default function PaymentReceiptCard({ receipt, compact = false, className = '' }) {
    if (!receipt) return null;

    const method = METHOD_LABEL[receipt.method] ?? receipt.method ?? 'Chapa';
    const paidAt = receipt.paidAt
        ? new Date(receipt.paidAt).toLocaleString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
        })
        : null;

    return (
        <div className={cn(
            'rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-5',
            className,
        )}>
            <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-900">Payment Receipt</p>
                    <p className="text-[10px] text-emerald-600 font-semibold uppercase tracking-wide">
                        {receipt.status === 'SUCCESS' ? 'Paid via Chapa' : receipt.status}
                    </p>
                </div>
            </div>

            <div className={cn('space-y-2.5', compact && 'text-xs')}>
                <Row label="Amount" value={receipt.amount != null ? `ETB ${Number(receipt.amount).toLocaleString()}` : null} />
                <Row label="Method" value={method} />
                <Row label="Booking ref" value={receipt.bookingReference} mono />
                <Row label="Gateway ref" value={receipt.gatewayReference} mono />
                <Row label="Transaction" value={receipt.transactionId} mono />
                {!compact && paidAt && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 pt-1">
                        <Calendar size={12} />
                        {paidAt}
                    </div>
                )}
            </div>

            {!compact && (
                <p className="text-[10px] text-gray-400 mt-4">
                    Saved on this device. View anytime from My Bookings or Payment History.
                </p>
            )}
        </div>
    );
}
