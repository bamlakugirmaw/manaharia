import React, { useState, useRef } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Building, Phone, Mail, CreditCard, Lock, Upload, Check } from 'lucide-react';

export default function OperatorSettings() {
    const fileInputRef = useRef(null);
    const [logo, setLogo] = useState(null);
    
    // States for actions
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingBanking, setSavingBanking] = useState(false);
    
    // Password States
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
    const [passwordError, setPasswordError] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    // Handlers
    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogo(URL.createObjectURL(file));
        }
    };

    const handleLogoRemove = () => {
        setLogo(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSaveProfile = () => {
        setSavingProfile(true);
        setTimeout(() => setSavingProfile(false), 1000);
    };

    const handleSaveBanking = () => {
        setSavingBanking(true);
        setTimeout(() => setSavingBanking(false), 1500);
    };

    const handleUpdatePassword = () => {
        setPasswordError('');
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            setPasswordError('All fields are required');
            return;
        }
        if (passwords.new.length < 8) {
            setPasswordError('Password must be at least 8 characters long');
            return;
        }
        if (passwords.new !== passwords.confirm) {
            setPasswordError('New passwords do not match');
            return;
        }
        
        setSavingPassword(true);
        setTimeout(() => {
            setSavingPassword(false);
            setShowPasswordForm(false);
            setPasswords({ current: '', new: '', confirm: '' });
            alert("Password updated successfully!");
        }, 1200);
    };

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold">Company Profile & Settings</h1>
                <p className="text-gray-500">Manage your organization details and preferences.</p>
            </div>

            {/* Profile Header */}
            <Card className="p-6 border-none shadow-sm flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-primary text-2xl font-bold border-4 border-white shadow-sm overflow-hidden">
                    {logo ? (
                        <img src={logo} alt="Company Logo" className="w-full h-full object-cover" />
                    ) : (
                        'SB'
                    )}
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold">Selam Bus Line S.C.</h2>
                    <p className="text-gray-500">Verified Operator • Gold Tier</p>
                    <div className="flex justify-center md:justify-start gap-3 mt-4">
                        <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            ref={fileInputRef} 
                            onChange={handleLogoUpload} 
                        />
                        <Button size="sm" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2">
                            <Upload size={16} /> Change Logo
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleLogoRemove} className="text-red-500 hover:text-red-600 hover:bg-red-50 border-red-100">
                            Remove
                        </Button>
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
                    <Button onClick={handleSaveProfile} disabled={savingProfile} className="min-w-[140px]">
                        {savingProfile ? 'Saving...' : 'Save Changes'}
                    </Button>
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
                    <Button variant={savingBanking ? 'default' : 'outline'} onClick={handleSaveBanking} disabled={savingBanking} className={savingBanking ? 'bg-green-500 hover:bg-green-600 text-white border-green-500' : ''}>
                        {savingBanking ? <span className="flex items-center gap-2"><Check size={16}/> Successfully Updated</span> : 'Update Banking Details'}
                    </Button>
                </div>
            </Card>

            {/* Security Settings */}
            <Card className="p-8 border-none shadow-sm space-y-6">
                <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                    <Lock className="text-gray-400" size={20} />
                    <h3 className="font-bold text-lg">Security & Passwords</h3>
                </div>

                {!showPasswordForm ? (
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Account Password</h4>
                            <p className="text-sm text-gray-500">Periodically changing your password ensures strong account security.</p>
                        </div>
                        <Button variant="outline" onClick={() => setShowPasswordForm(true)}>Update Password</Button>
                    </div>
                ) : (
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 animate-in fade-in duration-300">
                        <h4 className="font-bold text-gray-900 mb-4">Update Password</h4>
                        
                        {passwordError && (
                            <div className="p-3 bg-red-50 text-red-600 text-sm font-medium rounded-lg border border-red-100 mb-5">
                                {passwordError}
                            </div>
                        )}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="space-y-1 md:col-span-2">
                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.current}
                                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.new}
                                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                />
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <Button variant="ghost" onClick={() => { setShowPasswordForm(false); setPasswordError(''); }}>Cancel</Button>
                            <Button onClick={handleUpdatePassword} disabled={savingPassword}>
                                {savingPassword ? 'Updating...' : 'Save Password'}
                            </Button>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
}
