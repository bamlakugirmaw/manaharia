import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { User, Check } from 'lucide-react';
import profileIcon from '../../assets/profile-icon.jpg';

export default function UserProfile() {
    const [saving, setSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setSaving(true);
        setShowSuccess(false);
        setTimeout(() => {
            setSaving(false);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        }, 1200);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <Card className="p-8 border border-gray-100/50 shadow-[0_8px_30px_rgba(0,0,0,0.02)] rounded-3xl bg-white space-y-8">
                {/* Profile Header */}
                <div className="flex items-center gap-6 pb-6 border-b border-gray-100/80">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] relative group cursor-pointer overflow-hidden bg-gray-50 shrink-0">
                        <img 
                            src={profileIcon} 
                            alt="Abebe Kebede Profile" 
                            className="w-full h-full object-cover" 
                        />
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold">
                            Change
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">Abebe Kebede</h2>
                        <p className="text-xs font-bold text-primary uppercase tracking-wider mt-1 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                            Traveller Account
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {showSuccess && (
                        <div className="p-4 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-2xl border border-emerald-100/50 flex items-center gap-2 animate-in fade-in duration-300">
                            <Check size={16} /> Profile settings successfully updated!
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input 
                            label="First Name" 
                            defaultValue="Abebe" 
                            className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white" 
                        />
                        <Input 
                            label="Last Name" 
                            defaultValue="Kebede" 
                            className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white" 
                        />
                    </div>

                    <Input 
                        label="Email Address" 
                        type="email" 
                        defaultValue="abebe@example.com" 
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white" 
                    />
                    <Input 
                        label="Phone Number" 
                        type="tel" 
                        defaultValue="+251 91 123 4567" 
                        className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 font-semibold text-gray-700 bg-white" 
                    />

                    {/* Change Password Block */}
                    <div className="pt-6 border-t border-gray-100/80">
                        <h3 className="font-bold text-gray-900 text-base mb-1">Change Password</h3>
                        <p className="text-xs text-gray-400 mb-4">To update your password, fill in the fields below. Otherwise, leave them blank.</p>
                        
                        <div className="space-y-4">
                            <Input 
                                label="Current Password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 text-gray-700 bg-white" 
                            />
                            <Input 
                                label="New Password" 
                                type="password" 
                                placeholder="••••••••" 
                                className="h-12 rounded-xl border-gray-200 focus-visible:ring-primary/20 px-4 text-gray-700 bg-white" 
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-6 flex justify-end gap-3 border-t border-gray-100/80">
                        <Button type="button" variant="outline" className="rounded-xl px-6 h-12 font-semibold border-gray-200 hover:bg-gray-50">
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={saving} 
                            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 font-semibold shadow-lg shadow-primary/10 transition-all duration-300 min-w-[140px]"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
