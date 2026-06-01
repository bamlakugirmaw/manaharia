import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Bus, Settings, AlertTriangle, X, LayoutGrid, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { useBuses, useRemoveBus } from '../../hooks/useBuses';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSeats } from '../../hooks/useSeats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { busesApi } from '../../api/buses.api';
import { seatsApi } from '../../api/seats.api';
import { buildSeatDefinitionsForBus } from '../../lib/seatLayout';
import { VIP_SEAT_LABELS } from '../../lib/seatPricing';
import { extractErrorMessage } from '../../lib/api';

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

function BusFleetCard({ bus, onEdit, onDelete, deleting }) {
    const qc = useQueryClient();
    const { data: seats = [], isLoading: seatsLoading } = useSeats(bus.id);
    const [seeding, setSeeding] = useState(false);
    const [seedError, setSeedError] = useState('');

    const totalSeats = parseInt(bus.totalSeats, 10) || 0;
    const needsSeats = !seatsLoading && seats.length === 0 && totalSeats > 0;
    const vipCount = seats.filter((s) => s.seatType === 'VIP' || VIP_SEAT_LABELS.has(s.seatNumber)).length;

    const handleGenerateSeats = async () => {
        setSeeding(true);
        setSeedError('');
        try {
            await seatsApi.createSeatBatch({
                busId: bus.id,
                seats: buildSeatDefinitionsForBus(totalSeats),
            });
            qc.invalidateQueries({ queryKey: ['seats', 'list', { busId: bus.id }] });
        } catch (err) {
            setSeedError(extractErrorMessage(err, 'Failed to generate seats.'));
        } finally {
            setSeeding(false);
        }
    };

    return (
        <Card className="overflow-hidden bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl hover:shadow-md transition-shadow">
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
                    <span className="text-gray-400">Layout seats</span>
                    <span className="text-gray-900 font-bold">
                        {seatsLoading ? '…' : seats.length}
                        {!seatsLoading && seats.length > 0 && (
                            <span className="text-[10px] font-semibold text-amber-600 ml-1">
                                ({vipCount} VIP)
                            </span>
                        )}
                    </span>
                </div>
                {!needsSeats && seats.length > 0 && vipCount === 0 && (
                    <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1.5">
                        Front seats A1–A4 should be VIP. Regenerate seats, then create a new trip schedule.
                    </p>
                )}
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bus ID</span>
                    <span className="text-gray-400 font-mono text-[10px]">{bus.id}</span>
                </div>
                {seedError && <p className="text-[10px] text-red-600">{seedError}</p>}
                <div className="pt-3 space-y-2">
                    {needsSeats && (
                        <Button
                            variant="outline"
                            className="h-8 text-[10px] font-bold w-full gap-1.5"
                            onClick={handleGenerateSeats}
                            disabled={seeding}
                        >
                            <LayoutGrid size={12} />
                            {seeding ? 'Generating…' : 'Generate seats'}
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        className="h-8 text-[10px] font-bold bg-gray-50 text-gray-600 hover:bg-primary hover:text-white rounded-lg transition-colors w-full"
                        onClick={() => onEdit({ ...bus })}
                    >
                        Edit Details
                    </Button>
                    <Button
                        variant="outline"
                        className="h-8 text-[10px] font-bold text-red-600 border-red-100 hover:bg-red-50 rounded-lg w-full gap-1"
                        onClick={() => onDelete(bus)}
                        disabled={deleting}
                    >
                        <Trash2 size={12} /> {deleting ? 'Deleting…' : 'Remove Bus'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function FleetManagement() {
    const { user } = useAuth();
    const operatorId = user?.operatorId ?? null;

    const { data: buses = [], isLoading } = useBuses(operatorId ? { operatorId, limit: 100 } : {});
    const { mutate: createBus, isPending: creating } = useCreateBus();
    const { mutate: updateBus, isPending: updating } = useUpdateBus();
    const { mutate: removeBus, isPending: removingBus } = useRemoveBus();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();
    const [deletingBusId, setDeletingBusId] = useState(null);

    const [isAddOpen,   setIsAddOpen]   = useState(false);
    const [editingBus,  setEditingBus]  = useState(null);

    const [newBus, setNewBus] = useState({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' });
    const [addError, setAddError] = useState('');
    const [seedingSeats, setSeedingSeats] = useState(false);

    const handleAdd = () => {
        if (!operatorId) return;
        setAddError('');
        const totalSeats = parseInt(newBus.totalSeats, 10) || 0;
        if (!newBus.plateNumber || !newBus.make || totalSeats < 1) {
            setAddError('Plate, make, and seat count are required.');
            return;
        }
        createBus({
            operatorId,
            plateNumber: newBus.plateNumber,
            make:        newBus.make,
            totalSeats,
            status:      newBus.status,
        }, {
            onSuccess: async (res) => {
                const bus = res?.data ?? res;
                const busId = bus?.id;
                if (busId) {
                    setSeedingSeats(true);
                    try {
                        await seatsApi.createSeatBatch({
                            busId,
                            seats: buildSeatDefinitionsForBus(totalSeats),
                        });
                    } catch (seatErr) {
                        setAddError(
                            extractErrorMessage(
                                seatErr,
                                'Bus created but seat layout failed. Add seats manually or retry from fleet.'
                            )
                        );
                        setSeedingSeats(false);
                        return;
                    }
                    setSeedingSeats(false);
                }
                setIsAddOpen(false);
                setNewBus({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' });
                setAddError('');
                window.alert(
                    'Bus and seat layout saved. Create a new trip schedule for this bus so travellers can book (trip seats are materialized when the trip is created).'
                );
            },
            onError: (err) => setAddError(extractErrorMessage(err, 'Failed to add bus.')),
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

    const handleDeleteBus = async (bus) => {
        const ok = await confirm({
            title: 'Remove this bus?',
            description: `Bus ${bus.plateNumber} will be removed from your fleet. This action cannot be undone.`,
            confirmLabel: 'Remove Bus',
        });
        if (!ok) return;
        setDeletingBusId(bus.id);
        removeBus(bus.id, {
            onSuccess: () => {
                setDeletingBusId(null);
                if (editingBus?.id === bus.id) setEditingBus(null);
            },
            onError: () => setDeletingBusId(null),
        });
    };

    const activeCount     = buses.filter(b => (b.status ?? '').toUpperCase() === 'ACTIVE').length;
    const inactiveCount   = buses.filter(b => (b.status ?? '').toUpperCase() === 'INACTIVE').length;
    const suspendedCount  = buses.filter(b => (b.status ?? '').toUpperCase() === 'SUSPENDED').length;

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
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
                    {buses.map((bus) => (
                        <BusFleetCard
                            key={bus.id}
                            bus={bus}
                            onEdit={setEditingBus}
                            onDelete={handleDeleteBus}
                            deleting={deletingBusId === bus.id && removingBus}
                        />
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
                            {addError && (
                                <p className="text-sm text-red-600">{addError}</p>
                            )}
                            <Button className="w-full mt-6 bg-primary" onClick={handleAdd} disabled={creating || seedingSeats}>
                                {creating || seedingSeats ? (seedingSeats ? 'Creating seats…' : 'Adding…') : 'Add Vehicle'}
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
                            <Button
                                variant="outline"
                                className="w-full mt-2 text-red-600 border-red-200 hover:bg-red-50"
                                disabled={removingBus}
                                onClick={() => handleDeleteBus(editingBus)}
                            >
                                <Trash2 size={14} className="inline mr-1" />
                                {removingBus ? 'Deleting…' : 'Remove Bus'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
