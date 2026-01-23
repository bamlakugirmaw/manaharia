import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export default function Footer() {
    return (
        <footer className="bg-[#086a94] text-white pt-12 pb-6">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-8">
                    {/* Brand Column */}
                    <div className="space-y-6">
                        <Logo light />
                        <p className="text-white/80 text-[13px] font-medium leading-relaxed max-w-[280px]">
                            Your trusted partner for comfortable and reliable long-distance bus travel across East Africa.
                        </p>
                        <div className="flex space-x-4 pt-4">
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-white/90">
                                <Facebook size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-white/90">
                                <Twitter size={20} />
                            </a>
                            <a href="#" className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition-all text-white/90">
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-black text-lg mb-8 tracking-tight">Quick Links</h3>
                        <ul className="space-y-4 text-[14px] font-bold text-white/80">
                            <li><Link to="/routes" className="hover:text-white transition-colors">Popular Routes</Link></li>
                            <li><Link to="/operators" className="hover:text-white transition-colors">Our Operators</Link></li>
                            <li><Link to="/destinations" className="hover:text-white transition-colors">Destinations</Link></li>
                            <li><Link to="/track" className="hover:text-white transition-colors">Track My Bus</Link></li>
                            <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="font-black text-lg mb-8 tracking-tight">Support</h3>
                        <ul className="space-y-4 text-[14px] font-bold text-white/80">
                            <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                            <li><Link to="/policies/cancellation" className="hover:text-white transition-colors">Cancellation Policy</Link></li>
                            <li><Link to="/policies/refund" className="hover:text-white transition-colors">Refund Policy</Link></li>
                            <li><Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="font-black text-lg mb-8 tracking-tight">Contact Us</h3>
                        <ul className="space-y-5 text-[14px] font-bold text-white/80">
                            <li className="flex items-start gap-4">
                                <MapPin size={22} className="text-orange-400 shrink-0" />
                                <span className="leading-tight">Bole Road, Addis Ababa<br />Ethiopia</span>
                            </li>
                            <li className="flex items-center gap-4">
                                <Phone size={22} className="text-orange-400 shrink-0" />
                                <a href="tel:+251911234567" className="hover:text-white">+251 91 123 4567</a>
                            </li>
                            <li className="flex items-center gap-4">
                                <Mail size={22} className="text-cyan-400 shrink-0" />
                                <a href="mailto:info@menaharia.com" className="hover:text-white">info@menaharia.com</a>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-6 text-[13px] font-bold text-white/60 tracking-tight">
                    <p>&copy; {new Date().getFullYear()} Menaharia. All rights reserved. | Designed with excellence for travelers.</p>
                </div>
            </div>
        </footer>
    );
}
