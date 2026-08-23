import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Components
import Sidebar from './components/layout/Sidebar';
import Navbar from './components/layout/Navbar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ClientsPage from './pages/ClientsPage';
import CertificationPage from './pages/CertificationPage';
import BillingPage from './pages/BillingPage';
import LedgerPage from './pages/LedgerPage';
import TaskBoardPage from './pages/TaskBoardPage';
import GSTFilingPage from './pages/GSTFilingPage';
import BookKeepingPage from './pages/BookKeepingPage';
import ITFilingPage from './pages/ITFilingPage';
import RegistrationPage from './pages/RegistrationPage';
import ReportsPage from './pages/ReportsPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditLogsPage from './pages/AuditLogsPage';
import SettingsPage from './pages/SettingsPage';

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MainLayout = () => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });

  const toggleSidebar = () => {
    // If mobile screen (< 1024px), toggle mobile menu drawer
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen((prev) => !prev);
    } else {
      // On desktop, toggle collapse state
      setIsSidebarCollapsed((prev) => {
        const next = !prev;
        localStorage.setItem('sidebar_collapsed', String(next));
        return next;
      });
    }
  };

  const toggleDesktopCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex min-h-screen bg-[#0A1E36] bg-[url('/login_bg.jpg')] bg-cover bg-center bg-fixed relative">
      {/* Semi-transparent dark/light glassmorphic backdrop layer */}
      <div className="absolute inset-0 bg-slate-100/90 backdrop-blur-md pointer-events-none"></div>

      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleDesktopCollapse}
      />
      <div className={`relative z-10 flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <Navbar
          globalSearch={globalSearch}
          onSearchChange={setGlobalSearch}
          onToggleMobileMenu={toggleSidebar}
          isSidebarCollapsed={isSidebarCollapsed}
        />
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/certification" element={<CertificationPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/ledger" element={<LedgerPage />} />
            <Route path="/tasks" element={<TaskBoardPage />} />
            <Route path="/gst-filing" element={<GSTFilingPage />} />
            <Route path="/bookkeeping" element={<BookKeepingPage />} />
            <Route path="/it-filing" element={<ITFilingPage />} />
            <Route path="/registration-portal" element={<RegistrationPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
