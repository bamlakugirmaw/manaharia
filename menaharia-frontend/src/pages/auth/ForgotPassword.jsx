import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { extractErrorMessage } from '../../lib/api';

const GENERIC_SUCCESS =
    'If an account exists for that email or phone, we sent password reset instructions. Check your inbox or messages.';

export default function ForgotPassword() {
    const [identifier, setIdentifier] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const isPhone = /^[+0-9]/.test(identifier.trim());
    const InputIcon = isPhone ? Phone : Mail;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await authApi.forgotPassword({ identifier: identifier.trim() });
            setSubmitted(true);
        } catch (err) {
            const status = err?.response?.status;
            if (status === 404) {
                setError('Password reset is not available yet. Please contact support or try again later.');
            } else {
                setError(extractErrorMessage(err, 'Could not send reset instructions. Try again.'));
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
                    <p className="text-gray-500 mt-2">
                        Enter the email or phone you use to sign in. We will send reset instructions.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                            <p className="text-sm text-gray-600 leading-relaxed">{GENERIC_SUCCESS}</p>
                            <Link
                                to="/login"
                                className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                            >
                                <ArrowLeft size={16} />
                                Back to sign in
                            </Link>
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-gray-700 ml-1">
                                        Email or phone number
                                    </label>
                                    <div className="relative">
                                        <InputIcon
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="text"
                                            required
                                            autoComplete="username"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="Email or phone (e.g. 0912345678)"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isSubmitting}
                                    className="py-6 rounded-xl font-bold text-lg"
                                >
                                    {isSubmitting ? 'Sending…' : 'Send reset instructions'}
                                </Button>
                            </form>

                            <p className="text-center mt-6">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary"
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
