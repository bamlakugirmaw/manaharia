import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, User, Mail, Phone, AlertCircle } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';

export default function PassengerDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, selectedSeats, totalPrice } = location.state || {};

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        emergencyContact: ''
    });

    if (!tripId) {
        navigate('/');
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/booking/payment', {
            state: {
                tripId,
                selectedSeats,
                totalPrice,
                passengerDetails: formData
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Progress Stepper */}
            <ProgressStepper currentStep={3} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Main Content - Passenger Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Passenger Information</h1>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <User size={18} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="+251 9XX XXX XXX"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Mail size={18} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        Booking confirmation will be sent to this email
                                    </p>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Emergency Contact <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                            <Phone size={18} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="+251 9XX XXX XXX"
                                            required
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            className="w-full h-12 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-gray-900"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1.5">
                                        In case we need to reach someone on your behalf
                                    </p>
                                </div>

                                {/* Important Information Alert */}
                                <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-4">
                                    <div className="flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                                        <div>
                                            <h4 className="font-semibold text-sm text-gray-900 mb-1">Important Information</h4>
                                            <p className="text-xs text-gray-700 leading-relaxed">
                                                Please ensure all information is accurate. You may be asked to present a valid ID that matches the name provided during your journey.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-6"
                                >
                                    Continue to Payment
                                    <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="lg:col-span-2">
                        <BookingSummary
                            tripId={tripId}
                            selectedSeats={selectedSeats}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
