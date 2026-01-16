import { useNavigate, Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import Navbar from '../components/layout/Navbar';
import { Logo } from '../components/ui/Logo';
import { LayoutDashboard, Ticket, User, LogOut, Settings, History, CreditCard, Bus, Calendar as CalendarIcon, Map, Shield, Users, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';

// Sidebar Items for Traveller
const TRAVELLER_NAV = [
    { name: 'Dashboard', href: '/traveller/dashboard', icon: LayoutDashboard },
    { name: 'Upcoming Trips', href: '/traveller/upcoming', icon: CalendarIcon },
    { name: 'My Bookings', href: '/traveller/bookings', icon: Ticket },
    { name: 'Payment History', href: '/traveller/payments', icon: CreditCard },
    { name: 'Profile Settings', href: '/traveller/profile', icon: User },
];

// Sidebar Items for Operator
const OPERATOR_NAV = [
    { name: 'Overview', href: '/operator/dashboard', icon: LayoutDashboard },
    { name: 'Bus Management', href: '/operator/fleet', icon: Bus },
    { name: 'Trip Scheduling', href: '/operator/schedules', icon: CalendarIcon },
    { name: 'Bookings', href: '/operator/bookings', icon: Ticket },
    { name: 'Revenue Reports', href: '/operator/reports', icon: CreditCard },
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
    { name: 'Disputes', href: '/admin/disputes', icon: Shield },
    { name: 'Payment Logs', href: '/admin/payments', icon: CreditCard },
    { name: 'System Logs', href: '/admin/logs', icon: Activity },
];

export default function DashboardLayout({ children }) {
    const location = useLocation();

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
                                            "flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-300 group relative",
                                            isActive
                                                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02] z-10"
                                                : "text-gray-400 hover:bg-gray-50/80 hover:text-gray-900"
                                        )
                                        }
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                            isActive ? "bg-white/20" : "bg-gray-50 group-hover:bg-white"
                                        )}>
                                            <item.icon size={18} className={cn(isActive ? "text-white" : "text-gray-400 group-hover:text-primary")} />
                                        </div>
                                        {item.name}
                                        {isActive && (
                                            <div className="ml-auto w-1 h-1 rounded-full bg-white opacity-80" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="mt-auto p-6 border-t border-gray-50">
                        <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl h-12 px-5 font-bold">
                            <LogOut className="mr-3 h-5 w-5" /> Sign Out
                        </Button>
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
