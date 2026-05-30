import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import TripCard from '../components/tickets/TripCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Bus, Check, Sparkles, MapPin, Calendar, Search, ChevronUp, ChevronDown, RefreshCw, Clock, ArrowUpDown, Star, TrendingUp } from 'lucide-react';
import { LOCATIONS } from '../data/mock-db';
import { useTrips } from '../hooks/useTrips';
import heroBg from '../assets/hero-bus-bg.png';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const from = searchParams.get('from') || '';
    const to   = searchParams.get('to')   || '';
    const date = searchParams.get('date') || '';

    // Local form states (inline search bar)
    const [fromVal, setFromVal] = useState(from);
    const [toVal,   setToVal]   = useState(to);
    const [dateVal, setDateVal] = useState(date);

    // Client-side filter / sort states
    const [selectedTime,      setSelectedTime]      = useState('');
    const [selectedOperators, setSelectedOperators] = useState([]);
    const [sortBy,            setSortBy]            = useState('earliest');
    const [sortOpen,          setSortOpen]          = useState(false);
    const [timeOpen,          setTimeOpen]          = useState(true);
    const [operatorsOpen,     setOperatorsOpen]     = useState(true);

    // Sync form fields when URL params change (e.g. browser back/forward)
    useEffect(() => {
        setFromVal(from);
        setToVal(to);
        setDateVal(date);
    }, [from, to, date]);

    // ── Fetch trips from backend ──────────────────────────────────────────────
    // GET /v1/trips?origin=&destination=&date= (public endpoint)
    const { data: tripsResponse, isLoading, isError } = useTrips({
        origin:      from || undefined,
        destination: to   || undefined,
        date:        date || undefined,
        limit:       100,
    });

    // Backend returns { data: [...], total, page, limit } or just an array.
    // Normalise to always be an array.
    const rawTrips = useMemo(() => {
        if (!tripsResponse) return [];
        return Array.isArray(tripsResponse) ? tripsResponse : (tripsResponse.data ?? []);
    }, [tripsResponse]);

    // ── Client-side filtering + sorting ──────────────────────────────────────
    // Filtering by time band and operator is done locally so the UI stays
    // instant — no extra network round-trips for each filter toggle.
    const trips = useMemo(() => {
        let filtered = [...rawTrips];

        // Time band filter
        if (selectedTime) {
            filtered = filtered.filter(t => {
                const hour = parseInt((t.departureTime || '').split(':')[0], 10);
                if (selectedTime === 'Before 6:00 AM')      return hour < 6;
                if (selectedTime === '6:00 AM - 12:00 PM')  return hour >= 6  && hour < 12;
                if (selectedTime === '12:00 PM - 6:00 PM')  return hour >= 12 && hour < 18;
                if (selectedTime === 'After 6:00 PM')       return hour >= 18;
                return true;
            });
        }

        // Operator filter — backend trip has operator.id or operatorId
        if (selectedOperators.length > 0) {
            filtered = filtered.filter(t => {
                const opId = t.operator?.id ?? t.operatorId ?? '';
                return selectedOperators.includes(opId);
            });
        }

        // Sorting
        if (sortBy === 'earliest')   filtered.sort((a, b) => (a.departureTime ?? '').localeCompare(b.departureTime ?? ''));
        if (sortBy === 'latest')     filtered.sort((a, b) => (b.departureTime ?? '').localeCompare(a.departureTime ?? ''));
        if (sortBy === 'price-low')  filtered.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        if (sortBy === 'price-high') filtered.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        if (sortBy === 'rating')     filtered.sort((a, b) => ((b.operator?.rating ?? 0) - (a.operator?.rating ?? 0)));

        return filtered;
    }, [rawTrips, selectedTime, selectedOperators, sortBy]);

    // Derive unique operators from the fetched trips for the filter sidebar
    const operatorsInResults = useMemo(() => {
        const seen = new Map();
        rawTrips.forEach(t => {
            const id   = t.operator?.id   ?? t.operatorId ?? '';
            const name = t.operator?.name ?? t.operatorName ?? id;
            if (id && !seen.has(id)) seen.set(id, { id, name });
        });
        return [...seen.values()];
    }, [rawTrips]);

    const SORT_OPTIONS = [
        { value: 'earliest',   label: 'Departure: Earliest First', icon: Clock },
        { value: 'latest',     label: 'Departure: Latest First',   icon: Clock },
        { value: 'price-low',  label: 'Price: Lowest First',       icon: TrendingUp },
        { value: 'price-high', label: 'Price: Highest First',      icon: TrendingUp },
        { value: 'rating',     label: 'Rating: Highest First',     icon: Star },
    ];
    const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort By';

    const handleTimeSelect = (time) => setSelectedTime(prev => prev === time ? '' : time);
    const handleOperatorSelect = (opId) => setSelectedOperators(prev =>
        prev.includes(opId) ? prev.filter(id => id !== opId) : [...prev, opId]
    );
    const handleSwap = () => { setFromVal(toVal); setToVal(fromVal); };
    const clearFilters = () => { setSelectedTime(''); setSelectedOperators([]); };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const p = {};
        if (fromVal) p.from = fromVal;
        if (toVal)   p.to   = toVal;
        if (dateVal) p.date = dateVal;
        setSearchParams(p);
    };

    const handleSelectTrip = (tripId) => navigate(`/booking/seats/${tripId}`);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Search Banner */}
            <div
                className="relative rounded-[2.5rem] p-8 md:p-10 mb-10 overflow-hidden shadow-sm"
                style={{ backgroundImage: `url(${heroBg})`, backgroundSize: 'cover', backgroundPosition: 'center 55%', backgroundColor: '#E8EEFF' }}
            >
                <div className="relative z-10">
                    <div className="flex items-center gap-1.5 mb-2.5 text-blue-600">
                        <Sparkles size={14} className="fill-blue-600/10" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] opacity-90">Plan Your Journey</span>
                    </div>

                    <h1 className="text-3xl md:text-[38px] font-black text-dark tracking-tight leading-none mb-2 flex items-center gap-3">
                        {from || 'Anywhere'}
                        <span className="text-blue-500/50 font-light text-2xl">➔</span>
                        {to || 'Anywhere'}
                    </h1>

                    <p className="text-gray-500/80 text-[11px] font-bold uppercase tracking-[0.1em] mb-8">
                        {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'All dates'}
                        <span className="mx-2.5 opacity-40">•</span>
                        {isLoading ? 'Searching...' : `${trips.length} buses available`}
                    </p>

                    {/* Inline Search Bar */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border border-gray-100/90 w-full max-w-5xl">
                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70">
                            <MapPin size={20} className="text-blue-500 stroke-[2] shrink-0" />
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">FROM</span>
                                <select className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none appearance-none cursor-pointer" value={fromVal} onChange={e => setFromVal(e.target.value)} required>
                                    <option value="">Departure location</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        <button type="button" onClick={handleSwap} className="w-9 h-9 rounded-full bg-white border border-gray-100/90 flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-95 transition-all shrink-0 z-20">
                            <span className="text-gray-500 font-extrabold text-base leading-none">⇄</span>
                        </button>

                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70">
                            <MapPin size={20} className="text-blue-500 stroke-[2] shrink-0" />
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">TO</span>
                                <select className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none appearance-none cursor-pointer" value={toVal} onChange={e => setToVal(e.target.value)} required>
                                    <option value="">Destination location</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70">
                            <Calendar size={20} className="text-blue-500 stroke-[2] shrink-0" />
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">DATE</span>
                                <input type="date" className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none cursor-pointer" value={dateVal} onChange={e => setDateVal(e.target.value)} required />
                            </div>
                        </div>

                        <Button type="submit" className="w-full lg:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 shrink-0 border-none">
                            <Search size={16} /> Search Buses
                        </Button>
                    </form>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Filters Sidebar */}
                <div className="lg:sticky lg:top-24 self-start w-full">
                    <Card className="p-6 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] flex flex-col justify-between min-h-[calc(100vh-220px)]">
                        <div>
                            {/* Departure Time */}
                            <div className="mb-8">
                                <div className="flex items-center justify-between cursor-pointer group mb-6" onClick={() => setTimeOpen(v => !v)}>
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-dark/70 flex items-center gap-2.5">
                                        <Clock size={15} className="text-blue-500 stroke-[2.5]" /> Departure Time
                                    </h3>
                                    {timeOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                </div>
                                {timeOpen && (
                                    <div className="space-y-4 pl-0.5">
                                        {['Before 6:00 AM', '6:00 AM - 12:00 PM', '12:00 PM - 6:00 PM', 'After 6:00 PM'].map(time => (
                                            <label key={time} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-dark transition-colors cursor-pointer group">
                                                <div className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${selectedTime === time ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`} onClick={e => { e.preventDefault(); handleTimeSelect(time); }}>
                                                    {selectedTime === time && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                </div>
                                                <span className={selectedTime === time ? 'text-dark font-extrabold' : ''} onClick={() => handleTimeSelect(time)}>{time}</span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gray-100/70 my-6" />

                            {/* Operators */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between cursor-pointer group mb-6" onClick={() => setOperatorsOpen(v => !v)}>
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-dark/70 flex items-center gap-2.5">
                                        <Bus size={15} className="text-blue-500 stroke-[2.5]" /> Operators
                                    </h3>
                                    {operatorsOpen ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                </div>
                                {operatorsOpen && (
                                    <div className="space-y-4 pl-0.5">
                                        {operatorsInResults.map(op => {
                                            const isChecked = selectedOperators.includes(op.id);
                                            return (
                                                <label key={op.id} className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-dark transition-colors cursor-pointer group">
                                                    <div className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isChecked ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white'}`} onClick={e => { e.preventDefault(); handleOperatorSelect(op.id); }}>
                                                        {isChecked && <Check size={12} className="text-white stroke-[3.5]" />}
                                                    </div>
                                                    <span className={isChecked ? 'text-dark font-extrabold' : ''} onClick={() => handleOperatorSelect(op.id)}>{op.name}</span>
                                                </label>
                                            );
                                        })}
                                        {operatorsInResults.length === 0 && !isLoading && (
                                            <p className="text-[10px] text-gray-400 font-bold">No operators in results</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-auto pt-6 border-t border-gray-100/50">
                            {(selectedTime || selectedOperators.length > 0) ? (
                                <Button onClick={clearFilters} variant="outline" className="w-full py-2.5 rounded-2xl border border-blue-500 text-blue-500 font-bold hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-xs">
                                    <RefreshCw size={12} /> Clear Filters
                                </Button>
                            ) : (
                                <div className="text-center text-[10px] text-gray-400 font-bold tracking-wide uppercase">No active filters</div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Results */}
                <div className="lg:col-span-3">
                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {isLoading ? 'Searching...' : `${trips.length} result${trips.length !== 1 ? 's' : ''} found`}
                        </p>
                        <div className="relative">
                            <button onClick={() => setSortOpen(v => !v)} className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-xs font-bold text-gray-700">
                                <ArrowUpDown size={14} className="text-blue-500 shrink-0" />
                                <span className="hidden sm:inline text-gray-500 font-semibold">Sort:</span>
                                <span className="text-gray-800 max-w-[130px] truncate">{activeSortLabel}</span>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 shrink-0 ${sortOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {sortOpen && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setSortOpen(false)} />
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden z-20">
                                        <div className="px-3 pt-3 pb-2">
                                            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-400 px-2 mb-2">Sort By</p>
                                            {SORT_OPTIONS.map(option => {
                                                const Icon = option.icon;
                                                const isActive = sortBy === option.value;
                                                return (
                                                    <button key={option.value} onClick={() => { setSortBy(option.value); setSortOpen(false); }} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                                                        <Icon size={14} className={isActive ? 'text-blue-500 shrink-0' : 'text-gray-400 shrink-0'} />
                                                        <span className="flex-1">{option.label}</span>
                                                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => <Card key={i} className="h-32 animate-pulse bg-gray-50/50 rounded-3xl border-none" />)}
                        </div>
                    ) : isError ? (
                        <div className="text-center py-24 bg-white border border-dashed border-red-200 rounded-[3rem]">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bus size={40} className="text-red-200" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900">Failed to load trips</h3>
                            <p className="text-gray-400 mt-2 text-[11px] font-bold uppercase tracking-wider">Check your connection and try again</p>
                        </div>
                    ) : trips.length > 0 ? (
                        <div className="space-y-6">
                            {trips.map(trip => <TripCard key={trip.id} trip={trip} onSelect={handleSelectTrip} />)}
                        </div>
                    ) : (
                        <div className="text-center py-24 bg-white border border-dashed border-gray-200 rounded-[3rem]">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Bus size={40} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-extrabold text-gray-900">No trips found</h3>
                            <p className="text-gray-400 mt-2 text-[11px] font-bold uppercase tracking-wider">Try changing your search criteria</p>
                            <Button className="mt-8 h-12 px-8 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all border-none" onClick={() => { clearFilters(); setFromVal(''); setToVal(''); setDateVal(''); setSearchParams({}); }}>
                                Clear All Search
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
