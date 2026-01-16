import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Search, Filter, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const MOCK_LOGS = [
    { id: 'LOG-9921', event: 'New User Registration', details: 'User account created for bekele@gmail.com', level: 'info', time: '2 mins ago', ip: '197.156.x.x' },
    { id: 'LOG-9920', event: 'Booking Confirmation', details: 'Booking ID #BK-392 confirmed via Telebirr', level: 'success', time: '5 mins ago', ip: '196.12.x.x' },
    { id: 'LOG-9919', event: 'Failed Login Attempt', details: 'Multiple failed attempts for admin@selambus.com', level: 'warning', time: '15 mins ago', ip: '41.222.x.x' },
    { id: 'LOG-9918', event: 'Payment Gateway Timeout', details: 'Connection to CBE Birr API timed out after 30s', level: 'error', time: '1 hour ago', ip: 'System' },
    { id: 'LOG-9917', event: 'Operator Profile Update', details: 'Sky Bus updated their contact information', level: 'info', time: '2 hours ago', ip: '197.156.x.x' },
];

export default function AdminLogs() {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">System Logs</h1>
                    <p className="text-gray-500">Monitor platform activity and troubleshoot issues.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Export Logs</Button>
                    <Button variant="outline">Log Settings</Button>
                </div>
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
                    <Button variant="outline" size="icon"><Filter size={18} /></Button>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="cursor-pointer hover:bg-gray-100">All Levels</Badge>
                    <Badge variant="outline" className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50">Errors Only</Badge>
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
                        {MOCK_LOGS.map((log) => (
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
                    </tbody>
                </table>
            </div>
        </div>
    );
}
