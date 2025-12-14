export interface MonthlyData {
    year: number;
    month: number;
    income: number;
    expense: number;
    net: number;
    is_highest_net: boolean;
    is_lowest_net: boolean;
}

export interface KpiSummary {
    total_income_current_month: number;
    total_expense_current_month: number;
    total_income_last_month: number;
    total_expense_last_month: number;
    highest_month: MonthlyData;
    lowest_month: MonthlyData;
    forecast_next_month_income: number;
    forecast_next_month_expense: number;
    total_income_current_year: number;
    total_expense_current_year: number;
    total_income_last_year: number;
    total_expense_last_year: number;
}

export interface Transaction {
    description: string;
    amount: number;
    category: string;
}

export interface DailyData {
    day: number;
    amount: number;
    transactions: Transaction[];
}
