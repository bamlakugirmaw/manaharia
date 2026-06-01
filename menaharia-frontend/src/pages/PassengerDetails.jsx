import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { loadBookingFlow, saveBookingFlow, clearBookingSession } from '../lib/bookingFlow';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth.api';
import { Button } from '../components/ui/Button';
import { ArrowRight, User, Mail, Phone, Info, Clock } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';
import { reserveBooking } from '../lib/bookingCheckout';
import { extractErrorMessage } from '../lib/api';
import { bookingKeys } from '../hooks/useBookings';
import { tripKeys } from '../hooks/useTrips';

const EMPTY_FORM = {
    fullName: '',
    email: '',
    phone: '',
    emergencyContact: '',
};

function profileToPassengerForm(profile) {
    if (!profile) return null;
    const fullName = profile.fullName ?? profile.name ?? '';
    const phone = profile.phone ?? '';
    const email = profile.email ?? '';
    if (!fullName && !phone && !email) return null;
    return {
        fullName,
        email,
        phone,
        emergencyContact: profile.emergencyContact ?? phone,
    };
}

export default function PassengerDetails() {
    const location = useLocation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user, isAuthenticated } = useAuth();
    const prefilledRef = useRef(false);
    const submitLock = useRef(false);

    const saved = loadBookingFlow();
    const flow = location.state ?? saved ?? {};
    const { trip, tripId, selectedSeats: rawSeats, totalPrice } = flow;
    const selectedSeats = (rawSeats ?? []).map((s) =>
        typeof s === 'string' ? { label: s, tripSeatId: null } : s
    );

    const [formData, setFormData] = useState(EMPTY_FORM);
    const [profilePrefilled, setProfilePrefilled] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(null); // 'payLater' | 'payment' | null

    useEffect(() => {
        if (!tripId && !trip) {
            const id = saved?.tripId;
            if (id) navigate(`/booking/seats/${id}`, { replace: true });
            else navigate('/search', { replace: true });
        }
    }, [tripId, trip, saved, navigate]);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', {
                state: { from: { pathname: '/booking/passenger', state: flow } },
            });
        }
    }, [isAuthenticated, navigate, flow]);

    useEffect(() => {
        const fromFlow = flow.passengerDetails ?? saved?.passengerDetails;
        if (fromFlow && (fromFlow.fullName || fromFlow.email || fromFlow.phone)) {
            if (!prefilledRef.current) {
                setFormData({
                    fullName: fromFlow.fullName ?? '',
                    email: fromFlow.email ?? '',
                    phone: fromFlow.phone ?? '',
                    emergencyContact: fromFlow.emergencyContact ?? '',
                });
                prefilledRef.current = true;
            }
            return undefined;
        }

        if (prefilledRef.current) return undefined;

        const applyProfile = (profile) => {
            const mapped = profileToPassengerForm(profile);
            if (!mapped) return;
            setFormData(mapped);
            setProfilePrefilled(true);
            prefilledRef.current = true;
        };

        if (!isAuthenticated) {
            applyProfile(user);
            return undefined;
        }

        let cancelled = false;
        authApi.me()
            .then((response) => {
                if (cancelled) return;
                const raw = response?.data ?? response;
                applyProfile({
                    fullName: raw.fullName ?? raw.name,
                    email: raw.email,
                    phone: raw.phone,
                });
            })
            .catch(() => {
                if (!cancelled) applyProfile(user);
            });

        return () => { cancelled = true; };
    }, [user, isAuthenticated, flow.passengerDetails, saved?.passengerDetails]);

    if (!tripId && !trip) {
        return null;
    }

    const invalidateAfterReserve = (bookingId) => {
        queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
        queryClient.invalidateQueries({ queryKey: tripKeys.all });
    };

    const runReserve = async () => {
        const effectiveTripId = tripId ?? trip?.id;
        return reserveBooking({
            tripId: effectiveTripId,
            trip,
            selectedSeats,
            passengerDetails: formData,
        });
    };

    const handlePayLater = async (e) => {
        e.preventDefault();
        if (submitLock.current) return;
        submitLock.current = true;
        setErrorMsg('');
        setSubmitting('payLater');

        try {
            const result = await runReserve();
            invalidateAfterReserve(result.bookingId);
            clearBookingSession();

            navigate('/traveller/bookings', {
                replace: false,
                state: {
                    bookingReserved: true,
                    bookingId: result.bookingId,
                    bookingReference: result.bookingReference,
                    payLater: true,
                },
            });
        } catch (err) {
            setErrorMsg(extractErrorMessage(err, 'Could not save your booking. Please try again.'));
        } finally {
            setSubmitting(null);
            submitLock.current = false;
        }
    };

    const handleContinueToPayment = async (e) => {
        e.preventDefault();
        if (submitLock.current) return;
        submitLock.current = true;
        setErrorMsg('');
        setSubmitting('payment');

        try {
            const result = await runReserve();
            invalidateAfterReserve(result.bookingId);

            const payload = {
                trip: result.trip ?? trip,
                tripId: tripId ?? trip?.id,
                selectedSeats: result.selectedSeats,
                totalPrice: result.totalAmount ?? totalPrice,
                passengerDetails: formData,
                bookingId: result.bookingId,
                bookingReference: result.bookingReference,
                reservedUntil: result.reservedUntil,
            };
            saveBookingFlow({ ...payload, step: 'payment' });
            navigate('/booking/payment', { state: payload });
        } catch (err) {
            setErrorMsg(extractErrorMessage(err, 'Could not reserve seats. Please try again.'));
        } finally {
            setSubmitting(null);
            submitLock.current = false;
        }
    };

    const busy = submitting !== null;

    return (
        <div className="min-h-screen bg-[#F8FAFC] pb-16">
            <ProgressStepper currentStep={3} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-10">
                            <h2 className="text-3xl font-black text-indigo-950 mb-1 tracking-tight">Passenger Information</h2>
                            <p className="text-sm font-medium text-slate-400 mb-4">Please enter accurate details for a smooth journey.</p>
                            {profilePrefilled && (
                                <p className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-6">
                                    Pre-filled from your account. You can edit any field before continuing.
                                </p>
                            )}

                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                                    {errorMsg}
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleContinueToPayment}>
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
                                </div>

                                <div className="bg-[#EFF6FF]/60 border border-blue-100/50 rounded-2xl p-5 flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100/50 flex items-center justify-center shrink-0">
                                        <Info className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-sm text-indigo-950 mb-1">Important Information</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                                            Pay Later reserves your seats with payment status Pending. You can complete payment anytime from My Bookings.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        fullWidth
                                        disabled={busy}
                                        isLoading={submitting === 'payLater'}
                                        onClick={handlePayLater}
                                        className="h-14 border-2 border-slate-300 text-slate-800 font-extrabold text-base rounded-2xl hover:bg-slate-50 flex items-center justify-center gap-2"
                                    >
                                        <Clock className="w-5 h-5" />
                                        {submitting === 'payLater' ? 'Saving…' : 'Pay Later'}
                                    </Button>
                                    <Button
                                        type="submit"
                                        fullWidth
                                        disabled={busy}
                                        isLoading={submitting === 'payment'}
                                        className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-blue-600/15 flex items-center justify-center gap-2"
                                    >
                                        {submitting === 'payment' ? 'Reserving…' : 'Continue to Payment'}
                                        <ArrowRight className="w-5 h-5" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <BookingSummary
                            trip={trip}
                            tripId={tripId}
                            selectedSeats={selectedSeats}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
