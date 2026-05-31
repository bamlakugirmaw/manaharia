import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { Check, AlertCircle, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useProfileImage } from '../../hooks/useProfileImage';
import ProfileAvatarUpload from '../../components/profile/ProfileAvatarUpload';
import { storageApi } from '../../api/storage.api';

export default function UserProfile() {
    const navigate = useNavigate();
    const { user, updateProfile, changePassword, deleteAccount, setAvatarUrl } = useAuth();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();
    const avatarUrl = useProfileImage();

    const isAdmin = user?.role === 'admin';
    const isTraveller = user?.role === 'traveller';
    const canUploadPhoto = isAdmin || isTraveller;

    const roleLabel = isAdmin
        ? 'Admin Account'
        : user?.role === 'operator'
            ? 'Operator Account'
            : 'Traveller Account';

    const [photoError, setPhotoError] = useState('');
    const [photoSuccess, setPhotoSuccess] = useState(false);
    const [photoPublicId, setPhotoPublicId] = useState(null);

    // ── Profile form ──────────────────────────────────────────────────────────
    const [profileForm, setProfileForm] = useState({
        fullName: '',
        email:    '',
        phone:    '',
    });
    const [profileSaving,  setProfileSaving]  = useState(false);
    const [profileSuccess, setProfileSuccess] = useState(false);
    const [profileError,   setProfileError]   = useState('');

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

    const handlePhotoUploaded = async ({ url, publicId }) => {
        setPhotoError('');
        setPhotoSuccess(false);
        const result = await updateProfile({ profilePicture: url });
        if (result.success) {
            setAvatarUrl(url);
            if (publicId) setPhotoPublicId(publicId);
            setPhotoSuccess(true);
            setTimeout(() => setPhotoSuccess(false), 3000);
        } else {
            setPhotoError(result.message ?? 'Profile photo update failed.');
            throw new Error(result.message);
        }
    };

    const handlePhotoRemoved = async () => {
        setPhotoError('');
        setPhotoSuccess(false);
        if (photoPublicId) {
            try {
                await storageApi.deleteImage(photoPublicId);
            } catch {
                // Non-fatal — still clear profile on the user record
            }
        }
        const result = await updateProfile({ profilePicture: null });
        if (result.success) {
            setAvatarUrl(null);
            setPhotoPublicId(null);
            setPhotoSuccess(true);
            setTimeout(() => setPhotoSuccess(false), 3000);
        } else {
            setPhotoError(result.message ?? 'Could not remove profile photo.');
            throw new Error(result.message);
        }
    };

    // ── Password form ─────────────────────────────────────────────────────────
    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [pwSaving,  setPwSaving]  = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError,   setPwError]   = useState('');

    const [deleteError, setDeleteError] = useState('');
    const [deletingAccount, setDeletingAccount] = useState(false);

    const handleDeleteAccount = async () => {
        setDeleteError('');
        const ok = await confirm({
            title: 'Delete your account?',
            description: 'You will be signed out and your account data will be permanently removed. This cannot be undone.',
            confirmLabel: 'Continue',
        });
        if (!ok) return;
        const confirmed = await confirm({
            title: 'Final confirmation',
            description: 'Are you absolutely sure you want to delete your Menaharia account?',
            confirmLabel: 'Delete My Account',
        });
        if (!confirmed) return;
        setDeletingAccount(true);
        const result = await deleteAccount();
        setDeletingAccount(false);
        if (result.success) {
            navigate('/');
        } else {
            setDeleteError(result.message ?? 'Account deletion failed.');
        }
    };

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
            <ConfirmDialogHost />
            <Card className="p-8 border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl bg-white space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-gray-100/80">
                    <ProfileAvatarUpload
                        value={avatarUrl}
                        name={user?.name ?? ''}
                        folder="profiles"
                        uploadLabel="Change Photo"
                        removeLabel="Remove Photo"
                        disabled={!canUploadPhoto}
                        disabledReason={!canUploadPhoto ? 'Company logo is managed from Operator Profile settings.' : undefined}
                        onUploaded={canUploadPhoto ? handlePhotoUploaded : undefined}
                        onRemoved={canUploadPhoto ? handlePhotoRemoved : undefined}
                    />
                    <div className="text-center sm:text-left">
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{user?.name || '—'}</h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1 bg-blue-50 px-2.5 py-1 rounded-full w-fit mx-auto sm:mx-0">
                            {roleLabel}
                        </p>
                        {photoSuccess && (
                            <p className="text-xs text-green-700 mt-2 font-semibold flex items-center gap-1 justify-center sm:justify-start">
                                <Check size={12} /> Photo updated
                            </p>
                        )}
                        {photoError && (
                            <p className="text-xs text-red-600 mt-2 font-semibold">{photoError}</p>
                        )}
                    </div>
                </div>

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

            {isTraveller && (
                <Card className="p-8 border border-red-100/80 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl bg-white space-y-4">
                    <div>
                        <h3 className="font-bold text-red-700 text-base mb-1">Delete Account</h3>
                        <p className="text-xs text-gray-500">
                            Permanently remove your Menaharia account. This action cannot be undone.
                        </p>
                    </div>
                    {deleteError && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-2">
                            <AlertCircle size={16} /> {deleteError}
                        </div>
                    )}
                    <Button
                        type="button"
                        variant="destructive"
                        disabled={deletingAccount}
                        onClick={handleDeleteAccount}
                        className="rounded-xl px-6 h-12 font-semibold flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        {deletingAccount ? 'Deleting…' : 'Delete My Account'}
                    </Button>
                </Card>
            )}
        </div>
    );
}
