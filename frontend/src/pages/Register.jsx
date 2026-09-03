import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Lock, Building2, CheckCircle2, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'GST Executive',
    department: 'GST'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [error, setError] = useState('');
  const { register, loading } = useAuth();

  const getRoleOptionsForDept = (dept) => {
    switch (dept) {
      case 'GST':
        return [
          { value: 'GST Executive', label: 'GST Executive' },
          { value: 'GST Admin', label: 'GST Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Income Tax':
        return [
          { value: 'Income Tax Executive', label: 'Income Tax Executive' },
          { value: 'Income Tax Admin', label: 'Income Tax Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Accounts':
        return [
          { value: 'Accounts Executive', label: 'Accounts Executive' },
          { value: 'Accounts Admin', label: 'Accounts Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Registration':
        return [
          { value: 'Registration Executive', label: 'Registration Executive' },
          { value: 'Registration Admin', label: 'Registration Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Book Keeping':
        return [
          { value: 'Book Keeping Executive', label: 'Book Keeping Executive' },
          { value: 'Book Keeping Admin', label: 'Book Keeping Department Admin (Lead)' },
          { value: 'Admin', label: 'Department Admin' }
        ];
      case 'Administration':
        return [
          { value: 'Admin', label: 'Administration Manager (Admin)' },
          { value: 'Department Admin', label: 'Department Admin' },
          { value: 'Super Admin', label: 'Super Admin' }
        ];
      default:
        return [
          { value: 'Admin', label: 'Department Admin' },
          { value: 'GST Executive', label: 'Executive' }
        ];
    }
  };

  const handleDepartmentSelect = (e) => {
    const newDept = e.target.value;
    const defaultRoles = getRoleOptionsForDept(newDept);
    setFormData({
      ...formData,
      department: newDept,
      role: defaultRoles[0].value
    });
  };

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
    <div className="flex min-h-screen items-center justify-center bg-[#07152B] bg-[url('/login_bg.jpg')] bg-cover bg-center bg-no-repeat p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[#07152B]/75 backdrop-blur-xs"></div>
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-xl border border-white/60">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-2xl bg-white p-1 shadow-md overflow-hidden border border-slate-200">
            <img src="/logo.jpg" alt="Vignesh Associates Logo" className="h-full w-full object-contain rounded-xl" />
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <span className="rounded bg-[#0F2B48] px-2.5 py-0.5 font-extrabold text-sm text-white tracking-wide">Vignesh</span>
            <span className="rounded bg-[#52A636] px-2.5 py-0.5 font-extrabold text-sm text-white tracking-wide">Associates</span>
          </div>
          <h2 className="mt-2 text-xl font-bold text-slate-800">Staff Account Registration</h2>
          <p className="mt-1 text-xs text-slate-500">Requires Admin approval before login access</p>
        </div>

        {successMsg && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 border border-emerald-200 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
            {successMsg}
            <div className="mt-3">
              <Link to="/login" className="rounded-lg bg-[#0A1E3F] px-4 py-1.5 text-white text-xs font-medium border border-[#C59B27]/30">
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
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
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
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
                placeholder="staff@royalaccounting.co.in"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#C59B27] focus:ring-1 focus:ring-[#C59B27]"
                placeholder="+91 99943 60994"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-700">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleDepartmentSelect}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-[#0A1E3F] outline-none focus:border-[#C59B27]"
                >
                  <option value="GST">GST</option>
                  <option value="Income Tax">Income Tax</option>
                  <option value="Accounts">Accounts</option>
                  <option value="Book Keeping">Book Keeping</option>
                  <option value="Registration">Registration</option>
                  <option value="Administration">Administration</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs font-semibold text-[#0A1E3F] outline-none focus:border-[#C59B27]"
                >
                  {getRoleOptionsForDept(formData.department).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700">Password *</label>
              <div className="mt-1 flex items-center rounded-xl border border-slate-200 bg-white p-2 text-xs focus-within:border-[#C59B27] focus-within:ring-1 focus-within:ring-[#C59B27]">
                <Lock className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full bg-transparent text-xs text-slate-800 outline-none"
                  placeholder="Enter account password"
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
              className="w-full rounded-xl bg-gradient-to-r from-[#0A1E3F] to-[#0E2A59] py-3 text-xs font-bold text-white shadow-lg shadow-[#0A1E3F]/25 border border-[#C59B27]/30 transition hover:from-[#07152B] hover:to-[#0A1E3F]"
            >
              {loading ? 'Submitting Registration...' : 'Register Account'}
            </button>
          </form>
        )}

        <p className="mt-5 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#0A1E3F] hover:text-[#C59B27] hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
