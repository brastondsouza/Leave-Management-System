import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import type { LeaveBalancesResponse } from '../api/types';
import { LeaveBalanceCard } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const LeaveBalance: React.FC = () => {
  const [balances, setBalances] = useState<LeaveBalancesResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchBalances = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await leaveApi.getBalances();
      setBalances(data);
    } catch (error: any) {
      console.error('Error fetching leave balances', error);
      setErrorMsg('Failed to sync leave balance data from the server.');
      toast.error('API connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, []);

  return (
    <div className="space-y-8 font-sans max-w-5xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Leave Balances</h2>
          <p className="text-sm font-semibold text-slate-400 mt-0.5">View your current year time-off allocations, consumed quotas, and remaining days</p>
        </div>
        <button
          onClick={fetchBalances}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-650 hover:bg-slate-50 transition-colors focus:outline-hidden cursor-pointer"
        >
          <RefreshCw className="h-4 w-4" />
          Sync Balances
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

      {/* Centered Leave Balance Cards Grid */}
      <div className="flex flex-col items-center justify-center py-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full justify-items-center">
          {isLoading ? (
            <Skeleton type="card" count={3} />
          ) : balances ? (
            <>
              {/* Casual Leave -> Green */}
              <LeaveBalanceCard
                leaveType="Casual Leave"
                total={balances.casual.total}
                used={balances.casual.used}
                remaining={balances.casual.remaining}
                colorTheme="earned"
                className="w-full max-w-sm shadow-xs border-slate-150 hover:border-emerald-200"
              />
              {/* Sick Leave -> Orange */}
              <LeaveBalanceCard
                leaveType="Sick Leave"
                total={balances.sick.total}
                used={balances.sick.used}
                remaining={balances.sick.remaining}
                colorTheme="sick"
                className="w-full max-w-sm shadow-xs border-slate-150 hover:border-amber-250"
              />
              {/* Earned Leave -> Blue */}
              <LeaveBalanceCard
                leaveType="Earned Leave"
                total={balances.earned.total}
                used={balances.earned.used}
                remaining={balances.earned.remaining}
                colorTheme="brand"
                className="w-full max-w-sm shadow-xs border-slate-150 hover:border-brand-200"
              />
            </>
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-400 font-medium">
              No leave balances details found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveBalance;
