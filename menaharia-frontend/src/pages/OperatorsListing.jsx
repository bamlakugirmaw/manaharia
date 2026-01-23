import React, { useState } from 'react';
import { getAllOperators } from '../data/operators-data';
import OperatorCard from '../components/operators/OperatorCard';
import { Search } from 'lucide-react';

export default function OperatorsListing() {
    const [searchTerm, setSearchTerm] = useState('');
    const allOperators = getAllOperators();

    const filteredOperators = allOperators.filter(op =>
        op.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        op.routes.some(r => r.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Search Section */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary px-4 pt-20 pb-24 text-center rounded-b-[3rem] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }} />
                </div>

                <div className="relative max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Our Transport Partners
                    </h1>
                    <p className="text-lg text-white/90 font-medium max-w-xl mx-auto">
                        Travel with confidence. Choose from Ethiopia's most trusted and verified bus operators.
                    </p>

                    <div className="relative max-w-xl mx-auto mt-8">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by operator name or route..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-white/20 outline-none text-gray-800 placeholder:text-gray-400 font-medium transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Operators Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredOperators.map((operator) => (
                        <OperatorCard key={operator.id} operator={operator} />
                    ))}

                    {filteredOperators.length === 0 && (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">No operators found</h3>
                            <p className="text-gray-500 mt-2">Try adjusting your search terms.</p>
                        </div>
                    )}
                </div>

                {/* Trust Indicators */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mb-4 mx-auto text-green-600 text-2xl font-bold">✓</div>
                        <h3 className="font-bold text-gray-900 mb-2">Verified Partners</h3>
                        <p className="text-sm text-gray-600">Every operator is licensed and vetted for safety.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 mx-auto text-blue-600 text-2xl font-bold">★</div>
                        <h3 className="font-bold text-gray-900 mb-2">Real Ratings</h3>
                        <p className="text-sm text-gray-600">See honest reviews from fellow travelers.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                        <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-4 mx-auto text-purple-600 text-2xl font-bold">🔒</div>
                        <h3 className="font-bold text-gray-900 mb-2">Secure Booking</h3>
                        <p className="text-sm text-gray-600">Your payments and tickets are protected.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
