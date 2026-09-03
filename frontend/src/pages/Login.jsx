import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(email, password);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#07152B] bg-[url('/login_bg.jpg')] bg-cover bg-center bg-no-repeat p-4 relative overflow-hidden">
      {/* Subtle Dark Overlay to make card pop */}
      <div className="absolute inset-0 bg-[#07152B]/75 backdrop-blur-xs"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/60 transition-all">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-1 shadow-lg overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Vignesh Associates Logo" className="h-full w-full object-contain rounded-xl" />
          </div>
          <div className="mt-3 flex items-center justify-center space-x-1.5">
            <span className="rounded bg-[#0F2B48] px-2.5 py-0.5 font-extrabold text-sm text-white tracking-wide">Vignesh</span>
            <span className="rounded bg-[#52A636] px-2.5 py-0.5 font-extrabold text-sm text-white tracking-wide">Associates</span>
          </div>
          <h2 className="mt-2 text-xl font-extrabold text-[#0F2B48]">Auditor ERP Portal</h2>
          <p className="mt-1 text-xs font-medium text-slate-500">Sign in to manage GST, Audit, Ledger & Client Tasks</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-600 border border-rose-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white/80 p-3 shadow-xs transition focus-within:border-[#52A636] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#52A636]/20">
              <Mail className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none font-medium"
                placeholder="superadmin@vigneshassociates.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#52A636] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="flex items-center rounded-xl border border-slate-200 bg-white/80 p-3 shadow-xs transition focus-within:border-[#52A636] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#52A636]/20">
              <Lock className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-xs text-slate-800 outline-none font-medium"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 text-slate-400 hover:text-slate-600 focus:outline-none shrink-0"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#52A636] py-3 text-xs font-bold text-white shadow-lg shadow-[#52A636]/25 transition hover:bg-[#438A2B] hover:shadow-xl active:scale-[0.99] disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to ERP Portal'}</span>
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-slate-500">
          Need an ERP account?{' '}
          <Link to="/register" className="font-bold text-[#0F2B48] hover:text-[#52A636] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
