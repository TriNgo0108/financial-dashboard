import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';
import type { MonthlyData } from '@types';

interface MonthlyChartProps {
    data: MonthlyData[];
}

export const MonthlyChart = ({ data }: MonthlyChartProps) => {
    const chartData = data.map((d) => ({
        ...d,
        // Format label as "Jan 23"
        label: new Date(d.year, d.month - 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    }));

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg border border-gray-100 text-sm">
                    <p className="font-bold text-gray-800 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-500 capitalize">{entry.name}:</span>
                            <span className="font-mono font-medium text-gray-900">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(entry.value)}
                            </span>
                        </div>
                    ))}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-2 justify-between">
                        <span className="text-gray-400">Net:</span>
                        <span className={clsx("font-bold", (payload[0].payload.net >= 0 ? "text-emerald-600" : "text-rose-600"))}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(payload[0].payload.net)}
                        </span>
                    </div>
                </div>
            );
        }
        return null;
    };

    // Helper for clsx in tooltip since it's outside
    function clsx(...args: any[]) {
        return args.filter(Boolean).join(' ');
    }

    return (
        <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-gray-800 font-bold text-lg">
                    Financial Trend
                </h3>
                <div className="flex gap-2">
                    <span className="flex items-center text-xs text-gray-500 gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div>Income</span>
                    <span className="flex items-center text-xs text-gray-500 gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div>Expense</span>
                </div>
            </div>

            <div className="h-96 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{
                            top: 10,
                            right: 10,
                            left: 0,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                        <XAxis
                            dataKey="label"
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            dy={10}
                        />
                        <YAxis
                            stroke="#9CA3AF"
                            tick={{ fontSize: 12, fill: '#6B7280' }}
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(value) => `$${value / 1000}k`}
                            dx={-10}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#9CA3AF', strokeWidth: 1, strokeDasharray: '4 4' }} />
                        <Area
                            type="monotone"
                            dataKey="income"
                            name="Income"
                            stroke="#10B981"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorIncome)"
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                        <Area
                            type="monotone"
                            dataKey="expense"
                            name="Expense"
                            stroke="#EF4444"
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorExpense)"
                            animationDuration={1500}
                            animationEasing="ease-in-out"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
