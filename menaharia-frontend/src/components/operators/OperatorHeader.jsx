import React from 'react';
import { Phone, Mail, MapPin, Shield, CreditCard, QrCode, Calendar, Star, TrendingUp } from 'lucide-react';

const BADGE_ICONS = {
    'Verified Operator': Shield,
    'Secure Payments': CreditCard,
    'QR Ticketing': QrCode,
};

export default function OperatorHeader({ operator }) {
    const badges = operator.badges ?? operator.badge ?? [];
    const contact = operator.contact ?? {};
    const ratingLabel = operator.rating != null ? Number(operator.rating).toFixed(1) : null;

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-2xl">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                    backgroundSize: '40px 40px',
                }} />
            </div>

            <div className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/20 bg-white">
                            <img
                                src={operator.logo}
                                alt={operator.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = '/images/Enhanced_Bus_Images/Selam_Bus1.jpg'; }}
                            />
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                {operator.name}
                            </h1>
                            {operator.status === 'ACTIVE' && (
                                <span className="bg-green-400/20 text-green-100 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-green-300/30">
                                    Verified
                                </span>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            {ratingLabel && (
                                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    <Star className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                                    <span className="text-sm font-bold text-white">{ratingLabel} rating</span>
                                </div>
                            )}
                            {operator.reliabilityScore != null && (
                                <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    <TrendingUp className="w-4 h-4 text-white" />
                                    <span className="text-sm font-bold text-white">{operator.reliabilityScore}% reliability</span>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-4 mb-6">
                            {contact.phone && (
                                <div className="flex items-center gap-2 text-white/90">
                                    <Phone className="w-4 h-4" />
                                    <span className="text-sm font-medium">{contact.phone}</span>
                                </div>
                            )}
                            {contact.email && (
                                <div className="flex items-center gap-2 text-white/90">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm font-medium">{contact.email}</span>
                                </div>
                            )}
                            {contact.address && (
                                <div className="flex items-center gap-2 text-white/90">
                                    <MapPin className="w-4 h-4" />
                                    <span className="text-sm font-medium">{contact.address}</span>
                                </div>
                            )}
                        </div>

                        {badges.length > 0 && (
                            <div className="flex flex-wrap gap-3 mb-4">
                                {badges.map((badge, idx) => {
                                    const Icon = BADGE_ICONS[badge];
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
                        )}

                        {operator.established && (
                            <div className="flex items-center gap-2 text-white/90">
                                <Calendar className="w-4 h-4" />
                                <span className="text-sm font-medium">
                                    Serving since {operator.established} · {new Date().getFullYear() - operator.established} years of excellence
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
