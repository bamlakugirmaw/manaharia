import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { CreditCard, Ticket, XCircle, Building2, UserCircle, MessageCircle, Phone, Mail, ChevronRight, Headphones } from 'lucide-react';

export default function Help() {
    const navigate = useNavigate();

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
            color: 'from-emerald-500 to-emerald-600'
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

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Hero Section – bg_image.png background, light theme */}
            <div 
                className="px-4 pt-20 pb-28 text-center rounded-b-[5rem] relative overflow-hidden mb-12"
                style={{ 
                    backgroundImage: `url(/images/background_image/bg_image.png)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center center',
                    backgroundColor: '#E8EEFF'
                }}
            >
                <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-200/50 mb-2">
                        <Headphones size={13} className="text-blue-600" />
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.15em]">Help Center</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">
                        How can we help you?
                    </h1>
                    <p className="text-sm md:text-base text-gray-500 font-medium max-w-xl mx-auto leading-relaxed">
                        Search for answers or browse categories below
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 max-w-6xl">
                {/* Categories Grid */}
                <div className="mb-14">
                    <h2 className="text-xl font-black text-dark mb-6">Browse by Category</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => {
                            const Icon = category.icon;
                            return (
                                <Card
                                    key={category.id}
                                    onClick={() => handleCategoryClick(category.id)}
                                    className="bg-white border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.015)] rounded-[2rem] p-5 hover:shadow-md hover:border-gray-200/50 transition-all duration-300 cursor-pointer group flex items-center justify-between gap-4"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform`}>
                                            <Icon className="w-5 h-5 text-white stroke-[2.5]" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <h3 className="text-sm font-extrabold text-gray-900 leading-tight group-hover:text-primary transition-colors truncate">{category.title}</h3>
                                            <p className="text-xs text-gray-400 font-medium mt-1 leading-normal">{category.description}</p>
                                        </div>
                                    </div>
                                    <div className="text-blue-500 shrink-0 group-hover:translate-x-1 transition-transform">
                                        <ChevronRight size={18} className="stroke-[2.5]" />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Support Banner Card */}
                <Card className="bg-[#F4F9FD]/60 border border-blue-50 shadow-[0_8px_30px_rgba(0,0,0,0.01)] rounded-[2.5rem] p-8 md:p-10 mb-10">
                    <h2 className="text-xl font-extrabold text-dark mb-8">Still need help?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {/* Contact Support */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-blue-500 shadow-sm">
                                <MessageCircle className="w-5 h-5 stroke-[2]" />
                            </div>
                            <div className="flex flex-col items-start">
                                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Contact Support</h3>
                                <p className="text-xs text-gray-400 font-medium mt-1 leading-normal">Get help from our support team</p>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/contact')}
                                    className="mt-3.5 h-9 px-4 rounded-xl border border-blue-500 hover:border-blue-600 text-blue-500 hover:text-blue-600 hover:bg-blue-50/50 font-extrabold text-[11px] transition-all shadow-none"
                                >
                                    Contact Us
                                </Button>
                            </div>
                        </div>

                        {/* Call Us */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center shrink-0 text-emerald-500 shadow-sm">
                                <Phone className="w-5 h-5 stroke-[2]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Call Us</h3>
                                <p className="text-xs font-extrabold text-gray-700 mt-2 leading-none">+251 911 234 567</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-none">Mon-Fri, 8am-6pm</p>
                            </div>
                        </div>

                        {/* Email Us */}
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center shrink-0 text-blue-500 shadow-sm">
                                <Mail className="w-5 h-5 stroke-[2]" />
                            </div>
                            <div className="flex flex-col">
                                <h3 className="text-sm font-extrabold text-gray-900 leading-tight">Email Us</h3>
                                <p className="text-xs font-extrabold text-gray-700 mt-2 leading-none">support@menaharia.et</p>
                                <p className="text-[10px] text-gray-400 font-medium mt-1.5 leading-none">24-48 hour response</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
