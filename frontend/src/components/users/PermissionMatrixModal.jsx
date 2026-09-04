import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  User,
  Users,
  Save,
  RotateCcw,
  CheckSquare,
  Square,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Lock,
  Unlock,
  Building2,
  Briefcase
} from 'lucide-react';
import api from '../../services/api';

const SYSTEM_MODULES = [
  'Dashboard',
  'Task Board',
  'Clients',
  'Certification Status',
  'Billing & Invoices',
  'Client Ledger',
  'GST Filing',
  'Income Tax',
  'Accounts',
  'Registration Portal',
  'Reports & Analytics',
  'User Management',
  'Settings'
];

const STANDARD_ROLES = [
  'Admin',
  'Department Admin',
  'GST Admin',
  'Income Tax Admin',
  'Accounts Admin',
  'Registration Admin',
  'Book Keeping Admin',
  'GST Executive',
  'Income Tax Executive',
  'Accounts Executive',
  'Registration Executive',
  'Book Keeping Executive',
  'GST Team',
  'IT Filing Team',
  'Book Keeping Team',
  'Registration Team'
];

const ACTIONS = [
  { key: 'view', label: 'View' },
  { key: 'create', label: 'Create' },
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
  { key: 'approve', label: 'Approve' },
  { key: 'export', label: 'Export' }
];

const getDefaultModulesState = (roleName = 'Admin') => {
  const isGlobalAdmin = roleName === 'Admin' || roleName === 'Super Admin';
  const isDeptAdmin = roleName.includes('Admin');

  const initialState = {};
  SYSTEM_MODULES.forEach((mod) => {
    if (isGlobalAdmin) {
      initialState[mod] = {
        view: true,
        create: true,
        edit: true,
        delete: mod !== 'Settings',
        approve: true,
        export: true
      };
    } else if (isDeptAdmin) {
      initialState[mod] = {
        view: true,
        create: true,
        edit: true,
        delete: false,
        approve: true,
        export: true
      };
    } else {
      // Executive / Staff baseline
      initialState[mod] = {
        view: true,
        create: ['Task Board', 'GST Filing', 'Income Tax', 'Accounts', 'Registration Portal'].includes(mod),
        edit: ['Task Board', 'GST Filing', 'Income Tax', 'Accounts', 'Registration Portal'].includes(mod),
        delete: false,
        approve: false,
        export: ['Reports & Analytics', 'Task Board'].includes(mod)
      };
    }
  });
  return initialState;
};

const PermissionMatrixModal = ({ isOpen, onClose, users = [], defaultUserId = null }) => {
  const [configMode, setConfigMode] = useState('role'); // 'role' | 'user'
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [selectedUserId, setSelectedUserId] = useState(defaultUserId || '');
  const [userSearch, setUserSearch] = useState('');

  const [allPermissions, setAllPermissions] = useState([]);
  const [allUsers, setAllUsers] = useState(users || []);
  const [modulesState, setModulesState] = useState(() => getDefaultModulesState('Admin'));

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // When defaultUserId changes or modal opens with a user specified
  useEffect(() => {
    if (defaultUserId) {
      setSelectedUserId(defaultUserId);
      setConfigMode('user');
    }
  }, [defaultUserId, isOpen]);

  // Fetch all permissions & users on modal open
  const fetchAllData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const [permRes, usersRes] = await Promise.all([
        api.get('/users/permissions'),
        users && users.length > 0 ? Promise.resolve({ data: users }) : api.get('/users')
      ]);

      const fetchedPerms = permRes.data || [];
      const fetchedUsers = usersRes.data || [];

      setAllPermissions(fetchedPerms);
      setAllUsers(fetchedUsers);

      if (fetchedUsers.length > 0 && !selectedUserId) {
        // Default to first non-superadmin or first user
        const staffUser = fetchedUsers.find((u) => u.role !== 'Super Admin') || fetchedUsers[0];
        if (staffUser) setSelectedUserId(staffUser._id);
      }
    } catch (err) {
      console.error('Failed to load permission matrix data:', err);
      setErrorMsg('Failed to fetch permissions from server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAllData();
    }
  }, [isOpen]);

  // Selected User Object
  const selectedUserObj = useMemo(() => {
    return allUsers.find((u) => u._id === selectedUserId) || null;
  }, [allUsers, selectedUserId]);

  // Check if selected user has custom permission override
  const userCustomOverride = useMemo(() => {
    if (!selectedUserId) return null;
    return allPermissions.find((p) => p.targetType === 'user' && (p.user?._id === selectedUserId || p.user === selectedUserId));
  }, [allPermissions, selectedUserId]);

  // Load active permissions whenever configMode, selectedRole, or selectedUserId changes
  useEffect(() => {
    if (!isOpen) return;

    if (configMode === 'role') {
      const rolePerm = allPermissions.find((p) => (p.targetType === 'role' || !p.targetType) && p.role === selectedRole);
      if (rolePerm && rolePerm.modules) {
        const raw = rolePerm.modules instanceof Map ? Object.fromEntries(rolePerm.modules) : rolePerm.modules;
        setModulesState(hydrateModules(raw, selectedRole));
      } else {
        setModulesState(getDefaultModulesState(selectedRole));
      }
    } else if (configMode === 'user' && selectedUserObj) {
      if (userCustomOverride && userCustomOverride.modules) {
        const raw = userCustomOverride.modules instanceof Map ? Object.fromEntries(userCustomOverride.modules) : userCustomOverride.modules;
        setModulesState(hydrateModules(raw, selectedUserObj.role));
      } else {
        // Fallback to user's role permissions
        const userRole = selectedUserObj.role || 'GST Executive';
        const rolePerm = allPermissions.find((p) => (p.targetType === 'role' || !p.targetType) && p.role === userRole);
        if (rolePerm && rolePerm.modules) {
          const raw = rolePerm.modules instanceof Map ? Object.fromEntries(rolePerm.modules) : rolePerm.modules;
          setModulesState(hydrateModules(raw, userRole));
        } else {
          setModulesState(getDefaultModulesState(userRole));
        }
      }
    }
  }, [configMode, selectedRole, selectedUserId, allPermissions, userCustomOverride, selectedUserObj, isOpen]);

  const hydrateModules = (rawModules, roleContext) => {
    const defaultState = getDefaultModulesState(roleContext);
    const result = { ...defaultState };

    SYSTEM_MODULES.forEach((mod) => {
      if (rawModules && rawModules[mod]) {
        result[mod] = {
          view: rawModules[mod].view !== undefined ? Boolean(rawModules[mod].view) : true,
          create: Boolean(rawModules[mod].create),
          edit: Boolean(rawModules[mod].edit),
          delete: Boolean(rawModules[mod].delete),
          approve: Boolean(rawModules[mod].approve),
          export: Boolean(rawModules[mod].export)
        };
      }
    });
    return result;
  };

  if (!isOpen) return null;

  // Checkbox toggle
  const handleToggle = (moduleName, action) => {
    setModulesState((prev) => ({
      ...prev,
      [moduleName]: {
        ...prev[moduleName],
        [action]: !prev[moduleName]?.[action]
      }
    }));
  };

  // Toggle all actions for a specific module row
  const handleToggleRow = (moduleName) => {
    const current = modulesState[moduleName] || {};
    const allChecked = ACTIONS.every((act) => current[act.key]);
    const newState = !allChecked;

    setModulesState((prev) => ({
      ...prev,
      [moduleName]: {
        view: newState,
        create: newState,
        edit: newState,
        delete: newState,
        approve: newState,
        export: newState
      }
    }));
  };

  // Toggle entire column across all modules
  const handleToggleColumn = (actionKey) => {
    const allColChecked = SYSTEM_MODULES.every((mod) => modulesState[mod]?.[actionKey]);
    const nextVal = !allColChecked;

    setModulesState((prev) => {
      const updated = { ...prev };
      SYSTEM_MODULES.forEach((mod) => {
        updated[mod] = {
          ...updated[mod],
          [actionKey]: nextVal
        };
      });
      return updated;
    });
  };

  // Grant Full Access across all modules
  const handleGrantFull = () => {
    const updated = {};
    SYSTEM_MODULES.forEach((mod) => {
      updated[mod] = { view: true, create: true, edit: true, delete: true, approve: true, export: true };
    });
    setModulesState(updated);
  };

  // Grant View-Only across all modules
  const handleGrantViewOnly = () => {
    const updated = {};
    SYSTEM_MODULES.forEach((mod) => {
      updated[mod] = { view: true, create: false, edit: false, delete: false, approve: false, export: false };
    });
    setModulesState(updated);
  };

  // Save Permissions
  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    setErrorMsg('');

    try {
      let payload;
      if (configMode === 'role') {
        payload = {
          targetType: 'role',
          role: selectedRole,
          modules: modulesState
        };
      } else {
        if (!selectedUserId) {
          setErrorMsg('Please select a user first');
          setSaving(false);
          return;
        }
        payload = {
          targetType: 'user',
          userId: selectedUserId,
          modules: modulesState
        };
      }

      const res = await api.put('/users/permissions', payload);
      setMessage(res.data.message || 'Permissions updated successfully');

      // Refresh permissions list
      const permRes = await api.get('/users/permissions');
      setAllPermissions(permRes.data || []);
    } catch (err) {
      console.error('Failed to save permissions:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Reset User Specific Permissions to Role Defaults
  const handleResetUserToRoleDefaults = async () => {
    if (!selectedUserId) return;
    if (!window.confirm(`Are you sure you want to revert ${selectedUserObj?.name}'s custom permissions back to their default Role (${selectedUserObj?.role}) permissions?`)) {
      return;
    }

    setSaving(true);
    setMessage('');
    setErrorMsg('');

    try {
      const res = await api.delete(`/users/permissions/user/${selectedUserId}`);
      setMessage(res.data.message || 'User permissions reset to role defaults');

      // Refresh permissions list
      const permRes = await api.get('/users/permissions');
      setAllPermissions(permRes.data || []);
    } catch (err) {
      console.error('Failed to reset user permissions:', err);
      setErrorMsg('Failed to reset user permissions');
    } finally {
      setSaving(false);
    }
  };

  // Filtered Users for Dropdown / Search
  const filteredUsers = allUsers.filter((u) => {
    if (u.role === 'Super Admin') return false; // Super admin has global bypass
    const q = userSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q)) ||
      (u.department && u.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white p-4 sm:p-6 shadow-2xl border border-slate-100 max-h-[94vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A1E3F] text-[#52A636] shadow-md">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="rounded bg-[#52A636] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase tracking-wider">
                  Super Admin
                </span>
                <h3 className="text-base sm:text-lg font-bold text-[#0A1E3F]">
                  Page Permission & Access Management
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure module-level View, Create, Edit, Delete, Approve, and Export access <strong className="text-[#0A1E3F]">Role-wise</strong> or <strong className="text-[#52A636]">User-wise (Name-wise)</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Feedback Banners */}
        {message && (
          <div className="mt-3 flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mt-3 flex items-center space-x-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mode Selector Tabs (Role-wise vs User-wise) */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
          <div className="flex items-center space-x-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-xs">
            <button
              type="button"
              onClick={() => setConfigMode('role')}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                configMode === 'role'
                  ? 'bg-[#0A1E3F] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4 text-[#52A636]" />
              <span>Role-Wise Permissions</span>
            </button>
            <button
              type="button"
              onClick={() => setConfigMode('user')}
              className={`flex items-center space-x-2 rounded-lg px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
                configMode === 'user'
                  ? 'bg-[#52A636] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <User className="h-4 w-4 text-white" />
              <span>User Name-Wise Permissions</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleGrantFull}
              className="flex items-center space-x-1 rounded-xl bg-slate-200/70 hover:bg-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition cursor-pointer"
              title="Check all permissions"
            >
              <Unlock className="h-3.5 w-3.5 text-emerald-600" />
              <span>Grant All</span>
            </button>
            <button
              type="button"
              onClick={handleGrantViewOnly}
              className="flex items-center space-x-1 rounded-xl bg-slate-200/70 hover:bg-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 transition cursor-pointer"
              title="View only for all"
            >
              <Lock className="h-3.5 w-3.5 text-amber-600" />
              <span>View-Only</span>
            </button>
          </div>
        </div>

        {/* Dynamic Selection Bar (Role or User) */}
        <div className="mt-3 p-3 bg-slate-50/60 rounded-2xl border border-slate-200/60">
          {configMode === 'role' ? (
            /* Role Selector */
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center space-x-1.5">
                  <Briefcase className="h-4 w-4 text-[#0A1E3F]" />
                  <span>Select Target Role:</span>
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A1E3F] shadow-xs outline-none focus:border-[#52A636] cursor-pointer min-w-[200px]"
                >
                  {STANDARD_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Editing baseline permissions for all employees with role: <strong className="text-[#0A1E3F] font-bold">{selectedRole}</strong>
              </span>
            </div>
          ) : (
            /* User Name Selector */
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-1 items-center space-x-3">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap flex items-center space-x-1.5">
                    <User className="h-4 w-4 text-[#52A636]" />
                    <span>Select Specific User:</span>
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="flex-1 max-w-md rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A1E3F] shadow-xs outline-none focus:border-[#52A636] cursor-pointer"
                  >
                    <option value="">-- Choose User / Employee --</option>
                    {filteredUsers.map((u) => {
                      const hasOverride = allPermissions.some(
                        (p) => p.targetType === 'user' && (p.user?._id === u._id || p.user === u._id)
                      );
                      return (
                        <option key={u._id} value={u._id}>
                          {u.name} ({u.role} - {u.department || 'General'}) {hasOverride ? '⚡ [Custom]' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* User Status Badges & Revert Action */}
                {selectedUserObj && (
                  <div className="flex items-center space-x-2">
                    {userCustomOverride ? (
                      <>
                        <span className="inline-flex items-center space-x-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                          <Sparkles className="h-3 w-3 text-emerald-600" />
                          <span>Custom Override Active</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleResetUserToRoleDefaults}
                          disabled={saving}
                          className="flex items-center space-x-1 rounded-xl border border-slate-300 bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 px-2.5 py-1.5 text-[11px] font-bold text-slate-600 transition cursor-pointer"
                          title="Delete custom user permissions and revert to role default"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Revert to Role Default</span>
                        </button>
                      </>
                    ) : (
                      <span className="inline-flex items-center space-x-1 rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-bold text-blue-800">
                        <Users className="h-3 w-3 text-blue-600" />
                        <span>Inheriting Role Default ({selectedUserObj.role})</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              {selectedUserObj && (
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-100">
                  <span>Name: <strong className="text-[#0A1E3F] font-bold">{selectedUserObj.name}</strong></span>
                  <span>Email: <strong className="text-slate-700">{selectedUserObj.email}</strong></span>
                  <span>Base Role: <strong className="text-[#52A636] font-bold">{selectedUserObj.role}</strong></span>
                  <span>Dept: <strong className="text-slate-700">{selectedUserObj.department || 'N/A'}</strong></span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Permissions Table */}
        <div className="mt-3 flex-1 overflow-y-auto overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 z-20 bg-[#0A1E3F] text-white shadow-xs">
              <tr>
                <th className="p-3 font-bold text-left min-w-[180px]">
                  Page / System Module
                </th>
                {ACTIONS.map((act) => (
                  <th key={act.key} className="p-3 text-center min-w-[75px]">
                    <button
                      type="button"
                      onClick={() => handleToggleColumn(act.key)}
                      className="inline-flex items-center space-x-1 font-bold text-white hover:text-[#52A636] transition cursor-pointer"
                      title={`Toggle ${act.label} for all modules`}
                    >
                      <span>{act.label}</span>
                    </button>
                  </th>
                ))}
                <th className="p-3 text-center min-w-[90px] font-bold">
                  Quick Row
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {SYSTEM_MODULES.map((mod, idx) => {
                const isRowAll = ACTIONS.every((act) => modulesState[mod]?.[act.key]);
                const isRowNone = ACTIONS.every((act) => !modulesState[mod]?.[act.key]);

                return (
                  <tr
                    key={mod}
                    className={`transition hover:bg-slate-50/80 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'
                    }`}
                  >
                    <td className="p-3 font-bold text-[#0A1E3F]">
                      <div className="flex items-center space-x-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#52A636]"></span>
                        <span>{mod}</span>
                      </div>
                    </td>

                    {ACTIONS.map((act) => {
                      const isChecked = Boolean(modulesState[mod]?.[act.key]);
                      return (
                        <td key={act.key} className="p-3 text-center">
                          <label className="inline-flex items-center justify-center cursor-pointer p-1">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggle(mod, act.key)}
                              className="h-4 w-4 rounded border-slate-300 text-[#52A636] focus:ring-[#52A636] accent-[#52A636] cursor-pointer"
                            />
                          </label>
                        </td>
                      );
                    })}

                    {/* Row Quick Toggle */}
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleRow(mod)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-extrabold transition cursor-pointer border ${
                          isRowAll
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : isRowNone
                            ? 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                        }`}
                        title="Toggle all permissions for this page"
                      >
                        {isRowAll ? 'All ON' : isRowNone ? 'All OFF' : 'Partial'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer Actions */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div className="text-xs text-slate-500">
            {configMode === 'role' ? (
              <span>Saving will apply to all current and future users with role: <strong className="text-[#0A1E3F]">{selectedRole}</strong></span>
            ) : (
              <span>Saving will apply custom direct overrides for: <strong className="text-[#52A636]">{selectedUserObj?.name || 'Selected User'}</strong></span>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || (configMode === 'user' && !selectedUserId)}
              className="flex items-center justify-center space-x-2 rounded-xl bg-[#52A636] px-6 py-2.5 text-xs font-extrabold text-white shadow-md transition hover:bg-[#438A2B] disabled:opacity-50 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>
                {saving
                  ? 'Saving Matrix...'
                  : configMode === 'role'
                  ? `Save Permissions for ${selectedRole}`
                  : `Save Permissions for ${selectedUserObj?.name || 'User'}`}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PermissionMatrixModal;
