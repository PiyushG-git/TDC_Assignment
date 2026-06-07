import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="min-w-full divide-y divide-slate-200">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children }) => (
  <thead className="bg-brand-cream">
    {children}
  </thead>
);

export const TableBody = ({ children }) => (
  <tbody className="bg-white divide-y divide-slate-200">
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr 
    className={`${onClick ? 'cursor-pointer hover:bg-brand-cream transition-colors' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-sm text-slate-700 ${className}`}>
    {children}
  </td>
);
