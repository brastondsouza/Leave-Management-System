import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'brand' | 'white' | 'slate';
  label?: string;
}

const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'brand',
  label,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const colorClasses = {
    brand: 'border-brand-100 border-t-brand-600',
    white: 'border-white/20 border-t-white',
    slate: 'border-slate-200 border-t-slate-600',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`animate-spin rounded-full border-solid ${sizeClasses[size]} ${colorClasses[color]}`}
        role="status"
        aria-label="loading"
      />
      {label && <span className="text-sm font-medium text-slate-500">{label}</span>}
    </div>
  );
};

export default Spinner;
