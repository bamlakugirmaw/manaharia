import React from 'react';
import { getAllOperators } from '../data/operators-data';
import OperatorCard from '../components/operators/OperatorCard';
import { Bus, Search } from 'lucide-react';

export default function OperatorsListing() {
    const operators = getAllOperators();

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary/95 to-secondary py-20 px-4 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative max-w-7xl mx-auto text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-md rounded-3xl mb-6 shadow-2xl">
                        <Bus className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Transport Operators
                    </h1>
                    <p className="text-xl md:text-2xl text-white/90 font-medium max-w-3xl mx-auto leading-relaxed">
                        Discover trusted bus operators across Ethiopia. Compare services, routes, and prices to find the perfect travel partner for your journey.
                    </p>
                </div>
            </section>

            {/* Operators Grid */}
            <section className="py-16 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* Stats Bar */}
                    <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Available Operators</p>
                            <p className="text-3xl font-black text-gray-900">{operators.length} Verified Companies</p>
                        </div>

                        {/* Future: Search/Filter */}
                        <div className="flex items-center gap-2 text-gray-400">
                            <Search className="w-5 h-5" />
                            <span className="text-sm font-medium">Search & filters coming soon</span>
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {operators.map((operator) => (
                            <OperatorCard key={operator.id} operator={operator} />
                        ))}
                    </div>

                    {/* Info Section */}
                    <div className="mt-20 bg-gradient-to-br from-blue-50 to-primary/5 rounded-3xl p-8 md:p-12 border border-primary/10">
                        <div className="max-w-3xl mx-auto text-center">
                            <h2 className="text-3xl font-black text-gray-900 mb-4">
                                Why Book with Our Operators?
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                All operators listed on our platform are verified and meet strict safety and quality standards.
                                Enjoy secure payments, QR ticketing, and reliable service across Ethiopia's major routes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <span className="text-2xl">✓</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">Verified Operators</h3>
                                    <p className="text-sm text-gray-600">All companies are licensed and regularly inspected</p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">Secure Booking</h3>
                                    <p className="text-sm text-gray-600">Safe payment processing and instant confirmation</p>
                                </div>
                                <div className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
                                        <span className="text-2xl">⭐</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-2">Quality Service</h3>
                                    <p className="text-sm text-gray-600">Rated by thousands of satisfied travelers</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
