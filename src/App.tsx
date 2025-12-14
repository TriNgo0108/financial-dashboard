import { KpiCards } from '@components/KpiCards';
import { MonthlyChart } from '@components/MonthlyChart';
import { DailyChart } from '@components/DailyChart';
import { MonthBreakdown } from '@components/MonthBreakdown';
import { Login } from '@components/Login';
import { useFinancialData } from '@hooks/useFinancialData';
import { LayoutDashboard, LogOut } from 'lucide-react';

function App() {
  const {
    kpiData,
    monthlyData,
    dailyData,
    loading,
    error,
    isEncrypted,
    authError,
    handleLogin
  } = useFinancialData();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="text-slate-500 font-medium">Loading Financial Data...</div>
        </div>
      </div>
    );
  }

  if (isEncrypted) {
    return <Login onLogin={handleLogin} error={authError} />
  }

  if (error || !kpiData) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-rose-500 font-bold bg-rose-50 px-6 py-4 rounded-xl border border-rose-100">{error || 'No data available'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-600 to-slate-50 z-0 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="py-10 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl text-white shadow-lg">
              <LayoutDashboard size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Dashboard</h1>
              <p className="text-blue-100 text-sm font-medium">Personal Finance Overview</p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors backdrop-blur-md font-medium text-sm"
          >
            <LogOut size={16} />
            Logout
          </button>
        </header>

        <section>
          <KpiCards data={kpiData} />
        </section>

        <section className="mt-8">
          <MonthlyChart data={monthlyData} />
        </section>

        <section className="mt-8">
          <MonthBreakdown data={dailyData} />
        </section>

        <section className="mt-8">
          <DailyChart data={dailyData} />
        </section>

        <footer className="mt-12 text-center text-slate-400 text-xs font-medium uppercase tracking-wider">
          Last updated: {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </footer>
      </div>
    </div>
  );
}

export default App;
