import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Building2, CheckCircle2 } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'GST Team',
    department: 'GST'
  });
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const res = await register(formData);
    if (res.success) {
      setSuccessMsg(res.message);
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="glacier-card w-full max-w-md rounded-3xl p-8 shadow-2xl border border-slate-200">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-1.5">
            <span className="rounded bg-[#0F2B48] px-2 py-0.5 font-extrabold text-sm text-white">Vignesh</span>
            <span className="rounded bg-[#52A636] px-2 py-0.5 font-extrabold text-sm text-white">Associates</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-800">Staff Account Registration</h2>
          <p className="mt-1 text-xs text-slate-500">Requires Admin approval before login access</p>
        </div>

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            {successMsg}
            <div className="mt-3">
              <Link to="/login" className="rounded-lg bg-[#0F2B48] px-4 py-1.5 text-white text-xs font-medium">
                Return to Login
              </Link>
            </div>
          </div>
        )}

        {error && <div className="mt-4 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">{error}</div>}

        {!successMsg && (
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-700">Full Name *</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                placeholder="e.g. Suresh Kumar"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Email Address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                placeholder="suresh@vigneshassociates.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                >
                  <option>GST</option>
                  <option>Book Keeping</option>
                  <option>IT Filing</option>
                  <option>Registration</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
                >
                  <option>GST Team</option>
                  <option>Book Keeping Team</option>
                  <option>IT Filing Team</option>
                  <option>Registration Team</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Password *</label>
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#52A636] py-3 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
            >
              {loading ? 'Submitting Registration...' : 'Register Account'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#0F2B48] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
