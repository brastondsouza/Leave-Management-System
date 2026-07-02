import React from 'react';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Records Found',
  description = 'There are no items to display at the moment.',
  icon = <FolderOpen className="h-10 w-10 text-slate-400" />,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center shadow-xs">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-slate-500">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};

export default EmptyState;
