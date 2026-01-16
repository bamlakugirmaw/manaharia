import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { CheckCircle2, Download, Home, Calendar, MapPin, User, QrCode, Mail, MessageSquare, Bus, Clock } from 'lucide-react';
import { TRIPS, OPERATORS } from '../data/mock-db';

export default function Ticket() {
    const { bookingId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { tripId, selectedSeats, passengerDetails } = location.state || {};

    const trip = TRIPS.find(t => t.id === tripId) || TRIPS[0]; // Fallback to first trip
    const operator = OPERATORS.find(op => op.id === trip?.operatorId);

    // Fallback for direct access without state or trip
    if (!trip) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-2xl font-bold mb-4">Booking Not Found</h1>
                <Button onClick={() => navigate('/')}>Return Home</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Success Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 animate-in zoom-in duration-300">
                            <CheckCircle2 size={56} strokeWidth={2.5} />
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-lg text-gray-500 font-medium mb-4">Your ticket has been booked successfully</p>
                    <div className="inline-block px-5 py-2 bg-white border border-gray-200 rounded-xl font-mono text-sm text-gray-600 font-bold shadow-sm">
                        Booking ID: <span className="text-gray-900">{bookingId}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-4 justify-center mt-8">
                        <Button
                            className="h-12 px-8 font-bold bg-[#0EA5E9] hover:bg-[#0284C7] text-white shadow-lg shadow-sky-100 rounded-xl transition-transform hover:scale-105"
                        >
                            <Download className="mr-2 h-5 w-5" /> Download Ticket (PDF)
                        </Button>
                        <Button
                            variant="outline"
                            className="h-12 px-8 font-bold border-gray-200 hover:bg-gray-50 text-gray-700 bg-white shadow-sm rounded-xl transition-transform hover:scale-105"
                        >
                            <Calendar className="mr-2 h-5 w-5" /> Add to Calendar
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* Left Column: Booking Summary Text */}
                    <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-8">
                        <h2 className="text-xl font-extrabold text-gray-900 mb-6">Booking Summary</h2>

                        <div className="space-y-8">
                            {/* Trip Details */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">Trip Details</h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex items-start gap-4">
                                        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Route</p>
                                            <p className="font-bold text-gray-900 text-base">{trip.from} <span className="text-gray-400 mx-1">→</span> {trip.to}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Date</p>
                                            <p className="font-bold text-gray-900 text-base">{new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Time</p>
                                            <p className="font-bold text-gray-900 text-base">{trip.departureTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <Bus className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase mb-0.5">Seat(s)</p>
                                            <p className="font-bold text-gray-900 text-base">{selectedSeats?.join(', ') || '3-A, 3-B'} <span className="text-xs text-gray-400 font-normal">({operator?.name})</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Passenger Details */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">Passenger Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm font-medium">Name</span>
                                        <span className="text-gray-900 font-bold text-sm">{passengerDetails?.fullName || 'Abebe Kebede'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm font-medium">Phone</span>
                                        <span className="text-gray-900 font-bold text-sm">{passengerDetails?.phone || '+251 911 234 567'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm font-medium">Email</span>
                                        <span className="text-gray-900 font-bold text-sm">{passengerDetails?.email || 'abebe@example.com'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4 border-b border-gray-100 pb-2">Payment Details</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm font-medium">Total Amount Paid</span>
                                        <span className="text-gray-900 font-bold text-sm">ETB {location.state?.totalPrice?.toLocaleString() || '1,700'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 text-sm font-medium">Payment Method</span>
                                        <span className="text-gray-900 font-bold text-sm">Telebirr</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500 text-sm font-medium">Payment Status</span>
                                        <span className="px-2.5 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
                                            <CheckCircle2 size={12} /> Confirmed
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Right Column: E-Ticket Card */}
                    <div className="flex flex-col gap-6">
                        <Card className="bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-3xl overflow-hidden">
                            <div className="p-8 pb-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-6">Your E-Ticket</h3>

                                {/* Blue Gradient Ticket */}
                                <div className="rounded-3xl overflow-hidden shadow-lg transform transition-transform hover:scale-[1.01] duration-300">
                                    {/* Ticket Top - Gradient */}
                                    <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] p-8 text-white relative">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="font-black text-2xl tracking-tight">Menaharia</div>
                                            <div className="text-xs font-bold bg-white/20 backdrop-blur-sm px-2 py-1 rounded">E-TICKET</div>
                                        </div>
                                        <div className="text-center mb-4">
                                            <div className="text-2xl font-bold opacity-90">{trip.from}</div>
                                            <div className="my-1 opacity-60 text-xs uppercase tracking-widest font-bold">to</div>
                                            <div className="text-3xl font-black">{trip.to}</div>
                                        </div>
                                    </div>

                                    {/* Ticket Body - White */}
                                    <div className="bg-white p-8">
                                        <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
                                            <div>
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Passenger</div>
                                                <div className="text-sm font-bold text-gray-900 truncate">{passengerDetails?.fullName || 'Abebe Kebede'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Booking ID</div>
                                                <div className="text-sm font-bold text-gray-900 font-mono">{bookingId}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Date</div>
                                                <div className="text-sm font-bold text-gray-900">{new Date(trip.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Time</div>
                                                <div className="text-sm font-bold text-gray-900">{trip.departureTime}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Seats</div>
                                                <div className="text-sm font-bold text-gray-900">{selectedSeats?.join(', ') || '3-A'}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] uppercase text-gray-400 font-bold mb-1">Operator</div>
                                                <div className="text-sm font-bold text-gray-900">{operator?.name}</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <div className="bg-gray-900 p-3 rounded-xl shadow-lg">
                                                <QrCode size={100} className="text-white" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="bg-gray-50 border-t border-gray-100 p-4 text-center">
                                        <p className="text-[10px] text-gray-400 font-medium">Please show this QR code at boarding</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Notifications */}
                        <div className="space-y-3">
                            {/* Email Confirmation */}
                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-4 h-4 text-blue-600" />
                                </div>
                                <div className="text-xs text-gray-600">
                                    Email sent to <span className="font-bold text-gray-900">{passengerDetails?.email || 'email@example.com'}</span>
                                </div>
                            </div>

                            {/* SMS Confirmation */}
                            <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-4 h-4 text-green-600" />
                                </div>
                                <div className="text-xs text-gray-600">
                                    SMS sent to <span className="font-bold text-gray-900">{passengerDetails?.phone || '+251 9...'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Back Home */}
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-xl text-gray-500 font-bold text-sm hover:bg-gray-100"
                            onClick={() => navigate('/')}
                        >
                            <Home className="mr-2 w-4 h-4" /> Return to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
