import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Bus, TrendingUp, Calendar, CreditCard, Ticket, MoreHorizontal } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { cn } from '../../lib/utils';

const REVENUE_DATA = [
    { name: 'Jun', revenue: 150000 },
    { name: 'Jul', revenue: 220000 },
    { name: 'Aug', revenue: 180000 },
    { name: 'Sep', revenue: 260000 },
    { name: 'Oct', revenue: 210000 },
    { name: 'Nov', revenue: 280000 },
];

const RECENT_BOOKINGS = [
    { id: 'MEN-2025-12-15-A3B4', passenger: 'Abebe Kebede', route: 'Addis Ababa → Bahir Dar', date: 'Dec 15, 2025', seats: 2, amount: 'ETB 1700', status: 'confirmed' },
    { id: 'MEN-2025-12-15-B6C6', passenger: 'Tigist Alemu', route: 'Addis Ababa → Bahir Dar', date: 'Dec 15, 2025', seats: 1, amount: 'ETB 850', status: 'confirmed' },
    { id: 'MEN-2025-12-20-X1Y2', passenger: 'Dawit Haile', route: 'Bahir Dar → Addis Ababa', date: 'Dec 20, 2025', seats: 3, amount: 'ETB 2550', status: 'pending' },
];

export default function OperatorOverview() {
    const kpis = [
        { title: 'Bookings Today', value: '156', growth: '+12%', icon: Ticket, color: 'bg-blue-500', bg: 'bg-blue-50', iconColor: 'text-blue-500' },
        { title: 'Revenue Today', value: '89K', unit: 'ETB', growth: '+8%', icon: CreditCard, color: 'bg-emerald-500', bg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
        { title: 'Upcoming Trips', value: '24', icon: Calendar, color: 'bg-purple-500', bg: 'bg-purple-50', iconColor: 'text-purple-500' },
        { title: 'Active Buses', value: '12', icon: Bus, color: 'bg-orange-500', bg: 'bg-orange-50', iconColor: 'text-orange-500' },
    ];

    const trips = [
        { from: 'Addis Ababa', to: 'Bahir Dar', date: 'Dec 15, 2025', time: '08:00', seats: '28 / 40', revenue: 'ETB 23,800', load: 70 },
        { from: 'Addis Ababa', to: 'Bahir Dar', date: 'Dec 15, 2025', time: '14:00', seats: '35 / 45', revenue: 'ETB 22,750', load: 78 },
    ];

    return (
        <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => (
                    <Card key={idx} className="p-5 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="flex justify-between items-start relative z-10">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110", kpi.color)}>
                                <kpi.icon size={20} />
                            </div>
                            {kpi.growth && (
                                <div className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                                    {kpi.growth}
                                </div>
                            )}
                        </div>
                        <div className="mt-3 relative z-10">
                            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                                {kpi.unit && <span className="text-xs font-semibold text-gray-400 mr-1">{kpi.unit}</span>}
                                {kpi.value}
                            </h3>
                            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mt-0.5">{kpi.title}</p>
                        </div>
                        <div className={cn("absolute -right-3 -bottom-3 w-20 h-20 rounded-full opacity-5 group-hover:scale-150 transition-transform duration-700", kpi.bg)} />
                    </Card>
                ))}
            </div>

            {/* Middle Section: Analytics & Occupancy */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Analytics */}
                <Card className="lg:col-span-2 p-6 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 tracking-tight">Revenue Analytics</h3>
                            <p className="text-gray-400 font-semibold text-xs mt-1">Monthly performance overview</p>
                        </div>
                        <div className="text-right">
                            <div className="bg-sky-50 text-sky-600 px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1.5 mb-2 h-6">
                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                                Revenue (ETB)
                            </div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</div>
                            <div className="text-lg font-bold text-gray-900 leading-none">ETB 943K</div>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={REVENUE_DATA}>
                                <CartesianGrid vertical={false} stroke="#F1F5F9" strokeDasharray="0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 600 }} dy={10} />
                                <YAxis hide={true} />
                                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }} />
                                <Bar dataKey="revenue" fill="#0EA5E9" radius={[4, 4, 4, 4]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Fleet Occupancy */}
                <Card className="p-6 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6">Fleet Occupancy</h3>
                    <div className="flex-1 flex flex-col items-center justify-center">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray={439.6} strokeDashoffset={439.6 * (1 - 0.78)} className="text-sky-500" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-4xl font-bold text-gray-900">78%</span>
                                <span className="text-gray-400 font-bold text-[10px] uppercase">Average</span>
                            </div>
                        </div>
                        <div className="w-full mt-8 space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold">Booked Seats</span>
                                <span className="text-gray-900 font-bold">563</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold">Available Seats</span>
                                <span className="text-gray-900 font-bold">157</span>
                            </div>
                            <div className="border-t border-gray-50 pt-3 flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-semibold">Total Capacity</span>
                                <span className="text-gray-900 font-bold">720</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Today's Trip Performance */}
            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Today's Trip Performance</h3>
                    <div className="flex gap-3 text-[10px] font-bold text-gray-400 uppercase tracking-widest pb-1">
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-sky-500" /> Booked</div>
                        <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-gray-100" /> Available</div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trips.map((trip, idx) => (
                        <Card key={idx} className="p-6 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                            <div className="flex justify-between items-start mb-5">
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900">{trip.from} → {trip.to}</h4>
                                    <div className="flex gap-3 text-gray-400 font-semibold text-xs mt-1">
                                        <div className="flex items-center gap-1.5"><Calendar size={12} /> {trip.date}</div>
                                        <div className="flex items-center gap-1.5">Reg. Time: {trip.time}</div>
                                    </div>
                                </div>
                                <div className="w-12 h-12 rounded-full border-4 border-gray-50 flex items-center justify-center relative">
                                    <svg className="absolute w-full h-full transform -rotate-90">
                                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 * (1 - trip.load / 100)} className="text-sky-500" strokeLinecap="round" />
                                    </svg>
                                    <span className="text-[10px] font-bold text-gray-900">{trip.load}%</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="h-2 bg-gray-50 rounded-full overflow-hidden flex">
                                    <div className="bg-sky-500 h-full rounded-full" style={{ width: `${trip.load}%` }} />
                                </div>
                                <div className="flex justify-between items-center mt-3">
                                    <div className="flex items-center gap-1.5 text-gray-400 font-semibold text-xs transition-colors group-hover:text-sky-600">
                                        <div className="p-1 bg-gray-50 rounded-md"><TrendingUp size={14} /></div>
                                        {trip.seats} seats
                                    </div>
                                    <div className="text-lg font-bold text-sky-600">{trip.revenue}</div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Bookings */}
            <Card className="p-8 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold text-gray-900 tracking-tight">Recent Bookings</h3>
                    <Button variant="ghost" className="text-sky-500 font-bold text-xs hover:bg-sky-50 px-4 rounded-xl h-10">View All</Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-50">
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Booking ID</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Passenger</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Route</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Date</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Seats</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Amount</th>
                                <th className="pb-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {RECENT_BOOKINGS.map((booking, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 font-semibold text-gray-400 text-xs">{booking.id}</td>
                                    <td className="py-4 font-bold text-gray-900 text-sm">{booking.passenger}</td>
                                    <td className="py-4 font-semibold text-gray-500 text-xs">{booking.route}</td>
                                    <td className="py-4 font-semibold text-gray-500 text-xs">{booking.date}</td>
                                    <td className="py-4 font-bold text-gray-900 text-sm">{booking.seats}</td>
                                    <td className="py-4 font-bold text-gray-900 text-sm">{booking.amount}</td>
                                    <td className="py-4">
                                        <span className={cn("px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
                                            booking.status === 'confirmed' ? "bg-emerald-50 text-emerald-600" : "bg-orange-50 text-orange-600")}>
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
