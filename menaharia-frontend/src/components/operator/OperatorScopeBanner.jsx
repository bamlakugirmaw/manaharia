import { AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function OperatorScopeBanner({ message }) {
    const { user } = useAuth();
    if (user?.role !== 'operator' || user?.operatorId) return null;

    return (
        <div className="mb-6 p-4 rounded-2xl border border-amber-200 bg-amber-50 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
                <p className="text-sm font-bold text-amber-900">Operator profile not linked</p>
                <p className="text-sm text-amber-800 mt-1 leading-relaxed">
                    {message
                        ?? 'Your login is not matched to a bus operator company (email/phone must match the operator record). You cannot view fleet or bookings until this is fixed.'}
                </p>
            </div>
        </div>
    );
}
