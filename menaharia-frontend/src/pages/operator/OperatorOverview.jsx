import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bus, TrendingUp, Calendar, CreditCard, Ticket, MoreHorizontal, ArrowRight, Activity, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../../lib/utils';

const REVENUE_DATA = [
    { name: 'Mon', revenue: 12500, sales: 45 },
    { name: 'Tue', revenue: 15000, sales: 52 },
    { name: 'Wed', revenue: 18000, sales: 61 },
    { name: 'Thu', revenue: 14000, sales: 48 },
    { name: 'Fri', revenue: 22000, sales: 75 },
    { name: 'Sat', revenue: 28000, sales: 90 },
    { name: 'Sun', revenue: 25000, sales: 85 },
];

const RECENT_BOOKINGS = [
    { id: 'MEN-BK-001', passenger: 'Abebe Kebede', route: 'Addis Ababa → Bahir Dar', date: 'Today, 08:00', seats: 2, amount: '1,700 ETB', status: 'confirmed' },
    { id: 'MEN-BK-002', passenger: 'Tigist Alemu', route: 'Addis Ababa → Hawassa', date: 'Today, 09:30', seats: 1, amount: '850 ETB', status: 'confirmed' },
    { id: 'MEN-BK-003', passenger: 'Dawit Haile', route: 'Bahir Dar → Addis Ababa', date: 'Tomorrow, 07:00', seats: 3, amount: '2,550 ETB', status: 'pending' },
];

export default function OperatorOverview() {
    const kpis = [
        { title: 'Total Revenue', value: '134,500', unit: 'ETB', growth: '+12.5%', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { title: 'Active Bookings', value: '456', growth: '+8.2%', icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
        { title: 'Scheduled Trips', value: '28', growth: '-2.4%', icon: Bus, color: 'text-orange-600', bg: 'bg-orange-50' },
        { title: 'Passengers', value: '1.2k', growth: '+5.7%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Dashboard Overview</h1>
                    <p className="text-gray-500">Welcome back, Selam Bus!</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="gap-2"><Calendar size={16} /> Dec 2025</Button>
                    <Button className="gap-2"><Activity size={16} /> Live Report</Button>
                </div>
            </div>

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
                            <div className={cn("p-3 rounded-xl", kpi.bg, kpi.color)}>
                                <kpi.icon size={22} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center gap-2">
                            <span className={cn("text-xs font-bold px-1.5 py-0.5 rounded",
                                kpi.growth.startsWith('+') ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                                {kpi.growth}
                            </span>
                            <span className="text-xs text-gray-400">from last month</span>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[400px]">
                {/* Revenue Trend Chart */}
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
                            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    cursor={{ stroke: '#0EA5E9', strokeWidth: 2, strokeDasharray: '5 5' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#0EA5E9"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Popular Routes / Quick Stats */}
                <Card className="p-6 border-none shadow-sm flex flex-col h-full bg-white text-gray-900 border border-t border-r border-l border-b border-gray-100">
                    <h3 className="font-bold text-lg mb-1">Top Routes</h3>
                    <p className="text-gray-500 text-sm mb-6">Highest occupancy lines</p>

                    <div className="space-y-6 flex-1">
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Addis Ababa → Bahir Dar</span>
                                <span className="text-emerald-400 font-bold">92%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '92%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Hawassa → Addis Ababa</span>
                                <span className="text-blue-400 font-bold">85%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 rounded-full" style={{ width: '85%' }}></div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="font-medium">Addis Ababa → Dire Dawa</span>
                                <span className="text-orange-400 font-bold">78%</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: '78%' }}></div>
                            </div>
                        </div>
                    </div>

                    <Button className="w-full bg-white/10 hover:bg-white/20 text-white border-none mt-auto">
                        Manage Routes <ArrowRight size={16} className="ml-2" />
                    </Button>
                </Card>
            </div>

            {/* Recent Bookings Table */}
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
                            {RECENT_BOOKINGS.map((booking) => (
                                <tr key={booking.id} className="hover:bg-gray-50/50">
                                    <td className="py-4 pl-2 font-medium text-primary">{booking.id}</td>
                                    <td className="py-4 font-medium">{booking.passenger}</td>
                                    <td className="py-4 text-gray-500">{booking.route}</td>
                                    <td className="py-4 text-gray-500">{booking.date}</td>
                                    <td className="py-4 font-bold">{booking.amount}</td>
                                    <td className="py-4">
                                        <span className={cn("px-2.5 py-1 rounded-full text-xs font-bold capitalize",
                                            booking.status === 'confirmed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700")}>
                                            {booking.status}
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
