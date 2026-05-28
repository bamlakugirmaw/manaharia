import { createContext, useContext, useState, useRef } from 'react';

const ComplaintsContext = createContext(null);

// Pre-seeded complaints matching bookings
const INITIAL_COMPLAINTS = [
    {
        id: 'CMP-001',
        tripId: 'MEN-2025-11-10-X9Y2',
        busName: 'Golden Star Coach',
        operatorName: 'Golden Bus',
        operatorId: 'OP-003',
        seatNumber: '7-B',
        ticketId: 'TKT-2025-X9Y2',
        route: 'Addis Ababa → Mekelle',
        travelDate: 'Nov 10, 2025',
        bookingDate: 'Nov 05, 2025',
        passengerName: 'Abebe Kebede',
        paymentStatus: 'Paid',
        status: 'Resolved',
        createdAt: 'Nov 10, 2025 · 02:15 PM',
        messages: [
            {
                id: 1,
                sender: 'user',
                senderName: 'Abebe Kebede',
                text: 'The bus departed 3 hours late with no announcement. Completely unacceptable.',
                time: '02:15 PM',
            },
            {
                id: 2,
                sender: 'operator',
                senderName: 'Golden Bus Support',
                text: 'We sincerely apologize for the delay caused by an emergency vehicle breakdown. A partial refund of ETB 300 has been processed to your account.',
                time: '04:00 PM',
            },
            {
                id: 3,
                sender: 'user',
                senderName: 'Abebe Kebede',
                text: 'Thank you for resolving this quickly.',
                time: '04:12 PM',
            },
        ],
    },
    {
        id: 'CMP-002',
        tripId: 'MEN-2025-12-15-A3B4',
        busName: 'Selam VIP Coach',
        operatorName: 'Selam Bus',
        operatorId: 'OP-001',
        seatNumber: '3-A',
        ticketId: 'TKT-2025-A3B4',
        route: 'Addis Ababa → Bahir Dar',
        travelDate: 'Dec 15, 2025',
        bookingDate: 'Dec 10, 2025',
        passengerName: 'Abebe Kebede',
        paymentStatus: 'Paid',
        status: 'Open',
        createdAt: 'Dec 12, 2025 · 10:30 AM',
        messages: [
            {
                id: 1,
                sender: 'user',
                senderName: 'Abebe Kebede',
                text: 'AC is not working properly on this VIP bus. Please resolve.',
                time: '10:30 AM',
            }
        ]
    }
];

export function ComplaintsProvider({ children }) {
    const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS);
    const nextId = useRef(3); // next CMP number after CMP-002

    /**
     * Creates a new complaint with the first message.
     * Returns the new complaint ID synchronously.
     */
    const addComplaint = (tripData, firstMessage) => {
        const id = `CMP-${String(nextId.current).padStart(3, '0')}`;
        nextId.current += 1;

        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const newComplaint = {
            id,
            tripId: tripData.tripId,
            busName: tripData.busName,
            operatorName: tripData.operatorName,
            operatorId: tripData.operatorId,
            seatNumber: tripData.seatNumber,
            ticketId: tripData.ticketId,
            route: tripData.route,
            travelDate: tripData.travelDate,
            bookingDate: tripData.bookingDate,
            passengerName: tripData.passengerName,
            paymentStatus: tripData.paymentStatus,
            status: 'Open',
            createdAt: `${dateStr} · ${timeStr}`,
            messages: [
                {
                    id: 1,
                    sender: 'user',
                    senderName: tripData.passengerName,
                    text: firstMessage,
                    time: timeStr,
                },
            ],
        };

        setComplaints(prev => [newComplaint, ...prev]);
        return id;
    };

    /**
     * Appends a message to an existing complaint.
     * sender: 'user' | 'operator'
     */
    const addMessage = (complaintId, text, sender) => {
        const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        setComplaints(prev =>
            prev.map(c => {
                if (c.id !== complaintId) return c;
                const senderName =
                    sender === 'user' ? c.passengerName : `${c.operatorName} Support`;
                return {
                    ...c,
                    messages: [
                        ...c.messages,
                        { id: c.messages.length + 1, sender, senderName, text, time: timeStr },
                    ],
                };
            })
        );
    };

    /** Changes the status of a complaint. */
    const updateStatus = (complaintId, status) => {
        setComplaints(prev =>
            prev.map(c => (c.id === complaintId ? { ...c, status } : c))
        );
    };

    return (
        <ComplaintsContext.Provider value={{ complaints, addComplaint, addMessage, updateStatus }}>
            {children}
        </ComplaintsContext.Provider>
    );
}

export function useComplaints() {
    const ctx = useContext(ComplaintsContext);
    if (!ctx) throw new Error('useComplaints must be used inside <ComplaintsProvider>');
    return ctx;
}
