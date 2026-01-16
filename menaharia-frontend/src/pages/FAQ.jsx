import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

export default function FAQ() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
    const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
    const [expandedId, setExpandedId] = useState(null);

    const faqs = [
        {
            id: 1,
            category: 'booking',
            question: 'How do I book a ticket?',
            answer: 'To book a ticket: 1) Search for your route and date, 2) Select a trip from the results, 3) Choose your seats, 4) Enter passenger details, 5) Make payment via Telebirr, CBE Birr, or other methods, 6) Receive your QR e-ticket via email and SMS.'
        },
        {
            id: 2,
            category: 'booking',
            question: 'How do I pay with Telebirr?',
            answer: 'Select Telebirr as your payment method at checkout. Enter your Telebirr phone number, you will receive a payment prompt on your phone. Enter your PIN to complete the payment. You will receive instant confirmation once payment is successful.'
        },
        {
            id: 3,
            category: 'tickets',
            question: 'How do I get my QR ticket?',
            answer: 'After successful payment, your QR e-ticket will be sent to your email and phone number via SMS. You can also download it from your booking confirmation page or access it from "My Bookings" in your account dashboard.'
        },
        {
            id: 4,
            category: 'tickets',
            question: 'Can I use a screenshot of my QR code?',
            answer: 'Yes, you can use a screenshot of your QR code. However, we recommend keeping the original email or downloading the PDF ticket for best quality scanning at the terminal.'
        },
        {
            id: 5,
            category: 'cancellations',
            question: 'What if my bus is cancelled?',
            answer: 'If your bus is cancelled by the operator, you will receive immediate notification via SMS and email. You will be offered a full refund or the option to reschedule to another trip at no extra cost. Refunds are processed within 3-5 business days.'
        },
        {
            id: 6,
            category: 'cancellations',
            question: 'How do I cancel my booking?',
            answer: 'Go to "My Bookings" in your account, select the booking you want to cancel, and click "Cancel Booking". Cancellation fees apply based on timing: 24+ hours before departure (10% fee), 12-24 hours (25% fee), less than 12 hours (50% fee).'
        },
        {
            id: 7,
            category: 'cancellations',
            question: 'When will I receive my refund?',
            answer: 'Refunds are processed within 3-5 business days after cancellation approval. The refund will be sent to the original payment method used for booking.'
        },
        {
            id: 8,
            category: 'booking',
            question: 'Can I change my seat after booking?',
            answer: 'Yes, you can change your seat up to 6 hours before departure, subject to availability. Go to "My Bookings", select your trip, and click "Change Seat". No additional fee is charged for seat changes.'
        },
        {
            id: 9,
            category: 'operators',
            question: 'How do I know if an operator is reliable?',
            answer: 'All operators on Menaharia are verified and licensed. Check the operator rating (out of 5 stars), reliability score, and customer reviews on their profile page. Operators with "Verified" badges have passed our safety and quality checks.'
        },
        {
            id: 10,
            category: 'operators',
            question: 'What if I have a complaint about an operator?',
            answer: 'You can file a complaint through "My Bookings" by selecting the trip and clicking "Report Issue". Our support team will investigate and respond within 24-48 hours. Serious safety concerns are escalated immediately.'
        },
        {
            id: 11,
            category: 'account',
            question: 'I forgot my password, how do I reset it?',
            answer: 'Click "Forgot Password" on the login page. Enter your email or phone number, and you will receive a password reset link via email or SMS. Follow the link to create a new password.'
        },
        {
            id: 12,
            category: 'account',
            question: 'How do I update my contact information?',
            answer: 'Log in to your account, go to "Profile Settings", and update your email, phone number, or other details. Click "Save Changes" to update your information.'
        }
    ];

    const categories = [
        { id: 'all', name: 'All Questions' },
        { id: 'booking', name: 'Booking & Payments' },
        { id: 'tickets', name: 'Tickets & QR Codes' },
        { id: 'cancellations', name: 'Cancellations & Refunds' },
        { id: 'operators', name: 'Operators' },
        { id: 'account', name: 'Account & Login' }
    ];

    const filteredFaqs = faqs.filter(faq => {
        const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const toggleExpand = (id) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    className="mb-6 pl-0 text-gray-400 hover:text-primary transition-colors text-xs font-bold"
                    onClick={() => navigate('/help')}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Help Center
                </Button>

                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Frequently Asked Questions</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Find answers to common questions</p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search questions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-14 pl-14 pr-6 bg-white border border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                        />
                    </div>
                </div>

                {/* Category Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {categories.map(category => (
                        <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selectedCategory === category.id
                                    ? 'bg-primary text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                                }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFaqs.map(faq => (
                        <Card
                            key={faq.id}
                            className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-2xl overflow-hidden hover:shadow-[0_4px_24px_rgba(0,0,0,0.06)] transition-all"
                        >
                            <button
                                onClick={() => toggleExpand(faq.id)}
                                className="w-full p-6 text-left flex items-center justify-between gap-4"
                            >
                                <h3 className="font-bold text-gray-900 flex-1">{faq.question}</h3>
                                {expandedId === faq.id ? (
                                    <ChevronUp className="w-5 h-5 text-primary flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>
                            {expandedId === faq.id && (
                                <div className="px-6 pb-6">
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>

                {/* Empty State */}
                {filteredFaqs.length === 0 && (
                    <div className="text-center py-20">
                        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">No questions found</h3>
                        <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-6">Try adjusting your search or category filter</p>
                        <Button onClick={() => navigate('/contact')}>Contact Support</Button>
                    </div>
                )}

                {/* Contact CTA */}
                {filteredFaqs.length > 0 && (
                    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-2xl p-8 mt-8 text-center">
                        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Still have questions?</h3>
                        <p className="text-gray-500 mb-6">Our support team is here to help</p>
                        <Button onClick={() => navigate('/contact')}>Contact Support</Button>
                    </Card>
                )}
            </div>
        </div>
    );
}
