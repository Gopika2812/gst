import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Award,
  Receipt,
  BookOpen,
  KanbanSquare,
  FileCheck,
  Calculator,
  FileSpreadsheet,
  Building2,
  BarChart3,
  ShieldAlert,
  UserCheck,
  Settings,
  X
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', path: '/clients', icon: Users },
    { name: 'Certification Status', path: '/certification', icon: Award },
    { name: 'Billing & Invoices', path: '/billing', icon: Receipt },
    { name: 'Client Ledger', path: '/ledger', icon: BookOpen },
    { name: 'Task Board', path: '/tasks', icon: KanbanSquare },

    // Department Portals Section
    { section: 'DEPARTMENT PORTALS' },
    { name: 'GST Filing', path: '/gst-filing', icon: FileCheck },
    { name: 'Book Keeping', path: '/bookkeeping', icon: Calculator },
    { name: 'IT Filing', path: '/it-filing', icon: FileSpreadsheet },
    { name: 'Registration', path: '/registration-portal', icon: Building2 },

    // Management Section
    { section: 'REPORTS & ADMIN' },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
    { name: 'User Management', path: '/users', icon: UserCheck, roles: ['Super Admin', 'Admin'] },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, roles: ['Super Admin'] },
    { name: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`glacier-sidebar fixed top-0 left-0 z-50 flex h-screen w-64 flex-col border-r border-slate-800 text-slate-300 shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header & Logo Graphic */}
        <div className="flex h-20 items-center justify-between border-b border-slate-700/60 px-5">
          <div className="flex items-center space-x-3">
            {/* Logo Graphic */}
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white p-0.5 shadow-md overflow-hidden border border-slate-700/50">
              <img src="/logo.jpg" alt="Vignesh Associates Logo" className="h-full w-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <span className="rounded bg-[#0F2B48] px-1.5 py-0.5 font-bold text-xs text-white border border-slate-600">Vignesh</span>
                <span className="rounded bg-[#52A636] px-1.5 py-0.5 font-bold text-xs text-white">Associates</span>
              </div>
              <p className="mt-0.5 text-[10px] tracking-wider text-slate-400 font-medium uppercase">Auditor ERP System</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onClose}
            className="lg:hidden rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={idx} className="pt-4 pb-1 px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                  {item.section}
                </div>
              );
            }

            // Check role restrictions
            if (item.roles && user && !item.roles.includes(user.role)) {
              return null;
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center space-x-3 rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-[#52A636] text-white font-semibold shadow-md shadow-[#52A636]/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer System Status */}
        <div className="border-t border-slate-700/60 p-4">
          <div className="flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-xs">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-medium text-slate-300">Live API Server</span>
            </div>
            <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">v1.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
