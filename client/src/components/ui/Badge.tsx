import React from 'react';
import type { LeaveStatus } from '../../api/types';

interface BadgeProps {
  status: LeaveStatus;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    pending: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Pending',
    },
    approved: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Approved',
    },
    rejected: {
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      label: 'Rejected',
    },
  };

  const config = statusConfig[status] || {
    bg: 'bg-slate-50 text-slate-700 border-slate-200',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold select-none shadow-2xs tracking-wide uppercase ${config.bg} ${className}`}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};

export default Badge;
