import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Mail, Phone, MessageCircle, Ticket, CreditCard, User, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

const FAQS = [
    {
        question: "How do I cancel my booking?",
        answer: "You can cancel your booking from the 'My Trips' section in your dashboard. Valid cancellations made 24 hours before departure are eligible for a refund."
    },
    {
        question: "Where can I find my ticket?",
        answer: "Your ticket is sent to your email immediately after booking. You can also view and download it from the 'Upcoming Trips' page in your account."
    },
    {
        question: "What payment methods do you accept?",
        answer: "We accept Telebirr, CBE Birr, Chapa, and major credit cards. All payments are secure and instant."
    },
    {
        question: "Can I change my seat after booking?",
        answer: "Seat changes are allowed up to 12 hours before departure, subject to availability. Please contact support for assistance."
    }
];

const TOPICS = [
    { icon: Ticket, title: "Booking & Ticketing", desc: "Issues with booking, downloading tickets, or seat selection." },
    { icon: CreditCard, title: "Payments & Refunds", desc: "Payment failures, refund status, and transaction concerns." },
    { icon: User, title: "Account & Profile", desc: "Login trouble, profile updates, and password resets." },
    { icon: Shield, title: "Safety & Privacy", desc: "Emergency contacts, trusted operators, and data protection." },
];

export default function SupportPage() {
    const [openIndex, setOpenIndex] = useState(null);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Search Section */}
            <div className="bg-gradient-to-br from-primary via-primary/90 to-secondary px-4 pt-20 pb-24 text-center rounded-b-[3rem] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-10"></div>
                <div className="relative max-w-2xl mx-auto space-y-6">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">How can we help you?</h1>
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for articles, questions, or topics..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl focus:ring-4 focus:ring-white/20 outline-none text-gray-800 placeholder:text-gray-400"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                {/* Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                    <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group border-none shadow-lg">
                        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Phone size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">Call Us</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Available 24/7 for urgent issues</p>
                        <span className="text-primary font-bold text-lg">+251 911 234 567</span>
                    </Card>
                    <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group border-none shadow-lg">
                        <div className="w-14 h-14 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <MessageCircle size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">Live Chat</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Chat with our support team</p>
                        <Button size="sm" className="rounded-full px-6">Start Chat</Button>
                    </Card>
                    <Card className="p-6 flex flex-col items-center text-center hover:shadow-lg transition-all cursor-pointer group border-none shadow-lg">
                        <div className="w-14 h-14 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Mail size={24} />
                        </div>
                        <h3 className="font-bold text-gray-900">Email Support</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-4">Get a response within 24 hours</p>
                        <span className="text-primary font-bold">support@menaharia.com</span>
                    </Card>
                </div>

                {/* Popular Topics */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse Topics</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {TOPICS.map((topic, idx) => (
                            <Card key={idx} className="p-6 border-gray-100 hover:border-primary/20 hover:shadow-md transition-all cursor-pointer group">
                                <topic.icon className="text-gray-400 group-hover:text-primary mb-4 transition-colors" size={32} />
                                <h3 className="font-bold text-gray-900 mb-2">{topic.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{topic.desc}</p>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {FAQS.map((faq, index) => (
                            <div key={index} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                <button
                                    className="w-full flex justify-between items-center p-6 text-left hover:bg-gray-50 transition-colors"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="font-bold text-gray-900">{faq.question}</span>
                                    {openIndex === index ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-gray-400" />}
                                </button>
                                {openIndex === index && (
                                    <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
