import React from 'react';

const StatCard = ({ title, value, icon: Icon, color = 'navy', trend, subtitle }) => {
  const colorMap = {
    navy: 'bg-[#0A1E3F] text-white',
    green: 'bg-[#C59B27] text-white',
    amber: 'bg-amber-500 text-white',
    rose: 'bg-rose-500 text-white',
    blue: 'bg-blue-600 text-white'
  };

  return (
    <div className="glacier-card glacier-card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <h4 className="mt-1 text-2xl font-bold text-slate-800 tracking-tight">{value}</h4>
          {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-md ${colorMap[color] || colorMap.navy}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center text-xs font-medium text-emerald-600">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
