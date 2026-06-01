import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';

export default function Login() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    // Pre-fill identifier if redirected from signup
    const [emailOrPhone, setEmailOrPhone] = useState(location.state?.prefill ?? '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // AuthContext.login now accepts (identifier, password) matching the backend.
            // The `identifier` field accepts both email and phone — same UX, different param name.
            const result = await login(emailOrPhone, password);
            if (result.success) {
                // Redirect based on the normalised role from the backend.
                if (result.user.role === 'admin') navigate('/admin/dashboard');
                else if (result.user.role === 'operator') navigate('/operator/dashboard');
                else navigate(from === '/' ? '/traveller/bookings' : from);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };



    // Dynamically show Mail or Phone icon based on whether it looks like a phone pattern
    const isPhone = /^[+0-9]/.test(emailOrPhone);
    const InputIcon = isPhone ? Phone : Mail;

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Logo & Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-500 mt-2">Sign in to your account to continue</p>
                </div>

                {/* Login Card */}
                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm animate-in fade-in slide-in-from-top-1">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 ml-1">Email Address or Phone Number</label>
                            <div className="relative">
                                <InputIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 transition-all duration-300" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Enter your email or phone number"
                                    value={emailOrPhone}
                                    onChange={(e) => setEmailOrPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                                    Forgot Password?
                                </Link>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
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

                        <Button
                            type="submit"
                            fullWidth
                            className="py-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:translate-y-[-1px] active:translate-y-[0px] transition-all"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Signing In...' : 'Sign In'}
                            {!isSubmitting && <ArrowRight className="ml-2" size={20} />}
                        </Button>
                    </form>


                </div>

                {/* Signup Link */}
                <p className="text-center mt-8 text-gray-600">
                    Don't have an account? {' '}
                    <Link to="/signup" className="text-primary font-bold hover:underline">
                        Create one now
                    </Link>
                </p>
            </div>
        </div>
    );
}
