export const LOCATIONS = [
    "Addis Ababa",
    "Bahir Dar",
    "Gondar",
    "Mekelle",
    "Dire Dawa",
    "Hawassa",
    "Harar",
    "Jimma",
    "Adama"
];

export const DESTINATIONS = [
    {
        id: "dest-1",
        name: "Addis Ababa",
        description: "The vibrant capital city of Ethiopia, known for its rich history, diverse culture, and as the political hub of Africa.",
        image: "/images/destinations/addis_ababa.jpg",
        highlights: ["National Museum", "Holy Trinity Cathedral", "Merkato Market"]
    },
    {
        id: "dest-2",
        name: "Bahir Dar",
        description: "A beautiful lakeside city on Lake Tana, home to ancient island monasteries and the stunning Blue Nile Falls.",
        image: "/images/destinations/bahir_dar.jpg",
        highlights: ["Lake Tana", "Blue Nile Falls", "Island Monasteries"]
    },
    {
        id: "dest-3",
        name: "Gondar",
        description: "The former imperial capital, famous for its medieval castles and the beautiful Debre Berhan Selassie Church.",
        image: "/images/destinations/gondar.jpg",
        highlights: ["Royal Enclosure", "Fasilides Bath", "Debre Berhan Selassie"]
    },
    {
        id: "dest-4",
        name: "Jimma",
        description: "A major coffee-producing region surrounded by lush green landscapes and traditional coffee ceremonies.",
        image: "/images/destinations/jimma.jpg", // Updated with real Jimma image
        highlights: ["Coffee Plantations", "Jimma Museum", "Aba Jifar Palace"]
    },
    {
        id: "dest-5",
        name: "Hawassa",
        description: "A resort city on the shores of Lake Hawassa, known for its fish market and beautiful lakeside promenade.",
        image: "/images/destinations/hawassa.jpg",
        highlights: ["Lake Hawassa", "Fish Market", "Amora Gedel Park"]
    },
    {
        id: "dest-6",
        name: "Mekelle",
        description: "The capital of Tigray region, gateway to the ancient rock-hewn churches of Tigray and historical sites.",
        image: "/images/destinations/mekelle.jpg",
        highlights: ["Martyrs Memorial", "Emperor Yohannes IV Palace", "Tigray Churches"]
    },
];

export const OPERATORS = [
    { id: "op-1", name: "Selam Bus", rating: 4.8, image: "/images/selam_bus.jpg" },
    { id: "op-2", name: "Sky Bus", rating: 4.7, image: "/images/sky_bus.jpg" },
    { id: "op-3", name: "Abay Bus", rating: 4.5, image: "/images/abay_bus.jpg" },
    { id: "op-4", name: "Golden Bus", rating: 4.6, image: "/images/sky_bus.jpg" }, // Fallback to sky bus style
    { id: "op-5", name: "Ethio Bus", rating: 4.3, image: "/images/ethio_bus.jpg" },
];

export const TRIPS = [
    // Addis Ababa → Bahir Dar (Multiple operators)
    {
        id: "trip-1",
        operatorId: "op-1",
        from: "Addis Ababa",
        to: "Bahir Dar",
        date: "2025-12-15",
        departureTime: "06:00",
        arrivalTime: "14:30",
        price: 800,
        seatsAvailable: 12,
        totalSeats: 45,
        busType: "VIP",
        amenities: ["WiFi", "AC", "Snacks"],
        distance: 510,
    },
    {
        id: "trip-2",
        operatorId: "op-2",
        from: "Addis Ababa",
        to: "Bahir Dar",
        date: "2025-12-15",
        departureTime: "09:30",
        arrivalTime: "18:00",
        price: 650,
        seatsAvailable: 8,
        totalSeats: 45,
        busType: "Standard",
        amenities: ["AC"],
        distance: 510,
    },
    {
        id: "trip-3",
        operatorId: "op-4",
        from: "Addis Ababa",
        to: "Bahir Dar",
        date: "2025-12-15",
        departureTime: "10:00",
        arrivalTime: "18:30",
        price: 900,
        seatsAvailable: 2,
        totalSeats: 45,
        busType: "Luxury",
        amenities: ["WiFi", "AC", "Lunch", "Entertainment"],
        distance: 510,
    },
    // Addis Ababa → Mekelle
    {
        id: "trip-4",
        operatorId: "op-2",
        from: "Addis Ababa",
        to: "Mekelle",
        date: "2025-12-15",
        departureTime: "05:00",
        arrivalTime: "17:00",
        price: 1200,
        seatsAvailable: 5,
        totalSeats: 45,
        busType: "VIP",
        amenities: ["WiFi", "AC", "Lunch"],
        distance: 780,
    },
    {
        id: "trip-5",
        operatorId: "op-3",
        from: "Addis Ababa",
        to: "Mekelle",
        date: "2025-12-15",
        departureTime: "06:30",
        arrivalTime: "18:30",
        price: 1100,
        seatsAvailable: 15,
        totalSeats: 45,
        busType: "Standard",
        amenities: ["AC"],
        distance: 780,
    },
    // Addis Ababa → Jimma
    {
        id: "trip-6",
        operatorId: "op-1",
        from: "Addis Ababa",
        to: "Jimma",
        date: "2025-12-15",
        departureTime: "07:00",
        arrivalTime: "13:00",
        price: 550,
        seatsAvailable: 20,
        totalSeats: 45,
        busType: "Standard",
        amenities: ["AC"],
        distance: 346,
    },
    {
        id: "trip-7",
        operatorId: "op-5",
        from: "Addis Ababa",
        to: "Jimma",
        date: "2025-12-15",
        departureTime: "08:30",
        arrivalTime: "14:30",
        price: 600,
        seatsAvailable: 10,
        totalSeats: 45,
        busType: "VIP",
        amenities: ["WiFi", "AC", "Snacks"],
        distance: 346,
    },
    // Addis Ababa → Hawassa
    {
        id: "trip-8",
        operatorId: "op-1",
        from: "Addis Ababa",
        to: "Hawassa",
        date: "2025-12-15",
        departureTime: "06:30",
        arrivalTime: "10:30",
        price: 450,
        seatsAvailable: 18,
        totalSeats: 45,
        busType: "Standard",
        amenities: ["AC"],
        distance: 275,
    },
    {
        id: "trip-9",
        operatorId: "op-2",
        from: "Addis Ababa",
        to: "Hawassa",
        date: "2025-12-15",
        departureTime: "08:00",
        arrivalTime: "12:00",
        price: 500,
        seatsAvailable: 7,
        totalSeats: 45,
        busType: "VIP",
        amenities: ["WiFi", "AC"],
        distance: 275,
    },
    // Bahir Dar → Addis Ababa (Return route)
    {
        id: "trip-10",
        operatorId: "op-1",
        from: "Bahir Dar",
        to: "Addis Ababa",
        date: "2025-12-16",
        departureTime: "06:00",
        arrivalTime: "14:30",
        price: 800,
        seatsAvailable: 20,
        totalSeats: 45,
        busType: "VIP",
        amenities: ["WiFi", "AC", "Snacks"],
        distance: 510,
    },
];

export const MOCK_USER = {
    id: "u-1",
    name: "Abebe Kebede",
    email: "abebe@example.com",
    role: "traveller", // 'traveller' | 'operator' | 'admin'
};
