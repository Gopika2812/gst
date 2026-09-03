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
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose, isCollapsed, onToggleCollapse }) => {
  const { user } = useAuth();

  const isSuperOrAdmin = user && (user.role === 'Super Admin' || (user.role && user.role.includes('Admin')));

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Task Board', path: '/tasks', icon: KanbanSquare },
    { name: 'Clients', path: '/clients', icon: Users, requireAdmin: true },
    { name: 'Certification Status', path: '/certification', icon: Award, requireAdmin: true },
    { name: 'Billing & Invoices', path: '/billing', icon: Receipt, requireAdmin: true },
    { name: 'Client Ledger', path: '/ledger', icon: BookOpen, requireAdmin: true },

    // Department Portals Section
    { section: 'DEPARTMENT PORTALS' },
    { name: 'GST Filing', path: '/gst-filing', icon: FileCheck },
    { name: 'Income Tax', path: '/it-filing', icon: FileSpreadsheet },
    { name: 'Accounts', path: '/bookkeeping', icon: Calculator },

    // Management Section
    { section: 'REPORTS & ADMIN' },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, requireAdmin: true },
    { name: 'User Management', path: '/users', icon: UserCheck, requireAdmin: true },
    { name: 'Audit Logs', path: '/audit-logs', icon: ShieldAlert, superAdminOnly: true },
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
        className={`glacier-sidebar fixed top-0 left-0 z-50 flex h-screen flex-col border-r border-slate-800/80 text-slate-300 shadow-2xl transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-64 lg:w-20' : 'w-64'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header & Logo Graphic */}
        <div className={`flex h-20 items-center border-b border-slate-700/60 px-4 ${isCollapsed ? 'justify-center lg:justify-center' : 'justify-between'}`}>
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Logo Graphic */}
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white p-0.5 shadow-md overflow-hidden border border-slate-700">
              <img src="/logo.jpg" alt="Vignesh Associates Logo" className="h-full w-full object-contain rounded-lg" />
            </div>
            <div className={`transition-opacity duration-200 ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              <div className="flex items-center space-x-1">
                <span className="rounded bg-[#07152B] px-1.5 py-0.5 font-extrabold text-xs text-white border border-slate-700">Vignesh</span>
                <span className="rounded bg-[#52A636] px-1.5 py-0.5 font-extrabold text-xs text-white">Associates</span>
              </div>
              <p className="mt-0.5 text-[10px] tracking-wider text-[#52A636] font-semibold uppercase whitespace-nowrap">AUDITOR ERP SYSTEM</p>
            </div>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className={`hidden lg:flex rounded-xl p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white ${
              isCollapsed ? 'ml-0' : ''
            }`}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </button>

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
                <React.Fragment key={idx}>
                  <div
                    className={`pt-4 pb-1 px-3 text-[10px] font-bold tracking-wider text-[#52A636] uppercase ${
                      isCollapsed ? 'lg:hidden' : 'block'
                    }`}
                  >
                    {item.section}
                  </div>
                  <div className={`my-2 border-t border-slate-700/60 hidden ${isCollapsed ? 'lg:block' : ''}`} title={item.section} />
                </React.Fragment>
              );
            }

            // Check role restrictions
            if (item.requireAdmin && !isSuperOrAdmin) {
              return null;
            }
            if (item.superAdminOnly && user?.role !== 'Super Admin') {
              return null;
            }
            if (item.roles && user && !item.roles.includes(user.role)) {
              return null;
            }

            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                title={item.name}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center rounded-xl py-2.5 text-xs font-medium transition-all ${
                    isCollapsed ? 'px-3 lg:justify-center' : 'px-3.5 space-x-3'
                  } ${
                    isActive
                      ? 'bg-[#52A636] text-white font-bold shadow-md shadow-[#52A636]/30'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={`truncate ${isCollapsed ? 'lg:hidden' : 'block'}`}>{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Footer System Status */}
        <div className="border-t border-slate-700/60 p-4">
          <div
            className={`flex items-center justify-between rounded-xl bg-slate-900/60 p-3 text-xs border border-slate-800 ${
              isCollapsed ? 'lg:justify-center lg:p-2' : ''
            }`}
            title="Live API Server v1.0"
          >
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-[#52A636] animate-pulse shrink-0"></span>
              <span className={`font-medium text-slate-300 ${isCollapsed ? 'lg:hidden' : 'block'}`}>Live API Server</span>
            </div>
            <span className={`rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-[#52A636] ${isCollapsed ? 'lg:hidden' : 'block'}`}>
              v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
