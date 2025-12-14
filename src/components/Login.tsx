import { useState, type FormEvent } from 'react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
    onLogin: (password: string) => void;
    error?: string | null;
}

export const Login = ({ onLogin, error }: LoginProps) => {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        onLogin(password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 relative overflow-hidden">

                {/* Decorative Circle */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-32 -mb-32"></div>

                <div className="relative z-10 flex flex-col items-center mb-8">
                    <div className="bg-white/20 p-4 rounded-full mb-4 shadow-inner ring-1 ring-white/30">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white text-center">Secure Access</h2>
                    <p className="text-blue-200 text-center text-sm mt-2">Enter your password to view financial data</p>
                </div>

                <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={18} className="text-blue-300" />
                        </div>
                        <input
                            type="password"
                            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent outline-none transition-all text-white placeholder-blue-300/50"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <div className="text-rose-300 text-sm bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-center backdrop-blur-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 group"
                    >
                        Unlock Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-xs text-blue-300/60 uppercase tracking-widest">Client-Side Encryption</p>
                </div>
            </div>
        </div>
    );
};
