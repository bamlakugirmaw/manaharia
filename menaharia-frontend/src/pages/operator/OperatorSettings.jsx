import { Button } from '../../components/ui/Button';
import { Settings } from 'lucide-react';

export default function OperatorSettings() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full">
                <Settings size={48} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold">Operator Settings</h1>
            <p className="text-gray-500 max-w-md">
                Manage company profile, payment methods, users, and notification preferences.
            </p>
        </div>
    );
}
