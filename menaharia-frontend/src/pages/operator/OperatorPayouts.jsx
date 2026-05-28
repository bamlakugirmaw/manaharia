import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Download, Search, Filter, Calendar, CreditCard, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export default function OperatorPayouts() {
    const [searchTerm, setSearchTerm] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedStart, setSelectedStart] = useState({ month: 'may', day: 12 });
    const [selectedEnd, setSelectedEnd] = useState({ month: 'june', day: 20 });

    // Mock payout data
    const payouts = [
        {
            id: 'PO-2025-001',
            date: 'Dec 01, 2025',
            amount: 45000,
            status: 'Completed',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-002',
            date: 'Dec 08, 2025',
            amount: 52000,
            status: 'Completed',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-003',
            date: 'Dec 15, 2025',
            amount: 48500,
            status: 'Processing',
            method: 'Bank Transfer',
            bank: 'CBE',
            account: '**** 1234'
        },
        {
            id: 'PO-2025-004',
            date: 'Dec 22, 2025',
            amount: 61000,
            status: 'Pending',
            method: 'Telebirr',
            bank: 'Wallet',
            account: '+251911...'
        }
    ];

    // Filter logic
    const filteredPayouts = payouts.filter(payout => {
        const matchesSearch = payout.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            payout.amount.toString().includes(searchTerm);
        
        const payoutDate = new Date(payout.date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;
        
        let matchesDate = true;
        if (start) {
            matchesDate = matchesDate && payoutDate >= start;
        }
        if (end) {
            // Set end to end of day
            const endOfDay = new Date(end);
            endOfDay.setHours(23, 59, 59, 999);
            matchesDate = matchesDate && payoutDate <= endOfDay;
        }

        return matchesSearch && matchesDate;
    });

    const handleDayClick = (month, day) => {
        if (!selectedStart || (selectedStart && selectedEnd)) {
            setSelectedStart({ month, day });
            setSelectedEnd(null);
        } else {
            const isAfter = (month === 'june' && selectedStart.month === 'may') || 
                            (month === selectedStart.month && day >= selectedStart.day);
            if (isAfter) {
                setSelectedEnd({ month, day });
            } else {
                setSelectedStart({ month, day });
                setSelectedEnd(null);
            }
        }
    };

    const isDaySelected = (month, day) => {
        return (selectedStart && selectedStart.month === month && selectedStart.day === day) ||
               (selectedEnd && selectedEnd.month === month && selectedEnd.day === day);
    };

    const isDayHighlighted = (month, day) => {
        if (!selectedStart || !selectedEnd) return false;
        
        if (selectedStart.month === selectedEnd.month) {
            return month === selectedStart.month && day > selectedStart.day && day < selectedEnd.day;
        }
        
        if (month === 'may') {
            return day > selectedStart.day;
        }
        if (month === 'june') {
            return day < selectedEnd.day;
        }
        return false;
    };

    const formatDateDisplay = (dateObj) => {
        if (!dateObj) return 'Select date';
        const monthName = dateObj.month === 'may' ? 'May' : 'June';
        return `${monthName} ${dateObj.day}, 2025`;
    };

    const handleApply = () => {
        if (selectedStart && selectedEnd) {
            const startStr = `2025-${selectedStart.month === 'may' ? '05' : '06'}-${String(selectedStart.day).padStart(2, '0')}`;
            const endStr = `2025-${selectedEnd.month === 'may' ? '05' : '06'}-${String(selectedEnd.day).padStart(2, '0')}`;
            setStartDate(startStr);
            setEndDate(endStr);
        }
        setShowDatePicker(false);
    };

    return (
        <div className="space-y-6">

            <Card className="p-6 border-none shadow-sm space-y-6">
                {/* Filters */}
                <div className="flex flex-col space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by ID or amount..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 relative">
                            <Button 
                                variant="outline" 
                                className={cn(
                                    "flex items-center gap-2 border transition-all text-sm font-semibold rounded-lg px-4 py-2",
                                    showDatePicker 
                                        ? "border-primary text-primary bg-primary/5" 
                                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                )}
                                onClick={() => setShowDatePicker(!showDatePicker)}
                            >
                                <Calendar size={16} /> 
                                {startDate && endDate 
                                    ? `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}` 
                                    : 'Date Range'}
                                <ChevronDown size={14} className={cn("transition-transform", showDatePicker && "rotate-180")} />
                            </Button>
                            {(startDate || endDate) && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-gray-500"
                                    onClick={() => {
                                        setStartDate('');
                                        setEndDate('');
                                        setSelectedStart({ month: 'may', day: 12 });
                                        setSelectedEnd({ month: 'june', day: 20 });
                                    }}
                                >
                                    Clear
                                </Button>
                            )}

                            {showDatePicker && (
                                <div className="absolute right-0 top-full mt-2 z-50 bg-white border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)] rounded-3xl p-6 flex flex-row gap-6 text-gray-800 w-[840px] animate-in fade-in slide-in-from-top-2 duration-200">


                                    {/* Middle Section: Double Calendar */}
                                    <div className="flex-1 flex flex-col gap-4">
                                        <div className="flex flex-row justify-between items-center px-2">
                                            <button type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                                                &lt;
                                            </button>
                                            <div className="flex justify-around w-full">
                                                <span className="font-bold text-sm text-gray-900 ml-12">May 2025</span>
                                                <span className="font-bold text-sm text-gray-900 mr-12">June 2025</span>
                                            </div>
                                            <button type="button" className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
                                                &gt;
                                            </button>
                                        </div>

                                        <div className="flex flex-row gap-6">
                                            {/* Calendar 1: May 2025 */}
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-y-1 text-xs text-center font-semibold">
                                                    {/* Empty cells before Thursday */}
                                                    <span className="h-8"></span>
                                                    <span className="h-8"></span>
                                                    <span className="h-8"></span>
                                                    <span className="h-8"></span>
                                                    
                                                    {/* Days 1 to 31 */}
                                                    {Array.from({ length: 31 }, (_, i) => {
                                                        const day = i + 1;
                                                        const isSelected = isDaySelected('may', day);
                                                        const isHighlighted = isDayHighlighted('may', day);
                                                        return (
                                                            <div 
                                                                key={`may-${day}`} 
                                                                className={cn(
                                                                    "h-8 flex items-center justify-center relative",
                                                                    isHighlighted && "bg-blue-50 text-blue-600"
                                                                )}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "h-8 w-8 flex items-center justify-center rounded-full transition-all focus:outline-none",
                                                                        isSelected 
                                                                            ? "bg-blue-600 text-white font-bold" 
                                                                            : "hover:bg-gray-100 text-gray-700"
                                                                    )}
                                                                    onClick={() => handleDayClick('may', day)}
                                                                >
                                                                    {day}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>

                                            {/* Calendar 2: June 2025 */}
                                            <div className="flex-1 flex flex-col gap-2">
                                                <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                                                    <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
                                                </div>
                                                <div className="grid grid-cols-7 gap-y-1 text-xs text-center font-semibold">
                                                    {/* June starts on Sunday, so no empty cells */}
                                                    {Array.from({ length: 30 }, (_, i) => {
                                                        const day = i + 1;
                                                        const isSelected = isDaySelected('june', day);
                                                        const isHighlighted = isDayHighlighted('june', day);
                                                        return (
                                                            <div 
                                                                key={`june-${day}`} 
                                                                className={cn(
                                                                    "h-8 flex items-center justify-center relative",
                                                                    isHighlighted && "bg-blue-50 text-blue-600"
                                                                )}
                                                            >
                                                                <button
                                                                    type="button"
                                                                    className={cn(
                                                                        "h-8 w-8 flex items-center justify-center rounded-full transition-all focus:outline-none",
                                                                        isSelected 
                                                                            ? "bg-blue-600 text-white font-bold" 
                                                                            : "hover:bg-gray-100 text-gray-700"
                                                                    )}
                                                                    onClick={() => handleDayClick('june', day)}
                                                                >
                                                                    {day}
                                                                </button>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Panel: Selected Range Display */}
                                    <div className="w-52 border-l border-gray-100 pl-4 flex flex-col gap-4 text-left">
                                        <div>
                                            <h4 className="font-bold text-xs text-gray-900">Selected Range</h4>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">From</label>
                                                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-2 bg-gray-50 text-xs font-semibold text-gray-700">
                                                    <span>{formatDateDisplay(selectedStart)}</span>
                                                    <Calendar size={14} className="text-gray-400" />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">To</label>
                                                <div className="flex items-center justify-between border border-gray-200 rounded-lg p-2 bg-gray-50 text-xs font-semibold text-gray-700">
                                                    <span>{formatDateDisplay(selectedEnd)}</span>
                                                    <Calendar size={14} className="text-gray-400" />
                                                </div>
                                            </div>
                                        </div>

                                        <Button 
                                            type="button"
                                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2.5 rounded-lg shadow-sm"
                                            onClick={handleApply}
                                        >
                                            Apply
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Payout ID</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                                <th className="px-6 py-4 font-semibold">Amount</th>
                                <th className="px-6 py-4 font-semibold">Method</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                                <th className="px-6 py-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredPayouts.length > 0 ? (
                                filteredPayouts.map((payout) => (
                                    <tr key={payout.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{payout.id}</td>
                                        <td className="px-6 py-4 text-gray-600">{payout.date}</td>
                                        <td className="px-6 py-4 font-bold text-gray-900">ETB {payout.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <CreditCard size={14} className="text-gray-400" />
                                                <span>{payout.bank} •••• {payout.account.slice(-4)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge className={`
                                                ${payout.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    payout.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'}
                                            `}>
                                                {payout.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button variant="ghost" size="sm" className="text-primary hover:bg-blue-50">
                                                Details
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                                        No payouts found for the selected criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-sm text-gray-500">
                        Showing {filteredPayouts.length} of {payouts.length} payouts
                    </span>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled>Previous</Button>
                        <Button variant="outline" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
