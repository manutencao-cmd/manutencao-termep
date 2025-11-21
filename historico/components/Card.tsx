import React from 'react';

export const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 transition-colors ${className}`}>
    {children}
  </div>
);