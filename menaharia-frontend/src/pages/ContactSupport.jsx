import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Phone, MessageCircle, ArrowLeft, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactSupport() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        category: 'general',
        message: ''
    });
    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In a real app, this would send to an API
        console.log('Form submitted:', formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({ name: '', email: '', category: 'general', message: '' });
        }, 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-5xl">
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
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Contact Support</h1>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">We're here to help you</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Contact Methods */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Email Support</h3>
                                    <p className="text-sm text-gray-500 mb-2">support@menaharia.et</p>
                                    <p className="text-xs text-gray-400">Response in 24-48 hours</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Phone className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">Phone Support</h3>
                                    <p className="text-sm text-gray-500 mb-2">+251 911 234 567</p>
                                    <p className="text-xs text-gray-400">Mon-Fri, 8am-6pm EAT</p>
                                </div>
                            </div>
                        </Card>

                        <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MessageCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-1">WhatsApp</h3>
                                    <p className="text-sm text-gray-500 mb-2">+251 911 234 567</p>
                                    <p className="text-xs text-gray-400">Quick responses</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="bg-white border-none shadow-[0_2px_20px_rgba(0,0,0,0.04)] rounded-3xl p-8">
                            <h2 className="text-xl font-extrabold text-gray-900 mb-6">Send us a message</h2>

                            {submitted ? (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Send className="w-8 h-8 text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-extrabold text-gray-900 mb-2">Message Sent!</h3>
                                    <p className="text-gray-500">We'll get back to you within 24-48 hours.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                        <Input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Your full name"
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                        <Input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                            placeholder="your.email@example.com"
                                            className="h-12"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Issue Category</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="w-full h-12 px-4 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        >
                                            <option value="general">General Inquiry</option>
                                            <option value="booking">Booking Issue</option>
                                            <option value="payment">Payment Problem</option>
                                            <option value="cancellation">Cancellation/Refund</option>
                                            <option value="technical">Technical Issue</option>
                                            <option value="complaint">Complaint</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows={6}
                                            placeholder="Please describe your issue in detail..."
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        className="h-12 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl"
                                    >
                                        <Send className="w-5 h-5 mr-2" />
                                        Send Message
                                    </Button>
                                </form>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
