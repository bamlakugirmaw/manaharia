import { useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import TripCard from '../components/tickets/TripCard';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Filter, ArrowLeft, Bus, Check, Sparkles, MapPin, Calendar, Search, ChevronUp, ChevronDown, RefreshCw, Clock, ArrowUpDown, Star, TrendingUp } from 'lucide-react';
import { TRIPS, OPERATORS, LOCATIONS } from '../data/mock-db';
import heroBg from '../assets/hero-bus-bg.png';

export default function SearchResults() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const date = searchParams.get('date');

    // Local form states
    const [fromVal, setFromVal] = useState(from || '');
    const [toVal, setToVal] = useState(to || '');
    const [dateVal, setDateVal] = useState(date || '');

    // Filter states
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedOperators, setSelectedOperators] = useState([]);
    const [sortBy, setSortBy] = useState('earliest');

    // Sort dropdown state
    const [sortOpen, setSortOpen] = useState(false);

    // Accordion states
    const [timeOpen, setTimeOpen] = useState(true);
    const [operatorsOpen, setOperatorsOpen] = useState(true);

    const SORT_OPTIONS = [
        { value: 'earliest',   label: 'Departure: Earliest First',  icon: Clock },
        { value: 'latest',     label: 'Departure: Latest First',    icon: Clock },
        { value: 'price-low',  label: 'Price: Lowest First',        icon: TrendingUp },
        { value: 'price-high', label: 'Price: Highest First',       icon: TrendingUp },
        { value: 'rating',     label: 'Rating: Highest First',      icon: Star },
    ];

    const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Sort By';

    // Sync input fields when URL search parameters change
    useEffect(() => {
        setFromVal(from || '');
        setToVal(to || '');
        setDateVal(date || '');
    }, [from, to, date]);

    const handleTimeSelect = (time) => {
        if (selectedTime === time) setSelectedTime('');
        else setSelectedTime(time);
    };

    const handleOperatorSelect = (opId) => {
        if (selectedOperators.includes(opId)) {
            setSelectedOperators(selectedOperators.filter(id => id !== opId));
        } else {
            setSelectedOperators([...selectedOperators, opId]);
        }
    };

    const handleSwap = () => {
        const temp = fromVal;
        setFromVal(toVal);
        setToVal(temp);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const newParams = {};
        if (fromVal) newParams.from = fromVal;
        if (toVal) newParams.to = toVal;
        if (dateVal) newParams.date = dateVal;
        setSearchParams(newParams);
    };

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => {
            let filtered = [...TRIPS];
            
            // Apply Route filter
            if (from) filtered = filtered.filter(t => t.from.toLowerCase() === from.toLowerCase());
            if (to) filtered = filtered.filter(t => t.to.toLowerCase() === to.toLowerCase());

            // Apply Time Filter (4 bands matching the UI layout)
            if (selectedTime) {
                filtered = filtered.filter(t => {
                    const hour = parseInt(t.departureTime.split(':')[0]);
                    if (selectedTime === 'Before 6:00 AM') return hour < 6;
                    if (selectedTime === '6:00 AM - 12:00 PM') return hour >= 6 && hour < 12;
                    if (selectedTime === '12:00 PM - 6:00 PM') return hour >= 12 && hour < 18;
                    if (selectedTime === 'After 6:00 PM') return hour >= 18;
                    return true;
                });
            }

            // Apply Operator Filter (multi-select)
            if (selectedOperators.length > 0) {
                filtered = filtered.filter(t => selectedOperators.includes(t.operatorId));
            }

            // Apply Sorting
            if (sortBy === 'earliest') {
                filtered.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
            } else if (sortBy === 'latest') {
                filtered.sort((a, b) => b.departureTime.localeCompare(a.departureTime));
            } else if (sortBy === 'price-low') {
                filtered.sort((a, b) => a.price - b.price);
            } else if (sortBy === 'price-high') {
                filtered.sort((a, b) => b.price - a.price);
            } else if (sortBy === 'rating') {
                filtered.sort((a, b) => {
                    const ratingA = OPERATORS.find(op => op.id === a.operatorId)?.rating ?? 0;
                    const ratingB = OPERATORS.find(op => op.id === b.operatorId)?.rating ?? 0;
                    return ratingB - ratingA;
                });
            }

            setTrips(filtered);
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [from, to, date, selectedTime, selectedOperators, sortBy]);

    const handleSelectTrip = (tripId) => {
        navigate(`/booking/seats/${tripId}`);
    };

    const clearFilters = () => {
        setSelectedTime('');
        setSelectedOperators([]);
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Search Banner */}
            <div 
                className="relative rounded-[2.5rem] p-8 md:p-10 mb-10 overflow-hidden shadow-sm"
                style={{ 
                    backgroundImage: `url(${heroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center 55%',
                    backgroundColor: '#E8EEFF'
                }}
            >

                {/* Banner Content */}
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
                        {trips.length} buses available
                    </p>

                    {/* Inline Search Bar Form */}
                    <form onSubmit={handleSearchSubmit} className="flex flex-col lg:flex-row items-center gap-3 bg-white p-3 rounded-3xl shadow-sm border border-gray-100/90 w-full max-w-5xl">
                        {/* Departure (FROM) Input */}
                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70 lg:last:border-r-0">
                            <div className="text-blue-500 shrink-0">
                                <MapPin size={20} className="stroke-[2]" />
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">FROM</span>
                                <select
                                    className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none appearance-none cursor-pointer"
                                    value={fromVal}
                                    onChange={(e) => setFromVal(e.target.value)}
                                    required
                                >
                                    <option value="">Departure location</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Swap Button */}
                        <button
                            type="button"
                            onClick={handleSwap}
                            className="w-9 h-9 rounded-full bg-white border border-gray-100/90 flex items-center justify-center shadow-sm hover:bg-gray-50 active:scale-95 transition-all shrink-0 -my-3 lg:my-0 -mx-1 lg:mx-0 z-20"
                            title="Swap Departure and Destination"
                        >
                            <span className="text-gray-500 font-extrabold text-base leading-none">⇄</span>
                        </button>

                        {/* Destination (TO) Input */}
                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70 lg:last:border-r-0">
                            <div className="text-blue-500 shrink-0">
                                <MapPin size={20} className="stroke-[2]" />
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">TO</span>
                                <select
                                    className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none appearance-none cursor-pointer"
                                    value={toVal}
                                    onChange={(e) => setToVal(e.target.value)}
                                    required
                                >
                                    <option value="">Destination location</option>
                                    {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="flex-1 w-full flex items-center gap-3 px-4 py-1.5 border-r border-gray-100/70 lg:last:border-r-0">
                            <div className="text-blue-500 shrink-0">
                                <Calendar size={20} className="stroke-[2]" />
                            </div>
                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">DATE</span>
                                <input
                                    type="date"
                                    className="w-full bg-transparent border-none p-0 text-[13px] font-bold text-gray-700 focus:ring-0 outline-none cursor-pointer"
                                    value={dateVal}
                                    onChange={(e) => setDateVal(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Search Button */}
                        <Button
                            type="submit"
                            className="w-full lg:w-auto h-12 px-8 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 text-white font-extrabold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 shrink-0 transition-all hover:scale-[1.01] active:scale-95 border-none"
                        >
                            <Search size={16} /> Search Buses
                        </Button>
                    </form>
                </div>
            </div>

            {/* Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                {/* Filters Sidebar - Sticky Full Height Layout */}
                <div className="lg:sticky lg:top-24 self-start w-full">
                    <Card className="p-6 bg-white border-none shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-[2rem] border border-gray-50/50 flex flex-col justify-between min-h-[calc(100vh-220px)]">
                        <div>
                            {/* DEPARTURE TIME Accordion */}
                            <div className="mb-8">
                                <div 
                                    className="flex items-center justify-between cursor-pointer group mb-6" 
                                    onClick={() => setTimeOpen(!timeOpen)}
                                >
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-dark/70 flex items-center gap-2.5">
                                        <Clock size={15} className="text-blue-500 stroke-[2.5]" />
                                        Departure Time
                                    </h3>
                                    {timeOpen ? (
                                        <ChevronUp size={16} className="text-gray-400 group-hover:text-dark transition-colors" />
                                    ) : (
                                        <ChevronDown size={16} className="text-gray-400 group-hover:text-dark transition-colors" />
                                    )}
                                </div>

                                {timeOpen && (
                                    <div className="space-y-4 pl-0.5">
                                        {['Before 6:00 AM', '6:00 AM - 12:00 PM', '12:00 PM - 6:00 PM', 'After 6:00 PM'].map(time => (
                                            <label 
                                                key={time} 
                                                className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-dark transition-colors cursor-pointer group"
                                            >
                                                <div
                                                    className={`w-5 h-5 rounded-full border transition-all flex items-center justify-center ${selectedTime === time ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white group-hover:border-blue-500/50'}`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleTimeSelect(time);
                                                    }}
                                                >
                                                    {selectedTime === time && (
                                                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                                    )}
                                                </div>
                                                <span 
                                                    className={selectedTime === time ? 'text-dark font-extrabold' : ''}
                                                    onClick={() => handleTimeSelect(time)}
                                                >
                                                    {time}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="h-px bg-gray-100/70 my-6"></div>

                            {/* OPERATORS Accordion */}
                            <div className="mb-4">
                                <div 
                                    className="flex items-center justify-between cursor-pointer group mb-6" 
                                    onClick={() => setOperatorsOpen(!operatorsOpen)}
                                >
                                    <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-dark/70 flex items-center gap-2.5">
                                        <Bus size={15} className="text-blue-500 stroke-[2.5]" />
                                        Operators
                                    </h3>
                                    {operatorsOpen ? (
                                        <ChevronUp size={16} className="text-gray-400 group-hover:text-dark transition-colors" />
                                    ) : (
                                        <ChevronDown size={16} className="text-gray-400 group-hover:text-dark transition-colors" />
                                    )}
                                </div>

                                {operatorsOpen && (
                                    <div className="space-y-4 pl-0.5">
                                        {OPERATORS.map(op => {
                                            const isChecked = selectedOperators.includes(op.id);
                                            return (
                                                <label 
                                                    key={op.id} 
                                                    className="flex items-center gap-3 text-xs font-bold text-gray-500 hover:text-dark transition-colors cursor-pointer group"
                                                >
                                                    <div
                                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${isChecked ? 'border-blue-500 bg-blue-500' : 'border-gray-300 bg-white group-hover:border-blue-500/50'}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            handleOperatorSelect(op.id);
                                                        }}
                                                    >
                                                        {isChecked && (
                                                            <Check size={12} className="text-white stroke-[3.5]" />
                                                        )}
                                                    </div>
                                                    <span 
                                                        className={isChecked ? 'text-dark font-extrabold' : ''}
                                                        onClick={() => handleOperatorSelect(op.id)}
                                                    >
                                                        {op.name}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Reset / Clear Filters pushed to bottom */}
                        <div className="mt-auto pt-6 border-t border-gray-100/50">
                            {(selectedTime || selectedOperators.length > 0) ? (
                                <Button 
                                    onClick={clearFilters} 
                                    variant="outline"
                                    className="w-full py-2.5 rounded-2xl border border-blue-500 text-blue-500 font-bold hover:bg-blue-50/50 transition-all flex items-center justify-center gap-2 text-xs"
                                >
                                    <RefreshCw size={12} /> Clear Filters
                                </Button>
                            ) : (
                                <div className="text-center text-[10px] text-gray-400 font-bold tracking-wide uppercase">
                                    No active filters
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Results List Area */}
                <div className="lg:col-span-3">

                    {/* Sort Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                            {loading ? 'Searching...' : `${trips.length} result${trips.length !== 1 ? 's' : ''} found`}
                        </p>

                        {/* Sort By Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setSortOpen(prev => !prev)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all text-xs font-bold text-gray-700 group"
                            >
                                <ArrowUpDown size={14} className="text-blue-500 shrink-0" />
                                <span className="hidden sm:inline text-gray-500 font-semibold">Sort:</span>
                                <span className="text-gray-800 max-w-[130px] truncate">{activeSortLabel}</span>
                                <ChevronDown
                                    size={14}
                                    className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                                        sortOpen ? 'rotate-180' : ''
                                    }`}
                                />
                            </button>

                            {sortOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setSortOpen(false)}
                                    />
                                    {/* Dropdown Panel */}
                                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100/80 overflow-hidden z-20 animate-in fade-in slide-in-from-top-1 duration-150">
                                        <div className="px-3 pt-3 pb-2">
                                            <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-gray-400 px-2 mb-2">Sort By</p>
                                            {SORT_OPTIONS.map(option => {
                                                const Icon = option.icon;
                                                const isActive = sortBy === option.value;
                                                return (
                                                    <button
                                                        key={option.value}
                                                        onClick={() => {
                                                            setSortBy(option.value);
                                                            setSortOpen(false);
                                                        }}
                                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-bold transition-all ${
                                                            isActive
                                                                ? 'bg-blue-50 text-blue-700'
                                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <Icon
                                                            size={14}
                                                            className={`shrink-0 ${
                                                                isActive ? 'text-blue-500' : 'text-gray-400'
                                                            }`}
                                                        />
                                                        <span className="flex-1">{option.label}</span>
                                                        {isActive && (
                                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/50">
                                            <p className="text-[9px] text-gray-400 font-semibold text-center">
                                                {activeSortLabel}
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {loading ? (
                        <div className="space-y-6">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="h-32 animate-pulse bg-gray-50/50 rounded-3xl border-none" />
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
                            <Button 
                                className="mt-8 h-12 px-8 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition-all border-none" 
                                onClick={() => {
                                    clearFilters();
                                    setFromVal('');
                                    setToVal('');
                                    setDateVal('');
                                    setSearchParams({});
                                }}
                            >
                                Clear All Search
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
