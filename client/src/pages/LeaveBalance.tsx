import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import { LeaveBalanceCard } from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import { AlertCircle, RefreshCw } from 'lucide-react';
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

const LeaveBalance: React.FC = () => {
  const [balances, setBalances] = useState<any>(null);
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
                    className="w-full max-w-sm shadow-xs border-slate-150 hover:border-emerald-250 transition-all"
                  />
                  {/* Sick Leave -> Orange */}
                  <LeaveBalanceCard
                    leaveType="Sick Leave"
                    total={sick.total}
                    used={sick.used}
                    remaining={sick.remaining}
                    colorTheme="sick"
                    className="w-full max-w-sm shadow-xs border-slate-150 hover:border-amber-250 transition-all"
                  />
                  {/* Earned Leave -> Blue */}
                  <LeaveBalanceCard
                    leaveType="Earned Leave"
                    total={earned.total}
                    used={earned.used}
                    remaining={earned.remaining}
                    colorTheme="brand"
                    className="w-full max-w-sm shadow-xs border-slate-150 hover:border-brand-200 transition-all"
                  />
                </>
              );
            })()
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
