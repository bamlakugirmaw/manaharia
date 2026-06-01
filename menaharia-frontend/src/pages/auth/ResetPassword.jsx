import { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, KeyRound, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { extractErrorMessage } from '../../lib/api';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const emailFromQuery = useMemo(
        () => searchParams.get('email') ?? '',
        [searchParams],
    );
    const otpFromQuery = useMemo(
        () => searchParams.get('otp') ?? searchParams.get('code') ?? '',
        [searchParams],
    );

    const [email, setEmail] = useState(emailFromQuery);
    const [otp, setOtp] = useState(otpFromQuery);

    useEffect(() => {
        if (emailFromQuery) setEmail(emailFromQuery);
        if (otpFromQuery) setOtp(otpFromQuery);
    }, [emailFromQuery, otpFromQuery]);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email.trim()) {
            setError('Enter the email address for your account.');
            return;
        }
        if (!otp.trim()) {
            setError('Enter the verification code from your email.');
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
            await authApi.resetPassword({
                email: email.trim(),
                otp: otp.trim(),
                newPassword,
            });
            setSuccess(true);
            setTimeout(() => navigate('/login'), 2500);
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not reset password. Check the code and try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
                    <p className="text-gray-500 mt-2">
                        Enter the code we emailed you and choose a new password.
                    </p>
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
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">Verification code</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            required
                                            inputMode="numeric"
                                            autoComplete="one-time-code"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none font-mono tracking-widest"
                                            placeholder="Code from email"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400 ml-1">
                                        Did not receive it?{' '}
                                        <Link to="/forgot-password" className="font-semibold text-primary hover:underline">
                                            Send a new code
                                        </Link>
                                    </p>
                                </div>

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
                                    disabled={isSubmitting}
                                    className="py-6 rounded-xl font-bold text-lg"
                                >
                                    {isSubmitting ? 'Saving…' : 'Update password'}
                                </Button>
                            </form>

                            <p className="text-center mt-6">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                                >
                                    <ArrowLeft size={16} />
                                    Back to sign in
                                </Link>
                            </p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
