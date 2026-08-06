import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      setMsg(res.data.message);
    } catch (err) {
      setMsg('Error dispatching reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="glacier-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#0F2B48]">Reset Password</h2>
          <p className="mt-1 text-xs text-slate-500">Enter your registered email address to receive reset link</p>
        </div>

        {msg ? (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs font-medium text-emerald-700 border border-emerald-200 text-center">
            <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            {msg}
            <div className="mt-3">
              <Link to="/login" className="font-semibold text-[#0F2B48] underline">
                Return to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs outline-none focus:border-[#52A636]"
                placeholder="user@vigneshassociates.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#52A636] py-3 text-xs font-semibold text-white shadow-md hover:bg-[#438A2B]"
            >
              {loading ? 'Sending Link...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
