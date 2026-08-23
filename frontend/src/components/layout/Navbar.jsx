import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Bell, Search, User, LogOut, ShieldCheck, ChevronDown, CheckCircle2, AlertTriangle, Calendar, Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

const Navbar = ({ onSearchChange, globalSearch, onToggleMobileMenu, isSidebarCollapsed }) => {
  const { user, logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const mockNotifications = [
    { id: 1, title: 'GST Filing Due Soon', text: 'GSTR-3B for Apex Logistics due on 20th', time: '10m ago', icon: AlertTriangle, type: 'warning' },
    { id: 2, title: 'Certificate Received', text: 'Green Leaf GST certificate uploaded', time: '1h ago', icon: CheckCircle2, type: 'success' },
    { id: 3, title: 'New Invoice Generated', text: 'INV-2026-0001 created for ₹17,700', time: '3h ago', icon: Calendar, type: 'info' }
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-3 sm:px-6 backdrop-blur-md">
      <div className="flex items-center flex-1 pr-2">
        {/* Sidebar Toggle Button (Desktop & Mobile) */}
        <button
          onClick={onToggleMobileMenu}
          className="mr-2 sm:mr-3 rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-[#0F2B48] flex items-center justify-center"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label="Toggle sidebar menu"
        >
          {isSidebarCollapsed ? (
            <PanelLeftOpen className="h-5 w-5 hidden lg:block text-[#52A636]" />
          ) : (
            <PanelLeftClose className="h-5 w-5 hidden lg:block text-slate-600" />
          )}
          <Menu className="h-5 w-5 lg:hidden" />
        </button>

        {/* Global Search Bar */}
        <div className="flex w-full max-w-[200px] xs:max-w-xs sm:max-w-none sm:w-72 md:w-96 items-center rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 sm:py-2 transition focus-within:border-[#52A636] focus-within:bg-white focus-within:ring-2 focus-within:ring-[#52A636]/20">
          <Search className="mr-2 h-4 w-4 shrink-0 text-slate-400" />
          <input
            type="text"
            value={globalSearch || ''}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder="Search..."
            className="w-full bg-transparent text-xs sm:text-sm text-slate-700 placeholder-slate-400 outline-none"
          />
        </div>
      </div>

      {/* Right Header Controls */}
      <div className="flex items-center space-x-4">
        {/* System Date Badge */}
        <div className="hidden items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 sm:flex">
          <Calendar className="mr-1.5 h-3.5 w-3.5 text-[#0F2B48]" />
          <span>{new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-[#0F2B48]"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#52A636] opacity-75"></span>
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#52A636]"></span>
            </span>
          </button>

          {/* Notifications Popover */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">3 New</span>
              </div>
              <div className="mt-3 divide-y divide-slate-100">
                {mockNotifications.map((n) => (
                  <div key={n.id} className="py-2.5 flex items-start space-x-3 hover:bg-slate-50 rounded-lg p-1.5 transition">
                    <n.icon className={`h-4 w-4 mt-0.5 ${n.type === 'warning' ? 'text-amber-500' : n.type === 'success' ? 'text-emerald-600' : 'text-blue-500'}`} />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Card */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 rounded-xl border border-slate-200 bg-slate-50/80 p-1.5 pr-3 transition hover:bg-slate-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0F2B48] font-semibold text-xs text-white shadow-sm">
              {user?.name ? user.name.split(' ').map((n) => n[0]).join('').substring(0, 2) : 'VA'}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name || 'Vigneshwaran CA'}</p>
              <div className="flex items-center space-x-1">
                <ShieldCheck className="h-3 w-3 text-[#52A636]" />
                <span className="text-[10px] font-medium text-slate-500">{user?.role || 'Super Admin'}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="border-b border-slate-100 px-3 py-2.5">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <div className="px-3 py-1.5 text-xs text-slate-600 flex justify-between items-center">
                  <span>Department</span>
                  <span className="font-semibold text-[#0F2B48]">{user?.department || 'GST'}</span>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={logout}
                  className="flex w-full items-center space-x-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
