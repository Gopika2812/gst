import React from 'react';

const Badge = ({ status, text }) => {
  const label = text || status;
  let style = 'bg-slate-100 text-slate-700 border-slate-200';

  if (['Paid', 'Approved', 'Active', 'Completed', 'Filed', 'Yes'].includes(status)) {
    style = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (['Pending', 'Waiting For Certificate', 'Pending Approval', 'In Progress', 'Partial'].includes(status)) {
    style = 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (['Overdue', 'Critical', 'Rejected', 'Deactivated', 'Suspended', 'High'].includes(status)) {
    style = 'bg-rose-50 text-rose-700 border-rose-200';
  } else if (['GST', 'Book Keeping', 'IT Filing', 'Registration'].includes(status)) {
    style = 'bg-blue-50 text-blue-700 border-blue-200';
  }

  return (
    <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-[11px] font-semibold transition ${style}`}>
      {label}
    </span>
  );
};

export default Badge;
