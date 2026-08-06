import React from 'react';

const GlacierCard = ({ children, className = '', title, subtitle, action }) => {
  return (
    <div className={`glacier-card rounded-2xl p-5 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            {title && <h3 className="font-semibold text-slate-800 text-sm">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default GlacierCard;
