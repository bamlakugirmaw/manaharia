import { tripOrigin, tripDest, tripSeatsLeft } from './tripHelpers';

const DEFAULT_LOGO = '/images/Enhanced_Bus_Images/Selam_Bus1.jpg';

const DEFAULT_BADGES = ['Verified Operator', 'Secure Payments', 'QR Ticketing'];

/** Operator id from a trip object. */
export const tripOperatorId = (t) =>
    t?.bus?.operator?.id ?? t?.bus?.operatorId ?? t?.operator?.id ?? t?.operatorId ?? '';

/** Strip ISO datetime to HH:MM for display. */
export function formatTripTime(value) {
    if (!value) return '—';
    const part = String(value).includes('T') ? String(value).split('T')[1] : String(value);
    const [h, m] = part.split(':');
    return h && m ? `${h.padStart(2, '0')}:${m}` : '—';
}

/** Format trip date for display. */
export function formatTripDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function routeKey(origin, dest) {
    return `${origin}|${dest}`;
}

function routeLabel(origin, dest) {
    if (!origin || !dest) return '';
    return `${origin} → ${dest}`;
}

/**
 * Build a display trip row from a backend trip.
 */
export function normaliseTripForOperator(trip) {
    const from = tripOrigin(trip);
    const to = tripDest(trip);
    return {
        id: trip.id,
        route: trip.routeName ?? routeLabel(from, to),
        origin: from,
        destination: to,
        departure: formatTripTime(trip.departureTime),
        departureTime: trip.departureTime,
        arrival: formatTripTime(trip.arrivalTime),
        date: trip.date,
        dateLabel: formatTripDate(trip.date),
        seatsLeft: tripSeatsLeft(trip),
        price: trip.price ?? 0,
        amenities: trip.amenities ?? [],
        busType: trip.bus?.make ?? trip.busName ?? 'Standard',
        status: trip.status,
    };
}

/**
 * Merge API operator record with trip-derived stats.
 */
export function mergeOperatorRecord(apiRecord, tripStats) {
    const raw = apiRecord?.data ?? apiRecord ?? {};
    const base = normaliseOperatorForUI(raw);
    if (!tripStats) return base;

    return {
        ...base,
        ...tripStats,
        // Prefer API text fields; keep trip-computed numbers when API null
        rating: raw.rating ?? tripStats.rating ?? null,
        reliabilityScore: raw.reliabilityScore ?? tripStats.reliabilityScore ?? null,
        startingPrice: tripStats.startingPrice ?? base.startingPrice,
        routesServed: tripStats.routesServed?.length ? tripStats.routesServed : base.routesServed,
        routeDetails: tripStats.routeDetails?.length ? tripStats.routeDetails : base.routeDetails,
        upcomingTrips: tripStats.upcomingTrips ?? [],
        scheduledTripCount: tripStats.scheduledTripCount ?? 0,
    };
}

/**
 * Normalise backend / trip operator object for UI components.
 */
export function normaliseOperatorForUI(op = {}, tripExtras = {}) {
    const name = op.name ?? op.companyName ?? 'Operator';
    const badges = Array.isArray(op.badge) && op.badge.length > 0
        ? op.badge
        : (Array.isArray(op.badges) && op.badges.length > 0 ? op.badges : DEFAULT_BADGES);

    return {
        id: op.id,
        name,
        companyName: op.companyName ?? name,
        logo: op.logo || DEFAULT_LOGO,
        rating: op.rating ?? null,
        reliabilityScore: op.reliabilityScore ?? null,
        established: op.established ?? null,
        status: op.status ?? 'ACTIVE',
        badges,
        about: op.about ?? `${name} is a verified Menaharia transport partner connecting cities across Ethiopia with safe, reliable bus service.`,
        safetyInfo: op.safetyInfo ?? 'All buses are registered operators on the Menaharia platform. Drivers and vehicles must meet platform safety standards.',
        contact: {
            phone: op.contact?.phone ?? op.companyPhone ?? op.phone ?? '',
            email: op.contact?.email ?? op.companyEmail ?? '',
            address: op.contact?.address ?? op.address ?? '',
        },
        companyPhone: op.companyPhone ?? op.phone ?? '',
        companyEmail: op.companyEmail ?? '',
        address: op.address ?? '',
        responsibleName: op.responsibleName ?? '',
        routesServed: tripExtras.routesServed ?? [],
        routeDetails: tripExtras.routeDetails ?? [],
        startingPrice: tripExtras.startingPrice ?? null,
        upcomingTrips: tripExtras.upcomingTrips ?? [],
        scheduledTripCount: tripExtras.scheduledTripCount ?? 0,
    };
}

/**
 * Aggregate trip-derived stats for one operator id.
 */
export function buildOperatorTripStats(trips, operatorId) {
    const operatorTrips = trips.filter((t) => tripOperatorId(t) === operatorId);
    if (operatorTrips.length === 0) return null;

    const routesMap = new Map();
    let minPrice = Infinity;
    let rawOperator = null;

    for (const trip of operatorTrips) {
        const price = trip.price ?? Infinity;
        if (price < minPrice) minPrice = price;

        const from = tripOrigin(trip);
        const to = tripDest(trip);
        const key = routeKey(from, to);
        if (from && to && !routesMap.has(key)) {
            routesMap.set(key, {
                origin: from,
                destination: to,
                label: routeLabel(from, to),
                distance: trip.route?.distance ?? null,
                code: trip.route?.code ?? null,
            });
        }

        const embedded = trip.bus?.operator;
        if (embedded?.id === operatorId) {
            rawOperator = { ...rawOperator, ...embedded };
        }
    }

    const routeDetails = [...routesMap.values()].sort((a, b) => a.label.localeCompare(b.label));
    const upcomingTrips = operatorTrips
        .map(normaliseTripForOperator)
        .sort((a, b) => {
            const da = a.date ?? '';
            const db = b.date ?? '';
            if (da !== db) return da.localeCompare(db);
            return (a.departureTime ?? '').localeCompare(b.departureTime ?? '');
        });

    return {
        rawOperator,
        routesServed: routeDetails.map((r) => r.label),
        routeDetails,
        startingPrice: minPrice === Infinity ? null : Math.round(minPrice),
        upcomingTrips,
        scheduledTripCount: operatorTrips.length,
    };
}

/**
 * Build operator list from scheduled trips (public — no /operators auth needed).
 */
export function aggregateOperatorsFromTrips(trips) {
    const ids = new Set();
    for (const trip of trips) {
        const id = tripOperatorId(trip);
        if (id) ids.add(id);
    }

    const results = [];
    for (const id of ids) {
        const stats = buildOperatorTripStats(trips, id);
        if (!stats) continue;
        const raw = stats.rawOperator ?? { id };
        results.push(normaliseOperatorForUI(
            { ...raw, id },
            {
                routesServed: stats.routesServed,
                routeDetails: stats.routeDetails,
                startingPrice: stats.startingPrice,
                upcomingTrips: stats.upcomingTrips,
                scheduledTripCount: stats.scheduledTripCount,
            },
        ));
    }

    return results.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Merge authenticated API operator list with trip-derived stats.
 */
export function mergeOperatorLists(apiOperators, trips) {
    const tripMap = new Map();
    for (const op of aggregateOperatorsFromTrips(trips)) {
        tripMap.set(op.id, op);
    }

    const merged = [];
    const seen = new Set();

    for (const raw of apiOperators) {
        const id = raw.id ?? raw._id;
        if (!id) continue;
        seen.add(id);
        const tripStats = tripMap.get(id);
        merged.push(mergeOperatorRecord(raw, tripStats));
    }

    for (const [id, tripOp] of tripMap) {
        if (!seen.has(id)) merged.push(tripOp);
    }

    return merged.sort((a, b) => a.name.localeCompare(b.name));
}
