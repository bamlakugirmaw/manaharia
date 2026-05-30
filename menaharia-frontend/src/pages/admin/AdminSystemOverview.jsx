import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, TrendingUp, BookOpen, Building, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import { useOperators } from '../../hooks/useOperators';

/**
 * Real backend dashboard shape (GET /v1/admin/dashboard):
 * {
 *   users: number,
 *   operators: number,
 *   buses: number,
 *   routes: number,
 *   trips: number,
 *   bookings: { pending, confirmed, cancelled },
 *   payments: { successful, revenue },
 *   tripsByStatus: { completed, cancelled },
 *   seats: { reserved, booked }
 * }
 */

const FALLBACK_REVENUE = [
    { name: 'Jun', revenue: 0 },
    { name: 'Jul', revenue: 0 },
    { name: 'Aug', revenue: 0 },
    { name: 'Sep', revenue: 0 },
    { name: 'Oct', revenue: 0 },
    { name: 'Nov', revenue: 0 },
];

export default function AdminSystemOverview() {
    const { data: dash, isLoading } = useAdminDashboard();
    const { data: operators = [] } = useOperators({ limit: 3 });

    // Total bookings = pending + confirmed + cancelled
    const totalBookings = dash
        ? (dash.bookings?.pending ?? 0) + (dash.bookings?.confirmed ?? 0) + (dash.bookings?.cancelled ?? 0)
        : null;

    // Revenue from payments
    const totalRevenue = dash?.payments?.revenue ?? null;

    const kpis = [
        {
            title: 'Total Revenue',
            value: isLoading ? '—' : totalRevenue !== null
                ? totalRevenue >= 1_000_000
                    ? `${(totalRevenue / 1_000_000).toFixed(1)}M`
                    : totalRevenue.toLocaleString()
                : '0',
            unit: 'ETB',
            icon: TrendingUp,
            color: 'bg-green-500',
            bg: 'bg-green-50',
        },
        {
            title: 'Total Bookings',
            value: isLoading ? '—' : (totalBookings?.toLocaleString() ?? '0'),
            icon: BookOpen,
            color: 'bg-blue-500',
            bg: 'bg-blue-50',
        },
        {
            title: 'Operators',
            value: isLoading ? '—' : (dash?.operators?.toLocaleString() ?? '0'),
            icon: Building,
            color: 'bg-purple-500',
            bg: 'bg-purple-50',
        },
        {
            title: 'Users',
            value: isLoading ? '—' : (dash?.users?.toLocaleString() ?? '0'),
            icon: Users,
            color: 'bg-orange-500',
            bg: 'bg-orange-50',
        },
        {
            title: 'Active Trips',
            value: isLoading ? '—' : (dash?.trips?.toLocaleString() ?? '0'),
            icon: Shield,
            color: 'bg-teal-500',
            bg: 'bg-teal-50',
        },
    ];

    // Build a simple revenue chart from available data
    // Backend doesn't return time-series yet — show a summary bar instead
    const revenueData = dash
        ? [
            { name: 'Pending',   revenue: dash.bookings?.pending   ?? 0 },
            { name: 'Confirmed', revenue: dash.bookings?.confirmed  ?? 0 },
            { name: 'Cancelled', revenue: dash.bookings?.cancelled  ?? 0 },
          ]
        : FALLBACK_REVENUE;

    // Top operators — already an array from useOperators (normalised in hook)
    const topOperators = Array.isArray(operators) ? operators.slice(0, 3) : [];

    return (
        <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="p-6 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[1.5rem] flex flex-col justify-between hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                        <div className="relative z-10">
                            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white shadow-md transition-transform group-hover:scale-110 duration-300', kpi.color)}>
                                <kpi.icon size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                                {kpi.unit && <span className="text-xs font-semibold text-gray-400 mr-1">{kpi.unit}</span>}
                                {kpi.value}
                            </h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{kpi.title}</p>
                        </div>
                        <div className={cn('absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700', kpi.bg)} />
                    </Card>
                ))}
            </div>

            {/* Bookings Breakdown Chart */}
            <Card className="p-10 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem]">
                <div className="mb-10">
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Bookings Overview</h3>
                    <p className="text-gray-400 font-semibold text-xs mt-1">Current booking status breakdown</p>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                            <defs>
                                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }} dy={15} />
                            <YAxis hide />
                            <Tooltip
                                cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                itemStyle={{ fontWeight: 700, color: '#1E293B', fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="revenue" name="Bookings" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#areaGradient)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Summary stats row */}
                {dash && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-gray-50">
                        {[
                            { label: 'Buses',  value: dash.buses  ?? 0 },
                            { label: 'Routes', value: dash.routes ?? 0 },
                            { label: 'Seats Reserved', value: dash.seats?.reserved ?? 0 },
                            { label: 'Seats Booked',   value: dash.seats?.booked   ?? 0 },
                        ].map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-black text-gray-900">{s.value.toLocaleString()}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                )}
            </Card>

            {/* Top Operators */}
            <Card className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem]">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Operators</h3>
                    <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5 px-3 rounded-lg">View All</Button>
                </div>

                {topOperators.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Building size={40} className="mx-auto mb-4 opacity-30" />
                        <p className="font-bold">No operators registered yet</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {topOperators.map((op, index) => (
                            <div key={op.id ?? index} className="flex justify-between items-center pt-6 border-t border-gray-50 first:border-0 first:pt-0 group hover:bg-gray-50/50 p-3 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-100 flex items-center justify-center">
                                        {op.logo
                                            ? <img src={op.logo} alt={op.name ?? op.companyName} className="w-full h-full object-cover" />
                                            : <Building size={20} className="text-gray-400" />
                                        }
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{op.name ?? op.companyName ?? '—'}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest">
                                            {op.status ?? 'Active'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900 text-sm">
                                        {op.rating ? `★ ${op.rating}` : '—'}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rating</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
}
