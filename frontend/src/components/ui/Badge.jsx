import React from 'react';

const statusConfig = {
  'New Lead':       { bg: '#fef3c7', text: '#92400e', dot: '#f59e0b' },
  'Profile Review': { bg: '#ede9fe', text: '#5b21b6', dot: '#7c3aed' },
  'Searching':      { bg: '#dbeafe', text: '#1e40af', dot: '#3b82f6' },
  'Match Sent':     { bg: '#fff7ed', text: '#9a3412', dot: '#dc9e4a' },
  'Matched':        { bg: '#dcfce7', text: '#14532d', dot: '#16a34a' },
  'Inactive':       { bg: '#f1f5f9', text: '#475569', dot: '#94a3b8' },
};

export const Badge = ({ children, status, className = '' }) => {
  const config = statusConfig[status] || { bg: '#fdfbf7', text: '#244c3c', dot: '#dc9e4a' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide ${className}`}
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: config.dot }} />
      {children}
    </span>
  );
};
