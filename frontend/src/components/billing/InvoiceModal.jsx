import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ArrowRight, ShieldCheck, CheckSquare } from 'lucide-react';
import api from '../../services/api';

const InvoiceModal = ({ isOpen, onClose, onRefresh, clients = [] }) => {
  const [selectedClient, setSelectedClient] = useState('');
  const [serviceType, setServiceType] = useState('GST Filing GSTR-3B & GSTR-1');
  const [items, setItems] = useState([{ description: 'GST Monthly Filing Fee', amount: 5000 }]);
  const [gstPercent, setGstPercent] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState('Bank Transfer');
  const [remarks, setRemarks] = useState('');
  const [moveToTaskAssignment, setMoveToTaskAssignment] = useState(true);

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

  const subTotal = items.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const gstAmount = Math.round((subTotal * gstPercent) / 100);
  const total = Math.max(0, subTotal + gstAmount - Number(discount));
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
      await api.post('/invoices', {
        client: selectedClient,
        serviceType,
        items,
        subTotal,
        gstPercent,
        gstAmount,
        discount,
        total,
        paidAmount,
        paymentMode,
        remarks,
        moveToTaskAssignment
      });

      onRefresh && onRefresh();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#0F2B48]">Generate Tax Invoice (Module 3)</h3>
            <p className="text-xs text-slate-500">Auto-calculate taxes, ledgers, and push to task workflow</p>
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
                onChange={(e) => setSelectedClient(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.clientName} ({c.gstin || c.pan || 'No GST'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Service Category *</label>
              <select
                value={serviceType}
                onChange={(e) => setServiceType(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs outline-none focus:border-[#52A636]"
              >
                <option>GST Filing GSTR-3B & GSTR-1</option>
                <option>Monthly Book Keeping & Reconciliation</option>
                <option>Income Tax Return & Tax Audit</option>
                <option>Registration & Certification Service</option>
                <option>Annual Audit & Advisory</option>
              </select>
            </div>
          </div>

          {/* Line Items */}
          <div className="rounded-xl border border-slate-200/80 p-3 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#0F2B48] uppercase tracking-wider">Line Items</h4>
              <button
                type="button"
                onClick={handleAddItem}
                className="flex items-center space-x-1 text-xs font-semibold text-[#52A636] hover:underline"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Item</span>
              </button>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
                />
                <input
                  type="number"
                  placeholder="Amount (₹)"
                  value={item.amount}
                  onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                  className="w-32 rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none focus:border-[#52A636]"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Summary Box */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 bg-slate-100/70 p-4 rounded-xl">
            <div>
              <label className="text-[11px] font-semibold text-slate-600">GST %</label>
              <select
                value={gstPercent}
                onChange={(e) => setGstPercent(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
              >
                <option value={18}>18% (Standard GST)</option>
                <option value={12}>12% GST</option>
                <option value={5}>5% GST</option>
                <option value={0}>0% (Exempted)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Discount (₹)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
              >
              </input>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600">Amount Paid (₹)</label>
              <input
                type="number"
                value={paidAmount}
                onChange={(e) => setPaidAmount(Number(e.target.value))}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none"
              />
            </div>
          </div>

          {/* Calculation Display */}
          <div className="rounded-xl bg-[#0F2B48] p-4 text-white flex justify-between items-center shadow-lg">
            <div>
              <p className="text-xs text-slate-300">Subtotal: ₹{subTotal.toLocaleString('en-IN')} | GST: ₹{gstAmount.toLocaleString('en-IN')}</p>
              <p className="text-xs text-amber-400 mt-0.5">Pending Balance: ₹{pendingAmount.toLocaleString('en-IN')}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Total Payable</span>
              <span className="text-2xl font-extrabold text-[#52A636]">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Feature Bridge Checkbox */}
          <div className="flex items-center space-x-2 rounded-xl bg-emerald-50 p-3 border border-emerald-200 text-emerald-800">
            <input
              type="checkbox"
              id="moveToTask"
              checked={moveToTaskAssignment}
              onChange={(e) => setMoveToTaskAssignment(e.target.checked)}
              className="h-4 w-4 rounded accent-[#52A636]"
            />
            <label htmlFor="moveToTask" className="text-xs font-semibold cursor-pointer">
              Move To Task Assignment (Automatically make client available in Task Assignment queue)
            </label>
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
              className="rounded-xl bg-[#52A636] px-5 py-2 text-xs font-semibold text-white shadow-md transition hover:bg-[#438A2B]"
            >
              {loading ? 'Generating...' : 'Generate Tax Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceModal;
