import React from 'react';
import { X, ShieldCheck, UserCheck, ChevronDown, Layers, Building2, Briefcase, Plus, ArrowRight } from 'lucide-react';

const OrgChartModal = ({ isOpen, onClose, users = [], onAssignTask }) => {
  if (!isOpen) return null;

  // Find Super Admin (Top level node)
  const superAdmins = users.filter((u) => u.role === 'Super Admin') || [];
  const sainath = superAdmins.find((u) => u.name.toLowerCase().includes('sainath')) || superAdmins[0] || {
    name: 'Sainath',
    designation: 'Founder & MD',
    role: 'Super Admin',
    department: 'Management'
  };

  // Level 1 Admins
  const deptAdmins = users.filter((u) => u.role === 'Admin') || [];

  // Helper to get staff under an admin
  const getStaffUnderAdmin = (adminId, deptName) => {
    return users.filter((u) => {
      if (u.role === 'Super Admin' || u.role === 'Admin') return false;
      if (u.reportsTo && (u.reportsTo._id === adminId || u.reportsTo === adminId)) return true;
      if (deptName && u.department === deptName) return true;
      return false;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="rounded-md bg-[#0F2B48] px-2 py-0.5 text-[10px] font-extrabold text-white uppercase">Hierarchy View</span>
              <h2 className="text-xl font-extrabold text-[#0F2B48]">Organization Chart & Reporting Structure</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Super Admin assigns tasks to Admins • Admins assign tasks to Staff (GST, Income Tax & Accounts Executives)
            </p>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Dynamic Interactive Org Tree */}
        <div className="py-8 px-4 flex flex-col items-center bg-gradient-to-b from-slate-50/50 via-white to-slate-50/80 rounded-2xl my-4 border border-slate-200/60 shadow-inner min-w-[700px]">
          
          {/* LEVEL 0: TOP SUPER ADMIN NODE (Sainath - Founder & MD) */}
          <div className="flex flex-col items-center relative group">
            <div className="relative overflow-hidden rounded-2xl bg-[#0F2B48] p-4 text-white shadow-xl border-2 border-[#52A636] w-64 text-center">
              <div className="absolute top-2 right-2">
                <span className="rounded-full bg-[#52A636] px-2 py-0.5 text-[9px] font-extrabold text-white uppercase shadow-xs">
                  SUPER ADMIN
                </span>
              </div>
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#52A636] text-xl font-extrabold text-white shadow-md border border-white/30">
                {sainath.name ? sainath.name[0] : 'S'}
              </div>
              <h3 className="text-base font-extrabold text-white leading-snug">{sainath.name}</h3>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">({sainath.designation || 'Founder & MD'})</p>
              
              {onAssignTask && (
                <button
                  onClick={() => onAssignTask(sainath)}
                  className="mt-3 w-full flex items-center justify-center space-x-1 rounded-xl bg-[#52A636] px-3 py-2 text-[11px] font-extrabold text-white shadow-sm hover:bg-[#438A2B] transition cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Assign Task to Admin</span>
                </button>
              )}
            </div>

            {/* Connecting Vertical Line from Super Admin to Level 1 */}
            <div className="h-10 w-0.5 bg-slate-300 my-1"></div>
          </div>

          {/* LEVEL 1: DEPARTMENT ADMINS / MANAGERS ROW */}
          <div className="w-full flex flex-col items-center">
            {/* Horizontal Connecting Bar across Admins */}
            <div className="w-3/4 h-0.5 bg-slate-300"></div>

            <div className="grid grid-cols-3 gap-6 w-full pt-4">
              {deptAdmins.map((admin) => {
                const staffList = getStaffUnderAdmin(admin._id, admin.department);
                
                return (
                  <div key={admin._id} className="flex flex-col items-center">
                    {/* Vertical Connector to Horizontal Line */}
                    <div className="h-4 w-0.5 bg-slate-300 -mt-4 mb-1"></div>

                    {/* Admin Card */}
                    <div className="glacier-card w-full rounded-2xl bg-white p-4 shadow-md border border-slate-200 hover:border-[#0F2B48] transition text-center relative group">
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-md bg-[#0F2B48]/10 px-2 py-0.5 text-[10px] font-bold text-[#0F2B48]">
                          {admin.department} Dept Lead
                        </span>
                        <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold text-white uppercase">
                          ADMIN
                        </span>
                      </div>

                      <h4 className="text-sm font-extrabold text-slate-800">{admin.name}</h4>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        ({admin.designation || `${admin.department} Manager`})
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-500">
                        <span>Staff Team: <strong className="text-slate-800">{staffList.length} Executives</strong></span>
                        {onAssignTask && (
                          <button
                            onClick={() => onAssignTask(admin)}
                            className="flex items-center space-x-1 rounded bg-[#52A636] px-2 py-1 text-white font-bold hover:bg-[#438A2B] transition"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Assign</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Connector Line to Staff Execs */}
                    {staffList.length > 0 && <div className="h-8 w-0.5 bg-slate-300 my-1"></div>}

                    {/* LEVEL 2: STAFF EXECUTIVES UNDER THIS ADMIN */}
                    <div className="w-full space-y-2.5">
                      {staffList.map((staff) => (
                        <div
                          key={staff._id}
                          className="glacier-card rounded-xl bg-slate-50/90 p-3 shadow-xs border border-slate-200 hover:bg-white hover:shadow-sm transition flex items-center justify-between"
                        >
                          <div>
                            <h5 className="text-xs font-bold text-slate-800">{staff.name}</h5>
                            <p className="text-[10px] font-medium text-[#52A636]">
                              ({staff.designation || staff.role})
                            </p>
                          </div>
                          {onAssignTask && (
                            <button
                              onClick={() => onAssignTask(staff)}
                              title={`Assign task to ${staff.name}`}
                              className="rounded-lg bg-slate-200/80 hover:bg-[#52A636] hover:text-white p-1 text-slate-700 transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Legend & Summary Footer */}
        <div className="mt-4 flex flex-wrap items-center justify-between rounded-2xl bg-slate-100/80 p-3 text-xs text-slate-600 border border-slate-200">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-[#0F2B48]">Workflow Rules:</span>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0F2B48]"></span>
              <span>Super Admin assigns ➔ Admin</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#52A636]"></span>
              <span>Admin assigns ➔ Executives (GST, IT, Accounts)</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#0F2B48] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#1A3A5E]"
          >
            Close Chart View
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrgChartModal;
