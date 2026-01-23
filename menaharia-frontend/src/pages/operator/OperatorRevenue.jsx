import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download, PieChart, BarChart as BarChartIcon } from 'lucide-react';
import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function OperatorRevenue() {
    // Mock data for revenue analytics
    const revenueStats = {
        totalRevenue: 2450000,
        monthlyRevenue: 450000,
        weeklyRevenue: 125000,
        growth: 12.5,
        lastMonth: 400000
    };

    const topRoutes = [
        { name: 'Addis Ababa - Bahir Dar', revenue: 120000, trips: 45, occupancy: '85%' },
        { name: 'Addis Ababa - Hawassa', revenue: 95000, trips: 38, occupancy: '78%' },
        { name: 'Addis Ababa - Mekelle', revenue: 88000, trips: 30, occupancy: '92%' },
        { name: 'Addis Ababa - Dire Dawa', revenue: 65000, trips: 25, occupancy: '65%' },
    ];

    const monthlyData = [
        { month: 'Jan', value: 35 },
        { month: 'Feb', value: 42 },
        { month: 'Mar', value: 38 },
        { month: 'Apr', value: 55 },
        { month: 'May', value: 65 },
        { month: 'Jun', value: 72 },
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Revenue Analytics</h1>
                    <p className="text-gray-500">Detailed financial performance and route analysis</p>
                </div>
                <Button variant="outline" className="flex items-center gap-2">
                    <Download size={16} /> Export Report
                </Button>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6 border-none shadow-sm bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                    <div className="flex flex-col">
                        <span className="text-blue-100 text-sm font-medium">Total Revenue</span>
                        <div className="text-3xl font-bold mt-2">ETB 2.45M</div>
                        <div className="flex items-center gap-1 mt-4 text-blue-100 text-sm">
                            <TrendingUp size={16} />
                            <span>+15% vs last year</span>
                        </div>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Monthly Revenue</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">ETB 450K</div>
                        </div>
                        <div className="p-2 bg-green-50 rounded-lg text-green-600">
                            <DollarSign size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-green-600 text-sm font-medium">
                        <TrendingUp size={16} />
                        <span>+12.5% vs last month</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Weekly Sales</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">ETB 125K</div>
                        </div>
                        <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                            <BarChartIcon size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-red-500 text-sm font-medium">
                        <TrendingDown size={16} />
                        <span>-2% vs last week</span>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-sm bg-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <span className="text-gray-500 text-sm font-medium">Net Profit Margin</span>
                            <div className="text-3xl font-bold mt-2 text-gray-900">18.2%</div>
                        </div>
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <PieChart size={20} />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 mt-4 text-gray-500 text-sm">
                        <span>Based on estimated costs</span>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Revenue Chart Placeholder/Visual */}
                <Card className="col-span-1 lg:col-span-2 p-6 border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-lg">Revenue Trend (6 Months)</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1 rounded-lg">
                            <Calendar size={14} /> Last 6 Months
                        </div>
                    </div>

                    {/* Recharts Composed Chart */}
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={monthlyData}
                                margin={{
                                    top: 20,
                                    right: 20,
                                    bottom: 20,
                                    left: 20,
                                }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="month" scale="band" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" barSize={20} fill="#413ea0" />
                                <Line type="monotone" dataKey="value" stroke="#ff7300" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Top Performing Routes */}
                <Card className="p-6 border-gray-100 shadow-sm">
                    <h3 className="font-bold text-lg mb-6">Top Performing Routes</h3>
                    <div className="space-y-6">
                        {topRoutes.map((route, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-sm">{route.name}</span>
                                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">{route.occupancy} Fill Rate</span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{route.trips} Trips</span>
                                    <span>ETB {route.revenue.toLocaleString()}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                                    <div
                                        className="bg-primary h-full rounded-full"
                                        style={{ width: route.occupancy }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
