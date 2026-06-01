import { Star, TrendingUp, Route, Calendar } from 'lucide-react';
import { Card } from '../ui/Card';
import { reliabilityLabel } from './OperatorHeader';

function StatCard({ icon: Icon, label, value, footer }) {
    return (
        <Card className="p-5 md:p-6 border border-gray-100 shadow-md bg-white rounded-2xl">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Icon size={22} strokeWidth={2} />
                </div>
                <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl md:text-3xl font-black text-dark leading-none">{value}</p>
                    {footer && (
                        <p className="text-xs text-gray-500 mt-2 font-medium">{footer}</p>
                    )}
                </div>
            </div>
        </Card>
    );
}

/**
 * Four summary stat cards below the operator hero banner.
 */
export default function OperatorStatCards({ operator }) {
    const routeCount = operator.routeDetails?.length ?? operator.routesServed?.length ?? 0;
    const tripCount = operator.scheduledTripCount ?? operator.upcomingTrips?.length ?? 0;
    const ratingValue = operator.rating != null ? Number(operator.rating).toFixed(1) : 'New';
    const reliabilityValue = reliabilityLabel(operator.reliabilityScore)
        ?? (operator.reliabilityScore != null ? `${operator.reliabilityScore}%` : '—');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                icon={Star}
                label="Rating"
                value={ratingValue}
                footer="Based on customer reviews"
            />
            <StatCard
                icon={TrendingUp}
                label="Reliability"
                value={reliabilityValue}
                footer="On-time performance"
            />
            <StatCard
                icon={Route}
                label="Routes"
                value={routeCount}
                footer="Active routes"
            />
            <StatCard
                icon={Calendar}
                label="Scheduled Trips"
                value={tripCount}
                footer="Upcoming trips"
            />
        </div>
    );
}
