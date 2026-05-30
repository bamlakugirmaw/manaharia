import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { User, Check, AlertCircle } from 'lucide-react';
import profileIcon from '../../assets/profile-icon.jpg';
import { useAuth } from '../../contexts/AuthContext';

export default function UserProfile() {
    const { user, updateProfile, changePassword } = useAuth();

    // ── Profile form ──────────────────────────────────────────────────────────
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email:    '',
        phone:    '',
    });
    const [profileSaving,  setProfileSaving]  = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError,   setProfileError]   = useState('');

    // Pre-fill from AuthContext when user loads
    useEffect(() => {
        if (user) {
            setProfileForm({
                fullName: user.name  ?? '',
                email:    user.email ?? '',
                phone:    user.phone ?? '',
            });
        }
    }, [user]);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileSaving(true);
        setProfileError('');
        setProfileSuccess(false);

        const result = await updateProfile(profileForm);
        setProfileSaving(false);

        if (result.success) {
            setProfileSuccess(true);
            setTimeout(() => setProfileSuccess(false), 3000);
        } else {
            setProfileError(result.message ?? 'Update failed.');
        }
    };

    // ── Password form ─────────────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving,  setPwSaving]  = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError,   setPwError]   = useState('');

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        setPwError('');
        setPwSuccess(false);

        if (pwForm.newPassword !== pwForm.confirmPassword) {
            setPwError('New passwords do not match.');
            return;
        }
        if (pwForm.newPassword.length < 8) {
            setPwError('New password must be at least 8 characters.');
            return;
        }

        setPwSaving(true);
        const result = await changePassword({
            currentPassword: pwForm.currentPassword,
            newPassword:     pwForm.newPassword,
        });
        setPwSaving(false);

        if (result.success) {
            setPwSuccess(true);
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setPwSuccess(false), 3000);
        } else {
            setPwError(result.message ?? 'Password change failed.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Info Card */}
            <Card className="p-8 border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl bg-white space-y-8">
                {/* Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100/80">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative group cursor-pointer overflow-hidden bg-gray-50 shrink-0">
                        <img src={profileIcon} alt="Profile" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                            Change
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.name || '—'}</h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                            {user?.role === 'traveller' ? 'Traveller Account' : (user?.role ?? 'Account')}
                        </p>
                    </div>
                </div>

                {/* Profile form */}
                <form onSubmit={handleProfileSave} className="space-y-6">
                    {profileSuccess && (
                        <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-2xl border border-emerald-100/50 flex items-center gap-2 animate-in fade-in duration-300">
                            <Check size={16} /> Profile updated successfully!
                        </div>
                    )}
                    {profileError && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
                            <AlertCircle size={16} /> {profileError}
                        </div>
                    )}

                    <Input
                        label="Full Name"
                        value={profileForm.fullName}
                        onChange={e => setProfileForm(p => ({ ...p, fullName: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={profileForm.email}
                        onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white"
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        value={profileForm.phone}
                        onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white"
                    />

                    <div className="pt-4 flex justify-end gap-3 border-t border-gray-100/80">
                        <Button type="button" variant="outline" className="rounded-xl px-6 h-12 font-semibold border-gray-200 hover:bg-gray-50"
                            onClick={() => setProfileForm({ fullName: user?.name ?? '', email: user?.email ?? '', phone: user?.phone ?? '' })}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={profileSaving}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 font-semibold shadow-lg shadow-primary/10 min-w-[140px]">
                            {profileSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Change Password Card */}
            <Card className="p-8 border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl bg-white space-y-6">
                <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">Change Password</h3>
                    <p className="text-xs text-gray-400">Fill in all fields to update your password.</p>
                </div>

                <form onSubmit={handlePasswordSave} className="space-y-4">
                    {pwSuccess && (
                        <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-2xl border border-emerald-100/50 flex items-center gap-2">
                            <Check size={16} /> Password changed successfully!
                        </div>
                    )}
                    {pwError && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
                            <AlertCircle size={16} /> {pwError}
                        </div>
                    )}

                    <Input label="Current Password" type="password" placeholder="••••••••"
                        value={pwForm.currentPassword}
                        onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 text-gray-700 bg-white" />
                    <Input label="New Password" type="password" placeholder="••••••••"
                        value={pwForm.newPassword}
                        onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 text-gray-700 bg-white" />
                    <Input label="Confirm New Password" type="password" placeholder="••••••••"
                        value={pwForm.confirmPassword}
                        onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 text-gray-700 bg-white" />

                    <div className="pt-4 flex justify-end border-t border-gray-100/80">
                        <Button type="submit" disabled={pwSaving}
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 font-semibold shadow-lg shadow-primary/10 min-w-[160px]">
                            {pwSaving ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
