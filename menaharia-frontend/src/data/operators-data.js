// Mock data for Ethiopian bus operators

export const OPERATORS = [
    {
        id: 'selam-bus',
        name: 'Selam Bus',
        logo: '/images/Enhanced_Bus_Images/Selam_Bus1.jpg',
        contact: {
            phone: '+251 11 234 5678',
            email: 'info@selambus.et',
            address: 'Meskel Square, Addis Ababa'
        },
        established: 1998,
        rating: 4.8,
        reliabilityScore: 96,
        routesServed: ['Addis Ababa → Bahir Dar', 'Addis Ababa → Gondar', 'Addis Ababa → Mekelle'],
        startingPrice: 450,
        badges: ['Verified Operator', 'Secure Payments', 'QR Ticketing'],
        about: 'Selam Bus is one of Ethiopia\'s most trusted transport operators, serving passengers since 1998. We pride ourselves on punctuality, comfort, and safety.',
        safetyInfo: 'All our buses undergo regular maintenance checks. Our drivers are professionally trained and certified.',
        upcomingTrips: [
            { id: 'trip-1', route: 'Addis Ababa → Bahir Dar', departure: '06:00', busType: 'VIP', seatsLeft: 12, price: 800 },
            { id: 'trip-6', route: 'Addis Ababa → Jimma', departure: '07:00', busType: 'Standard', seatsLeft: 20, price: 550 },
            { id: 'trip-8', route: 'Addis Ababa → Hawassa', departure: '06:30', busType: 'Standard', seatsLeft: 18, price: 450 },
            { id: 'trip-10', route: 'Bahir Dar → Addis Ababa', departure: '06:00', busType: 'VIP', seatsLeft: 20, price: 800 }
        ]
    },
    {
        id: 'sky-bus',
        name: 'Sky Bus',
        logo: '/images/Enhanced_Bus_Images/Sky_Bus.jpg',
        contact: {
            phone: '+251 11 345 6789',
            email: 'contact@skybus.et',
            address: 'Bole Road, Addis Ababa'
        },
        established: 2005,
        rating: 4.6,
        reliabilityScore: 94,
        routesServed: ['Addis Ababa → Dire Dawa', 'Addis Ababa → Hawassa', 'Addis Ababa → Jimma'],
        startingPrice: 390,
        badges: ['Verified Operator', 'Secure Payments', 'QR Ticketing'],
        about: 'Sky Bus offers premium travel experiences with modern fleet and exceptional customer service. Operating since 2005, we connect major cities across Ethiopia.',
        safetyInfo: 'GPS-tracked buses with emergency response systems. All drivers undergo annual safety training.',
        upcomingTrips: [
            { id: 'trip-2', route: 'Addis Ababa → Bahir Dar', departure: '09:30', busType: 'Standard', seatsLeft: 8, price: 650 },
            { id: 'trip-9', route: 'Addis Ababa → Hawassa', departure: '08:00', busType: 'VIP', seatsLeft: 7, price: 500 }
        ]
    },
    {
        id: 'walia-bus',
        name: 'Walia Bus',
        logo: '/images/Enhanced_Bus_Images/Walia_Bus.jpg',
        contact: {
            phone: '+251 11 456 7890',
            email: 'service@waliabus.et',
            address: 'Piazza, Addis Ababa'
        },
        established: 2010,
        rating: 4.7,
        reliabilityScore: 95,
        routesServed: ['Addis Ababa → Adama', 'Addis Ababa → Dessie', 'Bahir Dar → Gondar'],
        startingPrice: 320,
        badges: ['Verified Operator', 'Secure Payments'],
        about: 'Walia Bus specializes in regional routes with frequent departures. We focus on affordability without compromising on safety and comfort.',
        safetyInfo: 'Modern fleet with regular inspections. Experienced drivers with clean safety records.',
        upcomingTrips: [
            { id: 'trip-5', route: 'Addis Ababa → Mekelle', departure: '06:30', busType: 'Standard', seatsLeft: 15, price: 1100 }
        ]
    },
    {
        id: 'zemen-bus',
        name: 'Zemen Bus',
        logo: '/images/Enhanced_Bus_Images/Zemen_Bus.jpg',
        contact: {
            phone: '+251 11 567 8901',
            email: 'info@zemenbus.et',
            address: 'Merkato, Addis Ababa'
        },
        established: 2003,
        rating: 4.5,
        reliabilityScore: 92,
        routesServed: ['Addis Ababa → Arba Minch', 'Addis Ababa → Shashemene', 'Addis Ababa → Sodo'],
        startingPrice: 480,
        badges: ['Verified Operator', 'QR Ticketing'],
        about: 'Zemen Bus has been serving southern routes for over 20 years. Known for reliability and comfortable journeys.',
        safetyInfo: 'All buses equipped with seat belts and first aid kits. Regular driver training programs.',
        upcomingTrips: [
            { id: 'trip-3', route: 'Addis Ababa → Bahir Dar', departure: '10:00', busType: 'Luxury', seatsLeft: 2, price: 900 },
            { id: 'trip-7', route: 'Addis Ababa → Jimma', departure: '08:30', busType: 'VIP', seatsLeft: 10, price: 600 }
        ]
    },
    {
        id: 'sheger-bus',
        name: 'Sheger Bus',
        logo: '/images/Enhanced_Bus_Images/Selam_Bus2.jpg',
        contact: {
            phone: '+251 11 678 9012',
            email: 'contact@shegerbus.et',
            address: '4 Kilo, Addis Ababa'
        },
        established: 2012,
        rating: 4.4,
        reliabilityScore: 90,
        routesServed: ['Addis Ababa → Debre Birhan', 'Addis Ababa → Debre Markos', 'Addis Ababa → Nekemte'],
        startingPrice: 350,
        badges: ['Verified Operator', 'Secure Payments'],
        about: 'Sheger Bus offers affordable travel options with a focus on customer satisfaction. Modern fleet with competitive pricing.',
        safetyInfo: 'Comprehensive insurance coverage. Regular vehicle maintenance and safety inspections.',
        upcomingTrips: [
            { id: 'trip-4', route: 'Addis Ababa → Mekelle', departure: '05:00', busType: 'VIP', seatsLeft: 5, price: 1200 }
        ]
    },
    {
        id: 'abay-bus',
        name: 'Abay Bus',
        logo: '/images/Enhanced_Bus_Images/Abay_Bus.jpg',
        contact: {
            phone: '+251 11 789 0123',
            email: 'service@abaybus.et',
            address: 'Arat Kilo, Addis Ababa'
        },
        established: 2000,
        rating: 4.6,
        reliabilityScore: 93,
        routesServed: ['Addis Ababa → Harar', 'Addis Ababa → Jijiga', 'Dire Dawa → Harar'],
        startingPrice: 520,
        badges: ['Verified Operator', 'Secure Payments', 'QR Ticketing'],
        about: 'Abay Bus specializes in eastern routes with a reputation for punctuality and comfort. Over 20 years of trusted service.',
        safetyInfo: 'State-of-the-art safety features. Drivers with extensive route experience.',
        upcomingTrips: [
            // No matching trips in current mock data
        ]
    },
    {
        id: 'golden-bus',
        name: 'Golden Bus',
        logo: '/images/Enhanced_Bus_Images/Golden_Bus.jpg',
        contact: {
            phone: '+251 11 890 1234',
            email: 'info@goldenbus.et',
            address: 'Mexico Square, Addis Ababa'
        },
        established: 2015,
        rating: 4.7,
        reliabilityScore: 94,
        routesServed: ['Addis Ababa → Axum', 'Addis Ababa → Lalibela', 'Mekelle → Axum'],
        startingPrice: 680,
        badges: ['Verified Operator', 'QR Ticketing'],
        about: 'Golden Bus focuses on northern heritage routes, connecting travelers to Ethiopia\'s historic sites with premium service.',
        safetyInfo: 'Premium safety standards. Well-maintained luxury fleet with modern amenities.',
        upcomingTrips: [
            // No matching trips in current mock data
        ]
    },
    {
        id: 'ethio-bus',
        name: 'Ethio Bus',
        logo: '/images/Enhanced_Bus_Images/Ethio_Bus.jpg',
        contact: {
            phone: '+251 11 900 1234',
            email: 'contact@ethiobus.et',
            address: 'Bole, Addis Ababa'
        },
        established: 2001,
        rating: 4.8,
        reliabilityScore: 97,
        routesServed: ['Addis Ababa → Adama', 'Addis Ababa → Awash', 'Addis Ababa → Nazret'],
        startingPrice: 280,
        badges: ['Verified Operator', 'Secure Payments', 'QR Ticketing'],
        about: 'Ethio Bus is a leading transport provider known for modern fleet and exceptional service quality. We operate throughout Ethiopia with a focus on passenger comfort and safety.',
        safetyInfo: 'Modern buses with advanced safety features. GPS tracking and 24/7 customer support.',
        upcomingTrips: [
            // No matching trips in current mock data
        ]
    }
];

// Helper function to get operator by ID
export const getOperatorById = (id) => {
    return OPERATORS.find(op => op.id === id);
};

// Helper function to get all operators
export const getAllOperators = () => {
    return OPERATORS;
};
