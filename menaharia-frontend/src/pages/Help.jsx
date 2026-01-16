import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Search, CreditCard, Ticket, XCircle, Building2, UserCircle, MessageCircle, Phone, Mail } from 'lucide-react';
import { useState } from 'react';

export default function Help() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            id: 'booking',
            title: 'Booking & Payments',
            description: 'Learn how to book tickets and make payments',
            icon: CreditCard,
            color: 'from-blue-500 to-blue-600'
        },
        {
            id: 'tickets',
            title: 'Tickets & QR Codes',
            description: 'Get help with your e-tickets and QR codes',
            icon: Ticket,
            color: 'from-green-500 to-green-600'
        },
        {
            id: 'cancellations',
            title: 'Cancellations & Refunds',
            description: 'Information about cancellations and refunds',
            icon: XCircle,
            color: 'from-red-500 to-red-600'
        },
        {
            id: 'operators',
            title: 'Operators',
            description: 'Questions about bus operators and services',
            icon: Building2,
            color: 'from-purple-500 to-purple-600'
        },
        {
            id: 'account',
            title: 'Account & Login',
            description: 'Manage your account and login issues',
            icon: UserCircle,
            color: 'from-orange-500 to-orange-600'
        }
    ];

    const handleCategoryClick = (categoryId) => {
        navigate(`/faq?category=${categoryId}`);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/faq?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">How can we help you?</h1>
                    <p className="text-gray-500 text-lg mb-8">Search for answers or browse categories below</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for help..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-14 pr-6 bg-white border border-gray-200 rounded-2xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-base"
                            />
                        </div>
                    </form>
                </div>

                {/* Categories Grid */}
                <div className="mb-12">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Browse by Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-6 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 cursor-pointer group"
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                    <h3 className="text-lg font-extrabold text-gray-900 mb-2">{category.title}</h3>
                                    <p className="text-sm text-gray-500">{category.description}</p>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-8">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Still need help?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MessageCircle className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Contact Support</h3>
                                <p className="text-sm text-gray-500 mb-3">Get help from our support team</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => navigate('/contact')}
                                    className="text-primary border-primary hover:bg-primary/10"
                                >
                                    Contact Us
                                </Button>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Phone className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Call Us</h3>
                                <p className="text-sm text-gray-500 mb-1">+251 911 234 567</p>
                                <p className="text-xs text-gray-400">Mon-Fri, 8am-6pm</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Email Us</h3>
                                <p className="text-sm text-gray-500 mb-1">support@menaharia.et</p>
                                <p className="text-xs text-gray-400">24-48 hour response</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
