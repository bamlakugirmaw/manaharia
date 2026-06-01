import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { Button } from '../components/ui/Button';

import { Card } from '../components/ui/Card';

import PaymentReceiptCard from '../components/PaymentReceiptCard';

import {

    CheckCircle2, Download, Home, Calendar, MapPin,

    User, QrCode, Mail, MessageSquare, Bus, Clock, Ticket as TicketIcon,

} from 'lucide-react';

import { useTicketsByBooking } from '../hooks/useTickets';

import { useBooking } from '../hooks/useBookings';

import { tripOperatorName } from '../lib/tripHelpers';

import { isBookingPaid } from '../lib/bookingUi';

import { getPaymentReceipt } from '../lib/paymentReceipt';



const fmtTime = (s) => {

    if (!s) return '—';

    const part = s.includes('T') ? s.split('T')[1] : s;

    const [h, m] = part.split(':');

    return `${h}:${m}`;

};



export default function Ticket() {

    const { bookingId } = useParams();
    const navigate = useNavigate();
    const loc = useLocation();



    const {

        booking,

        trip: stateTripObj,

        selectedSeats = [],

        passengerDetails,

        totalPrice,

        receipt: stateReceipt,

    } = loc.state || {};



    const { data: bookingFromApi, isLoading: bookingLoading } = useBooking(bookingId);

    const resolvedBooking = bookingFromApi ?? booking ?? null;



    const { data: tickets = [], isLoading: ticketLoading } = useTicketsByBooking(bookingId);



    const ticket = Array.isArray(tickets) ? tickets[0] : null;

    const receipt = stateReceipt ?? getPaymentReceipt(bookingId);



    const tripData =

        ticket?.booking?.trip

        ?? ticket?.trip

        ?? resolvedBooking?.trip

        ?? stateTripObj

        ?? null;



    const from = tripData?.from ?? tripData?.route?.origin ?? '';

    const to = tripData?.to ?? tripData?.route?.destination ?? '';

    const departureTime = fmtTime(tripData?.departureTime ?? '');

    const tripDate = tripData?.date ?? '';

    const operatorName = tripOperatorName(tripData);



    const isPaymentComplete = isBookingPaid(resolvedBooking);



    const seatLabels = ticket?.travelers?.map((t) => t.seatNumber ?? t.seat?.seatNumber).filter(Boolean)

        ?? resolvedBooking?.travelers?.map((t) => t.seat?.seatNumber ?? t.seatNumber).filter(Boolean)

        ?? selectedSeats.map((s) => (typeof s === 'object' ? s.label : s));



    const passengerName = passengerDetails?.fullName

        ?? ticket?.travelers?.[0]?.fullName

        ?? resolvedBooking?.travelers?.[0]?.fullName

        ?? '';

    const passengerPhone = passengerDetails?.phone

        ?? ticket?.travelers?.[0]?.phone

        ?? resolvedBooking?.travelers?.[0]?.phone

        ?? '';

    const passengerEmail = passengerDetails?.email

        ?? ticket?.travelers?.[0]?.email

        ?? resolvedBooking?.travelers?.[0]?.email

        ?? '';



    const paidAmount =

        totalPrice

        ?? receipt?.amount

        ?? resolvedBooking?.payment?.amount

        ?? resolvedBooking?.totalAmount

        ?? tripData?.price

        ?? 0;



    const ticketCode = ticket?.ticketCode ?? ticket?.code ?? ticket?.id ?? bookingId;

    const qrPayload = ticket?.qrCode ?? ticket?.qrData ?? ticketCode;



    if (bookingLoading && !tripData && !resolvedBooking) {

        return (

            <div className="min-h-screen bg-gray-50 flex items-center justify-center">

                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />

            </div>

        );

    }



    if (!tripData && !ticketLoading && !resolvedBooking) {

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

                <div className="text-center mb-10">

                    <div className="flex justify-center mb-6">

                        <div className="h-24 w-24 bg-green-100 rounded-full flex items-center justify-center text-green-600">

                            <CheckCircle2 size={56} strokeWidth={2.5} />

                        </div>

                    </div>

                    <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">

                        {isPaymentComplete ? 'Booking Confirmed!' : 'Booking Reserved'}

                    </h1>

                    <p className="text-lg text-gray-500 font-medium mb-4">

                        {isPaymentComplete

                            ? 'Your ticket is ready. Show the QR code when boarding.'

                            : 'Complete payment to receive your e-ticket.'}

                    </p>

                    <div className="inline-block px-5 py-2 bg-white border border-gray-200 rounded-xl font-mono text-sm text-gray-600 font-bold shadow-sm">

                        Booking ID: <span className="text-gray-900">{bookingId}</span>

                    </div>



                    <div className="flex flex-wrap gap-4 justify-center mt-8">

                        <Button

                            className="h-12 px-8 font-bold bg-[#0EA5E9] hover:bg-[#0284C7] text-white rounded-xl"

                            onClick={() => navigate('/traveller/bookings')}

                        >

                            View My Bookings

                        </Button>

                        {ticket?.id && (

                            <Button

                                variant="outline"

                                className="h-12 px-8 font-bold rounded-xl"

                                onClick={() => navigate(`/booking/ticket/${bookingId}`)}

                            >

                                <TicketIcon className="mr-2 h-5 w-5" />

                                Refresh ticket

                            </Button>

                        )}

                    </div>

                </div>



                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    <div className="space-y-6">

                        <Card className="bg-white border-none shadow-sm rounded-3xl p-8">

                            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Booking Summary</h2>

                            <div className="space-y-4 text-sm">

                                <p className="font-bold text-gray-900">{from} → {to}</p>

                                <p className="text-gray-600">

                                    {tripDate

                                        ? new Date(tripDate).toLocaleDateString('en-US', {

                                            month: 'short', day: 'numeric', year: 'numeric',

                                        })

                                        : '—'}{' '}

                                    · {departureTime}

                                </p>

                                <p className="text-gray-600">

                                    Seats: {seatLabels.join(', ') || '—'}

                                    {operatorName && ` · ${operatorName}`}

                                </p>

                                <p className="text-gray-600">{passengerName}</p>

                                <p className="font-bold text-gray-900">

                                    ETB {Number(paidAmount).toLocaleString()}

                                    {' · '}

                                    {isPaymentComplete ? 'Paid' : 'Pending'}

                                </p>

                            </div>

                        </Card>



                        {receipt && isPaymentComplete && (

                            <PaymentReceiptCard receipt={receipt} />

                        )}

                    </div>



                    <Card className="bg-white border-none shadow-lg rounded-3xl overflow-hidden">

                        <div className="p-8 pb-4">

                            <h3 className="text-lg font-bold text-gray-900 mb-2">Your E-Ticket</h3>

                            {ticketLoading && (

                                <p className="text-sm text-gray-400 mb-4">Loading ticket from server…</p>

                            )}

                            {!ticketLoading && !ticket && isPaymentComplete && (

                                <p className="text-sm text-amber-600 mb-4">

                                    Ticket is being generated. Refresh in a moment if the QR does not appear.

                                </p>

                            )}

                            <div className="rounded-3xl overflow-hidden shadow-lg">

                                <div className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] p-8 text-white">

                                    <div className="flex items-center justify-between mb-6">

                                        <div className="font-black text-2xl">Menaharia</div>

                                        <div className="text-xs font-bold bg-white/20 px-2 py-1 rounded">E-TICKET</div>

                                    </div>

                                    <div className="text-center">

                                        <div className="text-xl font-bold opacity-90">{from || '—'}</div>

                                        <div className="my-1 opacity-60 text-xs uppercase tracking-widest">to</div>

                                        <div className="text-3xl font-black">{to || '—'}</div>

                                    </div>

                                </div>

                                <div className="bg-white p-8">

                                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">

                                        <div>

                                            <div className="text-[10px] uppercase text-gray-400 font-bold">Passenger</div>

                                            <div className="font-bold">{passengerName || '—'}</div>

                                        </div>

                                        <div className="text-right">

                                            <div className="text-[10px] uppercase text-gray-400 font-bold">Ticket</div>

                                            <div className="font-mono font-bold text-xs">{ticketCode}</div>

                                        </div>

                                        <div>

                                            <div className="text-[10px] uppercase text-gray-400 font-bold">Operator</div>

                                            <div className="font-bold">{operatorName || '—'}</div>

                                        </div>

                                        <div className="text-right">

                                            <div className="text-[10px] uppercase text-gray-400 font-bold">Seats</div>

                                            <div className="font-bold">{seatLabels.join(', ') || '—'}</div>

                                        </div>

                                    </div>

                                    <div className="flex justify-center">

                                        {ticket?.qrCodeUrl ? (

                                            <img

                                                src={ticket.qrCodeUrl}

                                                alt="Boarding QR"

                                                className="w-28 h-28 rounded-xl"

                                            />

                                        ) : (

                                            <div className="bg-gray-900 p-3 rounded-xl" title={qrPayload}>

                                                <QrCode size={100} className="text-white" />

                                            </div>

                                        )}

                                    </div>

                                    {!ticket?.qrCodeUrl && qrPayload && (

                                        <p className="text-center text-[10px] text-gray-400 mt-2 font-mono truncate px-4">

                                            {qrPayload}

                                        </p>

                                    )}

                                </div>

                            </div>

                        </div>

                    </Card>

                </div>



                <div className="mt-8 flex justify-center">

                    <Button variant="ghost" onClick={() => navigate('/')}>

                        <Home className="mr-2 w-4 h-4" /> Return to Home

                    </Button>

                </div>

            </div>

        </div>

    );

}

