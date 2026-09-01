import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, ShieldCheck, CheckSquare } from 'lucide-react';
import api from '../../services/api';

const InvoiceModal = ({ isOpen, onClose, onRefresh, clients = [], employees = [], invoice = null }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [serviceType, setServiceType] = useState('GST Filing GSTR-3B & GSTR-1');
  const [items, setItems] = useState([{ description: 'GST Monthly Filing Fee', amount: 5000 }]);
  const [gstPercent, setGstPercent] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [remarks, setRemarks] = useState('');
  const [moveToTaskAssignment, setMoveToTaskAssignment] = useState(true);

  // Task Assignment to Group & Person
  const [assignedGroup, setAssignedGroup] = useState('GST');
  const [assignedEmployee, setAssignedEmployee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [taskPriority, setTaskPriority] = useState('High');

  const [localEmployees, setLocalEmployees] = useState(employees);

  useEffect(() => {
    if (employees && employees.length > 0) {
      setLocalEmployees(employees);
    } else if (isOpen) {
      api.get('/users').then((res) => setLocalEmployees(res.data)).catch(console.error);
    }

    if (isOpen) {
      if (invoice) {
        setSelectedClient(invoice.client?._id || invoice.client || '');
        setServiceType(invoice.serviceType || 'GST Filing GSTR-3B & GSTR-1');
        setItems(invoice.items?.length ? invoice.items : [{ description: invoice.serviceType || 'Service', amount: invoice.subTotal || 0 }]);
        setGstPercent(0);
        setDiscount(invoice.discount || 0);
        setPaidAmount(invoice.paidAmount || 0);
        setPaymentMode(invoice.paymentMode || 'Bank Transfer');
        setRemarks(invoice.remarks || '');
        setMoveToTaskAssignment(false);
      } else {
        setSelectedClient('');
        setServiceType('GST Filing GSTR-3B & GSTR-1');
        setItems([{ description: 'GST Monthly Filing Fee', amount: 5000 }]);
        setGstPercent(0);
        setDiscount(0);
        setPaidAmount(0);
        setPaymentMode('Bank Transfer');
        setRemarks('');
        setMoveToTaskAssignment(true);
      }
    }
  }, [isOpen, employees, invoice]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems([...items, { description: '', amount: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = field === 'amount' ? Number(value) : value;
    setItems(newItems);
  };

  const currentClient = clients.find((c) => c._id === selectedClient);

  const handleClientChange = (clientId) => {
    setSelectedClient(clientId);
    const clientObj = clients.find((c) => c._id === clientId);
    if (clientObj) {
      if (clientObj.responsibleEmployee) {
        setAssignedEmployee(clientObj.responsibleEmployee._id || clientObj.responsibleEmployee);
      }

      if (clientObj.subscribedServices && clientObj.subscribedServices.length > 0) {
        const primaryService = clientObj.subscribedServices[0].subServiceName || clientObj.subscribedServices[0].serviceName;
        setServiceType(primaryService);

        const dept = clientObj.subscribedServices[0].department;
        if (dept) setAssignedGroup(dept);

        setItems(
          clientObj.subscribedServices.map((s) => ({
            description: `${s.subServiceName || s.serviceName} Fee`,
            amount: 5000
          }))
        );
      }
    }
  };

  const filteredEmployees = localEmployees.filter((emp) => {
    if (!assignedGroup) return true;
    return (
      emp.department === assignedGroup ||
      emp.role?.toLowerCase().includes(assignedGroup.toLowerCase()) ||
      emp.role === 'Super Admin'
    );
  });

  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const total = Math.max(0, subTotal - Number(discount));
  const pendingAmount = Math.max(0, total - Number(paidAmount));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClient) {
      setError('Please select a client');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (invoice) {
        await api.put(`/invoices/${invoice._id}`, {
          serviceType,
          items,
          subTotal,
          gstPercent: 0,
          gstAmount: 0,
          discount,
          total,
          paidAmount,
          paymentMode,
          remarks
        });
      } else {
        await api.post('/invoices', {
          client: selectedClient,
          serviceType,
          items,
          subTotal,
          gstPercent: 0,
          gstAmount: 0,
          discount,
          total,
          paidAmount,
          paymentMode,
          remarks,
          moveToTaskAssignment,
          assignedGroup,
          assignedEmployee,
          taskDueDate,
          taskPriority
        });
      }

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || (invoice ? 'Failed to update invoice' : 'Failed to generate invoice'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0A1E3F]">{invoice ? `Edit Tax Invoice (${invoice.invoiceNumber})` : 'Generate Tax Invoice (Module 3)'}</h3>
            <p className="text-xs text-slate-500">{invoice ? 'Update invoice amounts, items, and payment status' : 'Auto-calculate balances, ledgers, and push to task workflow'}</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <div className="mt-3 rounded-xl bg-rose-50 p-3 text-xs font-medium text-rose-600 border border-rose-200">{error}</div>}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Client & Service Selection */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Select Client *</label>
              <select
                required
                value={selectedClient}
                onChange={(e) => handleClientChange(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#C59B27]"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.clientName} ({c.gstin || c.pan || 'Active'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Service Category *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#C59B27]"
              >
                {currentClient?.subscribedServices && currentClient.subscribedServices.length > 0 && (
                  <optgroup label="Client Subscribed Services (From Registration)">
                    {currentClient.subscribedServices.map((s, idx) => (
                      <option key={idx} value={s.subServiceName || s.serviceName}>
                        {s.subServiceName || s.serviceName} ({s.department})
                      </option>
                    ))}
                    {currentClient.subscribedServices.length > 1 && (
                      <option value={currentClient.subscribedServices.map((s) => s.subServiceName).join(' & ')}>
                        All: {currentClient.subscribedServices.map((s) => s.subServiceName).join(' & ')}
                      </option>
                    )}
                  </optgroup>
                )}
                <optgroup label="Standard Service Categories">
                  <option>GST Filing GSTR-3B & GSTR-1</option>
                  <option>Monthly Book Keeping & Reconciliation</option>
                  <option>Income Tax Return & Tax Audit</option>
                  <option>Registration & Certification Service</option>
                  <option>Annual Audit & Advisory</option>
                </optgroup>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl border border-slate-200/80 p-3 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#0A1E3F] uppercase tracking-wider">Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-xs font-semibold text-[#C59B27] hover:underline cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#C59B27]"
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={item.amount}
                    onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                    className="flex-1 sm:w-32 rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#C59B27]"
                  />
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Summary & Payment Controls Box */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 bg-slate-100/70 p-4 rounded-xl">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                placeholder="0"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Payment Mode</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#C59B27] cursor-pointer"
              >
                <option value="Bank Transfer">Bank Transfer / NEFT</option>
                <option value="UPI">UPI Payment</option>
                <option value="Cash">Cash</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Amount Paid (₹)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                placeholder="0"
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#C59B27]"
              />
            </div>
          </div>

          {/* Calculation Display */}
          <div className="rounded-xl bg-[#0A1E3F] p-4 text-white flex flex-col sm:flex-row justify-between sm:items-center gap-2 shadow-lg">
            <div>
              <p className="text-xs text-slate-300">
                Subtotal: ₹{subTotal.toLocaleString('en-IN')}
                {discount > 0 && <span className="text-amber-300 font-semibold"> | Discount: ₹{discount.toLocaleString('en-IN')}</span>}
              </p>
              <p className="text-xs text-amber-400 mt-0.5 font-bold">Pending Balance: ₹{pendingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Total Payable</span>
              <span className="text-2xl font-extrabold text-[#C59B27]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Task Assignment Bridge Section */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3.5 space-y-3">
            <div className="flex items-center space-x-2 text-emerald-900">
              <input
                type="checkbox"
                id="moveToTask"
                checked={moveToTaskAssignment}
                onChange={(e) => setMoveToTaskAssignment(e.target.checked)}
                className="h-4 w-4 rounded accent-[#C59B27] cursor-pointer"
              />
              <label htmlFor="moveToTask" className="text-xs font-bold cursor-pointer">
                Move To Task Assignment (Auto-assign task to Group & Staff)
              </label>
            </div>

            {moveToTaskAssignment && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-200/60 text-xs">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Assign Group / Department *</label>
                  <select
                    value={assignedGroup}
                    onChange={(e) => setAssignedGroup(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#C59B27]"
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
                  <label className="text-[11px] font-bold text-slate-700">Assign Person / Executive *</label>
                  <select
                    value={assignedEmployee}
                    onChange={(e) => setAssignedEmployee(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#C59B27]"
                  >
                    <option value="">-- Choose Person / Executive --</option>
                    {filteredEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.designation || emp.role} - {emp.department})
                      </option>
                    ))}
                    {filteredEmployees.length === 0 && localEmployees.map((emp) => (
                      <option key={emp._id} value={emp._id}>
                        {emp.name} ({emp.designation || emp.role} - {emp.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Task Due Date *</label>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#C59B27]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700">Priority</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold text-slate-800 outline-none focus:border-[#C59B27]"
                  >
                    <option value="High">High Priority</option>
                    <option value="Critical">Critical</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#C59B27] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#A68018] cursor-pointer disabled:opacity-50"
            >
              {loading ? (invoice ? 'Saving Changes...' : 'Generating...') : (invoice ? 'Update Tax Invoice' : 'Generate Tax Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
