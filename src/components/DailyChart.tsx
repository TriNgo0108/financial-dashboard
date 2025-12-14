import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from 'recharts';
import type { DailyData } from '@types';
import { ShoppingBag, Calendar, Receipt } from 'lucide-react';

interface DailyChartProps {
    data: DailyData[];
}

export const DailyChart = ({ data }: DailyChartProps) => {
    const [selectedDay, setSelectedDay] = useState<DailyData | null>(null);

    const handleBarClick = (data: DailyData) => {
        setSelectedDay(data);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column: Chart */}
            <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                            <ShoppingBag size={18} />
                        </div>
                        <div>
                            <h3 className="text-gray-800 font-bold text-lg">Daily Expenses</h3>
                            <p className="text-xs text-gray-500">Current Month Breakdown</p>
                        </div>
                    </div>
                    <div className="text-xs text-gray-400 italic">
                        Hover over a bar to view transactions
                    </div>
                </div>

                <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis
                                dataKey="day"
                                stroke="#9CA3AF"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                tickLine={false}
                                axisLine={false}
                                dy={10}
                                interval={1}
                            />
                            <YAxis
                                stroke="#9CA3AF"
                                tick={{ fontSize: 12, fill: '#6B7280' }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                dx={-10}
                            />
                            <Tooltip
                                cursor={{ fill: '#fee2e2', opacity: 0.4 }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value: number) => [new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value), 'Expense']}
                            />
                            <Bar
                                dataKey="amount"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                                cursor="pointer"
                                onMouseEnter={(data: any) => handleBarClick(data)}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={selectedDay && selectedDay.day === entry.day ? '#E11D48' : '#F43F5E'}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Right Column: Details Panel */}
            <div className="lg:col-span-1 bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 flex flex-col h-[420px]">
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Receipt size={18} />
                    </div>
                    <div>
                        <h3 className="text-gray-800 font-bold text-lg">Transaction Details</h3>
                        <p className="text-xs text-gray-500">
                            {selectedDay ? `Day ${selectedDay.day}` : 'Hover a day'}
                        </p>
                    </div>
                </div>

                {selectedDay ? (
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <div className="mb-4">
                            <span className="text-3xl font-bold text-gray-800">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(selectedDay.amount)}
                            </span>
                            <span className="text-sm text-gray-500 ml-2">Total</span>
                        </div>

                        <div
                            key={selectedDay.day} // Trigger animation on day change
                            className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
                        >
                            {selectedDay.transactions.length > 0 ? (
                                selectedDay.transactions.map((tx, idx) => (
                                    <div key={idx} className="group p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex gap-2">
                                                <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                                                    {tx.category}
                                                </span>
                                                {tx.sub_category && (
                                                    <span className="text-xs font-bold text-violet-600 px-2 py-0.5 bg-violet-50 rounded-full border border-violet-100">
                                                        {tx.sub_category}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="font-mono font-medium text-gray-700">
                                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tx.amount)}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-snug pl-1">
                                            {tx.description || 'No description'}
                                        </p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-400 flex flex-col items-center">
                                    <ShoppingBag className="mb-2 opacity-50" size={32} />
                                    <p>No expenses recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 p-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Calendar size={32} className="text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-500">No Day Selected</p>
                        <p className="text-sm mt-2">Hover over charts to see the detailed transactions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
