import React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input'; // Assuming Input component exists
import { User, Building, Phone, Mail, CreditCard, Lock, Bell } from 'lucide-react';

export default function OperatorSettings() {
    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Company Profile & Settings</h1>
                <p className="text-gray-500">Manage your organization details and preferences.</p>
            </div>

            {/* Profile Header */}
            <Card className="p-6 border-none shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-primary text-2xl font-bold border-4 border-white shadow-sm">
                    SB
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold">Selam Bus Line S.C.</h2>
                    <p className="text-gray-500">Verified Operator • Gold Tier</p>
                    <div className="flex justify-center md:justify-start gap-3 mt-4">
                        <Button size="sm">Change Logo</Button>
                        <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">Remove</Button>
                    </div>
                </div>
            </Card>

            {/* Company Information Form */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Building className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Company Information</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Company Name</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="Selam Bus Line S.C." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Registration Number (TIN)</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500" defaultValue="TIN-98293842" disabled />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="text" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="+251 11 551 0000" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input type="email" className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="info@selambus.com" />
                        </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-700">Headquarters Address</label>
                        <textarea className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" rows="3" defaultValue="Meskel Square, Addis Ababa, Ethiopia" />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button>Save Changes</Button>
                </div>
            </Card>

            {/* Banking Settings */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <CreditCard className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Banking & Payouts</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Bank Name</label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20">
                            <option>Commercial Bank of Ethiopia</option>
                            <option>Awash Bank</option>
                            <option>Dashen Bank</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Account Number</label>
                        <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" defaultValue="1000123456789" />
                    </div>
                </div>
                <div className="flex justify-end pt-4">
                    <Button variant="outline">Update Banking Details</Button>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Lock className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Security</h3>
                </div>

                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                    </div>
                    <Button variant="outline">Enable</Button>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                        <h4 className="font-medium">Change Password</h4>
                        <p className="text-sm text-gray-500">Last changed 3 months ago.</p>
                    </div>
                    <Button variant="outline">Update Password</Button>
                </div>
            </Card>
        </div>
    );
}
