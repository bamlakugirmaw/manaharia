import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Plus, MapPin, Edit2, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useRoutes, useCreateRoute, useUpdateRoute } from '../../hooks/useRoutes';
import { extractErrorMessage } from '../../lib/api';

const autoCode = (origin = '', destination = '') => {
    const abbr = (s) => s.trim().toUpperCase().replace(/\s+/g, '').slice(0, 3).padEnd(3, 'X');
    if (!origin && !destination) return '';
    return `${abbr(origin)}-${abbr(destination)}`;
};

const EMPTY_ROUTE = { code: '', origin: '', destination: '', distance: '' };

export default function OperatorRoutes() {
    const { data: routes = [], isLoading, isError } = useRoutes({ limit: 200 });
    const { mutate: createRoute, isPending: creating } = useCreateRoute();
    const { mutate: updateRoute, isPending: updating } = useUpdateRoute();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editingRoute, setEditingRoute] = useState(null);
    const [form, setForm] = useState(EMPTY_ROUTE);
    const [formError, setFormError] = useState('');

    const f = (key) => ({
        value: form[key],
        onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    });

    const filtered = routes.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
            (r.origin ?? '').toLowerCase().includes(q) ||
            (r.destination ?? '').toLowerCase().includes(q) ||
            (r.code ?? '').toLowerCase().includes(q)
        );
    });

    const resetForm = () => {
        setForm(EMPTY_ROUTE);
        setFormError('');
    };

    const handleCreate = () => {
        setFormError('');
        if (!form.code || !form.origin || !form.destination || !form.distance) {
            setFormError('All fields are required.');
            return;
        }
        createRoute(
            {
                code: form.code,
                origin: form.origin,
                destination: form.destination,
                distance: Number(form.distance),
            },
            {
                onSuccess: () => {
                    setIsAddOpen(false);
                    resetForm();
                },
                onError: (err) => setFormError(extractErrorMessage(err, 'Failed to create route.')),
            }
        );
    };

    const handleUpdate = () => {
        if (!editingRoute) return;
        setFormError('');
        updateRoute(
            {
                id: editingRoute.id,
                code: editingRoute.code,
                origin: editingRoute.origin,
                destination: editingRoute.destination,
                distance: Number(editingRoute.distance) || editingRoute.distance,
            },
            {
                onSuccess: () => setEditingRoute(null),
                onError: (err) => setFormError(extractErrorMessage(err, 'Failed to update route.')),
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-xl font-bold tracking-tight">Route Management</h1>
                    <p className="text-gray-400 text-xs font-semibold">
                        Create and manage routes on the network (POST/PATCH /v1/routes).
                    </p>
                </div>
                <Button
                    className="gap-2 bg-primary text-xs h-9 px-4 rounded-xl font-bold"
                    onClick={() => { resetForm(); setIsAddOpen(true); }}
                >
                    <Plus size={16} /> Add Route
                </Button>
            </div>

            <div className="relative max-w-md">
                <input
                    type="text"
                    placeholder="Search by city or route code…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                />
            </div>

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-600">Failed to load routes.</p>
            )}

            {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((route) => (
                        <Card
                            key={route.id}
                            className="p-5 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-2xl"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-primary" />
                                </div>
                                <Badge variant="blue" className="text-[10px] font-bold uppercase">
                                    {route.code}
                                </Badge>
                            </div>
                            <h3 className="font-bold text-gray-900">{route.origin}</h3>
                            <p className="text-xs text-gray-400 my-1">→</p>
                            <h3 className="font-bold text-gray-900 mb-3">{route.destination}</h3>
                            <p className="text-sm text-gray-500 mb-4">{route.distance} km</p>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-2 rounded-xl"
                                onClick={() => {
                                    setFormError('');
                                    setEditingRoute({
                                        ...route,
                                        distance: String(route.distance ?? ''),
                                    });
                                }}
                            >
                                <Edit2 size={14} /> Edit Route
                            </Button>
                        </Card>
                    ))}
                    {filtered.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-12 text-sm">
                            No routes found. Add your first route to schedule trips.
                        </p>
                    )}
                </div>
            )}

            {/* Add modal */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-white p-6 relative rounded-2xl">
                        <button
                            type="button"
                            onClick={() => { setIsAddOpen(false); resetForm(); }}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Add New Route</h2>
                        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
                        <div className="space-y-3">
                            <Input label="Origin *" placeholder="Addis Ababa" {...f('origin')}
                                onChange={(e) => {
                                    const origin = e.target.value;
                                    setForm((p) => ({
                                        ...p,
                                        origin,
                                        code: autoCode(origin, p.destination),
                                    }));
                                }}
                            />
                            <Input label="Destination *" placeholder="Bahir Dar" {...f('destination')}
                                onChange={(e) => {
                                    const destination = e.target.value;
                                    setForm((p) => ({
                                        ...p,
                                        destination,
                                        code: autoCode(p.origin, destination),
                                    }));
                                }}
                            />
                            <Input label="Route Code *" placeholder="ADD-BAH" {...f('code')} />
                            <Input type="number" label="Distance (km) *" placeholder="510" {...f('distance')} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-primary" disabled={creating} onClick={handleCreate}>
                                {creating ? 'Creating…' : 'Create Route'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Edit modal */}
            {editingRoute && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-white p-6 relative rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setEditingRoute(null)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>
                        <h2 className="text-lg font-bold mb-4">Edit Route</h2>
                        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
                        <div className="space-y-3">
                            <Input
                                label="Origin"
                                value={editingRoute.origin}
                                onChange={(e) => setEditingRoute((p) => ({ ...p, origin: e.target.value }))}
                            />
                            <Input
                                label="Destination"
                                value={editingRoute.destination}
                                onChange={(e) => setEditingRoute((p) => ({ ...p, destination: e.target.value }))}
                            />
                            <Input
                                label="Route Code"
                                value={editingRoute.code}
                                onChange={(e) => setEditingRoute((p) => ({ ...p, code: e.target.value.toUpperCase() }))}
                            />
                            <Input
                                type="number"
                                label="Distance (km)"
                                value={editingRoute.distance}
                                onChange={(e) => setEditingRoute((p) => ({ ...p, distance: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setEditingRoute(null)}>
                                Cancel
                            </Button>
                            <Button className="flex-1 bg-primary" disabled={updating} onClick={handleUpdate}>
                                {updating ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
