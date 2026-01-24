import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Search, Filter, Bus, MoreHorizontal, Building2, Calendar, ShieldCheck, MapPin, Phone, Mail, X } from 'lucide-react';
import { Input } from '../../components/ui/Input'; // Ensure Input component is available
import DetailModal, { ModalDataRow } from '../../components/admin/DetailModal';

const MOCK_OPERATORS = [
    {
        id: 'OP-001',
        name: 'Selam Bus Transport',
        logo: '/images/Enhanced_Bus_Images/Selam_Bus1.jpg',
        license: 'LIC-2024-00123',
        buses: 12,
        revenue: 'ETB 943,000',
        status: 'active',
        joined: 'Jan 15, 2024',
        contactName: 'Daniel Abera',
        phone: '+251 911 223344',
        email: 'info@selambus.com'
    },
    {
        id: 'OP-002',
        name: 'Sky Bus Services',
        logo: '/images/Enhanced_Bus_Images/Sky_Bus.jpg',
        license: 'LIC-2024-00456',
        buses: 8,
        revenue: 'ETB 678,000',
        status: 'active',
        joined: 'Feb 10, 2024',
        contactName: 'Mulugeta Tesfaye',
        phone: '+251 922 334455',
        email: 'ops@skybus.com'
    },
    {
        id: 'OP-003',
        name: 'Golden Bus',
        logo: '/images/Enhanced_Bus_Images/Golden_Bus.jpg',
        license: 'LIC-2024-00789',
        buses: 5,
        revenue: 'ETB 234,000',
        status: 'pending',
        joined: 'Nov 20, 2024',
        contactName: 'Tewodros Kassahun',
        phone: '+251 933 445566',
        email: 'admin@goldenbus.et'
    },
];

export default function AdminOperatorManagement() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOp, setSelectedOp] = useState(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [operators, setOperators] = useState(MOCK_OPERATORS);
    const [newOperator, setNewOperator] = useState({
        name: '',
        contactName: '',
        email: '',
        phone: ''
    });

    const filteredOperators = operators.filter(op =>
        op.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleViewDetails = (op) => {
        setSelectedOp(op);
        setIsDetailModalOpen(true);
    };

    const handleAddOperator = () => {
        const op = {
            id: `OP-00${operators.length + 1}`,
            name: newOperator.name,
            logo: '/images/Enhanced_Bus_Images/Sky_Bus.jpg', // Default logo
            license: `LIC-2024-0099${operators.length}`,
            buses: 0,
            revenue: 'ETB 0',
            status: 'pending',
            joined: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            contactName: newOperator.contactName,
            phone: newOperator.phone,
            email: newOperator.email
        };
        setOperators([...operators, op]);
        setIsAddModalOpen(false);
        setNewOperator({ name: '', contactName: '', email: '', phone: '' });
    };

    return (
        <div className="space-y-6 relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Bus Operators</h1>
                    <p className="text-gray-500 text-sm">Manage transportation partners and their fleet credentials.</p>
                </div>
                <Button size="sm" onClick={() => setIsAddModalOpen(true)}>Add New Operator</Button>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Company Name or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Operators Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-bold text-center w-16">Icon</th>
                                <th className="px-6 py-4 font-bold">Company</th>
                                <th className="px-6 py-4 font-bold text-center">Buses</th>
                                <th className="px-6 py-4 font-bold">License</th>
                                <th className="px-6 py-4 font-bold">Revenue</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredOperators.map((op) => (
                                <tr key={op.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 overflow-hidden">
                                            {op.logo ? (
                                                <img src={op.logo} alt={op.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <Building2 size={20} />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        <div className="flex flex-col">
                                            <span>{op.name}</span>
                                            <span className="text-[9px] text-gray-400 font-mono tracking-tighter uppercase">{op.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                                            {op.buses} Units
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                                        {op.license}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                                        {op.revenue}
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge
                                            variant={op.status === 'active' ? 'success' : 'warning'}
                                            className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"
                                        >
                                            {op.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-primary font-bold text-xs"
                                                onClick={() => handleViewDetails(op)}
                                            >
                                                View Profile
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Operator Details Modal */}
            {selectedOp && (
                <DetailModal
                    isOpen={isDetailModalOpen}
                    onClose={() => setIsDetailModalOpen(false)}
                    title="Operator Profile"
                    footer={
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
                            <Button className="bg-primary hover:bg-primary/90 text-white">Edit Operator</Button>
                        </div>
                    }
                >
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-5 bg-purple-50/50 border border-purple-100 rounded-2xl">
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-purple-600 overflow-hidden">
                                {selectedOp.logo ? (
                                    <img src={selectedOp.logo} alt={selectedOp.name} className="w-full h-full object-cover" />
                                ) : (
                                    <Bus size={32} />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedOp.name}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-500">ID: {selectedOp.id}</span>
                                    <span className="text-gray-300">•</span>
                                    <span className="text-xs text-blue-600 font-medium">Joined {selectedOp.joined}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Business Details</h4>
                                <ModalDataRow label="Legal Name" value={selectedOp.name} icon={Building2} />
                                <ModalDataRow label="License No" value={selectedOp.license} icon={ShieldCheck} />
                                <ModalDataRow label="Fleet Size" value={`${selectedOp.buses} Registered Buses`} icon={Bus} />
                                <ModalDataRow label="Revenue Share" value="10%" icon={MapPin} />
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Primary Contact</h4>
                                <ModalDataRow label="Contact Person" value={selectedOp.contactName} />
                                <ModalDataRow label="Phone" value={selectedOp.phone} icon={Phone} />
                                <ModalDataRow label="Email" value={selectedOp.email} icon={Mail} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 pt-4">
                            <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-gray-900">{selectedOp.revenue.replace('ETB ', '')}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium">Lifetime Revenue</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-gray-900">{selectedOp.buses}</span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium">Active Fleet</span>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl text-center">
                                <span className="block text-2xl font-bold text-gray-900">4.8</span>
                                <span className="text-[10px] text-gray-500 uppercase font-medium">Avg Rating</span>
                            </div>
                        </div>
                    </div>
                </DetailModal>
            )}

            {/* Add Operator Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-md bg-white p-6 relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setIsAddModalOpen(false)}
                            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold mb-1">Onboard New Operator</h2>
                        <p className="text-sm text-gray-500 mb-6">Enter company details to register a new transport partner.</p>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Company Name</label>
                                <Input
                                    placeholder="e.g. Lion Bus Share Company"
                                    value={newOperator.name}
                                    onChange={(e) => setNewOperator({ ...newOperator, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Contact Person</label>
                                <Input
                                    placeholder="Full Name"
                                    value={newOperator.contactName}
                                    onChange={(e) => setNewOperator({ ...newOperator, contactName: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone</label>
                                    <Input
                                        placeholder="+251..."
                                        value={newOperator.phone}
                                        onChange={(e) => setNewOperator({ ...newOperator, phone: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Email</label>
                                    <Input
                                        placeholder="company@mail.com"
                                        value={newOperator.email}
                                        onChange={(e) => setNewOperator({ ...newOperator, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button className="w-full mt-6" onClick={handleAddOperator}>
                                Register Operator
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}

