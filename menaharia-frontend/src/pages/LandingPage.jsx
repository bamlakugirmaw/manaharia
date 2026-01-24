import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { MapPin, Calendar, Users, Search, ArrowRight, MousePointer2, Armchair, Wallet } from 'lucide-react';
import { LOCATIONS } from '../data/mock-db';
import { useNavigate, Link } from 'react-router-dom';
import { cn } from '../lib/utils';

export default function LandingPage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        from: '',
        to: '',
        date: '',
        passengers: 1
    });

    const handleSearch = (e) => {
        e.preventDefault();
        navigate(`/search?from=${searchParams.from}&to=${searchParams.to}&date=${searchParams.date}`);
    };

    const popularRoutes = [
        { id: 1, from: 'Addis Ababa', to: 'Dire Dawa', time: '8h 30m', price: '450', image: '/images/Enhanced_Bus_Images/Sky_Bus.jpg' },
        { id: 2, from: 'Addis Ababa', to: 'Bahir Dar', time: '9h 15m', price: '520', image: '/images/Enhanced_Bus_Images/Selam_Bus1.jpg' },
        { id: 3, from: 'Addis Ababa', to: 'Mekelle', time: '12h 00m', price: '680', image: '/images/Enhanced_Bus_Images/Ethio_Bus.jpg' },
        { id: 4, from: 'Dire Dawa', to: 'Hawassa', time: '7h 45m', price: '390', image: '/images/Enhanced_Bus_Images/Abay_Bus.jpg' },
    ];


    const destinations = [
        { name: 'Addis Ababa', routes: 45, image: '/images/destinations/addis_ababa.jpg' },
        { name: 'Bahir Dar', routes: 28, image: '/images/destinations/bahir_dar.jpg' },
        { name: 'Gondar', routes: 22, image: '/images/destinations/gondar.jpg' },
        { name: 'Jimma', routes: 32, image: '/images/destinations/jimma.jpg' },
        { name: 'Mekelle', routes: 26, image: '/images/destinations/mekelle.jpg' },
        { name: 'Hawassa', routes: 19, image: '/images/destinations/hawassa.jpg' },
    ];

    const HERO_IMAGES = [
        "/images/Enhanced_Bus_Images/Ethio_Bus.jpg",
        "/images/Enhanced_Bus_Images/Selam_Bus1.jpg",
        "/images/Enhanced_Bus_Images/Zemen_Bus.jpg"
    ];

    const OPERATORS = [
        { name: "Golden Bus", image: "/images/Enhanced_Bus_Images/Golden_Bus.jpg" },
        { name: "Selam Bus", image: "/images/Enhanced_Bus_Images/Selam_Bus1.jpg" },
        { name: "Abay Bus", image: "/images/Enhanced_Bus_Images/Abay_Bus.jpg" }
    ];

    const [heroIndex, setHeroIndex] = useState(0);
    const [opIndex, setOpIndex] = useState(0);

    const nextHero = useCallback(() => {
        setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, [HERO_IMAGES.length]);

    const nextOp = useCallback(() => {
        setOpIndex((prev) => (prev + 1) % OPERATORS.length);
    }, [OPERATORS.length]);

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
            <section className="relative h-[467px] flex items-center justify-center text-white overflow-hidden">
                <div className="absolute inset-0 z-0">
                    {HERO_IMAGES.map((img, idx) => (
                        <div
                            key={idx}
                            className={cn(
                                "absolute inset-0 transition-all duration-[1500ms] ease-in-out transform",
                                idx === heroIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
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

                {/* Carousel Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                    {HERO_IMAGES.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setHeroIndex(idx)}
                            className={cn(
                                "h-2 transition-all duration-500 rounded-full",
                                idx === heroIndex ? "w-10 bg-white" : "w-2 bg-white/40 hover:bg-white/60"
                            )}
                        />
                    ))}
                </div>
            </section>

            {/* Content Wrapper for Overlapping Search */}
            <div className="relative z-30 max-w-7xl mx-auto px-4 w-full -mt-8">
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
                                            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
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
                                            {LOCATIONS.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-3 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Date</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500">
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

                                <div className="md:col-span-3 space-y-3">
                                    <label className="text-sm font-bold text-gray-400 ml-1">Passengers</label>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-blue-500">
                                            <Users size={22} />
                                        </div>
                                        <select
                                            className="w-full h-16 pl-14 pr-6 bg-blue-50/40 border-none rounded-2xl text-[13px] font-bold text-gray-400 focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                                            value={searchParams.passengers}
                                            onChange={(e) => setSearchParams({ ...searchParams, passengers: parseInt(e.target.value) })}
                                        >
                                            {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Passenger{n > 1 ? 's' : ''}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <Button type="submit" className="w-full h-16 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 hover:opacity-90 transition-all font-black text-lg shadow-xl shadow-orange-500/20 flex items-center justify-center gap-2">
                                        <Search size={22} /> Search <ArrowRight size={18} className="opacity-50" />
                                    </Button>
                                </div>
                            </div>

                            {/* Popular Routes Quick Links */}
                            <div className="flex flex-wrap items-center gap-4">
                                <span className="text-xs font-bold text-gray-900 ml-1">Popular:</span>
                                {['Addis → Dire Dawa', 'Addis → Bahir Dar', 'Addis → Mekelle'].map(route => (
                                    <button
                                        key={route}
                                        type="button"
                                        className="px-4 py-1 rounded-full bg-white text-[12px] font-bold text-gray-900 transition-all border border-gray-100 shadow-sm hover:border-primary/30"
                                    >
                                        {route}
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
                        <p className="text-gray-500 text-lg">Discover our most traveled destinations with comfortable buses and reliable service</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {popularRoutes.map((route) => (
                            <div key={route.id} className="group relative h-80 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:translate-y-[-8px]">
                                <img src={route.image} alt={route.to} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                                <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">
                                    {route.time}
                                </div>

                                <div className="absolute bottom-6 left-6 right-6">
                                    <div className="flex items-center gap-2 text-white/80 mb-1">
                                        <MapPin size={12} className="text-orange-400" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{route.from} → {route.to}</span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-white/60 text-[10px] font-medium">Starting from</p>
                                            <p className="text-2xl font-black text-white">{route.price} <span className="text-xs font-bold text-white/70">ETB</span></p>
                                        </div>
                                        <Button size="icon" className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-primary transition-all shadow-lg border border-white/20 group-hover:translate-x-2">
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
                        {/* Connecting Line */}
                        <div className="absolute top-[4.5rem] left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-blue-100 via-primary/20 to-blue-100 hidden md:block" />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
                            {[
                                { step: 1, title: 'Search & Compare', desc: 'Find the perfect route and time that fits your schedule', icon: <Search size={32} />, color: 'bg-blue-600', shadow: 'shadow-blue-200' },
                                { step: 2, title: 'Pick Your Seat', desc: 'Choose your preferred seat from our interactive seat map', icon: <Armchair size={32} />, color: 'bg-primary', shadow: 'shadow-primary/20' },
                                { step: 3, title: 'Pay & Go', desc: 'Secure payment and instant ticket confirmation', icon: <Wallet size={32} />, color: 'bg-dark', shadow: 'shadow-dark/20' }
                            ].map((item, idx) => (
                                <div key={idx} className="flex flex-col items-center text-center group">
                                    <div className="relative mb-10">
                                        <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-black text-xs z-20 shadow-lg shadow-secondary/30">
                                            {item.step}
                                        </div>
                                        <div className={cn(
                                            "w-24 h-24 rounded-full bg-white flex items-center justify-center text-white scale-110 shadow-[0_20px_50px_rgba(0,0,0,0.1)] group-hover:scale-125 transition-all duration-500 z-10 relative",
                                            "ring-8 ring-blue-50/50"
                                        )}>
                                            <div className={cn("w-full h-full rounded-full flex items-center justify-center blur-sm absolute opacity-20", item.color)} />
                                            <div className={cn("w-16 h-16 rounded-full flex items-center justify-center text-white z-10", item.color)}>
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

                    <div className="mt-24 text-center">
                        <Button
                            onClick={() => navigate('/search')}
                            className="px-12 py-7 rounded-3xl bg-gradient-to-r from-orange-400 to-pink-500 font-black text-xl shadow-2xl shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all outline-none border-none"
                        >
                            Start Booking Now <Search className="ml-3" size={24} />
                        </Button>
                    </div>
                </div>
            </section>

            {/* Featured Operator Section */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-12">Trusted Operators</h2>
                    <div className="relative h-[500px] rounded-[3rem] overflow-hidden shadow-2xl group">
                        <div className="absolute inset-0">
                            {OPERATORS.map((op, idx) => (
                                <div
                                    key={idx}
                                    className={cn(
                                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                                        idx === opIndex ? "opacity-100" : "opacity-0"
                                    )}
                                >
                                    <img
                                        src={op.image}
                                        alt={op.name}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/20" />
                                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-full max-w-xl text-center px-4">
                                        <h3 className="text-4xl font-black text-white mb-6 drop-shadow-lg scale-95 transition-transform duration-700 group-hover:scale-100">
                                            {op.name}
                                        </h3>
                                        <div className="flex gap-2 justify-center">
                                            {OPERATORS.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setOpIndex(i)}
                                                    className={cn(
                                                        "h-2 transition-all duration-300 rounded-full",
                                                        i === opIndex ? "w-12 bg-primary shadow-lg shadow-primary/40" : "w-2 bg-white/40 hover:bg-white/60"
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
                        <p className="text-gray-500 text-lg max-w-2xl mx-auto">From bustling cities to serene landscapes, discover amazing places across the region</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Left side - Large Addis Ababa card */}
                        <div className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-[500px]">
                            <img src={destinations[0].image} alt={destinations[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                            <div className="absolute bottom-8 left-8">
                                <div
                                    onClick={() => navigate('/destinations')}
                                    className="cursor-pointer bg-black/30 backdrop-blur-md rounded-2xl border border-white/20 p-6 pr-10 hover:bg-black/40 transition-all"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <MapPin className="text-orange-400" size={20} />
                                        <h4 className="text-3xl font-black text-white">{destinations[0].name}</h4>
                                    </div>
                                    <p className="text-white/80 text-sm font-medium pl-7">{destinations[0].routes} routes available</p>
                                </div>
                            </div>
                        </div>

                        {/* Right side - Two stacked cards */}
                        <div className="grid grid-rows-2 gap-6 h-[500px]">
                            {destinations.slice(1, 3).map((dest, idx) => (
                                <div key={idx} className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-full">
                                    <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                    <div className="absolute bottom-6 left-6">
                                        <div
                                            onClick={() => navigate('/destinations')}
                                            className="cursor-pointer bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 hover:bg-white/20 transition-all"
                                        >
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin className="text-orange-400" size={16} />
                                                <h4 className="text-2xl font-black text-white">{dest.name}</h4>
                                            </div>
                                            <p className="text-white/70 text-xs font-medium pl-6">{dest.routes} routes</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Bottom row - Three equal cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        {destinations.slice(3, 6).map((dest, idx) => (
                            <div key={idx} className="group relative overflow-hidden rounded-[2rem] shadow-xl hover:shadow-2xl transition-all h-[240px]">
                                <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                                <div className="absolute bottom-6 left-6">
                                    <div
                                        onClick={() => navigate('/destinations')}
                                        className="cursor-pointer bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 p-4 hover:bg-black/50 transition-all"
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <MapPin className="text-orange-400" size={14} />
                                            <h4 className="text-xl font-black text-white">{dest.name}</h4>
                                        </div>
                                        <p className="text-white/70 text-xs font-medium pl-5 leading-tight">{dest.routes}<br />routes</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
