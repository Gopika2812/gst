import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Download, CheckCircle2, Clock, AlertTriangle, XCircle, FileText, User, Building2, Receipt, Phone, Mail, Sparkles, CheckSquare, ArrowRight } from 'lucide-react';
import { exportToCSV } from '../../utils/exportUtils';
import InvoiceModal from '../billing/InvoiceModal';

const CardDetailModal = ({ isOpen, onClose, modalData, onRefresh, clients = [], employees = [] }) => {
  const [search, setSearch] = useState('');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceInitialData, setInvoiceInitialData] = useState(null);

  const handleOpenInvoice = (task) => {
    const clientId = task.client?._id || task.client || '';
    setInvoiceInitialData({
      client: clientId,
      clientId: clientId,
      clientObj: task.client,
      serviceType: task.taskName || task.department || 'GST Filing GSTR-3B & GSTR-1',
      department: task.department || 'GST',
      taskName: task.taskName,
      items: [
        {
          description: `${task.taskName || task.department || 'Professional Service'} Fee`,
          amount: 5000
        }
      ],
      remarks: task.remarks ? `Billing for completed task: ${task.taskName} - ${task.remarks}` : `Billing for completed task: ${task.taskName}`,
      moveToTaskAssignment: false
    });
    setIsInvoiceModalOpen(true);
  };

  if (!isOpen || !modalData) return null;

  const { title, subtitle, type, items = [] } = modalData;

  const filteredItems = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    const servicesStr = Array.isArray(item.servicesRequested) ? item.servicesRequested.join(' ') : (item.servicesRequested || '');
    return (
      item.client?.clientName?.toLowerCase().includes(q) ||
      item.clientName?.toLowerCase().includes(q) ||
      item.leadName?.toLowerCase().includes(q) ||
      item.phone?.toLowerCase().includes(q) ||
      item.email?.toLowerCase().includes(q) ||
      item.notes?.toLowerCase().includes(q) ||
      servicesStr.toLowerCase().includes(q) ||
      item.taskName?.toLowerCase().includes(q) ||
      item.serviceType?.toLowerCase().includes(q) ||
      item.certificateType?.toLowerCase().includes(q) ||
      item.department?.toLowerCase().includes(q) ||
      item.assignedEmployee?.name?.toLowerCase().includes(q) ||
      item.assignedTo?.name?.toLowerCase().includes(q) ||
      item.createdBy?.name?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.invoiceNumber?.toLowerCase().includes(q)
    );
  });

  const handleExport = () => {
    let headers = {};
    if (type === 'tasks') {
      headers = {
        'client.clientName': 'Client Name',
        'client.gstin': 'GSTIN',
        taskName: 'Service / Task Name',
        department: 'Department',
        'assignedEmployee.name': 'Assigned Executive',
        dueDate: 'Due Date',
        priority: 'Priority',
        status: 'Status'
      };
    } else if (type === 'invoices') {
      headers = {
        invoiceNumber: 'Invoice #',
        'client.clientName': 'Client Name',
        serviceType: 'Service Type',
        total: 'Total (₹)',
        paidAmount: 'Paid (₹)',
        pendingAmount: 'Pending (₹)',
        paymentStatus: 'Payment Status',
        'assignedEmployee.name': 'Assigned Executive'
      };
    } else if (type === 'clients') {
      headers = {
        clientName: 'Client Name',
        tradeName: 'Trade Name',
        gstin: 'GSTIN',
        pan: 'PAN',
        phone: 'Phone',
        status: 'Status',
        'responsibleEmployee.name': 'Responsible Staff'
      };
    } else if (type === 'certifications') {
      headers = {
        'client.clientName': 'Client Name',
        certificateType: 'Certificate / Service',
        department: 'Department',
        status: 'Status',
        'assignedEmployee.name': 'Assigned Staff'
      };
    } else if (type === 'enquiries') {
      headers = {
        leadName: 'Lead Name',
        phone: 'Phone',
        email: 'Email',
        servicesRequested: 'Services Requested',
        priority: 'Priority',
        status: 'Status',
        'convertedTask.taskName': 'Converted Task',
        'createdBy.name': 'Created By',
        'assignedTo.name': 'Assigned Executive',
        createdAt: 'Created Date'
      };
    }

    exportToCSV(`RoyalAccounting_${title.replace(/\s+/g, '_')}`, filteredItems, headers);
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/70 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-3xl bg-white p-5 sm:p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-extrabold text-[#0A1E3F]">{title}</h3>
              <span className="rounded-full bg-[#0A1E3F] px-2.5 py-0.5 text-xs font-bold text-white shadow-2xs">
                {filteredItems.length} Records
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer shadow-2xs"
            >
              <Download className="h-3.5 w-3.5 text-[#52A636]" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="py-3 shrink-0">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs">
            <Search className="mr-2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, phone, email, service, department, executive or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-xs outline-none font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-y-auto overflow-x-auto rounded-xl border border-slate-200 grow">
          <table className="w-full text-left text-xs min-w-[750px]">
            <thead className="bg-[#0A1E3F] text-white sticky top-0 z-10">
              {type === 'enquiries' && (
                <tr>
                  <th className="p-3 font-semibold">Lead / Client Name</th>
                  <th className="p-3 font-semibold">Phone & Contact</th>
                  <th className="p-3 font-semibold">Services Requested</th>
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold">Created Date</th>
                  <th className="p-3 font-semibold">Task Conversion / Assignee</th>
                </tr>
              )}
              {type === 'tasks' && (
                <tr>
                  <th className="p-3 font-semibold">Client Name</th>
                  <th className="p-3 font-semibold">Service / Task Name</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Assigned Executive</th>
                  <th className="p-3 font-semibold">Due Date</th>
                  <th className="p-3 font-semibold">Priority</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              )}
              {type === 'invoices' && (
                <tr>
                  <th className="p-3 font-semibold">Invoice #</th>
                  <th className="p-3 font-semibold">Client Name</th>
                  <th className="p-3 font-semibold">Service Type</th>
                  <th className="p-3 font-semibold">Total (₹)</th>
                  <th className="p-3 font-semibold">Paid (₹)</th>
                  <th className="p-3 font-semibold">Pending (₹)</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              )}
              {type === 'clients' && (
                <tr>
                  <th className="p-3 font-semibold">Client Name</th>
                  <th className="p-3 font-semibold">Trade Name</th>
                  <th className="p-3 font-semibold">GSTIN / PAN</th>
                  <th className="p-3 font-semibold">Contact Phone</th>
                  <th className="p-3 font-semibold">Responsible Staff</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              )}
              {type === 'certifications' && (
                <tr>
                  <th className="p-3 font-semibold">Client Name</th>
                  <th className="p-3 font-semibold">Certificate / Service Type</th>
                  <th className="p-3 font-semibold">Department</th>
                  <th className="p-3 font-semibold">Assigned Staff</th>
                  <th className="p-3 font-semibold">Status</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No records found matching this card criteria
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, idx) => {
                  if (type === 'enquiries') {
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[#0A1E3F]">{item.leadName}</span>
                          </div>
                          {item.notes && (
                            <p className="text-[10px] text-slate-400 font-normal line-clamp-1 mt-0.5">{item.notes}</p>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="space-y-0.5">
                            {item.phone && (
                              <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                                <Phone className="h-3 w-3 text-[#52A636]" />
                                <span>{item.phone}</span>
                              </div>
                            )}
                            {item.email && (
                              <div className="flex items-center space-x-1 text-slate-400 text-[10px]">
                                <Mail className="h-2.5 w-2.5" />
                                <span className="truncate max-w-[140px]">{item.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {Array.isArray(item.servicesRequested) && item.servicesRequested.length > 0 ? (
                              item.servicesRequested.map((srv, sIdx) => (
                                <span key={sIdx} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[9px] border border-blue-100">
                                  {srv}
                                </span>
                              ))
                            ) : (
                              <span className="text-slate-400 text-[10px]">{item.serviceType || 'General Consultation'}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                            item.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                            item.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.priority || 'Medium'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Converted' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'In Discussion' || item.status === 'In Progress' ? 'bg-amber-100 text-amber-800' :
                            item.status === 'Closed' || item.status === 'Completed' ? 'bg-slate-100 text-slate-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {item.status || 'New'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700 block">
                            {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                          </span>
                          {item.createdBy?.name && (
                            <span className="text-[10px] text-slate-400">By {item.createdBy.name}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {item.convertedTask ? (
                            <div className="flex items-center space-x-1 text-[11px] font-bold text-emerald-700">
                              <CheckSquare className="h-3.5 w-3.5" />
                              <span>Task Created</span>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] font-medium">
                              {item.assignedTo?.name || 'Unassigned'}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  }

                  if (type === 'tasks') {
                    const isOverdue =
                      new Date(item.dueDate) < new Date() &&
                      item.status !== 'Completed' &&
                      item.status !== "Can't Complete";
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">
                          {item.client?.clientName || 'General Task'}
                          {item.client?.tradeName && (
                            <span className="block text-[10px] font-normal text-slate-400">{item.client.tradeName}</span>
                          )}
                        </td>
                        <td className="p-3 font-semibold text-[#0A1E3F]">{item.taskName}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[10px]">
                            {item.department}
                          </span>
                        </td>
                        <td className="p-3 font-medium text-slate-700">
                          {item.assignedEmployee?.name || 'Unassigned'}
                        </td>
                        <td className="p-3">
                          <span className="font-semibold text-slate-700">
                            {new Date(item.dueDate).toLocaleDateString('en-IN')}
                          </span>
                          {isOverdue && (
                            <span className="ml-1.5 text-[9px] font-extrabold text-rose-600 bg-rose-100 px-1 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                            item.priority === 'High' ? 'bg-amber-100 text-amber-800' :
                            item.priority === 'Medium' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              item.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                              item.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                              item.status === "Can't Complete" ? 'bg-rose-100 text-rose-800' :
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {item.status}
                            </span>
                            {item.status === 'Completed' && (
                              <button
                                type="button"
                                onClick={() => handleOpenInvoice(item)}
                                title={item.client?.clientName ? `Generate Bill / Invoice for ${item.client.clientName}` : 'Generate Bill / Invoice'}
                                className="inline-flex items-center space-x-1 rounded-lg bg-gradient-to-r from-amber-500 to-[#52A636] hover:from-amber-600 hover:to-[#438A2B] text-white px-2 py-0.5 text-[10px] font-extrabold shadow-2xs hover:shadow-xs transition transform hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                              >
                                <Receipt className="h-3 w-3" />
                                <span>Make Bill</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  if (type === 'invoices') {
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-mono font-bold text-[#0A1E3F]">{item.invoiceNumber}</td>
                        <td className="p-3 font-bold text-slate-800">{item.client?.clientName || 'Valued Client'}</td>
                        <td className="p-3 font-semibold text-slate-600">{item.serviceType}</td>
                        <td className="p-3 font-extrabold text-[#52A636]">₹{item.total?.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-semibold text-emerald-600">₹{item.paidAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-3 font-semibold text-rose-600">₹{item.pendingAmount?.toLocaleString('en-IN')}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                            item.paymentStatus === 'Partial' ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {item.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (type === 'clients') {
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{item.clientName}</td>
                        <td className="p-3 text-slate-600">{item.tradeName || '-'}</td>
                        <td className="p-3 font-mono text-[11px] text-slate-700">
                          {item.gstin ? (
                            <span className="font-bold text-slate-800">{item.gstin}</span>
                          ) : (
                            item.pan || 'N/A'
                          )}
                        </td>
                        <td className="p-3 text-slate-600">{item.phone || '-'}</td>
                        <td className="p-3 font-medium text-slate-700">
                          {item.responsibleEmployee?.name || 'Unassigned'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  if (type === 'certifications') {
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{item.client?.clientName || 'Client'}</td>
                        <td className="p-3 font-semibold text-[#0A1E3F]">{item.certificateType}</td>
                        <td className="p-3 font-medium text-slate-600">{item.department || 'Registration'}</td>
                        <td className="p-3 text-slate-700">{item.assignedEmployee?.name || 'Assigned Staff'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  }

                  return null;
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3 shrink-0">
          <span className="text-xs text-slate-400">Click anywhere outside or press Close to dismiss</span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#0A1E3F] px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>

      {/* Invoice Generation Modal */}
      {isInvoiceModalOpen && (
        <InvoiceModal
          isOpen={isInvoiceModalOpen}
          onClose={() => {
            setIsInvoiceModalOpen(false);
            setInvoiceInitialData(null);
          }}
          onRefresh={() => {
            if (onRefresh) onRefresh();
          }}
          clients={clients}
          employees={employees}
          initialData={invoiceInitialData}
        />
      )}
    </div>
  );

  return ReactDOM.createPortal(modalContent, document.body);
};

export default CardDetailModal;
