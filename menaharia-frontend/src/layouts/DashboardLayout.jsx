import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from '../components/layout/Navbar';
import { Logo } from '../components/ui/Logo';
import { LayoutDashboard, Ticket, User, LogOut, Settings, History, CreditCard, Bus, Calendar as CalendarIcon, Map, Shield, Users, Activity, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

// Sidebar Items for Traveller
const TRAVELLER_NAV = [
    { name: 'My Bookings', href: '/traveller/bookings', icon: Ticket },
    { name: 'Complaints', href: '/traveller/complaints', icon: MessageSquare },
    { name: 'Profile Settings', href: '/traveller/profile', icon: User },
];

// Sidebar Items for Operator
const OPERATOR_NAV = [
    { name: 'Overview', href: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'Bus Management', href: '/operator/fleet', icon: Bus },
    { name: 'Trip Scheduling', href: '/operator/schedules', icon: CalendarIcon },
    { name: 'Bookings', href: '/operator/bookings', icon: Ticket },
    { name: 'Revenue Reports', href: '/operator/reports', icon: CreditCard },
    { name: 'Disputes', href: '/operator/disputes', icon: Shield },
    { name: 'Payout History', href: '/operator/payouts', icon: History },
    { name: 'Operator Profile', href: '/operator/settings', icon: User },
];

// Sidebar Items for Admin
const ADMIN_NAV = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Operators', href: '/admin/operators', icon: Bus },
    { name: 'Manage Users', href: '/admin/users', icon: Users },
    { name: 'All Trips', href: '/admin/trips', icon: Map },
    { name: 'All Bookings', href: '/admin/bookings', icon: Ticket },
    { name: 'Payment Logs', href: '/admin/payments', icon: CreditCard },
    { name: 'System Logs', href: '/admin/logs', icon: Activity },
];

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    // Determine Nav Items based on path
    const isOperator = location.pathname.startsWith('/operator');
    const isAdmin = location.pathname.startsWith('/admin');

    let navItems = TRAVELLER_NAV;
    let user = { name: "Abebe Kebede", email: "abebe@example.com", initials: "AK" };
    let roleLabel = "";

    if (isOperator) {
        navItems = OPERATOR_NAV;
        user = { name: "Selam Bus Transport", email: "Operator Dashboard", initials: "SB", role: "Operator" };
    } else if (isAdmin) {
        navItems = ADMIN_NAV;
        user = { name: "System Admin", email: "admin@menaharia.com", initials: "SA", role: "Admin" };
    }

    return (
        <div className="flex flex-col min-h-screen font-sans">
            <Navbar />
            <div className="flex flex-1 bg-[#F8FAFC]">
                {/* Sidebar */}
                <aside className="w-72 bg-white border-r border-gray-100 hidden md:flex flex-col h-[calc(100vh-64px)] sticky top-16">
                    <div className="p-6 overflow-y-auto">
                        {/* Role Specific Profile Card */}
                        <div className="bg-white rounded-3xl border border-gray-100 p-5 flex flex-col items-center text-center shadow-[0_8px_30px_rgba(0,0,0,0.03)] mb-6">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-transform hover:scale-105 shadow-inner",
                                isAdmin ? "bg-blue-500 text-white" : isOperator ? "bg-sky-500 text-white" : "bg-primary text-white"
                            )}>
                                {isAdmin ? <Shield size={28} /> : <Bus size={28} />}
                            </div>
                            <h3 className="font-bold text-gray-900 text-base leading-tight">{user.name}</h3>
                            <p className="text-gray-400 text-xs font-semibold mt-1">{user.email}</p>
                        </div>

                        <nav className="space-y-1">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.href;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 font-semibold rounded-xl transition-all duration-300 ease-in-out group relative",
                                            isActive
                                                ? "text-primary z-10"
                                                : "text-gray-400 hover:bg-gray-50/80 hover:text-gray-900"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ease-in-out",
                                            isActive ? "bg-transparent" : "bg-gray-50 group-hover:bg-white"
                                        )}>
                                            <item.icon 
                                                size={18} 
                                                className={cn(
                                                    "transition-all duration-300 ease-in-out",
                                                    isActive ? "text-primary scale-[1.2]" : "text-gray-400 group-hover:text-primary scale-100"
                                                )} 
                                            />
                                        </div>
                                        <span className={cn(
                                            "transition-all duration-300 ease-in-out",
                                            isActive ? "text-[15px]" : "text-sm"
                                        )}>
                                            {item.name}
                                        </span>
                                        <div className={cn(
                                            "ml-auto w-1.5 h-1.5 rounded-full bg-primary transition-all duration-300 ease-in-out origin-center",
                                            isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                                        )} />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-[calc(100vh-64px)]">
                    <main className="flex-1 p-8">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
