import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, TrendingUp, BookOpen, Building, Users, PieChart as PieIcon, MapPin } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { cn } from '../../lib/utils';

const REVENUE_DATA = [
    { name: 'Jun', revenue: 1500000 },
    { name: 'Jul', revenue: 2200000 },
    { name: 'Aug', revenue: 1800000 },
    { name: 'Sep', revenue: 2600000 },
    { name: 'Oct', revenue: 2100000 },
    { name: 'Nov', revenue: 2800000 },
];

const TRAFFIC_DATA = [
    { name: 'Mobile App', value: 45, color: '#3B82F6' },
    { name: 'Website', value: 35, color: '#10B981' },
    { name: 'Agent Portal', value: 20, color: '#F59E0B' },
];

const TOP_OPERATORS = [
    { id: 1, name: 'Selam Bus', revenue: 'ETB 1.2M', growth: '+12%', logo: '/images/selam_bus.jpg' },
    { id: 2, name: 'Sky Bus', revenue: 'ETB 950k', growth: '+8%', logo: '/images/sky_bus.jpg' },
    { id: 3, name: 'Golden Bus', revenue: 'ETB 620k', growth: '+15%', logo: '/images/abay_bus.jpg' },
];

const RECENT_PAYMENTS = [
    { id: 1, amount: 'ETB 1700', user: 'Abebe Kebede', method: 'Telebirr', status: 'completed', statusColor: 'bg-green-100 text-green-700' },
    { id: 2, amount: 'ETB 900', user: 'Tigist Alemu', method: 'CBE Birr', status: 'completed', statusColor: 'bg-green-100 text-green-700' },
    { id: 3, amount: 'ETB 2550', user: 'Dawit Haile', method: 'Chapa', status: 'pending', statusColor: 'bg-yellow-100 text-yellow-700' },
];

export default function AdminSystemOverview() {
    const kpis = [
        { title: 'Total Revenue', value: '2.8M', unit: 'ETB', icon: TrendingUp, color: 'bg-green-500', bg: 'bg-green-50' },
        { title: 'Total Bookings', value: '1,543', icon: BookOpen, color: 'bg-blue-500', bg: 'bg-blue-50' },
        { title: 'Active Operators', value: '12', icon: Building, color: 'bg-purple-500', bg: 'bg-purple-50' },
        { title: 'Active Users', value: '8,756', icon: Users, color: 'bg-orange-500', bg: 'bg-orange-50' },
        { title: 'Avg Occupancy', value: '78%', icon: Shield, color: 'bg-teal-500', bg: 'bg-teal-50' },
    ];

    return (
        <div className="space-y-8">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="p-6 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[1.5rem] flex flex-col justify-between hover:shadow-lg transition-all duration-300 group overflow-hidden relative">
                        <div className="relative z-10">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-white shadow-md transition-transform group-hover:scale-110 duration-300", kpi.color)}>
                                <kpi.icon size={20} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
                                {kpi.unit && <span className="text-xs font-semibold text-gray-400 mr-1">{kpi.unit}</span>}
                                {kpi.value}
                            </h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{kpi.title}</p>
                        </div>
                        {/* Decorative background circle */}
                        <div className={cn("absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700", kpi.bg)} />
                    </Card>
                ))}
            </div>

            {/* Main Content Grid: Revenue Chart + Side Widget */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Platform Revenue Analytics Chart (Takes 2/3 width) */}
                <Card className="lg:col-span-2 p-10 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem]">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Revenue</h3>
                            <p className="text-gray-400 font-semibold text-xs mt-1">Real-time financial performance overview</p>
                        </div>
                    </div>
                    <div className="h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: 0, bottom: 30 }}>
                                <defs>
                                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                    dy={15}
                                />
                                <YAxis hide={true} />
                                <Tooltip
                                    cursor={{ stroke: '#3B82F6', strokeWidth: 2 }}
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                    itemStyle={{ fontWeight: 700, color: '#1E293B', fontSize: '12px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3B82F6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#areaGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Side Widget: Traffic Source (Takes 1/3 width) */}
                <Card className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem] flex flex-col">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight mb-2">Traffic Sources</h3>
                    <p className="text-gray-400 font-semibold text-xs mb-8">User device and channel distribution</p>

                    <div className="flex-1 flex items-center justify-center relative">
                        <div className="w-48 h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={TRAFFIC_DATA}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {TRAFFIC_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold text-gray-900">8.7k</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Users</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-4">
                        {TRAFFIC_DATA.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm font-bold text-gray-700">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Bottom Widgets: Top Operators & Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Operators */}
                <Card className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Top Performing Operators</h3>
                        <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5 px-3 rounded-lg">View Leaderboard</Button>
                    </div>
                    <div className="space-y-6">
                        {TOP_OPERATORS.map((op, index) => (
                            <div key={op.id} className="flex justify-between items-center pt-6 border-t border-gray-50 first:border-0 first:pt-0 group hover:bg-gray-50/50 p-3 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-500 font-bold text-sm">
                                        #{index + 1}
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden border border-gray-100">
                                        <img src={op.logo} alt={op.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{op.name}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest text-green-500">{op.growth} this month</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="block font-bold text-gray-900 text-sm">{op.revenue}</span>
                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Revenue</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Payments */}
                <Card className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Payments</h3>
                        <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5 px-3 rounded-lg">View All</Button>
                    </div>
                    <div className="space-y-6">
                        {RECENT_PAYMENTS.map((payment) => (
                            <div key={payment.id} className="flex justify-between items-start pt-6 border-t border-gray-50 first:border-0 first:pt-0 group hover:bg-gray-50/50 p-2 rounded-xl transition-colors">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 font-bold text-xs shrink-0">
                                        $
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-primary transition-colors">{payment.amount}</h4>
                                        <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{payment.user} • {payment.method}</p>
                                    </div>
                                </div>
                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", payment.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600")}>
                                    {payment.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
