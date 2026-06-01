import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, Bus, Settings, AlertTriangle, X, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useOperatorScope } from '../../hooks/useOperatorScope';
import { useRemoveBus } from '../../hooks/useBuses';
import OperatorScopeBanner from '../../components/operator/OperatorScopeBanner';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useSeats } from '../../hooks/useSeats';
import { seatKeys } from '../../hooks/useSeats';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { busesApi } from '../../api/buses.api';
import { ensureBusSeatsReady } from '../../lib/tripSeats';
import { VIP_SEAT_LABELS } from '../../lib/seatPricing';
import { extractErrorMessage } from '../../lib/api';
import { cn } from '../../lib/utils';

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

const statusVariant = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE') return 'success';
    if (v === 'SUSPENDED') return 'destructive';
    return 'warning';
};

const statusLabel = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE') return 'Active';
    if (v === 'SUSPENDED') return 'Suspended';
    return 'Inactive';
};

function FleetNotice({ notice, onDismiss }) {
    if (!notice) return null;
    const isSuccess = notice.type === 'success';
    return (
        <div
            className={cn(
                'rounded-2xl border p-4 flex gap-4 items-start shadow-sm animate-in fade-in slide-in-from-top-2 duration-300',
                isSuccess ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200',
            )}
            role="status"
        >
            {isSuccess ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
                <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
                <p className={cn('font-bold text-sm', isSuccess ? 'text-emerald-900' : 'text-red-900')}>
                    {notice.title}
                </p>
                {notice.subtitle && (
                    <p className={cn('text-xs font-mono mt-0.5', isSuccess ? 'text-emerald-700' : 'text-red-700')}>
                        {notice.subtitle}
                    </p>
                )}
                <p className={cn('text-sm mt-1 leading-relaxed', isSuccess ? 'text-emerald-800' : 'text-red-800')}>
                    {notice.message}
                </p>
                {notice.actionHref && (
                    <Link
                        to={notice.actionHref}
                        className="inline-flex items-center gap-1.5 mt-3 text-xs font-bold text-primary hover:underline"
                    >
                        {notice.actionLabel ?? 'Continue'}
                        <ArrowRight size={14} />
                    </Link>
                )}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                className="text-gray-400 hover:text-gray-600 shrink-0 p-1 rounded-lg hover:bg-black/5"
                aria-label="Dismiss"
            >
                <X size={18} />
            </button>
        </div>
    );
}

function BusFleetCard({ bus, onEdit, onDelete, deleting }) {
    const qc = useQueryClient();
    const { data: seats = [], isLoading: seatsLoading } = useSeats(bus.id);
    const seedingRef = useRef(false);

    const totalSeats = parseInt(bus.totalSeats, 10) || 0;
    const needsSeats = !seatsLoading && seats.length === 0 && totalSeats > 0;
    const vipCount = seats.filter((s) => s.seatType === 'VIP' || VIP_SEAT_LABELS.has(s.seatNumber)).length;

    useEffect(() => {
        if (!needsSeats || seedingRef.current || !bus.id) return;
        seedingRef.current = true;
        ensureBusSeatsReady(bus.id, totalSeats)
            .then(() => {
                qc.invalidateQueries({ queryKey: seatKeys.list({ busId: bus.id }) });
            })
            .catch(() => { /* silent — layout may already exist */ })
            .finally(() => {
                seedingRef.current = false;
            });
    }, [needsSeats, bus.id, totalSeats, qc]);

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
                        {seatsLoading || needsSeats ? (
                            <span className="text-gray-400 font-normal">Preparing…</span>
                        ) : (
                            <>
                                {seats.length}
                                {seats.length > 0 && (
                                    <span className="text-[10px] font-semibold text-amber-600 ml-1">
                                        ({vipCount} VIP)
                                    </span>
                                )}
                            </>
                        )}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Bus ID</span>
                    <span className="text-gray-400 font-mono text-[10px]">{bus.id}</span>
                </div>
                <div className="pt-3 space-y-2">
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
                        <Trash2 size={12} /> {deleting ? 'Removing…' : 'Remove Bus'}
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export default function FleetManagement() {
    const { operatorId, scopeReady, buses, busesQuery } = useOperatorScope();
    const isLoading = busesQuery.isLoading;
    const qc = useQueryClient();
    const { mutate: createBus, isPending: creating } = useCreateBus();
    const { mutate: updateBus, isPending: updating } = useUpdateBus();
    const { mutateAsync: removeBusAsync, isPending: removingBus } = useRemoveBus();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();
    const [deletingBusId, setDeletingBusId] = useState(null);

    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingBus, setEditingBus] = useState(null);
    const [newBus, setNewBus] = useState({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' });
    const [addError, setAddError] = useState('');
    const [seedingSeats, setSeedingSeats] = useState(false);
    const [fleetNotice, setFleetNotice] = useState(null);

    const handleAdd = () => {
        if (!scopeReady || !operatorId) return;
        setAddError('');
        const totalSeats = parseInt(newBus.totalSeats, 10) || 0;
        if (!newBus.plateNumber || !newBus.make || totalSeats < 1) {
            setAddError('Plate, make, and seat count are required.');
            return;
        }
        const plate = newBus.plateNumber.trim();
        createBus({
            operatorId,
            plateNumber: plate,
            make: newBus.make.trim(),
            totalSeats,
            status: newBus.status,
        }, {
            onSuccess: async (res) => {
                const bus = res?.data ?? res;
                const busId = bus?.id;
                if (busId) {
                    setSeedingSeats(true);
                    try {
                        await ensureBusSeatsReady(busId, totalSeats);
                        qc.invalidateQueries({ queryKey: seatKeys.list({ busId }) });
                    } catch (seatErr) {
                        setAddError(
                            extractErrorMessage(
                                seatErr,
                                'Bus was created but the seat layout could not be prepared. Try editing the bus or contact support.',
                            ),
                        );
                        setSeedingSeats(false);
                        return;
                    }
                    setSeedingSeats(false);
                }
                setIsAddOpen(false);
                setNewBus({ plateNumber: '', make: '', totalSeats: '', status: 'ACTIVE' });
                setAddError('');
                setFleetNotice({
                    type: 'success',
                    title: 'Bus added to your fleet',
                    subtitle: plate,
                    message:
                        'The seat layout was created automatically (including VIP seats A1–A4). '
                        + 'Create a trip schedule under Bookings so travellers can reserve seats.',
                    actionHref: '/operator/bookings',
                    actionLabel: 'Go to Bookings',
                });
            },
            onError: (err) => setAddError(extractErrorMessage(err, 'Failed to add bus.')),
        });
    };

    const handleSaveEdit = () => {
        updateBus({
            id: editingBus.id,
            plateNumber: editingBus.plateNumber,
            make: editingBus.make,
            totalSeats: parseInt(editingBus.totalSeats, 10) || editingBus.totalSeats,
            status: editingBus.status,
        }, { onSuccess: () => setEditingBus(null) });
    };

    const handleDeleteBus = async (bus) => {
        const ok = await confirm({
            title: 'Remove this bus?',
            description:
                `Bus ${bus.plateNumber} and its seat layout will be removed from your fleet. `
                + 'Existing trips using this bus may be affected.',
            confirmLabel: 'Remove Bus',
        });
        if (!ok) return;
        setDeletingBusId(bus.id);
        try {
            await removeBusAsync(bus.id);
            qc.removeQueries({ queryKey: seatKeys.list({ busId: bus.id }) });
            qc.invalidateQueries({ queryKey: seatKeys.all });
            if (editingBus?.id === bus.id) setEditingBus(null);
            setFleetNotice({
                type: 'success',
                title: 'Bus removed',
                subtitle: bus.plateNumber,
                message: 'The vehicle and its seat layout were removed from your fleet.',
            });
        } catch (err) {
            setFleetNotice({
                type: 'error',
                title: 'Could not remove bus',
                message: extractErrorMessage(err, 'Try again or contact support.'),
            });
        } finally {
            setDeletingBusId(null);
        }
    };

    const activeCount = buses.filter((b) => (b.status ?? '').toUpperCase() === 'ACTIVE').length;
    const inactiveCount = buses.filter((b) => (b.status ?? '').toUpperCase() === 'INACTIVE').length;
    const suspendedCount = buses.filter((b) => (b.status ?? '').toUpperCase() === 'SUSPENDED').length;

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
            <OperatorScopeBanner />
            <FleetNotice notice={fleetNotice} onDismiss={() => setFleetNotice(null)} />

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Fleet Management</h1>
                    <p className="text-gray-400 text-xs font-semibold">
                        Buses and seat layouts are set up automatically when you add a vehicle.
                    </p>
                </div>
                <Button
                    className="gap-2 bg-primary text-xs h-9 px-4 rounded-xl font-bold"
                    onClick={() => {
                        setAddError('');
                        setIsAddOpen(true);
                    }}
                >
                    <Plus size={16} /> Add New Bus
                </Button>
            </div>

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

            {isLoading ? (
                <div className="text-center py-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                    <p className="text-gray-400 text-sm mt-3">Loading fleet…</p>
                </div>
            ) : buses.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
                    <Bus size={40} className="text-gray-200 mx-auto mb-4" />
                    <p className="font-bold text-gray-600">No buses registered yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click &quot;Add New Bus&quot; to register your first vehicle.</p>
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

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            type="button"
                            onClick={() => !seedingSeats && setIsAddOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                            disabled={seedingSeats}
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-1">Add New Bus</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Vehicle details and seat layout are saved together—no extra steps.
                        </p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Plate Number *</label>
                                <Input
                                    placeholder="e.g. 3-AA-12345"
                                    value={newBus.plateNumber}
                                    onChange={(e) => setNewBus((p) => ({ ...p, plateNumber: e.target.value }))}
                                    disabled={creating || seedingSeats}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Make / Model *</label>
                                    <Input
                                        placeholder="e.g. Yutong"
                                        value={newBus.make}
                                        onChange={(e) => setNewBus((p) => ({ ...p, make: e.target.value }))}
                                        disabled={creating || seedingSeats}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Seats *</label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 45"
                                        value={newBus.totalSeats}
                                        onChange={(e) => setNewBus((p) => ({ ...p, totalSeats: e.target.value }))}
                                        disabled={creating || seedingSeats}
                                    />
                                </div>
                            </div>
                            {seedingSeats && (
                                <p className="text-xs text-primary font-medium flex items-center gap-2">
                                    <span className="inline-block w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                                    Creating seat layout…
                                </p>
                            )}
                            {addError && <p className="text-sm text-red-600">{addError}</p>}
                            <Button
                                className="w-full mt-6 bg-primary"
                                onClick={handleAdd}
                                disabled={creating || seedingSeats}
                            >
                                {creating || seedingSeats ? 'Adding vehicle…' : 'Add Vehicle'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {editingBus && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button onClick={() => setEditingBus(null)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                        <h2 className="text-xl font-bold mb-1">Edit Bus Details</h2>
                        <p className="text-sm text-gray-500 mb-6">Modify details for {editingBus.plateNumber}.</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Plate Number</label>
                                <Input
                                    value={editingBus.plateNumber ?? ''}
                                    onChange={(e) => setEditingBus((p) => ({ ...p, plateNumber: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Make / Model</label>
                                    <Input
                                        value={editingBus.make ?? ''}
                                        onChange={(e) => setEditingBus((p) => ({ ...p, make: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Total Seats</label>
                                    <Input
                                        type="number"
                                        value={editingBus.totalSeats ?? ''}
                                        onChange={(e) => setEditingBus((p) => ({ ...p, totalSeats: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Status</label>
                                <select
                                    className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                    value={editingBus.status ?? 'ACTIVE'}
                                    onChange={(e) => setEditingBus((p) => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="ACTIVE">Active</option>
                                    <option value="INACTIVE">Inactive</option>
                                    <option value="SUSPENDED">Suspended</option>
                                </select>
                            </div>
                            <p className="text-xs text-gray-500">
                                Changing seat count does not rebuild the layout automatically. Remove and re-add the bus if you need a new layout.
                            </p>
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
                                {removingBus ? 'Removing…' : 'Remove Bus'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
