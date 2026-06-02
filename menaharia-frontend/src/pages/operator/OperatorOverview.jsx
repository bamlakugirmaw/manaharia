import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bus, CreditCard, Ticket, Users, Star } from 'lucide-react';
import { useOperatorRatings } from '../../hooks/useOperatorRatings';
import StarRatingInput from '../../components/ratings/StarRatingInput';
import { averageFromRatings } from '../../lib/ratingHelpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { useOperator } from '../../hooks/useOperators';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import { useOperatorPayments } from '../../hooks/useOperatorPayments';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';

export default function OperatorOverview() {
    const navigate = useNavigate();

    // operatorId from scope (lightweight call)
    const { operatorId } = useOperatorScope({ limit: 10 });

    const {
        rows: paymentRows,
        totalNet,
        totalGross,
        activeBookings,
        scheduledTrips,
        revenueData,
        isLoading,
    } = useOperatorPayments();

    const { data: operatorRecord } = useOperator(operatorId);
    const operatorProfile = operatorRecord?.data ?? operatorRecord;

    const { data: recentReviews = [], isLoading: reviewsLoading } = useOperatorRatings({
        operatorId,
        limit: 5,
        enabled: !!operatorId,
    });
    const reviewAverage = averageFromRatings(recentReviews);
    const displayOperatorRating = operatorProfile?.rating ?? reviewAverage;

    // Recent 5 completed payment rows for the table
    const recentRows = useMemo(
        () => paymentRows.filter((r) => r.status === 'completed').slice(0, 5),
        [paymentRows],
    );

    const kpis = [
        {
            title:    'Total Revenue',
            value:    isLoading ? '—' : `ETB ${Math.round(totalNet).toLocaleString()}`,
            subtitle: isLoading ? '' : `Gross ETB ${Math.round(totalGross).toLocaleString()} · 5% fee deducted`,
            icon:     CreditCard,
            color:    'text-emerald-600',
            bg:       'bg-emerald-50',
        },
        {
            title:    'Active Bookings',
            value:    isLoading ? '—' : activeBookings.toString(),
            subtitle: 'Confirmed & paid',
            icon:     Ticket,
            color:    'text-blue-600',
            bg:       'bg-blue-50',
        },
        {
            title:    'Scheduled Trips',
            value:    isLoading ? '—' : scheduledTrips.toString(),
            subtitle: 'Upcoming departures',
            icon:     Bus,
            color:    'text-orange-600',
            bg:       'bg-orange-50',
        },
        {
            title:    'Passengers',
            value:    isLoading ? '—' : activeBookings.toString(),
            subtitle: 'From confirmed bookings',
            icon:     Users,
            color:    'text-purple-600',
            bg:       'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-8">
            <OperatorScopeBanner />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <div className="min-w-0 flex-1 pr-2">
                                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                <h3 className="text-2xl font-bold mt-1 tabular-nums">{kpi.value}</h3>
                                {kpi.subtitle && <p className="text-[11px] text-gray-400 mt-1 leading-tight">{kpi.subtitle}</p>}
                            </div>
                            <div className={cn('p-3 rounded-xl shrink-0', kpi.bg, kpi.color)}>
                                <kpi.icon size={22} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Revenue Trend */}
            <div className="h-[400px]">
                <Card className="p-6 border-none shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Revenue Trend</h3>
                            <p className="text-sm text-gray-500">Net weekly revenue (after 5% fee)</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5"
                            onClick={() => navigate('/operator/reports')}>
                            View Report
                        </Button>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        {revenueData.length === 0 && !isLoading ? (
                            <p className="text-sm text-gray-400 text-center py-16">
                                No revenue data yet. Revenue appears once bookings are confirmed.
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%"  stopColor="#0EA5E9" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }}
                                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                                        cursor={{ stroke: '#0EA5E9', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        formatter={(value) => [`ETB ${value.toLocaleString()}`, 'Net Revenue']}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>
            </div>

            {/* Customer ratings */}
            <Card className="p-6 border-none shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                            Customer ratings
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">Feedback from travellers on your service</p>
                    </div>
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                        <span className="text-3xl font-black text-gray-900 tabular-nums">
                            {displayOperatorRating != null ? Number(displayOperatorRating).toFixed(1) : '—'}
                        </span>
                        <div>
                            <StarRatingInput value={displayOperatorRating != null ? Math.round(displayOperatorRating) : 0} disabled size={16} />
                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">Platform average</p>
                        </div>
                    </div>
                </div>
                {reviewsLoading ? (
                    <p className="text-sm text-gray-400 text-center py-6">Loading reviews…</p>
                ) : recentReviews.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-6">
                        No reviews yet. Ratings appear after travellers complete paid trips.
                    </p>
                ) : (
                    <ul className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        {recentReviews.map((r) => (
                            <li key={r.id} className="px-5 py-4 flex items-start justify-between gap-4 bg-white">
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-gray-900">{r.reviewerName}</p>
                                    {r.comment && <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</p>}
                                </div>
                                <StarRatingInput value={r.rating} disabled size={14} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            {/* Recent Confirmed Payments */}
            <Card className="p-6 border-none shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Recent Confirmed Bookings</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Net amounts shown after 5% platform fee</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/operator/reports')}>View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="pb-3 font-medium pl-2">Reference</th>
                                <th className="pb-3 font-medium">Passenger</th>
                                <th className="pb-3 font-medium">Route</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium">Gross</th>
                                <th className="pb-3 font-medium text-emerald-700">Net (−5%)</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Loading…</td></tr>
                            ) : recentRows.length === 0 ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">No confirmed bookings yet.</td></tr>
                            ) : recentRows.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 pl-2 font-mono text-xs text-primary">{r.reference}</td>
                                    <td className="py-4 font-medium text-sm">
                                        {r._loadingUser
                                            ? <span className="inline-block w-20 h-3 bg-gray-200 rounded animate-pulse" />
                                            : r.user}
                                    </td>
                                    <td className="py-4 text-gray-500 text-xs">{r.route}</td>
                                    <td className="py-4 text-gray-500 text-xs">{r.dateDisplay}</td>
                                    <td className="py-4 text-gray-500 text-xs">ETB {r.gross.toLocaleString()}</td>
                                    <td className="py-4 font-bold text-emerald-700 text-xs">ETB {Math.round(r.net).toLocaleString()}</td>
                                    <td className="py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">Confirmed</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
