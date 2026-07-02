import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { leaveApi } from '../api/leave';
import type { LeaveBalancesResponse, LeaveRequest } from '../api/types';
import { LeaveBalanceCard } from '../components/ui/Card';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import {
  CalendarPlus,
  History,
  ClipboardList,
  AlertCircle,
  RefreshCw,
  Briefcase,
  Calendar,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface NormalizedQuota {
  total: number;
  remaining: number;
  used?: number;
}

const getQuota = (balances: any, type: 'casual' | 'sick' | 'earned'): NormalizedQuota => {
  const defaultAllotments = { casual: 10, sick: 8, earned: 15 };
  const total = defaultAllotments[type];
  
  if (!balances) {
    return { total, remaining: total, used: 0 };
  }

  const value = balances[type];

  // If it's already an object
  if (value && typeof value === 'object') {
    const r = typeof value.remaining === 'number' ? value.remaining : 0;
    const t = typeof value.total === 'number' ? value.total : total;
    const u = typeof value.used === 'number' ? value.used : Math.max(0, t - r);
    return { total: t, remaining: r, used: u };
  }

  // If it's a number (representing remaining days)
  if (typeof value === 'number') {
    const remaining = value;
    const used = Math.max(0, total - remaining);
    return { total, remaining, used };
  }

  // Graceful fallback
  return { total, remaining: total, used: 0 };
};

const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const [balances, setBalances] = useState<LeaveBalancesResponse | null>(null);
  const [recentRequests, setRecentRequests] = useState<LeaveRequest[]>([]);
  
  const [isLoadingBalances, setIsLoadingBalances] = useState<boolean>(true);
  const [isLoadingRequests, setIsLoadingRequests] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setErrorMsg(null);
    setIsLoadingBalances(true);
    setIsLoadingRequests(true);

    try {
      const [balancesData, historyData] = await Promise.all([
        leaveApi.getBalances(),
        leaveApi.getHistory(),
      ]);

      setBalances(balancesData);
      setRecentRequests(historyData.slice(0, 5));
    } catch (error: any) {
      console.error('Error fetching dashboard info', error);
      setErrorMsg('Could not fetch leave balances or recent requests from the server.');
      toast.error('API sync failed.');
    } finally {
      setIsLoadingBalances(false);
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-8 font-sans max-w-6xl mx-auto px-4">
      {/* Welcome Card Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 p-6 text-white shadow-lg border border-slate-800">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-12 -bottom-20 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <span className="inline-flex items-center rounded-md bg-brand-500/25 px-2.5 py-0.5 text-xs font-bold text-brand-300 uppercase tracking-wider select-none">
              Employee Portal
            </span>
            <h2 className="text-2xl font-black tracking-tight md:text-3xl mt-2.5">
              {getGreeting()}, {user?.name}!
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-350 text-sm font-medium mt-1">
              <div className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-brand-400" />
                <span>{user?.department} &bull; {user?.designation}</span>
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-emerald-450" />
                <span>{formattedDate}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={fetchDashboardData}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-850 hover:bg-slate-800 px-4.5 py-2.5 text-sm font-bold text-white shadow-2xs transition-colors focus:outline-hidden cursor-pointer"
            >
              <RefreshCw className="h-4 w-4" />
              Sync Dashboard
            </button>
          </div>
        </div>
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

      {/* Leave Balance Dashboard Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
          Leave Balance Dashboard
        </h3>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center">
          {isLoadingBalances ? (
            <Skeleton type="card" count={3} />
          ) : balances ? (
            (() => {
              const casual = getQuota(balances, 'casual');
              const sick = getQuota(balances, 'sick');
              const earned = getQuota(balances, 'earned');
              
              return (
                <>
                  {/* Casual Leave -> Green */}
                  <LeaveBalanceCard
                    leaveType="Casual Leave"
                    total={casual.total}
                    used={casual.used}
                    remaining={casual.remaining}
                    colorTheme="earned"
                    className="w-full max-w-sm hover:border-emerald-250 transition-all border-slate-200"
                  />
                  {/* Sick Leave -> Orange */}
                  <LeaveBalanceCard
                    leaveType="Sick Leave"
                    total={sick.total}
                    used={sick.used}
                    remaining={sick.remaining}
                    colorTheme="sick"
                    className="w-full max-w-sm hover:border-amber-250 transition-all border-slate-200"
                  />
                  {/* Earned Leave -> Blue */}
                  <LeaveBalanceCard
                    leaveType="Earned Leave"
                    total={earned.total}
                    used={earned.used}
                    remaining={earned.remaining}
                    colorTheme="brand"
                    className="w-full max-w-sm hover:border-brand-200 transition-all border-slate-200"
                  />
                </>
              );
            })()
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-400 font-medium">
              No leave balances found.
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Recent Leave Requests Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 tracking-tight flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-slate-400" />
              Recent Requests
            </h3>
            <Link to="/leave-history" className="text-xs font-bold text-brand-600 hover:text-brand-700">
              View History
            </Link>
          </div>

          <Table
            headers={['Leave Type', 'Start Date', 'End Date', 'Duration', 'Status']}
            isLoading={isLoadingRequests}
            isEmpty={recentRequests.length === 0}
            emptyTitle="No Time-Off Requests"
            emptyDescription="You haven't requested any time off yet. Open the Apply form to submit a request."
            emptyAction={
              <Link
                to="/apply-leave"
                className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4.5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-brand-700 transition-all"
              >
                <CalendarPlus className="h-4 w-4" />
                Apply Now
              </Link>
            }
          >
            {recentRequests.map((request) => (
              <tr key={request._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-55 transition-colors">
                <td className="px-6 py-4.5">
                  <span className="font-bold text-slate-800 capitalize">{request.leaveType}</span>
                </td>
                <td className="px-6 py-4.5 text-slate-550 font-medium">
                  {formatDate(request.startDate)}
                </td>
                <td className="px-6 py-4.5 text-slate-555 font-medium">
                  {formatDate(request.endDate)}
                </td>
                <td className="px-6 py-4.5 text-slate-800 font-extrabold">
                  {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
                </td>
                <td className="px-6 py-4.5">
                  <Badge status={request.status} />
                </td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Right Column: Quick Actions Card */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-black text-slate-855 tracking-tight border-b border-slate-100 pb-3">Quick Actions</h3>
            <div className="flex flex-col gap-3.5">
              <Link
                to="/apply-leave"
                className="flex items-center gap-4 rounded-xl border border-brand-100 bg-brand-50/30 hover:bg-brand-50 p-4 text-brand-750 hover:border-brand-200 transition-all shadow-2xs font-semibold text-sm group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <CalendarPlus className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-slate-850 font-extrabold group-hover:text-brand-700 transition-colors">Apply Leave</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Submit new absence request</p>
                </div>
              </Link>
              <Link
                to="/leave-history"
                className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-100 p-4 text-slate-700 hover:border-slate-200 transition-all shadow-2xs font-semibold text-sm group"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-205 text-slate-600 shadow-2xs group-hover:scale-105 transition-transform">
                  <History className="h-5.5 w-5.5" />
                </div>
                <div>
                  <p className="text-slate-855 font-extrabold group-hover:text-slate-900 transition-colors">View History</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1">Review your past request logs</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
