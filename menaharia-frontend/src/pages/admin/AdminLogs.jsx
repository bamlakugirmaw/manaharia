import { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { cn } from '../../lib/utils';

const MOCK_LOGS = [
    { id: 'LOG-9921', event: 'New User Registration', details: 'User account created for bekele@gmail.com', level: 'info', time: '2 mins ago', ip: '197.156.x.x' },
    { id: 'LOG-9920', event: 'Booking Confirmation', details: 'Booking ID #BK-392 confirmed via Telebirr', level: 'success', time: '5 mins ago', ip: '196.12.x.x' },
    { id: 'LOG-9919', event: 'Failed Login Attempt', details: 'Multiple failed attempts for admin@selambus.com', level: 'warning', time: '15 mins ago', ip: '41.222.x.x' },
    { id: 'LOG-9918', event: 'Payment Gateway Timeout', details: 'Connection to CBE Birr API timed out after 30s', level: 'error', time: '1 hour ago', ip: 'System' },
    { id: 'LOG-9917', event: 'Operator Profile Update', details: 'Sky Bus updated their contact information', level: 'info', time: '2 hours ago', ip: '197.156.x.x' },
];

export default function AdminLogs() {
    const [levelFilter, setLevelFilter] = useState('all');

    const filteredLogs = MOCK_LOGS.filter(log => {
        if (levelFilter === 'error') {
            return log.level === 'error';
        }
        if (levelFilter === 'warning') {
            return log.level === 'warning';
        }
        return true; // 'all' shows everything
    });

    return (
        <div className="space-y-6">

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-start gap-3">
                <AlertTriangle className="shrink-0 mt-0.5" size={18} />
                <p>
                    System audit logs are not available from the API yet (no <code className="text-xs">/v1/logs</code> endpoint in OpenAPI).
                    The entries below are sample data for UI preview only.
                </p>
            </div>

            <Card className="p-4 border-none shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search logs..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Badge
                        variant="outline"
                        className={cn(
                            "cursor-pointer transition-colors",
                            levelFilter === 'all'
                                ? "bg-primary text-white border-primary"
                                : "hover:bg-gray-100"
                        )}
                        onClick={() => setLevelFilter('all')}
                    >
                        All Levels
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn(
                            "cursor-pointer transition-colors",
                            levelFilter === 'warning'
                                ? "bg-amber-500 text-white border-amber-500"
                                : "text-amber-600 border-amber-200 hover:bg-amber-50"
                        )}
                        onClick={() => setLevelFilter('warning')}
                    >
                        Warn
                    </Badge>
                    <Badge
                        variant="outline"
                        className={cn(
                            "cursor-pointer transition-colors",
                            levelFilter === 'error'
                                ? "bg-red-600 text-white border-red-600"
                                : "text-red-600 border-red-200 hover:bg-red-50"
                        )}
                        onClick={() => setLevelFilter('error')}
                    >
                        Errors Only
                    </Badge>
                </div>
            </Card>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium text-xs">
                        <tr>
                            <th className="px-6 py-4 font-bold">Level</th>
                            <th className="px-6 py-4 font-bold">Event</th>
                            <th className="px-6 py-4 font-bold">Details</th>
                            <th className="px-6 py-4 font-bold">Time</th>
                            <th className="px-6 py-4 font-bold text-right">Source IP</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    {log.level === 'info' && <Badge variant="secondary" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"><Info size={10} className="mr-1" /> Info</Badge>}
                                    {log.level === 'success' && <Badge variant="success" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"><CheckCircle size={10} className="mr-1" /> Success</Badge>}
                                    {log.level === 'warning' && <Badge variant="warning" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"><AlertTriangle size={10} className="mr-1" /> Warn</Badge>}
                                    {log.level === 'error' && <Badge variant="destructive" className="font-bold text-[10px] uppercase tracking-widest px-2 py-0.5"><XCircle size={10} className="mr-1" /> Error</Badge>}
                                </td>
                                <td className="px-6 py-4 font-semibold text-gray-900">{log.event}</td>
                                <td className="px-6 py-4 text-gray-500 text-xs truncate max-w-xs">{log.details}</td>
                                <td className="px-6 py-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">{log.time}</td>
                                <td className="px-6 py-4 text-right font-mono text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{log.ip}</td>
                            </tr>
                        ))}
                        {filteredLogs.length === 0 && (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                    No logs found matching your filter.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
