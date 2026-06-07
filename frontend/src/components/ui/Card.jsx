import React from 'react';

export const Card = ({ children, className = '', ...props }) => (
  <div
    className={`bg-white rounded-2xl overflow-hidden ${className}`}
    style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(27,58,47,0.06)' }}
    {...props}
  >
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-stone-100 ${className}`}>{children}</div>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-lg font-semibold text-brand-green-dark ${className}`} style={{ fontFamily: "'Playfair Display', serif" }}>
    {children}
  </h3>
);
