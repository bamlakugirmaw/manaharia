import { Phone, Mail, MapPin, Shield, CreditCard, QrCode, Star, BadgeCheck, Route, Calendar } from 'lucide-react';
import heroBg from '../../assets/hero-bus-bg.png';

const BADGE_ICONS = {
    'Verified Operator': Shield,
    'Secure Payments': CreditCard,
    'QR Ticketing': QrCode,
};

function reliabilityLabel(score) {
    if (score == null || Number.isNaN(Number(score))) return null;
    const n = Number(score);
    if (n >= 85) return 'High';
    if (n >= 70) return 'Good';
    if (n >= 50) return 'Fair';
    return '—';
}

/**
 * Operator profile hero — same photo background treatment as /operators and /routes.
 */
export default function OperatorHeader({ operator }) {
    const badges = (operator.badges ?? operator.badge ?? []).length > 0
        ? (operator.badges ?? operator.badge)
        : ['Verified Operator', 'Secure Payments', 'QR Ticketing'];
    const contact = operator.contact ?? {};
    const ratingLabel = operator.rating != null ? Number(operator.rating).toFixed(1) : null;
    const routeCount = operator.routeDetails?.length ?? operator.routesServed?.length ?? 0;
    const tripCount = operator.scheduledTripCount ?? operator.upcomingTrips?.length ?? 0;
    const location = contact.address ?? operator.address ?? null;
    const isVerified = operator.status === 'ACTIVE' || operator.status === undefined;

    return (
        <div
            className="relative overflow-hidden rounded-3xl shadow-lg"
            style={{
                backgroundImage: `url(${heroBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 55%',
            }}
        >
            <div className="absolute inset-0 bg-white/30" aria-hidden />

            <div className="relative p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                    <div className="flex-shrink-0">
                        <div className="w-32 h-32 rounded-2xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white">
                            <img
                                src={operator.logo}
                                alt={operator.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.currentTarget.src = '/images/Enhanced_Bus_Images/Selam_Bus1.jpg'; }}
                            />
                        </div>
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-3 mb-3">
                            <h1 className="text-4xl md:text-5xl font-black text-dark tracking-tight">
                                {operator.name}
                            </h1>
                            {isVerified && (
                                <span className="inline-flex items-center gap-1 border-2 border-success text-success bg-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                                    <BadgeCheck className="w-3.5 h-3.5" strokeWidth={2.5} />
                                    Verified
                                </span>
                            )}
                        </div>

                        {ratingLabel && (
                            <div className="flex items-center gap-1.5 mb-4">
                                <span className="inline-flex items-center gap-1.5 bg-white/90 border border-gray-200/70 px-3 py-1.5 rounded-full shadow-sm">
                                    <Star className="w-4 h-4 text-accent fill-accent" />
                                    <span className="text-sm font-bold text-dark">{ratingLabel} Rating</span>
                                </span>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium text-gray-700 mb-4">
                            {location && (
                                <span className="inline-flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                                    {location}
                                </span>
                            )}
                            {routeCount > 0 && (
                                <span className="inline-flex items-center gap-2">
                                    <Route className="w-4 h-4 text-primary shrink-0" />
                                    {routeCount} Route{routeCount !== 1 ? 's' : ''}
                                </span>
                            )}
                            {tripCount > 0 && (
                                <span className="inline-flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                                    {tripCount} Scheduled Trip{tripCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>

                        {(contact.phone || contact.email) && (
                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-gray-600 mb-4">
                                {contact.phone && (
                                    <span className="inline-flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-primary shrink-0" />
                                        {contact.phone}
                                    </span>
                                )}
                                {contact.email && (
                                    <span className="inline-flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-primary shrink-0" />
                                        {contact.email}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="flex flex-wrap gap-3">
                            {badges.map((badge, idx) => {
                                const Icon = BADGE_ICONS[badge];
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-200/80 shadow-sm"
                                    >
                                        {Icon && <Icon className="w-4 h-4 text-primary" />}
                                        <span className="text-sm font-semibold text-dark">{badge}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export { reliabilityLabel };
