import React from 'react';

interface SkeletonProps {
  type?: 'card' | 'table-row' | 'text' | 'form' | 'stats-card';
  count?: number;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  type = 'text',
  count = 1,
  className = '',
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'stats-card':
        return (
          <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
            </div>
            <div className="mt-4 h-8 w-16 rounded bg-slate-200"></div>
            <div className="mt-2 h-3 w-32 rounded bg-slate-200"></div>
          </div>
        );
      case 'card':
        return (
          <div className="animate-pulse rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-4 w-28 rounded bg-slate-200"></div>
            <div className="mt-6 flex items-baseline gap-2">
              <div className="h-9 w-12 rounded bg-slate-200"></div>
              <div className="h-4 w-16 rounded bg-slate-200"></div>
            </div>
            <div className="mt-6 space-y-3">
              <div className="h-2 rounded bg-slate-200"></div>
              <div className="flex justify-between text-xs">
                <div className="h-3 w-12 rounded bg-slate-200"></div>
                <div className="h-3 w-12 rounded bg-slate-200"></div>
              </div>
            </div>
          </div>
        );
      case 'table-row':
        return (
          <tr className="animate-pulse border-b border-slate-100 last:border-0">
            <td className="px-6 py-4">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
              <div className="mt-1 h-3 w-16 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-20 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-24 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-4 w-12 rounded bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-6 w-20 rounded-full bg-slate-200"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-8 w-8 rounded-lg bg-slate-200"></div>
            </td>
          </tr>
        );
      case 'form':
        return (
          <div className="space-y-6 animate-pulse rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="h-6 w-48 rounded bg-slate-200"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 w-20 rounded bg-slate-200"></div>
                <div className="mt-2 h-10 rounded bg-slate-200"></div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <div className="h-4 w-20 rounded bg-slate-200"></div>
                  <div className="mt-2 h-10 rounded bg-slate-200"></div>
                </div>
                <div>
                  <div className="h-4 w-20 rounded bg-slate-200"></div>
                  <div className="mt-2 h-10 rounded bg-slate-200"></div>
                </div>
              </div>
              <div>
                <div className="h-4 w-20 rounded bg-slate-200"></div>
                <div className="mt-2 h-24 rounded bg-slate-200"></div>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="h-10 w-24 rounded bg-slate-200"></div>
              <div className="h-10 w-28 rounded bg-slate-200"></div>
            </div>
          </div>
        );
      case 'text':
      default:
        return (
          <div className={`animate-pulse space-y-2 ${className}`}>
            <div className="h-4 rounded bg-slate-200"></div>
            <div className="h-4 w-5/6 rounded bg-slate-200"></div>
          </div>
        );
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <React.Fragment key={index}>{renderSkeleton()}</React.Fragment>
      ))}
    </>
  );
};

export default Skeleton;
