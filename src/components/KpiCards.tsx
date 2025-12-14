import type { KpiSummary } from '@types';
import clsx from 'clsx';
import { TrendingUp, DollarSign, Calendar, Target, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { ElementType, ReactNode } from 'react';

interface KpiCardsProps {
    data: KpiSummary;
}

interface CardProps {
    title: string;
    icon: ElementType;
    children: ReactNode;
    className?: string;
    accentColor?: string;
}

const Card = ({
    title,
    icon: Icon,
    children,
    className,
    accentColor = "blue"
}: CardProps) => (
    <div className={clsx(
        "bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-white/20 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group relative overflow-hidden",
        className
    )}>
        <div className={clsx("absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 blur-2xl",
            accentColor === "emerald" ? "bg-emerald-500" :
                accentColor === "rose" ? "bg-rose-500" :
                    accentColor === "violet" ? "bg-violet-500" : "bg-blue-500"
        )}></div>

        <div className="flex items-center gap-2 mb-4">
            <div className={clsx("p-2 rounded-lg",
                accentColor === "emerald" ? "bg-emerald-100 text-emerald-600" :
                    accentColor === "rose" ? "bg-rose-100 text-rose-600" :
                        accentColor === "violet" ? "bg-violet-100 text-violet-600" : "bg-blue-100 text-blue-600"
            )}>
                <Icon size={18} strokeWidth={2.5} />
            </div>
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">{title}</h3>
        </div>
        {children}
    </div>
);

interface MoneyProps {
    amount: number;
    type?: 'income' | 'expense' | 'neutral';
    label?: string;
}

const Money = ({
    amount,
    type = 'neutral',
    label
}: MoneyProps) => {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);

    const colorClass =
        type === 'income'
            ? 'text-emerald-600'
            : type === 'expense'
                ? 'text-rose-600'
                : 'text-gray-900';

    return (
        <div className="flex flex-col">
            {label && <span className="text-xs text-gray-400 mb-0.5">{label}</span>}
            <span className={clsx("text-2xl font-extrabold tracking-tight", colorClass)}>{formatted}</span>
        </div>
    );
};

export const KpiCards = ({ data }: KpiCardsProps) => {
    const currentNet = data.total_income_current_month - data.total_expense_current_month;
    const lastNet = data.total_income_last_month - data.total_expense_last_month;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

            {/* Current Month */}
            <Card title="Current Month" icon={Calendar} accentColor="blue">
                <div className="space-y-4">
                    <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                        <Money amount={data.total_income_current_month} type="income" label="Income" />
                        <div className="mb-1 text-emerald-500 bg-emerald-50 p-1.5 rounded-full">
                            <ArrowUpRight size={16} />
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <Money amount={data.total_expense_current_month} type="expense" label="Expense" />
                        <div className="mb-1 text-rose-500 bg-rose-50 p-1.5 rounded-full">
                            <ArrowDownRight size={16} />
                        </div>
                    </div>
                    <div className="pt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Net Flow</span>
                        <span className={clsx("font-bold px-2 py-0.5 rounded-full", currentNet >= 0 ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                            {currentNet >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(currentNet)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Last Month */}
            <Card title="Last Month" icon={Target} accentColor="violet">
                <div className="space-y-4">
                    <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                        <Money amount={data.total_income_last_month} type="income" label="Income" />
                        <span className="text-xs text-gray-400 mb-1">Previous</span>
                    </div>
                    <div className="flex justify-between items-end">
                        <Money amount={data.total_expense_last_month} type="expense" label="Expense" />
                    </div>
                    <div className="pt-2 flex justify-between items-center text-sm">
                        <span className="text-gray-400 font-medium">Net Flow</span>
                        <span className={clsx("font-bold px-2 py-0.5 rounded-full", lastNet >= 0 ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-700")}>
                            {lastNet >= 0 ? '+' : ''}{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(lastNet)}
                        </span>
                    </div>
                </div>
            </Card>

            {/* Forecast */}
            <Card title="Next Month Forecast" icon={TrendingUp} accentColor="emerald">
                <div className="space-y-4">
                    <div className="flex justify-between items-end pb-2 border-b border-gray-100">
                        <Money amount={data.forecast_next_month_income} type="income" label="Est. Income" />
                    </div>
                    <div className="flex justify-between items-end">
                        <Money amount={data.forecast_next_month_expense} type="expense" label="Est. Expense" />
                    </div>
                    <div className="pt-2 text-xs text-gray-400 text-center italic">
                        Based on 3-month moving avg
                    </div>
                </div>
            </Card>

            {/* Yearly Overview */}
            <Card title="Yearly Summary" icon={DollarSign} accentColor="rose">
                <div className="space-y-3 pt-1">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Current Year Net</span>
                        <span className={clsx("text-lg font-bold", data.total_income_current_year >= data.total_expense_current_year ? "text-emerald-600" : "text-rose-600")}>
                            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.total_income_current_year - data.total_expense_current_year)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Income</span>
                        <span className="text-gray-700 font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.total_income_current_year)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Total Expense</span>
                        <span className="text-gray-700 font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.total_expense_current_year)}</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                        <span>Last Year Net</span>
                        <span>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(data.total_income_last_year - data.total_expense_last_year)}</span>
                    </div>
                </div>
            </Card>

        </div>
    );
};
