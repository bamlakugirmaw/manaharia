import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Settings, Globe, CreditCard, Bell, Shield, Save, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function AdminSettings() {
    const [activeTab, setActiveTab] = useState('platform');

    const tabs = [
        { id: 'platform', label: 'Platform Configuration', icon: Globe },
        { id: 'payment', label: 'Payment Power', icon: CreditCard },
        { id: 'notifications', label: 'Notification Templates', icon: Bell },
        { id: 'security', label: 'Security & Access', icon: Shield },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                    <p className="text-gray-500 text-sm">Configure global platform parameters and integration keys.</p>
                </div>
                <Button className="flex items-center gap-2">
                    <Save size={18} /> Save All Changes
                </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full lg:w-72 flex flex-col gap-2 bg-gray-50/50 p-2 rounded-[2rem] border border-gray-100 h-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 text-xs font-semibold rounded-[1.25rem] transition-all duration-300",
                                activeTab === tab.id
                                    ? "bg-white text-primary shadow-lg shadow-gray-200/50 scale-[1.02]"
                                    : "text-gray-400 hover:text-gray-600 hover:bg-white/50"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-xl flex items-center justify-center transition-colors",
                                activeTab === tab.id ? "bg-primary text-white" : "bg-white text-gray-400"
                            )}>
                                <tab.icon size={16} />
                            </div>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    {activeTab === 'platform' && (
                        <Card className="p-8 border-none shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-base font-bold mb-4 text-gray-900">General Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Platform Name</label>
                                        <input type="text" defaultValue="Menaharia" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Support Email</label>
                                        <input type="email" defaultValue="support@menaharia.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20" />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-base font-bold mb-4 text-gray-900">Operational Settings</h3>
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-orange-50/50 rounded-xl border border-orange-100">
                                        <div className="max-w-md">
                                            <h4 className="font-bold text-orange-900 text-sm">Maintenance Mode</h4>
                                            <p className="text-xs text-orange-700 mt-1">When enabled, the public site will show a maintenance message. APIs will remain active.</p>
                                        </div>
                                        <div className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer" />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                                        <div className="max-w-md">
                                            <h4 className="font-bold text-blue-900 text-sm">Global Booking Fee (%)</h4>
                                            <p className="text-xs text-blue-700 mt-1">Percentage charged on every ticket booking across the platform.</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" defaultValue="5" className="w-16 bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-center font-bold outline-none" />
                                            <span className="font-bold text-blue-600">%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'payment' && (
                        <Card className="p-8 border-none shadow-sm space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div>
                                <h3 className="text-lg font-bold mb-4 text-gray-900">Payment Gateways</h3>
                                <p className="text-sm text-gray-500 mb-6">Manage API keys and configurations for supported payment methods.</p>

                                <div className="space-y-4">
                                    {['Chapa', 'Telebirr', 'CBE Birr API'].map((gateway) => (
                                        <div key={gateway} className="p-6 border border-gray-100 rounded-2xl bg-gray-50 group hover:bg-white hover:shadow-md transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 group-hover:bg-primary/5 transition-colors">
                                                        <CreditCard size={18} className="text-gray-400 group-hover:text-primary" />
                                                    </div>
                                                    <h4 className="font-bold text-gray-900 text-sm">{gateway}</h4>
                                                </div>
                                                <Badge variant="success" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5">Active</Badge>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Public Key</label>
                                                    <input type="password" value="pk_test_**********************" readOnly className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-[10px] uppercase font-bold text-gray-400">Secret Key</label>
                                                    <input type="password" value="sk_test_**********************" readOnly className="w-full bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs font-mono" />
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="mt-4 text-primary hover:bg-primary/5 px-0 h-auto">Update Gateway Config →</Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'notifications' && (
                        <Card className="p-8 border-none shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-base font-bold mb-4 text-gray-900">Communication Templates</h3>
                            <p className="text-xs text-gray-400 mb-6">Customize SMS and Email notifications sent to customers.</p>
                            <div className="space-y-4">
                                {[
                                    { name: 'Booking Confirmation SMS', desc: 'Sent when payment is successful.' },
                                    { name: 'Trip Reminder Email', desc: 'Sent 2 hours before departure.' },
                                    { name: 'Cancellation Notice', desc: 'Sent when operator cancels a trip.' }
                                ].map((item) => (
                                    <div key={item.name} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 transition-colors">
                                        <div>
                                            <h5 className="font-bold text-gray-800 text-sm">{item.name}</h5>
                                            <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                                        </div>
                                        <Button variant="outline" size="sm">Edit Template</Button>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}

                    {activeTab === 'security' && (
                        <Card className="p-8 border-none shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <h3 className="text-lg font-bold mb-4 text-gray-900">Platform Security</h3>
                            <div className="space-y-6 text-center py-12">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield size={32} className="text-gray-400" />
                                </div>
                                <h4 className="font-bold text-gray-900">Access Control & Audits</h4>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">Configure multi-factor authentication, set session timeouts, and review IP whitelist configurations.</p>
                                <Button className="mt-4">Security Dashboard</Button>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

