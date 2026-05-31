import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MapPin, Calendar, Users, Search, ArrowRight, Armchair, Wallet } from 'lucide-react';
import { LOCATIONS, DESTINATIONS, OPERATORS as MOCK_OPERATORS } from '../data/mock-db';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useRoutes } from '../hooks/useRoutes';
import { useAllTrips } from '../hooks/useTrips';
import { usePublicDestinations } from '../hooks/useDestinations';
import { useOperators } from '../hooks/useOperators';
import { useAuth } from '../contexts/AuthContext';
import { tripOrigin, tripDest, formatTripDuration } from '../lib/tripHelpers';

const STATIC_POPULAR_ROUTES = [
    { id: 1, from: 'Addis Ababa', to: 'Dire Dawa', time: '8h 30m', price: '450', image: '/images/Enhanced_Bus_Images/Sky_Bus.jpg' },
    { id: 2, from: 'Addis Ababa', to: 'Bahir Dar', time: '9h 15m', price: '520', image: '/images/Enhanced_Bus_Images/Selam_Bus1.jpg' },
    { id: 3, from: 'Addis Ababa', to: 'Mekelle', time: '12h 00m', price: '680', image: '/images/Enhanced_Bus_Images/Ethio_Bus.jpg' },
    { id: 4, from: 'Dire Dawa', to: 'Hawassa', time: '7h 45m', price: '390', image: '/images/Enhanced_Bus_Images/Abay_Bus.jpg' },
];

const ROUTE_CARD_IMAGES = [
    '/images/Enhanced_Bus_Images/Sky_Bus.jpg',
    '/images/Enhanced_Bus_Images/Selam_Bus1.jpg',
    '/images/Enhanced_Bus_Images/Ethio_Bus.jpg',
    '/images/Enhanced_Bus_Images/Abay_Bus.jpg',
];

const FALLBACK_OPERATORS = [
    { name: 'Golden Bus', image: '/images/Enhanced_Bus_Images/Golden_Bus.jpg' },
    { name: 'Selam Bus', image: '/images/Enhanced_Bus_Images/Selam_Bus1.jpg' },
    { name: 'Abay Bus', image: '/images/Enhanced_Bus_Images/Abay_Bus.jpg' },
];

export default function LandingPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();
    const { data: apiRoutes = [] } = useRoutes({ limit: 200 });
    const { data: trips = [] } = useAllTrips({ limit: 100, status: 'SCHEDULED' });
    const { data: destPayload } = usePublicDestinations({ limit: 12 });
    const { data: apiOperators = [] } = useOperators({
        limit: 6,
        status: 'ACTIVE',
        enabled: isAuthenticated,
    });

    const locations = useMemo(() => {
        const set = new Set();
        apiRoutes.forEach((r) => {
            if (r.origin) set.add(r.origin);
            if (r.destination) set.add(r.destination);
        });
        const fromApi = [...set].sort();
        return fromApi.length > 0 ? fromApi : LOCATIONS;
    }, [apiRoutes]);

    const popularRoutes = useMemo(() => {
        const map = new Map();
        trips.forEach((t) => {
            const from = tripOrigin(t);
            const to = tripDest(t);
            if (!from || !to) return;
            const key = `${from}|${to}`;
            const price = t.price ?? Infinity;
            const cur = map.get(key) ?? { from, to, count: 0, minPrice: Infinity, sample: t };
            cur.count += 1;
            if (price < cur.minPrice) {
                cur.minPrice = price;
                cur.sample = t;
            }
            map.set(key, cur);
        });
        const fromApi = [...map.values()]
            .sort((a, b) => b.count - a.count)
            .slice(0, 4)
            .map((r, i) => ({
                id: `${r.from}-${r.to}`,
                from: r.from,
                to: r.to,
                time: formatTripDuration(r.sample),
                price: r.minPrice === Infinity ? '—' : String(Math.round(r.minPrice)),
                image: ROUTE_CARD_IMAGES[i % ROUTE_CARD_IMAGES.length],
            }));
        return fromApi.length > 0 ? fromApi : STATIC_POPULAR_ROUTES;
    }, [trips]);

    const destinations = useMemo(() => {
        const apiDests = destPayload?.destinations ?? [];
        const build = (list) =>
            list.slice(0, 6).map((d) => {
                const name = d.name;
                const routeCount = trips.filter(
                    (t) => tripOrigin(t) === name || tripDest(t) === name
                ).length;
                return {
                    id: d.id,
                    name,
                    routes: routeCount,
                    image: d.image ?? '/images/destinations/addis_ababa.jpg',
                };
            });

        if (apiDests.length > 0) return build(apiDests);
        return build(DESTINATIONS);
    }, [destPayload, trips]);

    const operators = useMemo(() => {
        if (apiOperators.length > 0) {
            return apiOperators.slice(0, 5).map((o) => ({
                name: o.companyName ?? o.name ?? 'Operator',
                image: o.logo ?? o.image ?? '/images/Enhanced_Bus_Images/Selam_Bus1.jpg',
            }));
        }
        if (MOCK_OPERATORS.length > 0) {
            return MOCK_OPERATORS.slice(0, 5).map((o) => ({
                name: o.name,
                image: o.image,
            }));
        }
        return FALLBACK_OPERATORS;
    }, [apiOperators]);

    const goDestination = (dest) => {
        if (dest.id && !String(dest.id).startsWith('dest-')) {
            navigate(`/destinations/${dest.id}`);
        } else {
            navigate('/destinations');
        }
    };

    const [searchParams, setSearchParams] = useState({
        from: '',
        to: '',
        date: '',
        passengers: 1,
    });

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
    };

    const HERO_IMAGES = [
        '/images/Enhanced_Bus_Images/Ethio_Bus.jpg',
        '/images/Enhanced_Bus_Images/Selam_Bus1.jpg',
        '/images/Enhanced_Bus_Images/Zemen_Bus.jpg',
    ];

    const [heroIndex, setHeroIndex] = useState(0);
    const [opIndex, setOpIndex] = useState(0);

    const nextHero = useCallback(() => {
        setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, [HERO_IMAGES.length]);

    const nextOp = useCallback(() => {
        setOpIndex((prev) => (prev + 1) % operators.length);
    }, [operators.length]);

    useEffect(() => {
        setOpIndex(0);
    }, [operators.length]);

    useEffect(() => {
        const heroTimer = setInterval(nextHero, 5000);
        const opTimer = setInterval(nextOp, 6000);
        return () => {
            clearInterval(heroTimer);
            clearInterval(opTimer);
        };
    }, [nextHero, nextOp]);

    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <div className="relative z-10 max-w-[1400px] mx-auto px-4 w-full mt-6">
                <section className="relative h-[467px] flex items-center justify-center text-white overflow-hidden rounded-[3rem]">
                    <div className="absolute inset-0 z-0">
                        {HERO_IMAGES.map((img, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'absolute inset-0 transition-all duration-[1500ms] ease-in-out transform',
                                    idx === heroIndex ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
                                )}
                            >
                                <img
                                    src={img}
                                    alt={`Hero background ${idx}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                        <div className="absolute inset-0 bg-black/30" />
                    </div>

                    <div className="relative z-10 w-full max-w-7xl mx-auto px-4 text-center pb-20">
                        <h1 className="text-6xl md:text-[80px] font-black mb-6 tracking-tight leading-none">
                            Find the Best Bus <br /> for Your Trip
                        </h1>
                        <p className="text-xl md:text-2xl text-white/90 font-medium max-w-2xl mx-auto">
                            Compare routes, prices, and schedules for buses across Ethiopia
                        </p>
                    </div>

                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                        {HERO_IMAGES.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setHeroIndex(idx)}
                                className={cn(
                                    'h-2 transition-all duration-500 rounded-full',
                                    idx === heroIndex ? 'w-10 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                                )}
                            />
                        ))}
                    </div>
                </section>
            </div>

            {/* Content Wrapper for Overlapping Search */}
            <div className="relative z-30 max-w-5xl mx-auto px-4 w-full -mt-8">
                <Card className="bg-transparent p-0 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.15)] rounded-[3rem] border border-white/40 overflow-hidden">
                    <div className="h-7 w-full bg-transparent" />
                    <div className="bg-white p-10 pt-6">
                        <form onSubmit={handleSearch} className="flex flex-col gap-8">
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">From</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-cyan-500">
                                            <MapPin size={22} />
                                        </div>
                                        <select
                                            className="w-full h-16 pl-14 pr-6 bg-blue-50/40 border-none rounded-2xl text-[13px] font-bold text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                            value={searchParams.from}
                                            onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                                            required
                                        >
                                            <option value="">Departure city</option>
                                            {locations.map((loc) => (
                                                <option key={loc} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">To</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-orange-400">
                                            <MapPin size={22} />
                                        </div>
                                        <select
                                            className="w-full h-16 pl-14 pr-6 bg-blue-50/40 border-none rounded-2xl text-[13px] font-bold text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                            value={searchParams.to}
                                            onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                                            required
                                        >
                                            <option value="">Destination city</option>
                                            {locations.map((loc) => (
                                                <option key={loc} value={loc}>
                                                    {loc}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-3 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Date</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-purple-500">
                                            <Calendar size={22} />
                                        </div>
                                        <input
                                            type="date"
                                            className="w-full h-16 pl-14 pr-6 bg-blue-50/40 border-none rounded-2xl text-[13px] font-bold text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none"
                                            value={searchParams.date}
                                            onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="md:col-span-2 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Passengers</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500">
                                            <Users size={22} />
                                        </div>
                                        <select
                                            className="w-full h-16 pl-14 pr-6 bg-blue-50/40 border-none rounded-2xl text-[13px] font-bold text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                            value={searchParams.passengers}
                                            onChange={(e) =>
                                                setSearchParams({
                                                    ...searchParams,
                                                    passengers: parseInt(e.target.value, 10),
                                                })
                                            }
                                        >
                                            {[1, 2, 3, 4, 5, 6].map((n) => (
                                                <option key={n} value={n}>
                                                    {n} Passenger{n > 1 ? 's' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-3">
                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg shadow-primary/30 flex items-center justify-center gap-3"
                                    >
                                        <Search size={22} /> Search Buses
                                    </Button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 justify-center">
                                <span className="text-xs font-bold text-gray-400 mr-2 self-center">Popular:</span>
                                {popularRoutes.slice(0, 3).map((route) => (
                                    <button
                                        key={route.id}
                                        type="button"
                                        onClick={() =>
                                            setSearchParams((p) => ({
                                                ...p,
                                                from: route.from,
                                                to: route.to,
                                            }))
                                        }
                                        className="px-4 py-1 rounded-full bg-white text-[12px] font-bold text-gray-900 transition-all border border-gray-100 shadow-sm hover:border-primary/30"
                                    >
                                        {route.from} → {route.to}
                                    </button>
                                ))}
                            </div>
                        </form>
                    </div>
                </Card>
            </div>

            {/* Popular Routes Section */}
            <section className="pt-40 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 px-4">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Popular Routes</h2>
                        <p className="text-gray-500 text-lg">
                            Discover our most traveled destinations with comfortable buses and reliable service
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {popularRoutes.map((route) => (
                            <div
                                key={route.id}
                                role="button"
                                tabIndex={0}
                                onClick={() =>
                                    navigate(
                                        `/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`
                                    )
                                }
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        navigate(
                                            `/search?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`
                                        );
                                    }
                                }}
                                className="group relative h-80 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:translate-y-[-8px] cursor-pointer"
                            >
                                <img
                                    src={route.image}
                                    alt={route.to}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
                                    {route.time}
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 text-white/80 mb-1">
                                        <MapPin size={12} className="text-orange-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">
                                            {route.from} → {route.to}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white/60 text-[10px] font-medium">Starting from</p>
                                            <p className="text-2xl font-black text-white">
                                                {route.price}{' '}
                                                <span className="text-xs font-bold text-white/70">ETB</span>
                                            </p>
                                        </div>
                                        <Button
                                            size="icon"
                                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-primary transition-all shadow-lg border border-white/20 group-hover:translate-x-2"
                                        >
                                            <ArrowRight size={20} />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <Button
                            onClick={() => navigate('/routes')}
                            variant="outline"
                            className="px-10 py-6 rounded-2xl border-2 border-primary text-primary font-black text-lg hover:bg-primary hover:text-white transition-all"
                        >
                            View All Routes <ArrowRight className="ml-2" size={20} />
                        </Button>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4 z-10 relative">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">How It Works</h2>
                        <p className="text-gray-500 text-lg">Book your journey in three simple steps</p>
                    </div>

                    <div className="relative max-w-5xl mx-auto">
                        <div className="absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-100 via-primary/20 to-blue-100 hidden md:block" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                            {[
                                {
                                    step: 1,
                                    title: 'Search & Compare',
                                    desc: 'Find the perfect route and time that fits your schedule',
                                    icon: <Search size={32} />,
                                    color: 'bg-blue-600',
                                },
                                {
                                    step: 2,
                                    title: 'Pick Your Seat',
                                    desc: 'Choose your preferred seat from our interactive seat map',
                                    icon: <Armchair size={32} />,
                                    color: 'bg-primary',
                                },
                                {
                                    step: 3,
                                    title: 'Pay & Go',
                                    desc: 'Secure payment and instant ticket confirmation',
                                    icon: <Wallet size={32} />,
                                    color: 'bg-dark',
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center group">
                                    <div className="relative mb-10">
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-black text-xs z-20 shadow-lg shadow-secondary/30">
                                            {item.step}
                                        </div>
                                        <div
                                            className={cn(
                                                'w-24 h-24 rounded-full bg-white flex items-center justify-center text-white scale-110 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-all duration-500 z-10 relative',
                                                'ring-8 ring-blue-50/50'
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'w-full h-full rounded-full flex items-center justify-center blur-sm absolute opacity-20',
                                                    item.color
                                                )}
                                            />
                                            <div
                                                className={cn(
                                                    'w-16 h-16 rounded-full flex items-center justify-center text-white z-10',
                                                    item.color
                                                )}
                                            >
                                                {item.icon}
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-2xl font-black text-gray-900 mb-3">{item.title}</h3>
                                    <p className="text-gray-500 leading-relaxed font-medium max-w-[200px] mx-auto text-sm">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="mt-24 max-w-5xl mx-auto rounded-[2.5rem] border border-slate-100 p-8 md:p-14 shadow-[0_15px_40px_rgba(0,0,0,0.02)] grid grid-cols-1 md:grid-cols-12 gap-8 relative overflow-hidden bg-cover bg-center md:bg-[right_center]"
                        style={{ backgroundImage: "url('/images/cta_banner_bg.png')" }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/40 via-white/10 to-transparent pointer-events-none" />

                        <div className="md:col-span-7 flex flex-col justify-center space-y-6 text-center md:text-left z-10 relative">
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-[38px] font-black text-indigo-950 tracking-tight leading-tight">
                                    Ready to start your journey?
                                </h3>
                                <p className="text-sm md:text-base font-bold text-slate-600">
                                    Book bus tickets across Ethiopia in minutes.
                                </p>
                            </div>
                            <div className="flex justify-center md:justify-start">
                                <Button
                                    onClick={() => navigate('/routes')}
                                    className="h-14 px-10 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 font-extrabold text-base tracking-wide shadow-lg shadow-pink-500/25 hover:scale-105 active:scale-95 transition-all outline-none border-none flex items-center justify-center gap-2 w-full sm:w-auto"
                                >
                                    Start Booking Now <ArrowRight className="ml-2 w-5 h-5 shrink-0" />
                                </Button>
                            </div>
                        </div>

                        <div className="hidden md:block md:col-span-5" />
                    </div>
                </div>
            </section>

            {/* Featured Operator Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">Trusted Operators</h2>
                    <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0">
                            {operators.map((op, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        'absolute inset-0 transition-opacity duration-1000 ease-in-out',
                                        idx === opIndex ? 'opacity-100' : 'opacity-0'
                                    )}
                                >
                                    <img src={op.image} alt={op.name} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl text-center px-4">
                                        <h3 className="text-4xl font-black text-white mb-6 drop-shadow-lg scale-95 transition-transform duration-700 group-hover:scale-100">
                                            {op.name}
                                        </h3>
                                        <div className="flex gap-2 justify-center">
                                            {operators.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setOpIndex(i)}
                                                    className={cn(
                                                        'h-2 transition-all duration-300 rounded-full',
                                                        i === opIndex
                                                            ? 'w-12 bg-primary shadow-lg shadow-primary/40'
                                                            : 'w-2 bg-white/40 hover:bg-white/60'
                                                    )}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Explore Destinations grid */}
            <section className="py-32 px-4 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Explore Destinations</h2>
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                            From bustling cities to serene landscapes, discover amazing places across the region
                        </p>
                    </div>

                    {destinations.length > 0 && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-[500px]">
                                    <img
                                        src={destinations[0].image}
                                        alt={destinations[0].name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    <div className="absolute bottom-8 left-8">
                                        <div
                                            onClick={() => goDestination(destinations[0])}
                                            className="cursor-pointer bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 pr-10 hover:bg-black/40 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="text-orange-400" size={20} />
                                                <h4 className="text-3xl font-black text-white">{destinations[0].name}</h4>
                                            </div>
                                            <p className="text-white/80 text-sm font-medium pl-7">
                                                {destinations[0].routes} trips available
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-rows-2 gap-6 h-[500px]">
                                    {destinations.slice(1, 3).map((dest, idx) => (
                                        <div
                                            key={dest.id ?? idx}
                                            className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-full"
                                        >
                                            <img
                                                src={dest.image}
                                                alt={dest.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                            <div className="absolute bottom-6 left-6">
                                                <div
                                                    onClick={() => goDestination(dest)}
                                                    className="cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 hover:bg-white/20 transition-all"
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MapPin className="text-orange-400" size={16} />
                                                        <h4 className="text-2xl font-black text-white">{dest.name}</h4>
                                                    </div>
                                                    <p className="text-white/70 text-xs font-medium pl-6">
                                                        {dest.routes} trips
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                                {destinations.slice(3, 6).map((dest, idx) => (
                                    <div
                                        key={dest.id ?? idx}
                                        className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-[240px]"
                                    >
                                        <img
                                            src={dest.image}
                                            alt={dest.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                        <div className="absolute bottom-6 left-6">
                                            <div
                                                onClick={() => goDestination(dest)}
                                                className="cursor-pointer bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 p-4 hover:bg-black/50 transition-all"
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <MapPin className="text-orange-400" size={14} />
                                                    <h4 className="text-xl font-black text-white">{dest.name}</h4>
                                                </div>
                                                <p className="text-white/70 text-xs font-medium pl-5 leading-tight">
                                                    {dest.routes}
                                                    <br />
                                                    trips
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}
