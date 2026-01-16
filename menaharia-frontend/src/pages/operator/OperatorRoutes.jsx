import { Button } from '../../components/ui/Button';
import { Map } from 'lucide-react';

export default function OperatorRoutes() {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full">
                <Map size={48} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold">Route Management</h1>
            <p className="text-gray-500 max-w-md">
                This feature will allow operators to define new routes, stops, and pricing zones.
                <br />Coming in Phase 2.
            </p>
            <Button variant="outline">Request Early Access</Button>
        </div>
    );
}
