import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import type { LeaveRequest } from '../api/types';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import { Search, RefreshCw, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveHistory: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchHistory = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await leaveApi.getHistory({
        status: statusFilter || undefined,
        leaveType: typeFilter || undefined,
        search: searchQuery || undefined,
      });
      setRequests(data);
    } catch (error: any) {
      console.error('Failed to load leave history', error);
      setErrorMsg('Could not fetch leave history from the server.');
      toast.error('Connection failed. Please ensure the server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Implement debounce for search query
    const delayDebounceFn = setTimeout(() => {
      fetchHistory();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [statusFilter, typeFilter, searchQuery]);

  const handleClearFilters = () => {
    setStatusFilter('');
    setTypeFilter('');
    setSearchQuery('');
    toast.success('Filters cleared');
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Description Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">My Leave History</h2>
          <p className="text-sm font-medium text-slate-400 mt-0.5">Track the progress and review historical details of your time off requests</p>
        </div>
        <button
          onClick={fetchHistory}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {/* Error Alert Box */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4.5 text-rose-700 shadow-2xs">
          <AlertCircle className="h-5.5 w-5.5 shrink-0 text-rose-600" />
          <div className="text-sm font-medium">
            <p className="font-semibold text-rose-800">Connection Failed</p>
            <p className="mt-1 text-rose-600/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Filters Card Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {/* Search Field */}
          <div>
            <label htmlFor="search" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Search Reason
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to search..."
                className="block w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
              />
            </div>
          </div>

          {/* Leave Type Filter */}
          <div>
            <label htmlFor="leaveType" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Leave Type
            </label>
            <select
              id="leaveType"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">All Types</option>
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Reset Filters */}
          <div className="flex">
            <button
              onClick={handleClearFilters}
              disabled={!statusFilter && !typeFilter && !searchQuery}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-slate-50/50 transition-all duration-150"
            >
              <X className="h-4 w-4" />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main History Table */}
      <Table
        headers={['Leave Type', 'Start Date', 'End Date', 'Duration', 'Reason', 'Status', 'Manager Comments']}
        isLoading={isLoading}
        isEmpty={requests.length === 0}
        emptyTitle="No History Matches Found"
        emptyDescription="No leave request records match the current filters. Modify your search query or reset filters."
        emptyAction={
          (statusFilter || typeFilter || searchQuery) ? (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-all"
            >
              Clear Current Filters
            </button>
          ) : undefined
        }
      >
        {requests.map((request) => (
          <tr key={request._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
            <td className="px-6 py-4.5">
              <span className="font-semibold text-slate-800 capitalize">{request.leaveType}</span>
            </td>
            <td className="px-6 py-4.5 text-slate-500 font-medium">
              {formatDate(request.startDate)}
            </td>
            <td className="px-6 py-4.5 text-slate-500 font-medium">
              {formatDate(request.endDate)}
            </td>
            <td className="px-6 py-4.5 text-slate-800 font-bold">
              {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
            </td>
            <td className="px-6 py-4.5 text-slate-500 max-w-xs truncate font-medium" title={request.reason}>
              {request.reason}
            </td>
            <td className="px-6 py-4.5">
              <Badge status={request.status} />
            </td>
            <td className="px-6 py-4.5 text-xs text-slate-400 font-semibold italic max-w-xs truncate" title={request.comments}>
              {request.comments || <span className="text-slate-300 font-normal">No feedback yet</span>}
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
};

export default LeaveHistory;
