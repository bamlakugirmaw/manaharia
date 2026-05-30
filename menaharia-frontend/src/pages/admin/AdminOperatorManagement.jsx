import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Search, Bus, Building2, X } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { useOperators } from '../../hooks/useOperators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorsApi } from '../../api/operators.api';
import { operatorKeys } from '../../hooks/useOperators';
import { authApi } from '../../api/auth.api';
import { usersApi } from '../../api/users.api';

// BUS_OPERATOR role ID — fetched from GET /v1/roles and hardcoded here
// since roles are seeded and stable.
const BUS_OPERATOR_ROLE_ID = '3acd06f2-f7ac-4ee9-b6bf-c8648dac39e3';

const statusVariant = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE')    return 'success';
    if (v === 'SUSPENDED') return 'destructive';
    return 'warning';
};

function useUpdateOperator() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => operatorsApi.updateOperator(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.all }),
    });
}

const EMPTY_FORM = {
    // Account credentials
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    // Company details
    companyName: '', businessLicenseNo: '', tinNo: '',
    responsibleName: '', companyPhone: '', companyEmail: '',
    address: '', status: 'ACTIVE',
};

export default function AdminOperatorManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOp,  setSelectedOp]  = useState(null);
    const [isAddOpen,   setIsAddOpen]   = useState(false);
    const [isEditOpen,  setIsEditOpen]  = useState(false);
    const [editForm,    setEditForm]    = useState(null);
    const [form,        setForm]        = useState(EMPTY_FORM);
    const [addError,    setAddError]    = useState('');
    const [submitting,  setSubmitting]  = useState(false);

    const { data: operators = [], isLoading } = useOperators({ limit: 100 });
    const { mutate: updateOp, isPending: updating } = useUpdateOperator();
    const qc = useQueryClient();

    const filtered = operators.filter(op => {
        const q = searchQuery.toLowerCase();
        const name = (op.name ?? op.companyName ?? '').toLowerCase();
        return name.includes(q) || (op.id ?? '').toLowerCase().includes(q);
    });

    // ── Single-submit handler ─────────────────────────────────────────────────
    // Sequence:
    //   1. POST /v1/auth/register  → creates user with USER role
    //   2. POST /v1/users/:id/roles { roleId: BUS_OPERATOR_ROLE_ID } → upgrades role
    //   3. POST /v1/operators      → creates the company record
    // All three must succeed. If step 1 succeeds but step 2/3 fail, the user
    // account exists but has no operator record — admin can retry.
    const handleAdd = async () => {
        setAddError('');

        // Client-side validation
        if (form.password !== form.confirmPassword) {
            setAddError('Passwords do not match.');
            return;
        }
        if (form.password.length < 8) {
            setAddError('Password must be at least 8 characters.');
            return;
        }
        const required = ['fullName', 'email', 'phone', 'password',
            'companyName', 'businessLicenseNo', 'tinNo', 'address',
            'responsibleName', 'companyPhone', 'companyEmail'];
        const missing = required.filter(k => !form[k]?.trim());
        if (missing.length > 0) {
            setAddError(`Please fill in all required fields.`);
            return;
        }

        setSubmitting(true);
        try {
            // Step 1 — Register user account
            const regResponse = await authApi.register({
                fullName: form.fullName,
                email:    form.email,
                phone:    form.phone,
                password: form.password,
            });
            const regPayload = regResponse?.data ?? regResponse;
            const newUserId  = regPayload?.user?.id ?? regPayload?.id;

            if (!newUserId) throw new Error('Registration succeeded but no user ID was returned.');

            // Step 2 — Assign BUS_OPERATOR role
            await usersApi.addUserRole(newUserId, { roleId: BUS_OPERATOR_ROLE_ID });

            // Step 3 — Create operator company record
            await operatorsApi.createOperator({
                companyName:       form.companyName,
                businessLicenseNo: form.businessLicenseNo,
                tinNo:             form.tinNo,
                address:           form.address,
                responsibleName:   form.responsibleName,
                phone:             form.phone,
                companyPhone:      form.companyPhone,
                companyEmail:      form.companyEmail,
                status:            form.status,
            });

            qc.invalidateQueries({ queryKey: operatorKeys.all });
            setIsAddOpen(false);
            setForm(EMPTY_FORM);
        } catch (err) {
            const raw = err?.response?.data?.message?.message
                ?? err?.response?.data?.message
                ?? err?.message
                ?? 'Failed to register operator.';
            setAddError(Array.isArray(raw) ? raw.join('. ') : raw);
        } finally {
            setSubmitting(false);
        }
    };

    const handleSaveEdit = () => {
        updateOp(editForm, {
            onSuccess: () => {
                setIsEditOpen(false);
                setSelectedOp(prev => prev?.id === editForm.id ? { ...prev, ...editForm } : prev);
            },
        });
    };

    const closeAdd = () => {
        setIsAddOpen(false);
        setForm(EMPTY_FORM);
        setAddError('');
    };

    const f = (field) => ({
        value: form[field] ?? '',
        onChange: (e) => setForm(p => ({ ...p, [field]: e.target.value })),
    });

    // ── Detail view ───────────────────────────────────────────────────────────
    if (selectedOp) {
        return (
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                    <Button variant="ghost" onClick={() => setSelectedOp(null)} className="font-bold flex items-center gap-2">
                        ← Back to Operators List
                    </Button>
                    <Button className="bg-primary hover:bg-primary/95 text-white font-bold"
                        onClick={() => { setEditForm({ id: selectedOp.id, ...selectedOp }); setIsEditOpen(true); }}>
                        Edit Operator
                    </Button>
                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-6">
                    <div className="flex items-center gap-4 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center overflow-hidden">
                            {selectedOp.logo
                                ? <img src={selectedOp.logo} alt={selectedOp.name ?? selectedOp.companyName} className="w-full h-full object-cover" />
                                : <Bus size={32} className="text-purple-400" />
                            }
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedOp.name ?? selectedOp.companyName}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">ID: {selectedOp.id}</span>
                                <span className="text-gray-300">•</span>
                                <Badge variant={statusVariant(selectedOp.status)} className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                                    {(selectedOp.status ?? 'ACTIVE').toLowerCase()}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Details</h4>
                            {[
                                ['Legal Name',  selectedOp.companyName ?? selectedOp.name],
                                ['License No',  selectedOp.businessLicenseNo],
                                ['TIN No',      selectedOp.tinNo],
                                ['Address',     selectedOp.address],
                            ].map(([label, val]) => val ? (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                                    <span className="text-gray-400 font-medium">{label}</span>
                                    <span className="font-semibold text-gray-800 font-mono">{val}</span>
                                </div>
                            ) : null)}
                        </div>
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Contact</h4>
                            {[
                                ['Contact Person', selectedOp.responsibleName],
                                ['Phone',          selectedOp.companyPhone ?? selectedOp.phone],
                                ['Email',          selectedOp.companyEmail],
                            ].map(([label, val]) => val ? (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                                    <span className="text-gray-400 font-medium">{label}</span>
                                    <span className="font-semibold text-gray-800">{val}</span>
                                </div>
                            ) : null)}
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {isEditOpen && editForm && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <Card className="w-full max-w-lg bg-white p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                            <button onClick={() => setIsEditOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                            <h2 className="text-xl font-bold mb-1">Edit Operator</h2>
                            <p className="text-sm text-gray-500 mb-6">Update operator company details.</p>
                            <OperatorEditForm data={editForm} onChange={setEditForm} />
                            <Button className="w-full mt-6 bg-primary" onClick={handleSaveEdit} disabled={updating}>
                                {updating ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </Card>
                    </div>
                )}
            </div>
        );
    }

    // ── List view ─────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search by Company Name or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <Button size="sm" onClick={() => setIsAddOpen(true)}>Add New Operator</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold text-center w-16">Icon</th>
                                <th className="px-6 py-4 font-bold">Company</th>
                                <th className="px-6 py-4 font-bold">License</th>
                                <th className="px-6 py-4 font-bold">Contact</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">No operators found.</td></tr>
                            ) : filtered.map(op => (
                                <tr key={op.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center overflow-hidden">
                                            {op.logo
                                                ? <img src={op.logo} alt={op.name ?? op.companyName} className="w-full h-full object-cover" />
                                                : <Building2 size={20} className="text-purple-400" />
                                            }
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{op.name ?? op.companyName}</span>
                                            <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">{op.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{op.businessLicenseNo ?? '—'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{op.companyPhone ?? op.phone ?? '—'}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant(op.status)} className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                                            {(op.status ?? 'ACTIVE').toLowerCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-primary font-bold text-xs"
                                            onClick={() => setSelectedOp(op)}>
                                            View Profile
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Operator Modal — single form, single submit */}
            {isAddOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-2xl bg-white p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                        <button onClick={closeAdd} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-1">Register New Operator</h2>
                        <p className="text-sm text-gray-500 mb-6">
                            Creates a login account with the <span className="font-bold text-primary">BUS_OPERATOR</span> role and registers the company. All fields are required.
                        </p>

                        {addError && (
                            <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                {addError}
                            </div>
                        )}

                        {/* ── Account credentials section ── */}
                        <div className="mb-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">1</span>
                                Login Credentials
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Full Name *</label>
                                    <Input placeholder="Operator's full name" {...f('fullName')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email *</label>
                                    <Input type="email" placeholder="operator@company.et" {...f('email')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone *</label>
                                    <Input type="tel" placeholder="+251..." {...f('phone')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Password *</label>
                                    <Input type="password" placeholder="Min 8 characters" {...f('password')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Confirm Password *</label>
                                    <Input type="password" placeholder="Repeat password" {...f('confirmPassword')} />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 my-2" />

                        {/* ── Company details section ── */}
                        <div className="mt-6">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-black">2</span>
                                Company Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Company Name *</label>
                                    <Input placeholder="e.g. Selam Bus Share Company" {...f('companyName')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Business License No *</label>
                                    <Input placeholder="LIC-2024-00123" {...f('businessLicenseNo')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">TIN No *</label>
                                    <Input placeholder="Unique TIN number" {...f('tinNo')} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Address *</label>
                                    <Input placeholder="Meskel Square, Addis Ababa" {...f('address')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Responsible Person *</label>
                                    <Input placeholder="Full Name" {...f('responsibleName')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Company Phone *</label>
                                    <Input placeholder="+251 11 ..." {...f('companyPhone')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Company Email *</label>
                                    <Input placeholder="info@company.et" {...f('companyEmail')} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                        value={form.status}
                                        onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                        <option value="ACTIVE">Active</option>
                                        <option value="INACTIVE">Inactive</option>
                                        <option value="SUSPENDED">Suspended</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <Button className="w-full mt-8 bg-primary h-12 font-bold text-base" onClick={handleAdd} disabled={submitting}>
                            {submitting ? 'Registering Operator…' : 'Register Operator'}
                        </Button>
                    </Card>
                </div>
            )}
        </div>
    );
}

// ─── Edit form (company fields only — credentials not editable here) ──────────
function OperatorEditForm({ data, onChange }) {
    const f = (field) => ({
        value: data[field] ?? '',
        onChange: (e) => onChange(prev => ({ ...prev, [field]: e.target.value })),
    });
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Company Name</label>
                    <Input {...f('companyName')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Business License No</label>
                    <Input {...f('businessLicenseNo')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">TIN No</label>
                    <Input {...f('tinNo')} />
                </div>
                <div className="space-y-2 col-span-2">
                    <label className="text-sm font-medium text-gray-700">Address</label>
                    <Input {...f('address')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Responsible Person</label>
                    <Input {...f('responsibleName')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Company Phone</label>
                    <Input {...f('companyPhone')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Company Email</label>
                    <Input {...f('companyEmail')} />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Status</label>
                    <select className="w-full h-10 px-3 rounded-md border border-gray-300 bg-white text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        value={data.status ?? 'ACTIVE'}
                        onChange={e => onChange(prev => ({ ...prev, status: e.target.value }))}>
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
