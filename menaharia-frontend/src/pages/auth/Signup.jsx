import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Logo } from '../../components/ui/Logo';
import { User, Mail, Lock, ArrowRight, CheckCircle2, Phone } from 'lucide-react';

const validatePhoneNumber = (phone) => {
    const cleaned = phone.trim();
    if (!cleaned) return 'Phone number is required';
    
    // Ethiopian specific check: 09... or 07... (10 digits) or +2517... or +2519... (13 chars)
    const ethiopianRegex = /^(?:\+251|0)[79]\d{8}$/;
    // General international check
    const internationalRegex = /^\+[1-9]\d{6,14}$/;
    
    if (ethiopianRegex.test(cleaned) || internationalRegex.test(cleaned)) {
        return '';
    }
    
    return 'Please enter a valid phone number (e.g. 0912345678 or +251912345678)';
};

export default function Signup() {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [phoneError, setPhoneError] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { signup } = useAuth();
    const navigate = useNavigate();

    const handlePhoneChange = (e) => {
        let val = e.target.value;
        // Prevent invalid characters: allow only digits and leading '+'
        let sanitized = val.replace(/[^\d+]/g, '');
        if (sanitized.includes('+')) {
            sanitized = (sanitized.startsWith('+') ? '+' : '') + sanitized.replace(/\+/g, '');
        }
        
        setFormData(prev => ({ ...prev, phone: sanitized }));
        
        // Real-time validation
        if (sanitized) {
            setPhoneError(validatePhoneNumber(sanitized));
        } else {
            setPhoneError('Phone number is required');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setPhoneError('');

        const phoneValidationError = validatePhoneNumber(formData.phone);
        if (phoneValidationError) {
            setPhoneError(phoneValidationError);
            return setError('Please provide a valid phone number');
        }

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match');
        }

        setIsSubmitting(true);
        try {
            const result = await signup(formData);
            if (result.success) {
                setSuccess(true);
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Account creation failed. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                    <p className="text-gray-500 mt-2">Join thousands of travellers today</p>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100">
                    {success ? (
                        <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                <CheckCircle2 size={40} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 mb-2">Registration Successful!</h2>
                            <p className="text-gray-500">Your account has been created. Redirecting to login...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="tel"
                                        required
                                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all ${
                                            phoneError ? 'focus:ring-red-500/20 border border-red-300' : ''
                                        }`}
                                        placeholder="Enter your phone number (e.g. 0912345678)"
                                        value={formData.phone}
                                        onChange={handlePhoneChange}
                                    />
                                </div>
                                {phoneError && (
                                    <p className="text-xs font-medium text-red-500 ml-1 mt-1 animate-in fade-in duration-200">
                                        {phoneError}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Email Address (Optional)</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Enter your email (optional)"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Create a password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700 ml-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Confirm your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                className="py-6 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all"
                                disabled={isSubmitting || !!phoneError}
                            >
                                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                                {!isSubmitting && <ArrowRight className="ml-2" size={20} />}
                            </Button>
                        </form>
                    )}
                </div>

                <p className="text-center mt-8 text-gray-600">
                    Already have an account? {' '}
                    <Link to="/login" className="text-primary font-bold hover:underline">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
}
