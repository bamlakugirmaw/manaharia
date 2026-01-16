import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Phone, LayoutDashboard, Menu, X, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';
import { Logo } from '../ui/Logo';

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const navLinks = [
        { name: 'Routes', href: '/routes' },
        { name: 'Operators', href: '/operators' },
        { name: 'Destinations', href: '/destinations' },
        { name: 'Help', href: '/help' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'operator') return '/operator/dashboard';
        return '/traveller/dashboard';
    };

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Logo />
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {navLinks.map((link) => (
                            <NavLink
                                key={link.name}
                                to={link.href}
                                className={({ isActive }) =>
                                    cn(
                                        "text-sm font-medium transition-colors hover:text-primary",
                                        isActive ? "text-primary" : "text-gray-600"
                                    )
                                }
                            >
                                {link.name}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right Action Buttons */}
                    <div className="hidden md:flex items-center gap-6">
                        <Link to={getDashboardPath()} className="text-gray-600 hover:text-primary flex items-center gap-1.5 text-sm font-semibold transition-colors">
                            <LayoutDashboard size={18} />
                            Dashboard
                        </Link>
                        <div className="h-4 w-px bg-gray-200"></div>
                        <a href="tel:+251911234567" className="text-gray-600 hover:text-primary flex items-center gap-1.5 text-sm font-semibold transition-colors">
                            <Phone size={18} />
                            Support
                        </a>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 ml-2 border-l pl-6 border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                                        <User size={18} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-800 hidden lg:block">{user.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" onClick={handleLogout} className="text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all h-9 w-9">
                                    <LogOut size={20} />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-6 ml-2">
                                <Link to="/signup" className="text-sm font-bold text-gray-700 hover:text-primary transition-colors">
                                    Sign Up
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" className="bg-gradient-to-r from-[#FF8C37] to-[#F72585] border-0 hover:opacity-90 text-white font-bold h-11 px-8 rounded-xl shadow-lg shadow-orange-500/20 text-sm tracking-wide">
                                        Sign In
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-500 hover:text-gray-900 focus:outline-none"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 animate-in slide-in-from-top duration-200">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {isAuthenticated && (
                            <div className="px-3 py-4 border-b border-gray-50 flex items-center gap-3 mb-2">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                                </div>
                            </div>
                        )}
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="border-t border-gray-100 my-2 pt-2">
                            <Link to={getDashboardPath()} className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-primary" onClick={() => setIsMobileMenuOpen(false)}>
                                Dashboard
                            </Link>
                            {isAuthenticated ? (
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-3 py-2 text-base font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
                                >
                                    <LogOut size={18} /> Sign Out
                                </button>
                            ) : (
                                <div className="px-3 py-2">
                                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                                        <Button fullWidth variant="secondary">Sign In</Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
