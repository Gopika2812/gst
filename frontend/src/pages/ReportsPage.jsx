import React, { useState, useEffect } from 'react';
import GlacierCard from '../components/common/GlacierCard';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import api from '../services/api';
import { BarChart3, Download, Printer, Users, Award, Receipt, ShieldCheck } from 'lucide-react';

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState('employee');
  const [performanceData, setPerformanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const res = await api.get('/reports/employee-performance');
        setPerformanceData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleExportCSV = () => {
    const csvRows = [];
    csvRows.push(['Employee Name', 'Department', 'Assigned Tasks', 'Completed', 'Pending', 'Overdue', 'Completion Rate %'].join(','));

    performanceData.forEach((p) => {
      csvRows.push([
        `"${p.employee?.name}"`,
        `"${p.employee?.department}"`,
        p.assigned,
        p.completed,
        p.pending,
        p.overdue,
        `${p.completionRate}%`
      ].join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Vignesh_Associates_Employee_Performance_Report.csv`);
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Export Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#0F2B48]">Reports & Business Intelligence</h1>
          <p className="text-xs text-slate-500">Client reports, GST filing metrics, revenue performance & staff matrix</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 rounded-xl bg-[#0F2B48] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#1A3A5E]"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-1.5 rounded-xl bg-[#52A636] px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-[#438A2B]"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 rounded-2xl bg-slate-200/70 p-1">
        {[
          { id: 'employee', name: 'Employee Performance' },
          { id: 'gst', name: 'GST Filing Summary' },
          { id: 'revenue', name: 'Revenue & Outstanding' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-white text-[#0F2B48] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Employee Performance Matrix Table */}
      <GlacierCard className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-bold text-slate-800 text-sm">Staff Productivity & Task Completion Rate</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F2B48] text-white">
              <tr>
                <th className="p-3.5 font-semibold">Employee Name</th>
                <th className="p-3.5 font-semibold">Role & Department</th>
                <th className="p-3.5 font-semibold text-center">Assigned Tasks</th>
                <th className="p-3.5 font-semibold text-center">Completed</th>
                <th className="p-3.5 font-semibold text-center">Pending</th>
                <th className="p-3.5 font-semibold text-center">Overdue</th>
                <th className="p-3.5 font-semibold text-center">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">Loading performance data...</td>
                </tr>
              ) : (
                performanceData.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-800">{p.employee?.name}</td>
                    <td className="p-3.5 text-slate-600">
                      {p.employee?.role} ({p.employee?.department})
                    </td>
                    <td className="p-3.5 text-center font-bold text-slate-800">{p.assigned}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">{p.completed}</td>
                    <td className="p-3.5 text-center font-bold text-amber-600">{p.pending}</td>
                    <td className="p-3.5 text-center font-bold text-rose-600">{p.overdue}</td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#52A636] h-full"
                            style={{ width: `${p.completionRate}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-[#52A636] text-xs">{p.completionRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlacierCard>
    </div>
  );
};

export default ReportsPage;
