import React from 'react';

interface CardProps {
  title?: string;
  className?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  title,
  className = '',
  headerAction,
  children,
}) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs ${className}`}>
      {(title || headerAction) && (
        <div className="mb-5 flex items-center justify-between">
          {title && <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  iconBgColor?: string;
  iconColor?: string;
  className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  iconBgColor = 'bg-brand-50',
  iconColor = 'text-brand-600',
  className = '',
}) => {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:shadow-xs ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-800 tracking-tight md:text-3xl">{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBgColor} ${iconColor} shadow-sm`}>
          {icon}
        </div>
      </div>
      {description && (
        <p className="mt-4 text-xs font-medium text-slate-500">{description}</p>
      )}
    </div>
  );
};

interface LeaveBalanceCardProps {
  leaveType: string;
  total?: number;
  used?: number;
  remaining?: number;
  colorTheme?: 'brand' | 'sick' | 'earned';
  className?: string;
}

export const LeaveBalanceCard: React.FC<LeaveBalanceCardProps> = ({
  leaveType,
  total = 0,
  used,
  remaining = 0,
  colorTheme = 'brand',
  className = '',
}) => {
  const themes = {
    brand: {
      bg: 'bg-brand-50',
      text: 'text-brand-700',
      bar: 'bg-brand-600',
      badge: 'bg-brand-100 text-brand-800',
      border: 'border-brand-100',
    },
    sick: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      bar: 'bg-amber-500',
      badge: 'bg-amber-100 text-amber-800',
      border: 'border-amber-100',
    },
    earned: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      bar: 'bg-emerald-600',
      badge: 'bg-emerald-100 text-emerald-800',
      border: 'border-emerald-100',
    },
  };

  const currentTheme = themes[colorTheme] || themes.brand;
  const usagePercentage = total > 0 && used !== undefined ? Math.min((used / total) * 100, 100) : 0;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs transition-all hover:shadow-xs ${currentTheme.border} ${className}`}>
      <div className="flex items-center justify-between">
        <span className={`rounded-xl px-3 py-1 text-xs font-bold uppercase tracking-wider ${currentTheme.badge}`}>
          {leaveType}
        </span>
        <div className="text-right">
          <span className="text-xs font-semibold text-slate-400">Total Allotted: </span>
          <span className="text-sm font-bold text-slate-700">{total} days</span>
        </div>
      </div>

      <div className="mt-6 flex items-baseline gap-2">
        <span className="text-4xl font-extrabold text-slate-800 tracking-tight">{remaining}</span>
        <span className="text-sm font-semibold text-slate-400">days left</span>
      </div>

      {/* Usage Progress Bar */}
      {used !== undefined && (
        <div className="mt-6">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Used: {used} days</span>
            <span>{Math.round(usagePercentage)}% consumed</span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${currentTheme.bar}`}
              style={{ width: `${usagePercentage}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
