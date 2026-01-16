import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Shield, TrendingUp, BookOpen, Building, Users } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../../lib/utils';

const REVENUE_DATA = [
    { name: 'Jun', revenue: 1500000 },
    { name: 'Jul', revenue: 2200000 },
    { name: 'Aug', revenue: 1800000 },
    { name: 'Sep', revenue: 2600000 },
    { name: 'Oct', revenue: 2100000 },
    { name: 'Nov', revenue: 2800000 },
];

const RECENT_DISPUTES = [
    { id: 1, title: 'Seat mismatch', user: 'Abebe Kebede', date: 'Nov 30, 2025', status: 'pending', statusColor: 'bg-yellow-100 text-yellow-700' },
    { id: 2, title: 'Refund request', user: 'Tigist Alemu', date: 'Nov 28, 2025', status: 'resolved', statusColor: 'bg-green-100 text-green-700' },
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
        { title: 'Active Operators', value: '2', icon: Building, color: 'bg-purple-500', bg: 'bg-purple-50' },
        { title: 'Active Users', value: '8,756', icon: Users, color: 'bg-orange-500', bg: 'bg-orange-50' },
        { title: 'Monthly Growth', value: '+18.4%', icon: TrendingUp, color: 'bg-teal-500', bg: 'bg-teal-50' },
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

            {/* Platform Revenue Analytics Chart */}
            <Card className="p-10 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2.5rem]">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Platform Revenue Analytics</h3>
                        <p className="text-gray-400 font-semibold text-xs mt-1">Monthly revenue breakdown across all operators</p>
                    </div>
                    <Button className="rounded-2xl h-12 px-6 flex items-center gap-2 bg-[#F8FAFC] text-gray-500 hover:bg-gray-100 border border-gray-100 font-bold transition-all">
                        <div className="w-5 h-5 flex items-center justify-center">
                            <TrendingUp size={16} className="rotate-90" />
                        </div>
                        Export Report
                    </Button>
                </div>
                <div className="h-[400px] w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={REVENUE_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 700 }}
                                dy={15}
                            />
                            <YAxis hide={true} />
                            <Tooltip
                                cursor={{ fill: '#F8FAFC' }}
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '12px 16px' }}
                                itemStyle={{ fontWeight: 700, color: '#1E293B', fontSize: '12px' }}
                            />
                            <Bar
                                dataKey="revenue"
                                fill="#0EA5E9"
                                radius={[6, 6, 6, 6]}
                                barSize={12}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Chart labels overlay simulated */}
                <div className="flex justify-between mt-6 px-2">
                    {REVENUE_DATA.map((d, i) => (
                        <div key={i} className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">{d.name}</div>
                    ))}
                </div>
            </Card>

            {/* Bottom Widgets: Disputes & Payments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Disputes */}
                <Card className="p-8 bg-white border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-[2rem]">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Disputes</h3>
                        <Button variant="ghost" className="text-primary text-xs font-bold hover:bg-primary/5 px-3 rounded-lg">View All</Button>
                    </div>
                    <div className="space-y-6">
                        {RECENT_DISPUTES.map((dispute) => (
                            <div key={dispute.id} className="flex justify-between items-start pt-6 border-t border-gray-50 first:border-0 first:pt-0">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{dispute.title}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{dispute.user} • {dispute.date}</p>
                                </div>
                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest", dispute.status === 'pending' ? "bg-orange-50 text-orange-600" : "bg-green-50 text-green-600")}>
                                    {dispute.status}
                                </span>
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
                            <div key={payment.id} className="flex justify-between items-start pt-6 border-t border-gray-50 first:border-0 first:pt-0">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-sm">{payment.amount}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{payment.user} • {payment.method}</p>
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
