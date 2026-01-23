import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Search, User, Mail, Phone, Calendar, Shield, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';

const MOCK_USERS = [
    { id: 'USR-001', name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251 911 234 567', bookings: 12, status: 'active', joined: 'Jan 12, 2024', role: 'Traveller' },
    { id: 'USR-002', name: 'Tigist Alemu', email: 'tigist@example.com', phone: '+251 922 345 678', bookings: 8, status: 'active', joined: 'Feb 05, 2024', role: 'Traveller' },
    { id: 'USR-003', name: 'Dawit Haile', email: 'dawit@example.com', phone: '+251 933 456 789', bookings: 15, status: 'active', joined: 'Mar 20, 2024', role: 'Traveller' },
    { id: 'USR-004', name: 'Sara Tesfaye', email: 'sara@example.com', phone: '+251 944 567 890', bookings: 0, status: 'inactive', joined: 'Dec 15, 2024', role: 'Traveller' },
];

export default function AdminUserManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredUsers = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manage Users</h1>
                    <p className="text-gray-500 text-sm">Review, block, or manage permissions for all registered travellers.</p>
                </div>
                <Button size="sm">Export Users List</Button>
            </div>

            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Name, Email or User ID..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Contact Info</th>
                                <th className="px-6 py-4 font-bold text-center">Bookings</th>
                                <th className="px-6 py-4 font-bold">Joined Date</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{user.name}</span>
                                                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Mail size={12} className="text-gray-400" /> {user.email}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Phone size={12} className="text-gray-400" /> {user.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-50 text-gray-700 font-semibold text-xs">
                                            {user.bookings}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {user.joined}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={user.status === 'active' ? 'success' : 'destructive'}
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {user.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary font-bold text-xs hover:bg-primary/5"
                                                onClick={() => handleViewUser(user)}
                                            >
                                                Details
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Details Modal */}
            {selectedUser && (
                <DetailModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    title="User Account Details"
                    footer={
                        <div className="flex gap-2">
                            {selectedUser.status === 'active' ? (
                                <Button variant="destructive" className="flex items-center gap-2">
                                    <UserX size={16} /> Block User
                                </Button>
                            ) : (
                                <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
                                    <UserCheck size={16} /> Unblock User
                                </Button>
                            )}
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {selectedUser.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.role} • Registered since {selectedUser.joined}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-1">
                            <ModalDataRow label="Full Name" value={selectedUser.name} icon={User} />
                            <ModalDataRow label="Email Address" value={selectedUser.email} icon={Mail} />
                            <ModalDataRow label="Phone Number" value={selectedUser.phone} icon={Phone} />
                            <ModalDataRow label="User ID" value={selectedUser.id} icon={Shield} />
                            <ModalDataRow label="Registration Date" value={selectedUser.joined} icon={Calendar} />
                            <ModalDataRow label="Total Bookings" value={`${selectedUser.bookings} tickets`} />
                            <ModalDataRow
                                label="Current Status"
                                value={
                                    <Badge variant={selectedUser.status === 'active' ? 'success' : 'destructive'} className="capitalize">
                                        {selectedUser.status}
                                    </Badge>
                                }
                            />
                        </div>

                        <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <h4 className="text-sm font-bold text-blue-900 mb-2">Internal Admin Notes</h4>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                This user has a high booking frequency. No security flags or disputes recorded in the last 6 months.
                            </p>
                        </div>
                    </div>
                </DetailModal>
            )}
        </div>
    );
}

