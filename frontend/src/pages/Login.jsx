import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('superadmin@vigneshassociates.com');
  const [password, setPassword] = useState('admin123');
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
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="glacier-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white p-1 shadow-md overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Vignesh Associates Logo" className="h-full w-full object-cover rounded-xl" />
          </div>
          <div className="mt-3 flex items-center justify-center space-x-1.5">
            <span className="rounded bg-[#0F2B48] px-2 py-0.5 font-extrabold text-sm text-white">Vignesh</span>
            <span className="rounded bg-[#52A636] px-2 py-0.5 font-extrabold text-sm text-white">Associates</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-800">Auditor ERP Portal</h2>
          <p className="mt-1 text-xs text-slate-500">Sign in to manage GST, Audit, Ledger & Client Tasks</p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700">Email Address</label>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs focus-within:border-[#52A636]">
              <Mail className="mr-2 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
                placeholder="user@vigneshassociates.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-xs font-semibold text-[#52A636] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white p-2.5 shadow-xs focus-within:border-[#52A636]">
              <Lock className="mr-2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-800 outline-none"
              />
            </div>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="rounded-xl bg-slate-100/80 p-2.5 text-[11px] text-slate-600 space-y-1">
            <p className="font-semibold text-slate-700">Quick Login:</p>
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => { setEmail('superadmin@vigneshassociates.com'); setPassword('admin123'); }}
                className="rounded bg-white px-2 py-0.5 border text-[10px] hover:bg-slate-50 font-medium"
              >
                Super Admin (Default)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#52A636] py-3 text-xs font-semibold text-white shadow-lg transition hover:bg-[#438A2B]"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to ERP Portal'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Need an ERP account?{' '}
          <Link to="/register" className="font-semibold text-[#0F2B48] hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
