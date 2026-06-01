import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { extractErrorMessage } from '../../lib/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const token = useMemo(
        () => searchParams.get('token') ?? searchParams.get('resetToken') ?? '',
        [searchParams],
    );

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!token) {
            setError('Reset link is invalid or missing. Request a new link from the forgot password page.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.resetPassword({ token, newPassword });
            setSuccess(true);
            setTimeout(() => navigate('/login', { state: { prefill: '' } }), 2500);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                setError('Password reset is not available yet. Please contact support or request a new link.');
            } else {
                setError(extractErrorMessage(err, 'Could not reset password. The link may have expired.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Set new password</h1>
                    <p className="text-gray-500 mt-2">Choose a strong password for your Menaharia account.</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {success ? (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                            <p className="text-sm text-gray-600">
                                Your password was updated. Redirecting you to sign in…
                            </p>
                            <Link to="/login" className="text-sm font-bold text-primary hover:underline">
                                Sign in now
                            </Link>
                        </div>
                    ) : (
                        <>
                            {!token && (
                                <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 text-sm">
                                    This page needs a reset token from your email link.
                                    {' '}
                                    <Link to="/forgot-password" className="font-bold underline">
                                        Request a new link
                                    </Link>
                                </div>
                            )}

                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">New password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="At least 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Confirm password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            minLength={8}
                                            autoComplete="new-password"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isSubmitting || !token}
                                    className="py-6 rounded-xl font-bold text-lg"
                                >
                                    {isSubmitting ? 'Saving…' : 'Update password'}
                                </Button>
                            </form>

                            <p className="text-center mt-6">
                                <Link
                                    to="/forgot-password"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mr-4"
                                >
                                    Request new link
                                </Link>
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                >
                                    <ArrowLeft size={16} />
                                    Sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
