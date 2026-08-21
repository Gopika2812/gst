import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import Badge from '../components/common/Badge';
import PermissionMatrixModal from '../components/users/PermissionMatrixModal';
import UserModal from '../components/users/UserModal';
import OrgChartModal from '../components/users/OrgChartModal';
import TaskModal from '../components/tasks/TaskModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { UserCheck, ShieldCheck, CheckCircle2, XCircle, Power, Lock, Search, Pencil, Trash2, UserPlus, Network, Plus } from 'lucide-react';

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'Super Admin';

  const [users, setUsers] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isPermModalOpen, setIsPermModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOrgChartOpen, setIsOrgChartOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [preselectedAssignee, setPreselectedAssignee] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [userRes, clientRes] = await Promise.all([
        api.get('/users', { params: { search, status: statusFilter } }),
        api.get('/clients')
      ]);
      setUsers(userRes.data);
      setClients(clientRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter]);

  const handleCreateUser = () => {
    setSelectedUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (userToEdit) => {
    setSelectedUser(userToEdit);
    setIsUserModalOpen(true);
  };

  const handleAssignTaskFromChart = (targetUser) => {
    setPreselectedAssignee(targetUser);
    setIsTaskModalOpen(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleApprove = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`);
      fetchUsers();
    } catch (err) {
      alert('Failed to approve user');
    }
  };

  const handleReject = async (userId) => {
    try {
      await api.put(`/users/${userId}/reject`);
      fetchUsers();
    } catch (err) {
      alert('Failed to reject user');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/users/${userId}/toggle-status`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update staff status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-[#0F2B48]">User Management & Approval System</h1>
          <p className="text-xs text-slate-500">Super Admin assigns tasks to Admins • Admins assign tasks to Staffs (GST, IT, Accounts)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsOrgChartOpen(true)}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#0F2B48] px-3.5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#1A3A5E]"
          >
            <Network className="h-4 w-4 text-[#52A636]" />
            <span>Org Chart & Hierarchy</span>
          </button>

          <button
            onClick={handleCreateUser}
            className="flex items-center justify-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add New User</span>
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setIsPermModalOpen(true)}
              className="flex items-center justify-center space-x-1.5 rounded-xl bg-slate-800 px-3.5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-slate-700"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Permission Matrix</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <GlacierCard className="p-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex w-full sm:w-80 items-center rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Search className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search User Name, Email, Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto rounded-xl border border-slate-200 bg-white p-2 text-xs font-medium text-slate-700 outline-none"
            >
              <option value="">All Account Statuses</option>
              <option value="Pending Approval">Pending Approval</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Deactivated">Deactivated</option>
            </select>
          </div>
        </div>
      </GlacierCard>

      {/* User Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">User Name & Email</th>
                <th className="p-3.5 font-semibold">Role</th>
                <th className="p-3.5 font-semibold">Department</th>
                <th className="p-3.5 font-semibold">Phone</th>
                <th className="p-3.5 font-semibold">Status</th>
                <th className="p-3.5 font-semibold">Last Login</th>
                <th className="p-3.5 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading user accounts...</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800">{u.name}</p>
                      <p className="text-[10px] text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="rounded bg-[#0F2B48]/10 px-2 py-0.5 font-bold text-[#0F2B48] text-[10px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3.5 font-semibold text-slate-700">{u.department}</td>
                    <td className="p-3.5 text-slate-600">{u.phone || 'N/A'}</td>
                    <td className="p-3.5">
                      <Badge status={u.status} />
                    </td>
                    <td className="p-3.5 text-slate-500">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-IN') : 'Never'}
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => handleEditUser(u)}
                          title="Edit User Details"
                          className="rounded-lg p-1.5 font-semibold text-xs text-blue-600 hover:bg-blue-50 transition"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {u.status === 'Pending Approval' ? (
                          <>
                            <button
                              onClick={() => handleApprove(u._id)}
                              title="Approve User Registration"
                              className="flex items-center space-x-1 rounded-lg bg-[#52A636] px-2 py-1 text-white font-semibold text-[10px] hover:bg-[#438A2B]"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleReject(u._id)}
                              title="Reject User Registration"
                              className="flex items-center space-x-1 rounded-lg bg-rose-600 px-2 py-1 text-white font-semibold text-[10px] hover:bg-rose-700"
                            >
                              <XCircle className="h-3 w-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(u._id)}
                            title={u.status === 'Deactivated' ? 'Reactivate Staff' : 'Deactivate Staff (Prevents login)'}
                            className={`rounded-lg p-1.5 font-semibold text-xs ${
                              u.status === 'Deactivated' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'
                            }`}
                          >
                            <Power className="h-4 w-4" />
                          </button>
                        )}

                        {isSuperAdmin && u.email !== 'superadmin@vigneshassociates.com' && (
                          <button
                            onClick={() => handleDeleteUser(u._id, u.name)}
                            title="Delete User Account"
                            className="rounded-lg p-1.5 font-semibold text-xs text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={selectedUser}
        onSave={fetchUsers}
        allUsers={users}
      />

      <OrgChartModal
        isOpen={isOrgChartOpen}
        onClose={() => setIsOrgChartOpen(false)}
        users={users}
        onAssignTask={handleAssignTaskFromChart}
      />

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setPreselectedAssignee(null);
        }}
        onRefresh={fetchUsers}
        clients={clients}
        employees={users}
        defaultAssignee={preselectedAssignee}
      />

      <PermissionMatrixModal
        isOpen={isPermModalOpen}
        onClose={() => setIsPermModalOpen(false)}
      />
    </div>
  );
};

export default UserManagementPage;

