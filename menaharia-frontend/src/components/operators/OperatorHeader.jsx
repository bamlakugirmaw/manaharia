import React from 'react';
import { Badge } from '../ui/Badge';
import { Phone, Mail, MapPin, Shield, CreditCard, QrCode, Calendar } from 'lucide-react';

export default function OperatorHeader({ operator }) {
    const badgeIcons = {
        'Verified Operator': Shield,
        'Secure Payments': CreditCard,
        'QR Ticketing': QrCode
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px'
                }} />
            </div>

            <div className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 bg-white">
                            <img
                                src={operator.logo}
                                alt={operator.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Company Info */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                            {operator.name}
                        </h1>

                        {/* Contact Info */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            <div className="flex items-center gap-2 text-white/90">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm font-medium">{operator.contact.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium">{operator.contact.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/90">
                                <MapPin className="w-4 h-4" />
                                <span className="text-sm font-medium">{operator.contact.address}</span>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="flex flex-wrap gap-3 mb-4">
                            {operator.badges.map((badge, idx) => {
                                const Icon = badgeIcons[badge];
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30"
                                    >
                                        {Icon && <Icon className="w-4 h-4 text-white" />}
                                        <span className="text-sm font-bold text-white">{badge}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Established Year */}
                        <div className="flex items-center gap-2 text-white/90">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-medium">
                                Serving since {operator.established} • {new Date().getFullYear() - operator.established} years of excellence
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
