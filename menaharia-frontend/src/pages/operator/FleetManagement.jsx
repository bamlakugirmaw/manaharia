import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Bus, Settings, AlertTriangle, X } from 'lucide-react';
import { Input } from '../../components/ui/Input'; // Assuming Input component exists

const MOCK_FLEET = [
    { id: 'BUS-101', plate: '3-12345', model: 'Yutong ZK6122', type: 'Luxury', seats: 45, status: 'Active', driver: 'Abebe K.' },
    { id: 'BUS-102', plate: '3-67890', model: 'Higer KLQ6129', type: 'Standard', seats: 50, status: 'Active', driver: 'Kebede B.' },
    { id: 'BUS-103', plate: '3-11223', model: 'King Long XMQ', type: 'Standard', seats: 50, status: 'Maintenance', driver: '--' },
    { id: 'BUS-104', plate: '3-44556', model: 'Yutong ZK6122', type: 'Luxury', seats: 45, status: 'Garage', driver: '--' },
    { id: 'BUS-105', plate: '3-99887', model: 'Higer KLQ6129', type: 'Standard', seats: 50, status: 'Active', driver: 'Mulugeta T.' },
];

export default function FleetManagement() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fleet, setFleet] = useState(MOCK_FLEET);
    const [newBus, setNewBus] = useState({
        plate: '',
        model: '',
        type: 'Standard',
        seats: '',
        driver: ''
    });

    const handleAddBus = () => {
        const bus = {
            id: `BUS-${100 + fleet.length + 1}`,
            plate: newBus.plate,
            model: newBus.model,
            type: newBus.type,
            seats: parseInt(newBus.seats) || 0,
            status: 'Active',
            driver: newBus.driver || '--'
        };
        setFleet([...fleet, bus]);
        setIsModalOpen(false);
        setNewBus({ plate: '', model: '', type: 'Standard', seats: '', driver: '' });
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Fleet Management</h1>
                    <p className="text-gray-400 text-xs font-semibold">Manage your buses and drivers.</p>
                </div>
                <Button
                    className="gap-2 bg-primary text-xs h-9 px-4 rounded-xl font-bold"
                    onClick={() => setIsModalOpen(true)}
                >
                    <Plus size={16} /> Add New Bus
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Summary Cards */}
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500"><Bus size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{fleet.filter(b => b.status === 'Active').length}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Buses</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Settings size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{fleet.filter(b => b.status === 'Maintenance').length}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">In Maintenance</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500"><AlertTriangle size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{fleet.filter(b => b.status === 'Garage').length}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Out of Service</div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {fleet.map(bus => (
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

            {/* Add Bus Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-1">Add New Bus</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter vehicle details to add to fleet.</p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Plate Number</label>
                                <Input
                                    placeholder="e.g. 3-12345"
                                    value={newBus.plate}
                                    onChange={(e) => setNewBus({ ...newBus, plate: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Model</label>
                                    <Input
                                        placeholder="e.g. Yutong"
                                        value={newBus.model}
                                        onChange={(e) => setNewBus({ ...newBus, model: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Type</label>
                                    <select
                                        className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                        value={newBus.type}
                                        onChange={(e) => setNewBus({ ...newBus, type: e.target.value })}
                                    >
                                        <option>Standard</option>
                                        <option>Luxury</option>
                                        <option>VIP</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Seats</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 45"
                                        value={newBus.seats}
                                        onChange={(e) => setNewBus({ ...newBus, seats: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Driver</label>
                                    <Input
                                        placeholder="Optional"
                                        value={newBus.driver}
                                        onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-6" onClick={handleAddBus}>
                                Add Vehicle
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
