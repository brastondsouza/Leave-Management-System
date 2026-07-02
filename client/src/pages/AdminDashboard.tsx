import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leaveApi } from '../api/leave';
import type { LeaveRequest } from '../api/types';
import { StatsCard } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Skeleton from '../components/ui/Skeleton';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  UserPlus,
  Calendar,
  ClipboardList,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface LeaveStatsResponse {
  totalRequests: number;
  totalDays: number;
  byStatus: {
    pending: { count: number; days: number };
    approved: { count: number; days: number };
    rejected: { count: number; days: number };
  };
  byType: Record<string, { count: number; days: number }>;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<LeaveStatsResponse | null>(null);
  const [pendingRequests, setPendingRequests] = useState<LeaveRequest[]>([]);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoadingStats(true);
    setIsLoadingRequests(true);
    setErrorMsg(null);
    try {
      const [statsData, requestsData] = await Promise.all([
        leaveApi.getAdminStats() as any, // Cast as any because the raw response has the nested stats structure
        leaveApi.getAdminRequests(),
      ]);

      if (statsData?.success && statsData?.stats) {
        setStats(statsData.stats);
      } else {
        setStats(statsData);
      }
      
      const allRequests = requestsData || [];
      // Filter out pending requests for the pending table
      setPendingRequests(allRequests.filter((r: LeaveRequest) => r.status === 'pending').slice(0, 5));
      // Store all recent requests for the Recent Activity log feed
      setRecentRequests(allRequests.slice(0, 5));
    } catch (error: any) {
      console.error('Failed to load admin stats', error);
      setErrorMsg('Failed to sync admin details. The REST server might be offline.');
      toast.error('Network connection error.');
    } finally {
      setIsLoadingStats(false);
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRelativeTime = (dateStr: string) => {
    const rDate = new Date(dateStr);
    const diffMs = new Date().getTime() - rDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Banner Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight md:text-3xl">
            HRMS Administration Panel
          </h2>
          <p className="mt-1 text-sm font-semibold text-slate-400">
            Real-time operations, analytics, and leave request management.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4.5 py-2.5 text-sm font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors focus:outline-hidden cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Dashboard
        </button>
      </div>

      {/* Connection Offline Box */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50/50 p-4.5 text-rose-700 shadow-2xs">
          <AlertCircle className="h-5.5 w-5.5 shrink-0 text-rose-600" />
          <div className="text-sm font-medium">
            <p className="font-semibold text-rose-800">Connection Failed</p>
            <p className="mt-1 text-rose-600/90">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Redesigned Statistics Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingStats ? (
          <Skeleton type="stats-card" count={4} />
        ) : stats ? (
          <>
            <StatsCard
              title="Pending Requests"
              value={stats.byStatus?.pending?.count ?? 0}
              icon={<Clock className="h-6 w-6" />}
              iconBgColor="bg-amber-50 border border-amber-100"
              iconColor="text-amber-600"
              description={`${stats.byStatus?.pending?.days ?? 0} total requested days`}
            />
            <StatsCard
              title="Approved Leave"
              value={stats.byStatus?.approved?.count ?? 0}
              icon={<CheckCircle className="h-6 w-6" />}
              iconBgColor="bg-emerald-50 border border-emerald-100"
              iconColor="text-emerald-600"
              description={`${stats.byStatus?.approved?.days ?? 0} scheduled leave days`}
            />
            <StatsCard
              title="Total Requests"
              value={stats.totalRequests ?? 0}
              icon={<FileText className="h-6 w-6" />}
              iconBgColor="bg-brand-50 border border-brand-100"
              iconColor="text-brand-650"
              description={`${stats.totalDays ?? 0} cumulative days`}
            />
            <StatsCard
              title="Leave Types"
              value={Object.keys(stats.byType ?? {}).length}
              icon={<TrendingUp className="h-6 w-6" />}
              iconBgColor="bg-indigo-50 border border-indigo-100"
              iconColor="text-indigo-650"
              description="Casual, Sick, & Earned active"
            />
          </>
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 font-medium">
            No statistics metrics available.
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Actions & Recent Activity */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Quick Actions Panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">HRMS Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/admin/employees?add=true"
                className="flex items-center gap-3.5 rounded-xl border border-slate-100 hover:border-brand-200 bg-slate-50/50 hover:bg-brand-50/30 p-3.5 text-slate-700 hover:text-brand-800 transition-all font-semibold text-sm group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p>Add Employee</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-brand-500 font-medium mt-0.5">Register new staff account</p>
                </div>
              </Link>
              
              <Link
                to="/admin/calendar"
                className="flex items-center gap-3.5 rounded-xl border border-slate-100 hover:border-brand-200 bg-slate-50/50 hover:bg-brand-50/30 p-3.5 text-slate-700 hover:text-brand-800 transition-all font-semibold text-sm group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p>View Calendar</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-brand-500 font-medium mt-0.5">Track team time-off bounds</p>
                </div>
              </Link>

              <Link
                to="/admin/requests"
                className="flex items-center gap-3.5 rounded-xl border border-slate-100 hover:border-brand-200 bg-slate-50/50 hover:bg-brand-50/30 p-3.5 text-slate-700 hover:text-brand-800 transition-all font-semibold text-sm group"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <ClipboardList className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p>Leave Requests Queue</p>
                  <p className="text-[10px] text-slate-400 group-hover:text-brand-500 font-medium mt-0.5">Review and approve applications</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity Log Feed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-base font-black text-slate-800 tracking-tight mb-4">Recent System Activity</h3>
            {isLoadingRequests ? (
              <div className="space-y-4 py-2">
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : recentRequests.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4 font-semibold">No recent leave request actions.</p>
            ) : (
              <div className="relative border-l border-slate-100 pl-4.5 ml-2.5 space-y-5.5 py-2">
                {recentRequests.map((item) => (
                  <div key={item._id} className="relative text-xs">
                    {/* Circle bullet node */}
                    <span className={`absolute -left-[24.5px] top-1.5 flex h-2 w-2 rounded-full ring-4 ring-white ${
                      item.status === 'approved' ? 'bg-emerald-500' : item.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500 animate-pulse'
                    }`} />
                    <div className="flex items-center justify-between text-slate-400 font-medium mb-1">
                      <span className="font-bold text-slate-850">{(item.employee as any)?.name}</span>
                      <span>{getRelativeTime(item.createdAt)}</span>
                    </div>
                    <p className="text-slate-500 leading-normal font-medium">
                      Requested <span className="font-bold text-slate-800 capitalize">{item.leaveType}</span> leave for {item.totalDays} {item.totalDays === 1 ? 'day' : 'days'}. Status: <span className={`font-semibold capitalize ${
                        item.status === 'approved' ? 'text-emerald-600' : item.status === 'rejected' ? 'text-rose-600' : 'text-amber-600'
                      }`}>{item.status}</span>.
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pending Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Requests Awaiting Action ({pendingRequests.length})
            </h3>
            <Link to="/admin/requests" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-0.5">
              Manage Queue
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <Table
            headers={['Employee', 'Leave Type', 'Duration', 'Dates', 'Action']}
            isLoading={isLoadingRequests}
            isEmpty={pendingRequests.length === 0}
            emptyTitle="Requests Queue Clear"
            emptyDescription="All incoming leave requests have been successfully processed."
          >
            {pendingRequests.map((request) => (
              <tr key={request._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
                <td className="px-6 py-4">
                  <div>
                    <p className="font-bold text-slate-800">{(request.employee as any)?.name}</p>
                    <p className="text-xs text-slate-450 font-medium truncate max-w-[150px]">{(request.employee as any)?.department}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-650 font-semibold capitalize">
                  {request.leaveType}
                </td>
                <td className="px-6 py-4 text-slate-800 font-extrabold">
                  {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium text-xs">
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to="/admin/requests"
                    className="inline-flex items-center gap-1 rounded-lg border border-brand-100 bg-brand-50/60 px-3 py-1.5 text-xs font-bold text-brand-750 hover:bg-brand-100 transition-all shadow-2xs"
                  >
                    Process
                  </Link>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
