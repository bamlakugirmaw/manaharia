import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Clock, Ticket, Calendar, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserUpcoming() {
    const navigate = useNavigate();

    // Mock data for upcoming trips
    const upcomingTrips = [
        {
            id: 'MEN-2025-001',
            operator: 'Selam Bus',
            image: '/images/selam_bus.jpg',
            from: 'Addis Ababa',
            to: 'Bahir Dar',
            date: 'Dec 15, 2025',
            time: '08:00',
            seats: ['3-A', '3-B'],
            price: 1700,
            status: 'Confirmed'
        },
        {
            id: 'MEN-2025-002',
            operator: 'Sky Bus',
            image: '/images/sky_bus.jpg',
            from: 'Bahir Dar',
            to: 'Addis Ababa',
            date: 'Dec 20, 2025',
            time: '14:00',
            seats: ['5-C'],
            price: 900,
            status: 'Confirmed'
        },
        {
            id: 'MEN-2025-003',
            operator: 'Abay Bus',
            image: '/images/abay_bus.jpg', // Placeholder
            from: 'Addis Ababa',
            to: 'Hawassa',
            date: 'Jan 10, 2026',
            time: '06:30',
            seats: ['12-A', '12-B'],
            price: 1200,
            status: 'Pending'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Upcoming Trips</h1>
                    <p className="text-gray-500">Manage your scheduled upcoming journeys</p>
                </div>
            </div>

            <div className="space-y-4">
                {upcomingTrips.map((trip) => (
                    <Card key={trip.id} className="p-0 overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                            <div className="flex items-start gap-4">
                                <img
                                    src={trip.image}
                                    alt={trip.operator}
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                />

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
                                        <span className="flex items-center gap-1"><Ticket size={14} /> Seats: {trip.seats.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-2 text-right w-full md:w-auto">
                                <Badge className={trip.status === 'Confirmed' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}>
                                    {trip.status}
                                </Badge>
                                <div className="font-bold text-primary text-xl">ETB {trip.price.toLocaleString()}</div>
                                <div className="flex gap-2 mt-2 w-full md:w-auto">
                                    <Button variant="outline" size="sm" className="flex-1 md:flex-none">Cancel</Button>
                                    <Button size="sm" className="flex-1 md:flex-none" onClick={() => navigate(`/booking/ticket/${trip.id}`)}>
                                        View Ticket
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
