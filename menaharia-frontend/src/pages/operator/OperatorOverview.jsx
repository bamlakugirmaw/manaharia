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
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';
import { tripOrigin, tripDest } from '../../lib/tripHelpers';

/** Platform fee deducted from each booking payment (5%). */
const PLATFORM_FEE_RATE = 0.05;

/** Net amount the operator receives after platform fee. */
function netAmount(gross) {
    return gross * (1 - PLATFORM_FEE_RATE);
}

export default function OperatorOverview() {
    const navigate = useNavigate();

    const {
        operatorId,
        bookings,
        bookingsQuery,
        trips,
        tripsQuery,
    } = useOperatorScope({ limit: 200 });

    const bookingsLoading = bookingsQuery.isLoading;
    const tripsLoading   = tripsQuery.isLoading;

    const { data: operatorRecord } = useOperator(operatorId);
    const operatorProfile = operatorRecord?.data ?? operatorRecord;

    const { data: recentReviews = [], isLoading: reviewsLoading } = useOperatorRatings({
        operatorId,
        limit: 5,
        enabled: !!operatorId,
    });
    const reviewAverage = averageFromRatings(recentReviews);
    const displayOperatorRating = operatorProfile?.rating ?? reviewAverage;

    // ── Compute KPIs from real data ───────────────────────────────────────────
    const stats = useMemo(() => {
        const confirmedBookings = (bookings ?? []).filter((b) => {
            const bs = (b.status ?? '').toUpperCase();
            const payment = b.payment ?? (Array.isArray(b.payments) ? b.payments[0] : null);
            const ps = (payment?.status ?? '').toUpperCase();
            return bs === 'CONFIRMED'
                || ps === 'SUCCESS'
                || ps === 'COMPLETED'
                || ps === 'PAID';
        });

        // Total gross revenue from confirmed bookings
        const grossRevenue = confirmedBookings.reduce((sum, b) => {
            const amt = b.payment?.amount ?? b.totalAmount ?? b.trip?.price ?? 0;
            return sum + Number(amt);
        }, 0);

        // Net revenue after 5% platform fee
        const netRevenue = netAmount(grossRevenue);

        // Active (CONFIRMED) booking count
        const activeBookings = confirmedBookings.length;

        // Scheduled trips — count all trips owned by this operator
        const scheduledTrips = (trips ?? []).length;

        // Unique passengers from confirmed bookings
        const passengerSet = new Set();
        for (const b of confirmedBookings) {
            const travelers = b.travelers ?? b.bookingTravelers ?? [];
            for (const t of travelers) {
                if (t.id) passengerSet.add(t.id);
                else if (t.phone) passengerSet.add(t.phone);
            }
            // At minimum count the booking itself as 1 passenger
            if (passengerSet.size === 0 || travelers.length === 0) {
                passengerSet.add(b.id);
            }
        }
        const totalPassengers = passengerSet.size || activeBookings;

        // Revenue trend: group confirmed bookings by week day label
        const dayMap = {};
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        for (const b of confirmedBookings) {
            const d = new Date(b.createdAt || b.trip?.date || Date.now());
            const label = dayLabels[d.getDay()];
            const amt = b.payment?.amount ?? b.totalAmount ?? b.trip?.price ?? 0;
            dayMap[label] = (dayMap[label] ?? 0) + netAmount(Number(amt));
        }
        // Only show days that have data; if none, return empty
        const revenueData = Object.entries(dayMap).map(([name, revenue]) => ({
            name,
            revenue: Math.round(revenue),
        }));

        // Top routes by booking count
        const routeMap = {};
        for (const b of confirmedBookings) {
            const from = b.trip ? tripOrigin(b.trip) : '';
            const to   = b.trip ? tripDest(b.trip) : '';
            if (!from || !to) continue;
            const key = `${from} → ${to}`;
            routeMap[key] = (routeMap[key] ?? 0) + 1;
        }
        const totalForRoutes = Object.values(routeMap).reduce((s, n) => s + n, 0) || 1;
        const topRoutes = Object.entries(routeMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([name, count]) => ({
                name,
                occupancy: Math.round((count / totalForRoutes) * 100),
            }));

        // Recent bookings for table (last 5)
        const recentBookings = confirmedBookings
            .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
            .slice(0, 5)
            .map((b) => {
                const gross = b.payment?.amount ?? b.totalAmount ?? b.trip?.price ?? 0;
                return {
                    id:        b.id,
                    passenger: b.travelers?.[0]?.fullName ?? b.bookingTravelers?.[0]?.fullName ?? '—',
                    route:     b.trip
                        ? `${tripOrigin(b.trip)} → ${tripDest(b.trip)}`
                        : b.bookingReference ?? '—',
                    date:      b.createdAt
                        ? new Date(b.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—',
                    gross:     Number(gross),
                    net:       netAmount(Number(gross)),
                    status:    (b.status ?? 'pending').toLowerCase(),
                    reference: b.bookingReference ?? b.id?.slice(0, 8),
                };
            });

        return { netRevenue, grossRevenue, activeBookings, scheduledTrips, totalPassengers, revenueData, topRoutes, recentBookings };
    }, [bookings, trips]);

    const loading = bookingsLoading || tripsLoading;

    const kpis = [
        {
            title:    'Total Revenue',
            value:    loading ? '—' : `ETB ${Math.round(stats.netRevenue).toLocaleString()}`,
            subtitle: loading ? '' : `Gross ETB ${Math.round(stats.grossRevenue).toLocaleString()} · 5% fee deducted`,
            icon:     CreditCard,
            color:    'text-emerald-600',
            bg:       'bg-emerald-50',
        },
        {
            title:    'Active Bookings',
            value:    loading ? '—' : stats.activeBookings.toString(),
            subtitle: 'Confirmed & paid',
            icon:     Ticket,
            color:    'text-blue-600',
            bg:       'bg-blue-50',
        },
        {
            title:    'Scheduled Trips',
            value:    loading ? '—' : stats.scheduledTrips.toString(),
            subtitle: 'Upcoming departures',
            icon:     Bus,
            color:    'text-orange-600',
            bg:       'bg-orange-50',
        },
        {
            title:    'Passengers',
            value:    loading ? '—' : stats.totalPassengers.toString(),
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
                                {kpi.subtitle && (
                                    <p className="text-[11px] text-gray-400 mt-1 leading-tight">{kpi.subtitle}</p>
                                )}
                            </div>
                            <div className={cn('p-3 rounded-xl shrink-0', kpi.bg, kpi.color)}>
                                <kpi.icon size={22} />
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts — Revenue Trend full width */}
            <div className="h-[400px]">
                <Card className="p-6 border-none shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Revenue Trend</h3>
                            <p className="text-sm text-gray-500">Net weekly revenue (after 5% fee)</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/5"
                            onClick={() => navigate('/operator/reports')}
                        >
                            View Report
                        </Button>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        {stats.revenueData.length === 0 && !loading ? (
                            <p className="text-sm text-gray-400 text-center py-16">
                                No revenue data yet. Revenue appears once bookings are confirmed.
                            </p>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                            <StarRatingInput
                                value={displayOperatorRating != null ? Math.round(displayOperatorRating) : 0}
                                disabled
                                size={16}
                            />
                            <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-wide">
                                Platform average
                            </p>
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
                                    {r.comment && (
                                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{r.comment}</p>
                                    )}
                                </div>
                                <StarRatingInput value={r.rating} disabled size={14} />
                            </li>
                        ))}
                    </ul>
                )}
            </Card>

            {/* Recent Bookings */}
            <Card className="p-6 border-none shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="font-bold text-lg">Recent Confirmed Bookings</h3>
                        <p className="text-xs text-gray-400 mt-0.5">Net amounts shown after 5% platform fee</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/operator/bookings')}>
                        View All
                    </Button>
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
                            {loading ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">Loading…</td></tr>
                            ) : stats.recentBookings.length === 0 ? (
                                <tr><td colSpan={7} className="py-8 text-center text-gray-400 text-sm">No confirmed bookings yet.</td></tr>
                            ) : stats.recentBookings.map((b) => (
                                <tr key={b.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 pl-2 font-mono text-xs text-primary">{b.reference}</td>
                                    <td className="py-4 font-medium">{b.passenger}</td>
                                    <td className="py-4 text-gray-500 text-xs">{b.route}</td>
                                    <td className="py-4 text-gray-500 text-xs">{b.date}</td>
                                    <td className="py-4 text-gray-500 text-xs">ETB {b.gross.toLocaleString()}</td>
                                    <td className="py-4 font-bold text-emerald-700 text-xs">
                                        ETB {Math.round(b.net).toLocaleString()}
                                    </td>
                                    <td className="py-4">
                                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                            Confirmed
                                        </span>
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
