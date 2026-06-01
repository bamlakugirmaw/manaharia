import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { authApi } from '../../api/auth.api';
import { extractErrorMessage } from '../../lib/api';

const GENERIC_SUCCESS =
    'If an account exists for that email, we sent a one-time verification code. Check your inbox (and spam folder).';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await authApi.forgotPassword({ email: email.trim() });
            setSubmitted(true);
        } catch (err) {
            setError(extractErrorMessage(err, 'Could not send verification code. Try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetUrl = `/reset-password?email=${encodeURIComponent(email.trim())}`;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Forgot password?</h1>
                    <p className="text-gray-500 mt-2">
                        Enter your account email. We will send a one-time code to reset your password.
                    </p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {submitted ? (
                        <div className="text-center space-y-4">
                            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
                            <p className="text-sm text-gray-600 leading-relaxed">{GENERIC_SUCCESS}</p>
                            <Link to={resetUrl}>
                                <Button fullWidth className="py-4 rounded-xl font-bold">
                                    Enter verification code
                                </Button>
                            </Link>
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
                                        Email address
                                    </label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                                            size={18}
                                        />
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    fullWidth
                                    disabled={isSubmitting}
                                    className="py-6 rounded-xl font-bold text-lg"
                                >
                                    {isSubmitting ? 'Sending…' : 'Send verification code'}
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
