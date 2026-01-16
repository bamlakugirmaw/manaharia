import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Shield, CreditCard, Smartphone, Wallet, ArrowRight } from 'lucide-react';
import ProgressStepper from '../components/booking/ProgressStepper';
import BookingSummary from '../components/booking/BookingSummary';

export default function Payment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, selectedSeats, totalPrice, passengerDetails } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('telebirr');

    if (!tripId) {
        navigate('/');
        return null;
    }

    const paymentMethods = [
        {
            id: 'telebirr',
            name: 'Telebirr',
            description: 'Pay with Telebirr wallet',
            icon: Smartphone,
            color: 'bg-blue-500'
        },
        {
            id: 'cbe',
            name: 'CBE Birr',
            description: 'Pay with CBE Birr mobile banking',
            icon: CreditCard,
            color: 'bg-purple-800'
        },
        {
            id: 'chapa',
            name: 'Chapa',
            description: 'Pay with cards via Chapa',
            icon: Wallet,
            color: 'bg-orange-500'
        }
    ];

    const handlePayment = () => {
        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            // Generate a Mock Booking ID with date-time format
            const now = new Date();
            const dateStr = now.toISOString().split('T')[0];
            const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
            const bookingId = `MEN-${dateStr}-${randomId}`;

            navigate(`/booking/ticket/${bookingId}`, {
                state: {
                    bookingId,
                    tripId,
                    selectedSeats,
                    passengerDetails,
                    totalPrice
                }
            });
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Progress Stepper */}
            <ProgressStepper currentStep={4} />

            <div className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    {/* Main Content - Payment */}
                    <div className="lg:col-span-3">
                        {/* Secure Payment Notice */}
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <Shield className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">Secure Payment</h4>
                                    <p className="text-xs text-gray-700">
                                        Your payment information is encrypted and secure
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-8">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">Select Payment Method</h1>

                            <div className="space-y-4 mb-8">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    const isSelected = paymentMethod === method.id;

                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 border-2 rounded-xl flex items-center gap-4 transition-all ${isSelected
                                                    ? 'border-[#0EA5E9] bg-blue-50'
                                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                                }`}
                                        >
                                            {/* Icon */}
                                            <div className={`w-12 h-12 ${method.color} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                                                <Icon size={24} />
                                            </div>

                                            {/* Details */}
                                            <div className="flex-1 text-left">
                                                <div className="font-bold text-gray-900 text-base">{method.name}</div>
                                                <div className="text-sm text-gray-600">{method.description}</div>
                                            </div>

                                            {/* Radio Button */}
                                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-[#0EA5E9]' : 'border-gray-300'
                                                }`}>
                                                {isSelected && (
                                                    <div className="w-3 h-3 rounded-full bg-[#0EA5E9]" />
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Payment Instructions */}
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h3 className="font-bold text-base text-gray-900 mb-4">Payment Instructions</h3>

                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            1
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            Click "Proceed to Payment" below
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            2
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            You will be redirected to {paymentMethods.find(m => m.id === paymentMethod)?.name} payment page
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            3
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            Enter your Telebirr PIN to complete payment
                                        </p>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="w-6 h-6 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">
                                            4
                                        </div>
                                        <p className="text-sm text-gray-700 pt-0.5">
                                            You will receive confirmation via SMS and email
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Pay Button */}
                            <Button
                                fullWidth
                                className="h-12 bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm rounded-lg shadow-sm transition-colors mt-6"
                                onClick={handlePayment}
                                disabled={loading}
                                isLoading={loading}
                            >
                                {loading ? 'Processing Payment...' : `Pay ETB ${totalPrice?.toLocaleString() || 0}`}
                                {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                            </Button>
                        </div>
                    </div>

                    {/* Sidebar - Final Summary */}
                    <div className="lg:col-span-2">
                        <BookingSummary
                            tripId={tripId}
                            selectedSeats={selectedSeats}
                            showEncryption={true}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
