import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { DailyData } from '@types';

import { ShoppingBag } from 'lucide-react';

interface DailyChartProps {
    data: DailyData[];
}

export const DailyChart = ({ data }: DailyChartProps) => {

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const dayData = payload[0].payload as DailyData;

            return (
                <div className="bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-100 text-sm max-w-xs z-50">
                    <p className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">Day {label}</p>
                    <div className="mb-2">
                        <span className="text-rose-500 font-bold text-lg">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(dayData.amount)}
                        </span>
                        <span className="text-xs text-gray-400 ml-1">Total Expense</span>
                    </div>

                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                        {dayData.transactions.length > 0 ? (
                            dayData.transactions.map((tx, idx) => (
                                <div key={idx} className="flex justify-between items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-700 truncate font-medium text-xs">{tx.description || 'Uncategorized'}</p>
                                        <p className="text-[10px] text-gray-400 truncate">{tx.category}</p>
                                    </div>
                                    <span className="text-gray-600 text-xs font-mono">
                                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(tx.amount)}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-400 italic text-xs">No expenses recorded.</p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 mt-8">
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
                    Hover bars for details
                </div>
            </div>

            <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="day"
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                            interval={1} // Modify interval if too crowded, or rely on responsive
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value}`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: '#fee2e2', opacity: 0.4 }} />
                        <Bar
                            dataKey="amount"
                            fill="#F43F5E"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={40}
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
