import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bus, TrendingUp, Calendar, CreditCard, Ticket, ArrowRight, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useOperatorDashboard } from '../../hooks/useOperators';
import { useBookings } from '../../hooks/useBookings';

// Fallback chart data shown while loading
const FALLBACK_REVENUE = [
    { name: 'Mon', revenue: 12500 },
    { name: 'Tue', revenue: 15000 },
    { name: 'Wed', revenue: 18000 },
    { name: 'Thu', revenue: 14000 },
    { name: 'Fri', revenue: 22000 },
    { name: 'Sat', revenue: 28000 },
    { name: 'Sun', revenue: 25000 },
];

export default function OperatorOverview() {
    const { user } = useAuth();
    const operatorId = user?.operatorId ?? null;

    // GET /v1/operators/:id/dashboard
    const { data: dashData, isLoading: dashLoading } = useOperatorDashboard(operatorId);

    // GET /v1/bookings — recent bookings for this operator's trips
    const { data: bookingsResponse, isLoading: bookingsLoading } = useBookings(
        operatorId ? { limit: 5 } : {}
    );

    const recentBookings = (() => {
        const raw = Array.isArray(bookingsResponse)
            ? bookingsResponse
            : (bookingsResponse?.data ?? []);
        return raw.slice(0, 5).map(b => ({
            id:        b.id,
            passenger: b.travelers?.[0]?.fullName ?? '—',
            route:     `${b.trip?.from ?? b.trip?.route?.origin ?? ''} → ${b.trip?.to ?? b.trip?.route?.destination ?? ''}`,
            date:      b.trip?.departureTime ?? '—',
            amount:    `${(b.payment?.amount ?? b.trip?.price ?? 0).toLocaleString()} ETB`,
            status:    (b.status ?? 'pending').toLowerCase(),
        }));
    })();

    // Revenue chart data — backend may return dailyRevenue array
    const revenueData = dashData?.dailyRevenue ?? dashData?.weeklyRevenue ?? FALLBACK_REVENUE;

    // KPI values — use API data when available, show '—' while loading
    const kpis = [
        {
            title: 'Total Revenue',
            value: dashLoading ? '—' : (dashData?.totalRevenue?.toLocaleString() ?? '—'),
            unit: 'ETB',
            growth: dashData?.revenueGrowth ?? '+0%',
            icon: CreditCard,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            title: 'Active Bookings',
            value: dashLoading ? '—' : (dashData?.activeBookings ?? '—'),
            growth: dashData?.bookingsGrowth ?? '+0%',
            icon: Ticket,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            title: 'Scheduled Trips',
            value: dashLoading ? '—' : (dashData?.scheduledTrips ?? '—'),
            growth: dashData?.tripsGrowth ?? '+0%',
            icon: Bus,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
        },
        {
            title: 'Passengers',
            value: dashLoading ? '—' : (dashData?.totalPassengers?.toLocaleString() ?? '—'),
            growth: dashData?.passengersGrowth ?? '+0%',
            icon: Users,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="p-6 border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{kpi.title}</p>
                                <h3 className="text-2xl font-bold mt-1">
                                    {kpi.unit && <span className="text-sm text-gray-400 mr-1">{kpi.unit}</span>}
                                    {kpi.value}
                                </h3>
                            </div>
                            <div className={cn('p-3 rounded-xl', kpi.bg, kpi.color)}>
                                <kpi.icon size={22} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded',
                                String(kpi.growth).startsWith('+') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
                                {kpi.growth}
                            </span>
                            <span className="text-xs text-gray-400">from last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
                <Card className="lg:col-span-2 p-6 border-none shadow-sm flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="font-bold text-lg">Revenue Trend</h3>
                            <p className="text-sm text-gray-500">Weekly revenue performance</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/5">View Report</Button>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#0EA5E9', strokeWidth: 2, strokeDasharray: '5 5' }} />
                                <Area type="monotone" dataKey="revenue" stroke="#0EA5E9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Routes */}
                <Card className="p-6 border-none shadow-sm flex flex-col h-full bg-white text-gray-900 border border-gray-100">
                    <h3 className="font-bold text-lg mb-1">Top Routes</h3>
                    <p className="text-gray-500 text-sm mb-6">Highest occupancy lines</p>
                    <div className="space-y-6 flex-1">
                        {(dashData?.topRoutes ?? [
                            { name: 'Addis Ababa → Bahir Dar', occupancy: 92 },
                            { name: 'Hawassa → Addis Ababa',   occupancy: 85 },
                            { name: 'Addis Ababa → Dire Dawa', occupancy: 78 },
                        ]).map((route, i) => {
                            const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-orange-500'];
                            const textColors = ['text-emerald-400', 'text-blue-400', 'text-orange-400'];
                            return (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{route.name}</span>
                                        <span className={cn('font-bold', textColors[i % 3])}>{route.occupancy}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full', colors[i % 3])} style={{ width: `${route.occupancy}%` }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    <Button className="w-full bg-primary/10 hover:bg-primary/20 text-primary border-none mt-auto">
                        Manage Routes <ArrowRight size={16} className="ml-2" />
                    </Button>
                </Card>
            </div>

            {/* Recent Bookings */}
            <Card className="p-6 border-none shadow-sm overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-lg">Recent Bookings</h3>
                    <Button variant="ghost" size="sm">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="pb-3 font-medium pl-2">Booking ID</th>
                                <th className="pb-3 font-medium">Passenger</th>
                                <th className="pb-3 font-medium">Route</th>
                                <th className="pb-3 font-medium">Date</th>
                                <th className="pb-3 font-medium">Amount</th>
                                <th className="pb-3 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {(bookingsLoading ? [] : recentBookings).map(booking => (
                                <tr key={booking.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 pl-2 font-medium text-primary text-xs font-mono">{booking.id}</td>
                                    <td className="py-4 font-medium">{booking.passenger}</td>
                                    <td className="py-4 text-gray-500">{booking.route}</td>
                                    <td className="py-4 text-gray-500">{booking.date}</td>
                                    <td className="py-4 font-bold">{booking.amount}</td>
                                    <td className="py-4">
                                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-bold capitalize',
                                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700')}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {!bookingsLoading && recentBookings.length === 0 && (
                                <tr><td colSpan={6} className="py-8 text-center text-gray-400 text-sm">No recent bookings</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
