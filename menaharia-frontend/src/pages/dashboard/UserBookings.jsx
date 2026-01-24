import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Eye } from 'lucide-react';

const MOCK_BOOKINGS = [
    {
        id: "MEN-2025-12-15-A3B4",
        operator: "Selam Bus",
        route: "Addis Ababa → Bahir Dar",
        date: "Dec 15, 2025",
        status: "confirmed",
        amount: 1700,
    },
    {
        id: "MEN-2025-12-20-B5C6",
        operator: "Sky Bus",
        route: "Bahir Dar → Addis Ababa",
        date: "Dec 20, 2025",
        status: "confirmed",
        amount: 900,
    },
    {
        id: "MEN-2025-11-10-X9Y2",
        operator: "Golden Bus",
        route: "Addis Ababa → Mekelle",
        date: "Nov 10, 2025",
        status: "completed",
        amount: 2100,
    }
];

export default function UserBookings() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">My Bookings</h1>
                <Button onClick={() => navigate('/search')}>Book New Trip</Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Operator</th>
                            <th className="px-6 py-4">Route</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {MOCK_BOOKINGS.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-mono text-gray-600">{booking.id}</td>
                                <td className="px-6 py-4 font-medium">{booking.operator}</td>
                                <td className="px-6 py-4 text-gray-600">{booking.route}</td>
                                <td className="px-6 py-4 text-gray-600">{booking.date}</td>
                                <td className="px-6 py-4">
                                    <Badge variant={booking.status === 'confirmed' ? 'success' : 'secondary'}>
                                        {booking.status}
                                    </Badge>
                                </td>
                                <td className="px-6 py-4 text-right font-medium text-gray-900">
                                    ETB {booking.amount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
                                        <Eye size={16} className="mr-1" /> View
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
