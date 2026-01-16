import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Bus, Settings, AlertTriangle } from 'lucide-react';

const MOCK_FLEET = [
    { id: 'BUS-101', plate: '3-12345', model: 'Yutong ZK6122', type: 'Luxury', seats: 45, status: 'Active', driver: 'Abebe K.' },
    { id: 'BUS-102', plate: '3-67890', model: 'Higer KLQ6129', type: 'Standard', seats: 50, status: 'Active', driver: 'Kebede B.' },
    { id: 'BUS-103', plate: '3-11223', model: 'King Long XMQ', type: 'Standard', seats: 50, status: 'Maintenance', driver: '--' },
    { id: 'BUS-104', plate: '3-44556', model: 'Yutong ZK6122', type: 'Luxury', seats: 45, status: 'Garage', driver: '--' },
    { id: 'BUS-105', plate: '3-99887', model: 'Higer KLQ6129', type: 'Standard', seats: 50, status: 'Active', driver: 'Mulugeta T.' },
];

export default function FleetManagement() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Fleet Management</h1>
                    <p className="text-gray-400 text-xs font-semibold">Manage your buses and drivers.</p>
                </div>
                <Button className="gap-2 bg-primary text-xs h-9 px-4 rounded-xl font-bold">
                    <Plus size={16} /> Add New Bus
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Summary Cards */}
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500"><Bus size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">38</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Buses</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Settings size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">4</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">In Maintenance</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500"><AlertTriangle size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">2</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of Service</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_FLEET.map(bus => (
                    <Card key={bus.id} className="overflow-hidden bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl hover:shadow-md transition-shadow">
                        <div className="bg-gray-50/50 p-4 border-b border-gray-50 flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                    <Bus size={14} />
                                </div>
                                <span className="font-bold text-gray-900 text-sm">{bus.id}</span>
                            </div>
                            <Badge variant={bus.status === 'Active' ? 'success' : bus.status === 'Maintenance' ? 'warning' : 'destructive'} className="text-[9px] uppercase tracking-wider font-bold">
                                {bus.status}
                            </Badge>
                        </div>
                        <div className="p-4 space-y-2.5 text-[11px] font-semibold">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Plate Number</span>
                                <span className="font-mono text-gray-900 bg-gray-50 px-2 py-0.5 rounded uppercase">{bus.plate}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Model</span>
                                <span className="text-gray-700">{bus.model}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Type</span>
                                <span className="text-gray-700">{bus.type} ({bus.seats} seats)</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Current Driver</span>
                                <span className="text-gray-900 font-bold">{bus.driver}</span>
                            </div>

                            <div className="pt-3 flex gap-2">
                                <Button variant="ghost" className="h-8 text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-primary hover:text-white rounded-lg transition-colors flex-1">Edit Details</Button>
                                <Button variant="ghost" className="h-8 text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex-1">Service History</Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
