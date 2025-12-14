import { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    Sector,
    Legend
} from 'recharts';
import type { DailyData } from '@types';
import { PieChart as PieChartIcon } from 'lucide-react';

interface MonthBreakdownProps {
    data: DailyData[];
}

const COLORS = ['#F43F5E', '#8B5CF6', '#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#6366F1'];

export const MonthBreakdown = ({ data }: MonthBreakdownProps) => {
    const [activeIndex, setActiveIndex] = useState(-1);

    // 1. Calculate Total Month Expense
    const totalExpense = data.reduce((sum, day) => sum + day.amount, 0);

    // 2. Aggregate Expenses by Category
    const categoryMap: Record<string, number> = {};
    data.forEach(day => {
        day.transactions.forEach(tx => {
            categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
        });
    });

    // 3. Convert to Array and Sort
    const breakdown = Object.entries(categoryMap)
        .map(([name, value]) => ({
            name,
            value,
            percent: totalExpense > 0 ? (value / totalExpense) * 100 : 0
        }))
        .sort((a, b) => b.value - a.value);

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const renderActiveShape = (props: any) => {
        const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, value, index } = props;
        const isActive = index === activeIndex;

        if (!isActive) {
            return (
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            );
        }

        return (
            <g>
                <text x={cx} y={cy} dy={-10} textAnchor="middle" fill="#374151" className="text-sm font-medium">
                    {payload.name}
                </text>
                <text x={cx} y={cy} dy={20} textAnchor="middle" fill="#111827" className="text-2xl font-extrabold">
                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius + 6}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
            </g>
        );
    };

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 flex flex-col items-center justify-center mt-8">
            <div className="w-full flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                        <PieChartIcon size={18} />
                    </div>
                    <h3 className="text-gray-800 font-bold text-lg">Monthly Composition</h3>
                </div>
            </div>

            <div className="h-96 w-full relative">
                {/* Default Center Text (visible when no slice is hovered) */}
                {activeIndex === -1 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-gray-500 text-sm font-medium">Total Expenses</span>
                        <span className="text-3xl font-extrabold text-gray-900 mt-1">
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(totalExpense)}
                        </span>
                    </div>
                )}

                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            shape={renderActiveShape}
                            data={breakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={100}
                            outerRadius={140}
                            paddingAngle={3}
                            dataKey="value"
                            onMouseEnter={onPieEnter}
                            onMouseLeave={() => setActiveIndex(-1)}
                        >
                            {breakdown.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                            ))}
                        </Pie>
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            iconType="circle"
                            formatter={(value, entry: any) => (
                                <span className="text-gray-600 font-medium ml-1">
                                    {value} <span className="text-gray-400">({entry.payload.percent.toFixed(0)}%)</span>
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
