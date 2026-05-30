import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Bus, Settings, AlertTriangle, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useBuses } from '../../hooks/useBuses';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { busesApi } from '../../api/buses.api';

// ─── Hooks ────────────────────────────────────────────────────────────────────
function useCreateBus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data) => busesApi.createBus(data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['buses'] }),
    });
}

function useUpdateBus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => busesApi.updateBus(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['buses'] }),
    });
}

// Backend status → badge variant
const statusVariant = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE')    return 'success';
    if (v === 'SUSPENDED') return 'destructive';
    return 'warning'; // INACTIVE
};

const statusLabel = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE')    return 'Active';
    if (v === 'SUSPENDED') return 'Suspended';
    return 'Inactive';
};

export default function FleetManagement() {
    const { user } = useAuth();
    const operatorId = user?.operatorId ?? null;

    const { data: buses = [], isLoading } = useBuses(operatorId ? { operatorId, limit: 100 } : {});
    const { mutate: createBus, isPending: creating } = useCreateBus();
    const { mutate: updateBus, isPending: updating } = useUpdateBus();

    const [isAddOpen,   setIsAddOpen]   = useState(false);
    const [editingBus,  setEditingBus]  = useState(null);

    const [newBus, setNewBus] = useState({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' });

    const handleAdd = () => {
        if (!operatorId) return;
        createBus({
            operatorId,
            plateNumber: newBus.plateNumber,
            make:        newBus.make,
            totalSeats:  parseInt(newBus.totalSeats) || 0,
            status:      newBus.status,
        }, {
            onSuccess: () => { setIsAddOpen(false); setNewBus({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' }); },
        });
    };

    const handleSaveEdit = () => {
        updateBus({
            id:          editingBus.id,
            plateNumber: editingBus.plateNumber,
            make:        editingBus.make,
            totalSeats:  parseInt(editingBus.totalSeats) || editingBus.totalSeats,
            status:      editingBus.status,
        }, { onSuccess: () => setEditingBus(null) });
    };

    const activeCount     = buses.filter(b => (b.status ?? '').toUpperCase() === 'ACTIVE').length;
    const inactiveCount   = buses.filter(b => (b.status ?? '').toUpperCase() === 'INACTIVE').length;
    const suspendedCount  = buses.filter(b => (b.status ?? '').toUpperCase() === 'SUSPENDED').length;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Fleet Management</h1>
                    <p className="text-gray-400 text-xs font-semibold">Manage your registered buses.</p>
                </div>
                <Button className="gap-2 bg-primary text-xs h-9 px-4 rounded-xl font-bold" onClick={() => setIsAddOpen(true)}>
                    <Plus size={16} /> Add New Bus
                </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-500"><Bus size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{isLoading ? '—' : activeCount}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Active Buses</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-orange-50 p-2.5 rounded-xl text-orange-500"><Settings size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{isLoading ? '—' : inactiveCount}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Inactive</div>
                    </div>
                </Card>
                <Card className="p-4 flex items-center gap-4 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl">
                    <div className="bg-rose-50 p-2.5 rounded-xl text-rose-500"><AlertTriangle size={20} /></div>
                    <div>
                        <div className="text-xl font-bold text-gray-900">{isLoading ? '—' : suspendedCount}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Suspended</div>
                    </div>
                </Card>
            </div>

            {/* Bus cards */}
            {isLoading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-gray-400 text-sm mt-3">Loading fleet…</p>
                </div>
            ) : buses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Bus size={40} className="text-gray-200 mx-auto mb-4" />
                    <p className="font-bold text-gray-600">No buses registered yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add New Bus" to register your first vehicle.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {buses.map(bus => (
                        <Card key={bus.id} className="overflow-hidden bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl hover:shadow-md transition-shadow">
                            <div className="bg-gray-50/50 p-4 border-b border-gray-50 flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 bg-white border border-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                                        <Bus size={14} />
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm font-mono">{bus.plateNumber}</span>
                                </div>
                                <Badge variant={statusVariant(bus.status)} className="text-[9px] uppercase tracking-wider font-bold">
                                    {statusLabel(bus.status)}
                                </Badge>
                            </div>
                            <div className="p-4 space-y-2.5 text-[11px] font-semibold">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Make / Model</span>
                                    <span className="text-gray-700">{bus.make ?? '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Total Seats</span>
                                    <span className="text-gray-900 font-bold">{bus.totalSeats ?? '—'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Bus ID</span>
                                    <span className="text-gray-400 font-mono text-[10px]">{bus.id}</span>
                                </div>
                                <div className="pt-3">
                                    <Button variant="ghost"
                                        className="h-8 text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-primary hover:text-white rounded-lg transition-colors w-full"
                                        onClick={() => setEditingBus({ ...bus })}>
                                        Edit Details
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Add Bus Modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setIsAddOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-1">Add New Bus</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter vehicle details to add to fleet.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Plate Number *</label>
                                <Input placeholder="e.g. 3-AA-12345" value={newBus.plateNumber}
                                    onChange={e => setNewBus(p => ({ ...p, plateNumber: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Make / Model *</label>
                                    <Input placeholder="e.g. Yutong ZK6122" value={newBus.make}
                                        onChange={e => setNewBus(p => ({ ...p, make: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Seats *</label>
                                    <Input type="number" placeholder="e.g. 45" value={newBus.totalSeats}
                                        onChange={e => setNewBus(p => ({ ...p, totalSeats: e.target.value }))} />
                                </div>
                            </div>
                            <Button className="w-full mt-6 bg-primary" onClick={handleAdd} disabled={creating}>
                                {creating ? 'Adding…' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit Bus Modal */}
            {editingBus && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setEditingBus(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-1">Edit Bus Details</h2>
                        <p className="text-sm text-gray-500 mb-6">Modify details for {editingBus.plateNumber}.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Plate Number</label>
                                <Input value={editingBus.plateNumber ?? ''}
                                    onChange={e => setEditingBus(p => ({ ...p, plateNumber: e.target.value }))} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Make / Model</label>
                                    <Input value={editingBus.make ?? ''}
                                        onChange={e => setEditingBus(p => ({ ...p, make: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Seats</label>
                                    <Input type="number" value={editingBus.totalSeats ?? ''}
                                        onChange={e => setEditingBus(p => ({ ...p, totalSeats: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    value={editingBus.status ?? 'ACTIVE'}
                                    onChange={e => setEditingBus(p => ({ ...p, status: e.target.value }))}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                            <Button className="w-full mt-6 bg-primary" onClick={handleSaveEdit} disabled={updating}>
                                {updating ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
