import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const SortableHeader = ({ label, sortKey, currentSort, onSort, align = 'left', className = '' }) => {
  const isSorted = currentSort?.key === sortKey;
  const direction = currentSort?.direction;

  return (
    <th
      onClick={() => onSort(sortKey)}
      className={`p-3.5 font-semibold text-white cursor-pointer select-none transition hover:bg-[#152e59] group ${
        align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
      } ${className}`}
    >
      <div className={`inline-flex items-center space-x-1.5 ${align === 'right' ? 'justify-end w-full' : align === 'center' ? 'justify-center w-full' : 'justify-start'}`}>
        <span>{label}</span>
        <span className="shrink-0">
          {isSorted ? (
            direction === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-[#52A636]" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-[#52A636]" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-amber-300" />
          )}
        </span>
      </div>
    </th>
  );
};

export const sortTableData = (data = [], sortConfig = { key: null, direction: 'asc' }) => {
  if (!sortConfig || !sortConfig.key || !Array.isArray(data)) return data;

  const { key, direction } = sortConfig;

  return [...data].sort((a, b) => {
    let aVal = key.split('.').reduce((o, i) => (o ? o[i] : null), a);
    let bVal = key.split('.').reduce((o, i) => (o ? o[i] : null), b);

    if (aVal === null || aVal === undefined) aVal = '';
    if (bVal === null || bVal === undefined) bVal = '';

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return direction === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (!isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean' && aVal !== '' && bVal !== '') {
      return direction === 'asc' ? aNum - bNum : bNum - aNum;
    }

    const aDate = Date.parse(aVal);
    const bDate = Date.parse(bVal);
    if (!isNaN(aDate) && !isNaN(bDate) && typeof aVal === 'string' && aVal.length > 8 && isNaN(Number(aVal))) {
      return direction === 'asc' ? aDate - bDate : bDate - aDate;
    }

    return direction === 'asc'
      ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' })
      : String(bVal).localeCompare(String(aVal), undefined, { numeric: true, sensitivity: 'base' });
  });
};
