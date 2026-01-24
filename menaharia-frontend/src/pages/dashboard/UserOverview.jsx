import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Calendar, Ticket, CreditCard, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserOverview() {
    const navigate = useNavigate();

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 flex items-center gap-4 bg-white border-none shadow-sm">
                    <div className="bg-blue-100 p-3 rounded-lg text-primary">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">2</div>
                        <div className="text-sm text-gray-500">Upcoming Trips</div>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white border-none shadow-sm">
                    <div className="bg-green-100 p-3 rounded-lg text-success">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-gray-500">Completed Trips</div>
                    </div>
                </Card>

                <Card className="p-6 flex items-center gap-4 bg-white border-none shadow-sm">
                    <div className="bg-orange-100 p-3 rounded-lg text-warning">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <div className="text-2xl font-bold">ETB 8.5K</div>
                        <div className="text-sm text-gray-500">Total Spent</div>
                    </div>
                </Card>
            </div>

            {/* Upcoming Trips Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Upcoming Trips</h2>
                    <Button variant="link" onClick={() => navigate('/traveller/upcoming')}>View All</Button>
                </div>

                {/* Trip Card Item (Hardcoded Mock) */}
                <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <img src="/images/Enhanced_Bus_Images/Selam_Bus1.jpg" className="w-16 h-16 rounded-lg object-cover" alt="Bus" />
                            <div>
                                <h3 className="font-bold text-lg">Selam Bus</h3>
                                <div className="text-sm text-gray-500 mb-2">Addis Ababa → Bahir Dar</div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><Clock size={14} /> 08:00</span>
                                    <span className="flex items-center gap-1"><Ticket size={14} /> Seats: 3-A, 3-B</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Confirmed</Badge>
                            <div className="font-bold text-primary text-xl">ETB 1,700</div>
                            <div className="text-xs text-gray-500">Dec 15, 2025</div>
                            <Button size="sm" className="mt-2" onClick={() => navigate('/booking/ticket/MEN-2025')}>View E-Ticket</Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-0 overflow-hidden border border-gray-100 shadow-sm">
                    <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                            <img src="/images/Enhanced_Bus_Images/Sky_Bus.jpg" className="w-16 h-16 rounded-lg object-cover" alt="Bus" />
                            <div>
                                <h3 className="font-bold text-lg">Sky Bus</h3>
                                <div className="text-sm text-gray-500 mb-2">Bahir Dar → Addis Ababa</div>

                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <span className="flex items-center gap-1"><Clock size={14} /> 14:00</span>
                                    <span className="flex items-center gap-1"><Ticket size={14} /> Seats: 5-C</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 text-right">
                            <Badge className="bg-green-100 text-green-700 hover:bg-green-200">Confirmed</Badge>
                            <div className="font-bold text-primary text-xl">ETB 900</div>
                            <div className="text-xs text-gray-500">Dec 20, 2025</div>
                            <Button size="sm" className="mt-2" onClick={() => navigate('/booking/ticket/MEN-2025')}>View E-Ticket</Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
