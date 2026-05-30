import React, { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, TrendingDown, DollarSign, Calendar, PieChart, BarChart as BarChartIcon } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';
import { useOperatorDashboard } from '../../hooks/useOperators';
import { useBookings } from '../../hooks/useBookings';

export default function OperatorRevenue() {
    const { user } = useAuth();
    const operatorId = user?.operatorId ?? null;

    // GET /v1/operators/:id/dashboard
    const { data: dash, isLoading: dashLoading } = useOperatorDashboard(operatorId);

    // GET /v1/bookings — derive route analytics client-side
    const { data: bookings = [] } = useBookings({ limit: 500 });

    // ── KPI values from dashboard ─────────────────────────────────────────────
    const totalRevenue   = dash?.totalRevenue   ?? dash?.payments?.revenue ?? 0;
    const activeBookings = dash?.activeBookings  ?? 0;
    const scheduledTrips = dash?.scheduledTrips  ?? dash?.trips ?? 0;
    const totalPassengers = dash?.totalPassengers ?? 0;

    // ── Top routes derived from bookings ──────────────────────────────────────
    const topRoutes = useMemo(() => {
        const map = {};
        bookings.forEach(b => {
            const from = b.trip?.from ?? b.trip?.route?.origin ?? '';
            const to   = b.trip?.to   ?? b.trip?.route?.destination ?? '';
            if (!from || !to) return;
            const key = `${from} - ${to}`;
            if (!map[key]) map[key] = { name: key, revenue: 0, trips: 0 };
            map[key].trips++;
            map[key].revenue += b.payment?.amount ?? b.trip?.price ?? 0;
        });
        return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, 4);
    }, [bookings]);

    // ── Chart data — group confirmed bookings by month ────────────────────────
    const monthlyData = useMemo(() => {
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        const map = {};
        months.forEach(m => { map[m] = 0; });
        bookings.forEach(b => {
            if (!b.createdAt) return;
            const m = months[new Date(b.createdAt).getMonth()];
            map[m] += b.payment?.amount ?? 0;
        });
        // Return last 6 months with data
        const now = new Date();
        return Array.from({ length: 6 }, (_, i) => {
            const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
            const name = months[d.getMonth()];
            return { month: name, value: Math.round((map[name] ?? 0) / 1000) }; // in thousands
        });
    }, [bookings]);

    const maxRoute = topRoutes[0]?.revenue ?? 1;

    const fmt = (n) => n >= 1_000_000
        ? `ETB ${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
        ? `ETB ${(n / 1_000).toFixed(0)}K`
        : `ETB ${n}`;

    return (
        <div className="space-y-8">
            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <div className="flex flex-col">
                        <span className="text-blue-100 text-sm font-medium">Total Revenue</span>
                        <div className="text-3xl font-bold mt-2">{dashLoading ? '—' : fmt(totalRevenue)}</div>
                        <div className="flex items-center gap-1 mt-4 text-blue-100 text-sm">
                            <TrendingUp size={16} />
                            <span>All time earnings</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Active Bookings</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">{dashLoading ? '—' : activeBookings.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600"><DollarSign size={20} /></div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-green-600 text-sm font-medium">
                        <TrendingUp size={16} />
                        <span>Currently active</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Scheduled Trips</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">{dashLoading ? '—' : scheduledTrips.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600"><BarChartIcon size={20} /></div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-gray-500 text-sm font-medium">
                        <Calendar size={16} />
                        <span>Upcoming trips</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Total Passengers</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">{dashLoading ? '—' : totalPassengers.toLocaleString()}</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><PieChart size={20} /></div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-gray-500 text-sm">
                        <span>All time passengers</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart */}
                <Card className="col-span-1 lg:col-span-2 p-6 border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Revenue Trend (6 Months)</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                            <Calendar size={14} /> Last 6 Months
                        </div>
                    </div>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="month" scale="band" />
                                <YAxis />
                                <Tooltip formatter={(v) => [`ETB ${v}K`, 'Revenue']} />
                                <Bar dataKey="value" barSize={20} fill="#413ea0" />
                                <Line type="monotone" dataKey="value" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Performing Routes */}
                <Card className="p-6 border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Top Performing Routes</h3>
                    {topRoutes.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">No booking data yet</div>
                    ) : (
                        <div className="space-y-6">
                            {topRoutes.map((route, index) => {
                                const pct = Math.round((route.revenue / maxRoute) * 100);
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm truncate max-w-[160px]">{route.name}</span>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded shrink-0">{pct}% Fill Rate</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>{route.trips} Trips</span>
                                            <span>ETB {route.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                            <div className="bg-primary h-full rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
