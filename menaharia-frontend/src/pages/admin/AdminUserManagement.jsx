import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Search, User, Mail, Phone, Calendar, Shield, UserCheck, UserX, Trash2 } from 'lucide-react';
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';
import { useUsers, useUpdateUserStatus, useRemoveUser, useHardRemoveUser, useRemoveUserRole } from '../../hooks/useUsers';
import { useRoles } from '../../hooks/useRoles';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';

// Backend status → badge variant
const statusVariant = (s) => {
    const v = (s ?? '').toUpperCase();
    if (v === 'ACTIVE')    return 'success';
    if (v === 'SUSPENDED') return 'destructive';
    return 'secondary'; // INACTIVE
};

export default function AdminUserManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // GET /v1/users
    const { data: users = [], isLoading } = useUsers({ limit: 100 });
    const { data: allRoles = [] } = useRoles({});
    const { mutate: updateStatus, isPending: updatingStatus } = useUpdateUserStatus();
    const { mutate: removeUser, isPending: removingUser } = useRemoveUser();
    const { mutate: hardRemoveUser, isPending: hardRemoving } = useHardRemoveUser();
    const { mutate: removeUserRole, isPending: removingRole } = useRemoveUserRole();
    const { confirm, ConfirmDialogHost } = useConfirmDialog();

    const filteredUsers = users.filter(u => {
        const q = searchQuery.toLowerCase();
        return (
            (u.fullName ?? u.name ?? '').toLowerCase().includes(q) ||
            (u.email ?? '').toLowerCase().includes(q) ||
            (u.id ?? '').toLowerCase().includes(q)
        );
    });

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleToggleStatus = (user) => {
        const newStatus = (user.status ?? '').toUpperCase() === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        updateStatus({ id: user.id, status: newStatus }, {
            onSuccess: () => {
                setSelectedUser(prev => prev?.id === user.id ? { ...prev, status: newStatus } : prev);
            },
        });
    };

    const handleSoftDelete = async (user) => {
        const ok = await confirm({
            title: 'Soft-delete this user?',
            description: `${displayName(user)} will no longer be able to sign in. Their data is retained.`,
            confirmLabel: 'Soft Delete',
        });
        if (!ok) return;
        removeUser(user.id, {
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const handleHardDelete = async (user) => {
        const ok = await confirm({
            title: 'Permanently delete this user?',
            description: `${displayName(user)} and all associated data will be permanently removed. This cannot be undone.`,
            confirmLabel: 'Continue',
        });
        if (!ok) return;
        const confirmed = await confirm({
            title: 'Final confirmation',
            description: 'All data will be erased. Are you absolutely sure?',
            confirmLabel: 'Permanently Delete',
        });
        if (!confirmed) return;
        hardRemoveUser(user.id, {
            onSuccess: () => {
                setIsModalOpen(false);
                setSelectedUser(null);
            },
        });
    };

    const roleName = (r) => (typeof r === 'string' ? r : r?.name ?? '');
    const roleIdFor = (roleItem) => {
        if (typeof roleItem === 'object' && roleItem?.id) return roleItem.id;
        const name = roleName(roleItem).toUpperCase().replace(/\s+/g, '_');
        const match = allRoles.find((r) => {
            const n = (r.name ?? '').toUpperCase().replace(/\s+/g, '_');
            return n === name;
        });
        return match?.id ?? null;
    };

    const handleRevokeRole = async (user, roleItem) => {
        const roleId = roleIdFor(roleItem);
        if (!roleId) return;
        const label = roleName(roleItem);
        const ok = await confirm({
            title: `Revoke ${label} role?`,
            description: `${displayName(user)} will lose the ${label} role.`,
            confirmLabel: 'Revoke Role',
        });
        if (!ok) return;
        removeUserRole({ id: user.id, roleId }, {
            onSuccess: () => {
                setSelectedUser((prev) => {
                    if (prev?.id !== user.id) return prev;
                    const nextRoles = (prev.roles ?? []).filter((r) => roleIdFor(r) !== roleId);
                    return { ...prev, roles: nextRoles };
                });
            },
        });
    };

    const displayName = (u) => u.fullName ?? u.name ?? '—';
    const initials    = (u) => displayName(u).split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    const joinedDate  = (u) => u.createdAt
        ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        : '—';

    return (
        <div className="space-y-6">
            <ConfirmDialogHost />
            <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                    type="text"
                    placeholder="Search by Name, Email or User ID..."
                    className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold">User</th>
                                <th className="px-6 py-4 font-bold">Contact Info</th>
                                <th className="px-6 py-4 font-bold">Joined Date</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {isLoading ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
                                </td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                    No users found matching your search.
                                </td></tr>
                            ) : filteredUsers.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {initials(user)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{displayName(user)}</span>
                                                <span className="text-[9px] font-mono text-gray-400 uppercase tracking-tighter">{user.id}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Mail size={12} className="text-gray-400" /> {user.email || '—'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                                <Phone size={12} className="text-gray-400" /> {user.phone || '—'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{joinedDate(user)}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={statusVariant(user.status)} className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">
                                            {(user.status ?? 'ACTIVE').toLowerCase()}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Button variant="ghost" size="sm" className="text-primary font-bold text-xs hover:bg-primary/5"
                                            onClick={() => handleViewUser(user)}>
                                            Details
                                        </Button>
                                    </td>
                                </tr>
                            ))}
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
                        <div className="flex flex-wrap gap-2 justify-end">
                            {(selectedUser.roles ?? []).length > 0 && (
                                <div className="flex flex-wrap gap-1 mr-auto">
                                    {(selectedUser.roles ?? []).map((roleItem, idx) => {
                                        const label = roleName(roleItem);
                                        const rid = roleIdFor(roleItem);
                                        if (!rid || label.toUpperCase() === 'USER') return null;
                                        return (
                                            <Button key={idx} variant="outline" size="sm" disabled={removingRole}
                                                className="text-xs"
                                                onClick={() => handleRevokeRole(selectedUser, roleItem)}>
                                                Revoke {label}
                                            </Button>
                                        );
                                    })}
                                </div>
                            )}
                            {(selectedUser.status ?? '').toUpperCase() !== 'SUSPENDED' ? (
                                <Button variant="destructive" disabled={updatingStatus}
                                    className="flex items-center gap-2"
                                    onClick={() => handleToggleStatus(selectedUser)}>
                                    <UserX size={16} /> {updatingStatus ? 'Updating…' : 'Suspend User'}
                                </Button>
                            ) : (
                                <Button disabled={updatingStatus}
                                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                                    onClick={() => handleToggleStatus(selectedUser)}>
                                    <UserCheck size={16} /> {updatingStatus ? 'Updating…' : 'Activate User'}
                                </Button>
                            )}
                            <Button variant="outline" disabled={removingUser}
                                className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                                onClick={() => handleSoftDelete(selectedUser)}>
                                <Trash2 size={16} /> {removingUser ? 'Deleting…' : 'Soft Delete'}
                            </Button>
                            <Button variant="destructive" disabled={hardRemoving}
                                className="flex items-center gap-2"
                                onClick={() => handleHardDelete(selectedUser)}>
                                <Trash2 size={16} /> {hardRemoving ? 'Deleting…' : 'Hard Delete'}
                            </Button>
                            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                {initials(selectedUser)}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{displayName(selectedUser)}</h3>
                                <p className="text-sm text-gray-500">
                                    {(selectedUser.roles ?? []).map(roleName).join(', ') || 'User'} · Registered since {joinedDate(selectedUser)}
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                            <ModalDataRow label="Full Name"         value={displayName(selectedUser)} icon={User} />
                            <ModalDataRow label="Email Address"     value={selectedUser.email || '—'} icon={Mail} />
                            <ModalDataRow label="Phone Number"      value={selectedUser.phone || '—'} icon={Phone} />
                            <ModalDataRow label="User ID"           value={selectedUser.id}           icon={Shield} />
                            <ModalDataRow label="Registration Date" value={joinedDate(selectedUser)}  icon={Calendar} />
                            <ModalDataRow label="Current Status"
                                value={
                                    <Badge variant={statusVariant(selectedUser.status)} className="capitalize">
                                        {(selectedUser.status ?? 'ACTIVE').toLowerCase()}
                                    </Badge>
                                }
                            />
                        </div>
                    </div>
                </DetailModal>
            )}
        </div>
    );
}
