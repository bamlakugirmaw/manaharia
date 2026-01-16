import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TripCard from '../components/tickets/TripCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Filter, ArrowLeft, Bus } from 'lucide-react';
import { TRIPS } from '../data/mock-db';

export default function SearchResults() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    useEffect(() => {
        // Simulate API fetch delay
        setLoading(true);
        setTimeout(() => {
            let filtered = TRIPS;
            if (from) filtered = filtered.filter(t => t.from === from);
            if (to) filtered = filtered.filter(t => t.to === to);
            // Date filter ignored for demo to show results always
            setTrips(filtered);
            setLoading(false);
        }, 500);
    }, [from, to, date]);

    const handleSelectTrip = (tripId) => {
        // Navigate to seat selection page
        navigate(`/booking/seats/${tripId}`);
    };

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="mb-10">
                <Button variant="ghost" className="mb-6 pl-0 text-gray-400 hover:text-primary transition-colors text-xs font-bold" onClick={() => navigate('/')}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Search
                </Button>
                <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                    <div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {from || 'Anywhere'} <span className="text-gray-300 font-light mx-2">→</span> {to || 'Anywhere'}
                        </h1>
                        <p className="text-gray-400 text-[11px] font-bold mt-1.5 uppercase tracking-[0.2em]">
                            {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All Dates'}
                            <span className="mx-3 text-gray-200">|</span>
                            {trips.length} Buses Available
                        </p>
                    </div>
                    <Button variant="outline" className="h-11 px-6 rounded-xl border-gray-200 font-bold text-gray-600 gap-2 hover:bg-gray-50">
                        <Filter size={18} /> Filters
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Filters Sidebar (Mock) */}
                <div className="hidden lg:block space-y-6">
                    <Card className="p-6 space-y-8 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2.5rem]">
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-6">Departure Time</h3>
                            <div className="space-y-4">
                                {['Before 6:00 AM', '6:00 AM - 12:00 PM', 'After 12:00 PM'].map(time => (
                                    <label key={time} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg border-2 border-gray-100 group-hover:border-primary/30 transition-all flex items-center justify-center bg-gray-50/50">
                                            <div className="w-2.5 h-2.5 rounded-md bg-primary opacity-0 group-hover:opacity-10 scale-50 group-hover:scale-100 transition-all" />
                                        </div>
                                        {time}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-gray-50"></div>

                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-6">Operators</h3>
                            <div className="space-y-4">
                                {['Selam Bus', 'Sky Bus', 'Golden Bus', 'Ethio Bus'].map(op => (
                                    <label key={op} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer group">
                                        <div className="w-5 h-5 rounded-lg border-2 border-gray-100 group-hover:border-primary/30 transition-all flex items-center justify-center bg-gray-50/50">
                                            <div className="w-2.5 h-2.5 rounded-md bg-primary opacity-0 group-hover:opacity-10 scale-50 group-hover:scale-100 transition-all" />
                                        </div>
                                        {op}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results List */}
                <div className="lg:col-span-3">
                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="h-32 animate-pulse bg-gray-50/50 rounded-2xl border-none" />
                            ))}
                        </div>
                    ) : trips.length > 0 ? (
                        <div className="space-y-6">
                            {trips.map(trip => (
                                <TripCard key={trip.id} trip={trip} onSelect={handleSelectTrip} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-[3rem]">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bus size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900">No trips found</h3>
                            <p className="text-gray-400 mt-2 text-[11px] font-bold uppercase tracking-wider">Try changing your search criteria</p>
                            <Button className="mt-8 h-12 px-8 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all" onClick={() => navigate('/')}>
                                Clear Search
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
