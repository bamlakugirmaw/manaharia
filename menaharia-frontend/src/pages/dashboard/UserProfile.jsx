import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { User } from 'lucide-react';

export default function UserProfile() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>

            <Card className="p-8">
                <div className="flex items-center gap-6 mb-8">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center relative group cursor-pointer overflow-hidden">
                        {/* Placeholder Avatar */}
                        <User size={40} className="text-gray-400" />
                        <div className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium">
                            Change
                        </div>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Abebe Kebede</h2>
                        <p className="text-gray-500">Traveller Account</p>
                    </div>
                </div>

                <form className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="First Name" defaultValue="Abebe" />
                        <Input label="Last Name" defaultValue="Kebede" />
                    </div>

                    <Input label="Email Address" type="email" defaultValue="abebe@example.com" />
                    <Input label="Phone Number" type="tel" defaultValue="+251 91 123 4567" />

                    <div className="pt-4 border-t border-gray-100">
                        <h3 className="font-semibold mb-4">Change Password</h3>
                        <div className="space-y-4">
                            <Input label="Current Password" type="password" placeholder="••••••••" />
                            <Input label="New Password" type="password" placeholder="••••••••" />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-4">
                        <Button variant="outline">Cancel</Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white">Save Changes</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
