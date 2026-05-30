import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ArrowRight, User, Mail, Phone, Info } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';

export default function PassengerDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    // selectedSeats is now an array of { label, tripSeatId } objects (from SeatSelection).
    // We keep backward compatibility: if it's still a plain string array (mock flow),
    // we wrap each entry so the rest of the page works uniformly.
    const { trip, tripId, selectedSeats: rawSeats, totalPrice } = location.state || {};
    const selectedSeats = (rawSeats ?? []).map(s =>
        typeof s === 'string' ? { label: s, tripSeatId: null } : s
    );

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        emergencyContact: ''
    });

    if (!tripId && !trip) {
        navigate('/');
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        navigate('/booking/payment', {
            state: {
                trip,
                tripId: tripId ?? trip?.id,
                selectedSeats,
                totalPrice,
                passengerDetails: formData,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-16">
            {/* Progress Stepper */}
            <ProgressStepper currentStep={3} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    {/* Main Content - Passenger Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-10">
                            <h2 className="text-3xl font-black text-indigo-950 mb-1 tracking-tight">Passenger Information</h2>
                            <p className="text-sm font-medium text-slate-400 mb-8">Please enter accurate details for a smooth journey.</p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Full Name */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <User size={20} />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Enter your full name"
                                            required
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-[#F8FAFC] border border-slate-200/85 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="+251 9XX XXX XXX"
                                            required
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-[#F8FAFC] border border-slate-200/85 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                </div>

                                {/* Email Address */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">
                                        Email Address <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Mail size={20} />
                                        </div>
                                        <input
                                            type="email"
                                            placeholder="your.email@example.com"
                                            required
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-[#F8FAFC] border border-slate-200/85 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-2 ml-1">
                                        Booking confirmation will be sent to this email
                                    </p>
                                </div>

                                {/* Emergency Contact */}
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2 ml-1">
                                        Emergency Contact <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            <Phone size={20} />
                                        </div>
                                        <input
                                            type="tel"
                                            placeholder="+251 9XX XXX XXX"
                                            required
                                            value={formData.emergencyContact}
                                            onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                            className="w-full h-14 pl-12 pr-4 bg-[#F8FAFC] border border-slate-200/85 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium"
                                        />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 mt-2 ml-1">
                                        In case we need to reach someone on your behalf
                                    </p>
                                </div>

                                {/* Important Information Alert */}
                                <div className="bg-[#EFF6FF]/60 border border-blue-100/50 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center shrink-0">
                                        <Info className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-indigo-950 mb-1">Important Information</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                            Please ensure all information is accurate. You may be asked to present a valid ID that matches the name provided during your journey.
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    fullWidth
                                    className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    Continue to Payment
                                    <ArrowRight className="w-5 h-5 ml-1" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* Sidebar - Booking Summary */}
                    <div className="lg:col-span-2">
                        <BookingSummary
                            trip={trip}
                            tripId={tripId}
                            selectedSeats={selectedSeats.map(s => s.label ?? s)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
