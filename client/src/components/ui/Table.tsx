import React from 'react';
import Skeleton from './Skeleton';
import EmptyState from './EmptyState';

interface TableProps {
  headers: string[];
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  children: React.ReactNode;
  skeletonRowCount?: number;
}

const Table: React.FC<TableProps> = ({
  headers,
  isLoading = false,
  isEmpty = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children,
  skeletonRowCount = 3,
}) => {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full border-collapse text-left text-sm text-slate-600">
        <thead className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-6 py-4.5 first:pl-6 last:pr-6 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {isLoading ? (
            <Skeleton type="table-row" count={skeletonRowCount} />
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-8">
                <EmptyState
                  title={emptyTitle}
                  description={emptyDescription}
                  action={emptyAction}
                />
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
