import { useMemo } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Clock, Ticket, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../../hooks/useBookings';
import { useAuth } from '../../contexts/AuthContext';
import { tripOrigin, tripDest } from '../../lib/tripHelpers';

function mapUpcoming(b) {
    const trip = b.trip ?? {};
    const route = trip.route ?? {};
    const operator = trip.bus?.operator ?? trip.operator ?? {};
    const travelers = b.travelers ?? [];
    const seats = travelers
        .map((t) => t.seat?.seatNumber ?? t.seatNumber)
        .filter(Boolean);

    return {
        id: b.id,
        operator: operator.companyName ?? operator.name ?? 'Operator',
        from: tripOrigin(trip),
        to: tripDest(trip),
        date: trip.date
            ? new Date(trip.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '—',
        time: trip.departureTime
            ? new Date(trip.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
            : '—',
        rawDate: trip.date ?? trip.departureTime,
        seats,
        price: b.payment?.amount ?? trip.price ?? 0,
        status: b.status === 'CONFIRMED' ? 'Confirmed' : b.status === 'PENDING' ? 'Pending' : b.status,
    };
}

export default function UserUpcoming() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const { data: raw = [], isLoading, isError } = useBookings(
        user?.id ? { userId: user.id, limit: 50, status: 'CONFIRMED' } : { limit: 50, status: 'CONFIRMED' }
    );

    const upcomingTrips = useMemo(() => {
        const list = Array.isArray(raw) ? raw : [];
        const now = new Date();
        return list
            .map(mapUpcoming)
            .filter((t) => {
                if (!t.rawDate) return true;
                try {
                    return new Date(t.rawDate) >= now;
                } catch {
                    return true;
                }
            })
            .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
    }, [raw]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Upcoming Trips</h1>
                <p className="text-gray-500">Confirmed bookings with future travel dates.</p>
            </div>

            {isLoading && (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </div>
            )}

            {isError && (
                <p className="text-sm text-red-600">Failed to load upcoming trips.</p>
            )}

            {!isLoading && !isError && (
            <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {trip.operator.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">{trip.operator}</h3>
                                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                                        <span className="font-medium text-gray-900">{trip.from}</span>
                                        <MapPin size={14} className="text-primary" />
                                        <span className="font-medium text-gray-900">{trip.to}</span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {trip.date}</span>
                                        <span className="flex items-center gap-1"><Clock size={14} /> {trip.time}</span>
                                        {trip.seats.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <Ticket size={14} /> Seats: {trip.seats.join(', ')}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 text-right w-full md:w-auto">
                                <Badge className={trip.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}>
                                    {trip.status}
                                </Badge>
                                <div className="font-bold text-primary text-xl">ETB {trip.price.toLocaleString()}</div>
                                <Button size="sm" className="mt-2" onClick={() => navigate(`/booking/ticket/${trip.id}`)}>
                                    View Ticket
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
                {upcomingTrips.length === 0 && (
                    <p className="text-center text-gray-500 py-12">No upcoming trips scheduled.</p>
                )}
            </div>
            )}
        </div>
    );
}
