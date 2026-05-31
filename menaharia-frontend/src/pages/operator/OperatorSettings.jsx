import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building, Phone, Mail, CreditCard, Lock, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOperator } from '../../hooks/useOperators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { operatorsApi } from '../../api/operators.api';
import { operatorKeys } from '../../hooks/useOperators';
import ProfileAvatarUpload from '../../components/profile/ProfileAvatarUpload';
import { storageApi } from '../../api/storage.api';

function useUpdateOperator() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }) => operatorsApi.updateOperator(id, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: operatorKeys.all }),
    });
}

export default function OperatorSettings() {
    const { user, changePassword, setAvatarUrl } = useAuth();
    const operatorId = user?.operatorId ?? null;

    const [logo, setLogo] = useState(null);
    const [logoPublicId, setLogoPublicId] = useState(null);
    const [logoError, setLogoError] = useState('');
    const [logoSuccess, setLogoSuccess] = useState(false);

    // ── Fetch operator data ───────────────────────────────────────────────────
    const { data: rawOperator, isLoading: opLoading } = useOperator(operatorId);
    const operator = rawOperator?.data ?? rawOperator;

    // ── Profile form state ────────────────────────────────────────────────────
    const [profileForm, setProfileForm] = useState({
        companyName: '', companyPhone: '', companyEmail: '', address: '',
    });
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError, setProfileError] = useState('');

    // Pre-fill when operator loads
    useEffect(() => {
        if (operator) {
            setProfileForm({
                companyName:  operator.companyName  ?? operator.name  ?? '',
                companyPhone: operator.companyPhone ?? operator.phone ?? '',
                companyEmail: operator.companyEmail ?? '',
                address:      operator.address      ?? '',
            });
            setLogo(operator.logo ?? null);
        }
    }, [operator]);

    const { mutateAsync: updateOp } = useUpdateOperator();

    const persistLogo = async (logoUrl) => {
        if (!operatorId) throw new Error('Operator profile not found.');
        await updateOp({ id: operatorId, logo: logoUrl || '' });
        setLogo(logoUrl || null);
        setAvatarUrl(logoUrl || null);
    };

    const handleLogoUploaded = async ({ url, publicId }) => {
        setLogoError('');
        setLogoSuccess(false);
        try {
            await persistLogo(url);
            if (publicId) setLogoPublicId(publicId);
            setLogoSuccess(true);
            setTimeout(() => setLogoSuccess(false), 3000);
        } catch (err) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Logo update failed.';
            setLogoError(Array.isArray(msg) ? msg.join('. ') : msg);
            throw err;
        }
    };

    const handleLogoRemove = async () => {
        setLogoError('');
        setLogoSuccess(false);
        try {
            if (logoPublicId) {
                try {
                    await storageApi.deleteImage(logoPublicId);
                } catch {
                    // Non-fatal — still clear operator logo reference
                }
            }
            await persistLogo('');
            setLogoPublicId(null);
            setLogoSuccess(true);
            setTimeout(() => setLogoSuccess(false), 3000);
        } catch (err) {
            const msg = err?.response?.data?.message ?? err?.message ?? 'Logo removal failed.';
            setLogoError(Array.isArray(msg) ? msg.join('. ') : msg);
            throw err;
        }
    };

    const handleSaveProfile = () => {
        if (!operatorId) return;
        setSavingProfile(true);
        setProfileError('');
        setProfileSuccess(false);
        updateOp({ id: operatorId, ...profileForm }, {
            onSuccess: () => {
                setSavingProfile(false);
                setProfileSuccess(true);
                setTimeout(() => setProfileSuccess(false), 3000);
            },
            onError: (err) => {
                setSavingProfile(false);
                const msg = err?.response?.data?.message ?? 'Update failed.';
                setProfileError(Array.isArray(msg) ? msg.join('. ') : msg);
            },
        });
    };

    // ── Banking (UI only — no backend endpoint) ───────────────────────────────
    const [savingBanking, setSavingBanking] = useState(false);
    const handleSaveBanking = () => {
        setSavingBanking(true);
        setTimeout(() => setSavingBanking(false), 1500);
    };

    // ── Password ──────────────────────────────────────────────────────────────
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    const handleUpdatePassword = async () => {
        setPasswordError('');
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setPasswordError('All fields are required'); return;
        }
        if (passwords.new.length < 8) {
            setPasswordError('Password must be at least 8 characters long'); return;
        }
        if (passwords.new !== passwords.confirm) {
            setPasswordError('New passwords do not match'); return;
        }
        setSavingPassword(true);
        const result = await changePassword({ currentPassword: passwords.current, newPassword: passwords.new });
        setSavingPassword(false);
        if (result.success) {
            setPasswordSuccess(true);
            setShowPasswordForm(false);
            setPasswords({ current: '', new: '', confirm: '' });
            setTimeout(() => setPasswordSuccess(false), 3000);
        } else {
            setPasswordError(result.message ?? 'Password change failed.');
        }
    };

    // ── Logo (upload → PATCH /operators/:id) ─────────────────────────────────
    const displayName = operator?.companyName ?? operator?.name ?? user?.name ?? 'Operator';

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            {/* Profile Header */}
            <Card className="p-6 border-none shadow-sm flex flex-col md:flex-row items-center gap-6">
                <ProfileAvatarUpload
                    value={logo}
                    name={displayName}
                    folder="operators"
                    uploadLabel="Change Logo"
                    removeLabel="Remove Logo"
                    onUploaded={handleLogoUploaded}
                    onRemoved={handleLogoRemove}
                />
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold">{opLoading ? '…' : displayName}</h2>
                    <p className="text-gray-500">
                        {operator?.status ? `${operator.status} Operator` : 'Verified Operator'}
                    </p>
                    {logoError && (
                        <p className="mt-3 text-sm text-red-600">{logoError}</p>
                    )}
                    {logoSuccess && (
                        <p className="mt-3 text-sm text-green-700 flex items-center justify-center md:justify-start gap-1">
                            <Check size={14} /> Logo updated successfully!
                        </p>
                    )}
                </div>
            </Card>

            {/* Company Information Form */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Building className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Company Information</h3>
                </div>

                {profileError && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">{profileError}</div>
                )}
                {profileSuccess && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-center gap-2">
                        <Check size={16} /> Profile updated successfully!
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                            value={profileForm.companyName}
                            onChange={e => setProfileForm(p => ({ ...p, companyName: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Registration Number (TIN)</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                            value={operator?.tinNo ?? '—'} disabled />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={profileForm.companyPhone}
                                onChange={e => setProfileForm(p => ({ ...p, companyPhone: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="email" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={profileForm.companyEmail}
                                onChange={e => setProfileForm(p => ({ ...p, companyEmail: e.target.value }))} />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Headquarters Address</label>
                        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" rows="3"
                            value={profileForm.address}
                            onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))} />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={handleSaveProfile} disabled={savingProfile || opLoading} className="min-w-[140px]">
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </Card>

            {/* Banking Settings — UI only, no backend endpoint */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <CreditCard className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Banking & Payouts</h3>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-semibold">
                    Banking details are managed by the platform administrator. Contact support to update your payout account.
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bank Name</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" disabled>
                            <option>Commercial Bank of Ethiopia</option>
                            <option>Awash Bank</option>
                            <option>Dashen Bank</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Account Number</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400" value="Contact admin to update" disabled />
                    </div>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Lock className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Security & Passwords</h3>
                </div>

                {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-center gap-2">
                        <Check size={16} /> Password updated successfully!
                    </div>
                )}

                {!showPasswordForm ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Account Password</h4>
                            <p className="text-sm text-gray-500">Periodically changing your password ensures strong account security.</p>
                        </div>
                        <Button variant="outline" onClick={() => setShowPasswordForm(true)}>Update Password</Button>
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in duration-300">
                        <h4 className="font-bold text-gray-900 mb-4">Update Password</h4>
                        {passwordError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 mb-5">{passwordError}</div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input type="password" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button variant="ghost" onClick={() => { setShowPasswordForm(false); setPasswordError(''); }}>Cancel</Button>
                            <Button onClick={handleUpdatePassword} disabled={savingPassword}>
                                {savingPassword ? 'Updating...' : 'Save Password'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
