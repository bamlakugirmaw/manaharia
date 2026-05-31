import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Plus, MapPin, Edit2, X, Trash2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import {
    useDestinations,
    useCreateDestination,
    useUpdateDestination,
    useRemoveDestination,
} from '../../hooks/useDestinations';
import { extractErrorMessage } from '../../lib/api';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

const EMPTY = { name: '', description: '', image: '', highlights: '' };

export default function AdminDestinations() {
    const { data: destinations = [], isLoading, isError } = useDestinations({ limit: 100 });
    const { mutate: createDest, isPending: creating } = useCreateDestination();
    const { mutate: updateDest, isPending: updating } = useUpdateDestination();
    const { mutate: removeDest, isPending: removing } = useRemoveDestination();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();

    const [searchQuery, setSearchQuery] = useState('');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [formError, setFormError] = useState('');

    const f = (key) => ({
        value: form[key],
        onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    });

    const filtered = destinations.filter((d) => {
        const q = searchQuery.toLowerCase();
        return (d.name ?? '').toLowerCase().includes(q) || (d.description ?? '').toLowerCase().includes(q);
    });

    const parseHighlights = (str) =>
        str.split(',').map((s) => s.trim()).filter(Boolean);

    const resetForm = () => {
        setForm(EMPTY);
        setFormError('');
    };

    const handleCreate = () => {
        setFormError('');
        if (!form.name || !form.description || !form.image) {
            setFormError('Name, description, and image URL are required.');
            return;
        }
        createDest(
            {
                name: form.name,
                description: form.description,
                image: form.image,
                highlights: parseHighlights(form.highlights),
            },
            {
                onSuccess: () => { setIsAddOpen(false); resetForm(); },
                onError: (err) => setFormError(extractErrorMessage(err, 'Failed to create destination.')),
            }
        );
    };

    const handleUpdate = () => {
        if (!editing) return;
        setFormError('');
        updateDest(
            {
                id: editing.id,
                name: editing.name,
                description: editing.description,
                image: editing.image,
                highlights: Array.isArray(editing.highlights)
                    ? editing.highlights
                    : parseHighlights(editing.highlightsStr ?? ''),
            },
            {
                onSuccess: () => setEditing(null),
                onError: (err) => setFormError(extractErrorMessage(err, 'Failed to update destination.')),
            }
        );
    };

    const handleDelete = async (id, name) => {
        const ok = await confirm({
            title: 'Remove this destination?',
            description: name ? `"${name}" will be removed from the platform.` : 'This destination will be removed.',
            confirmLabel: 'Remove',
        });
        if (!ok) return;
        removeDest(id);
    };

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
                    <p className="text-gray-500 text-sm">Manage destination content (GET/POST/PATCH/DELETE /v1/destinations).</p>
                </div>
                <Button className="gap-2 bg-primary" onClick={() => { resetForm(); setIsAddOpen(true); }}>
                    <Plus size={18} /> Add Destination
                </Button>
            </div>

            <input
                type="text"
                placeholder="Search destinations…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && <p className="text-sm text-red-600">Failed to load destinations.</p>}

            {!isLoading && !isError && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((dest) => (
                        <Card key={dest.id} className="overflow-hidden rounded-2xl border-none shadow-sm">
                            {dest.image && (
                                <img src={dest.image} alt={dest.name} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="font-bold text-gray-900">{dest.name}</h3>
                                    <MapPin size={16} className="text-primary shrink-0" />
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">{dest.description}</p>
                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 rounded-xl"
                                        onClick={() => {
                                            setFormError('');
                                            setEditing({
                                                ...dest,
                                                highlightsStr: Array.isArray(dest.highlights)
                                                    ? dest.highlights.join(', ')
                                                    : '',
                                            });
                                        }}
                                    >
                                        <Edit2 size={14} className="mr-1" /> Edit
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl text-red-600 border-red-100"
                                        disabled={removing}
                                        onClick={() => handleDelete(dest.id, dest.name)}
                                    >
                                        <Trash2 size={14} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                    {filtered.length === 0 && (
                        <p className="col-span-full text-center text-gray-500 py-12">No destinations found.</p>
                    )}
                </div>
            )}

            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-white p-6 relative rounded-2xl max-h-[90vh] overflow-y-auto">
                        <button type="button" onClick={() => { setIsAddOpen(false); resetForm(); }} className="absolute right-4 top-4 text-gray-400"><X size={20} /></button>
                        <h2 className="text-lg font-bold mb-4">Add Destination</h2>
                        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
                        <div className="space-y-3">
                            <Input label="Name *" {...f('name')} />
                            <Input label="Description *" {...f('description')} />
                            <Input label="Image URL *" placeholder="/images/destinations/addis_ababa.jpg" {...f('image')} />
                            <Input label="Highlights (comma-separated)" placeholder="Lake Tana, Castles" {...f('highlights')} />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
                            <Button className="flex-1 bg-primary" disabled={creating} onClick={handleCreate}>
                                {creating ? 'Creating…' : 'Create'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {editing && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg bg-white p-6 relative rounded-2xl max-h-[90vh] overflow-y-auto">
                        <button type="button" onClick={() => setEditing(null)} className="absolute right-4 top-4 text-gray-400"><X size={20} /></button>
                        <h2 className="text-lg font-bold mb-4">Edit Destination</h2>
                        {formError && <p className="text-sm text-red-600 mb-3">{formError}</p>}
                        <div className="space-y-3">
                            <Input label="Name" value={editing.name} onChange={(e) => setEditing((p) => ({ ...p, name: e.target.value }))} />
                            <Input label="Description" value={editing.description} onChange={(e) => setEditing((p) => ({ ...p, description: e.target.value }))} />
                            <Input label="Image URL" value={editing.image} onChange={(e) => setEditing((p) => ({ ...p, image: e.target.value }))} />
                            <Input
                                label="Highlights (comma-separated)"
                                value={editing.highlightsStr ?? ''}
                                onChange={(e) => setEditing((p) => ({ ...p, highlightsStr: e.target.value }))}
                            />
                        </div>
                        <div className="flex gap-3 mt-6">
                            <Button variant="outline" className="flex-1" onClick={() => setEditing(null)}>Cancel</Button>
                            <Button className="flex-1 bg-primary" disabled={updating} onClick={handleUpdate}>
                                {updating ? 'Saving…' : 'Save'}
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
