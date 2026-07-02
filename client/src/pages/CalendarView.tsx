import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import type { LeaveRequest } from '../api/types';
import { Card } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CalendarView: React.FC = () => {
  const [approvedRequests, setApprovedRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calendar Focus State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const fetchApprovedLeaves = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Query real REST endpoint GET /api/leaves/admin/requests?status=approved
      const data = await leaveApi.getAdminRequests({ status: 'approved' });
      setApprovedRequests(data || []);
    } catch (error: any) {
      console.error('Failed to load approved leaves', error);
      setErrorMsg('Failed to fetch scheduled leaves from the database.');
      toast.error('API connection failed.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedLeaves();
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  // Generate Calendar Days Array
  const generateCalendarDays = () => {
    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding days to complete 6 weeks (42 days grid)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Find leave requests overlapping with a specific date
  const getLeavesForDate = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return approvedRequests.filter((request) => {
      const start = new Date(request.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(request.endDate);
      end.setHours(0, 0, 0, 0);

      return checkDate >= start && checkDate <= end;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Color theme mapper based on leave category
  const getLeaveColorClass = (type: string) => {
    switch (type.toLowerCase()) {
      case 'casual':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'sick':
        return 'bg-amber-50 text-amber-700 border-amber-105';
      case 'earned':
        default:
        return 'bg-blue-50 text-blue-700 border-blue-100';
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Approved Absence Calendar</h2>
          <p className="text-sm font-semibold text-slate-400 mt-0.5">Track team availability and active time-off allocations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchApprovedLeaves}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors focus:outline-hidden cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            Sync
          </button>
        </div>
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

      {/* Calendar Shell Grid */}
      <Card className="border-slate-200 overflow-hidden shadow-sm">
        {/* Calendar Nav Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-150 p-5 bg-slate-50/50 gap-4">
          <div className="flex items-center gap-3">
            <CalendarIcon className="h-5.5 w-5.5 text-brand-600" />
            <h3 className="text-lg font-black text-slate-800 tracking-tight">
              {monthNames[month]} {year}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToday}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Today
            </button>
            <div className="flex items-center border border-slate-200 bg-white rounded-xl shadow-2xs overflow-hidden">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-slate-500 hover:bg-slate-50 border-r border-slate-200 cursor-pointer focus:outline-hidden"
                title="Previous month"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 text-slate-500 hover:bg-slate-50 cursor-pointer focus:outline-hidden"
                title="Next month"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Color Legend */}
        <div className="flex flex-wrap gap-4 px-6 py-3 border-b border-slate-100 bg-white text-xs font-semibold text-slate-450">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Casual Leave (Green)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Sick Leave (Orange)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Earned Leave (Blue)
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-32 bg-white">
            <Spinner size="lg" label="Mapping leave schedules..." />
          </div>
        ) : (
          <div className="bg-white">
            {/* Weekdays Title header */}
            <div className="grid grid-cols-7 border-b border-slate-100 text-center font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
              {weekdayNames.map((day) => (
                <div key={day} className="py-3 border-r border-slate-100 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Month grid days cells */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 border-b border-slate-100">
              {calendarDays.map((dayObj, index) => {
                const dayLeaves = getLeavesForDate(dayObj.date);
                const isToday =
                  new Date().toDateString() === dayObj.date.toDateString();

                return (
                  <div
                    key={index}
                    className={`min-h-[100px] p-2 flex flex-col justify-between transition-colors ${
                      dayObj.isCurrentMonth
                        ? isToday
                          ? 'bg-brand-50/20'
                          : 'bg-white'
                        : 'bg-slate-50/40 text-slate-350'
                    }`}
                  >
                    {/* Day number */}
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-xs font-extrabold flex h-6 w-6 items-center justify-center rounded-full ${
                          isToday
                            ? 'bg-brand-600 text-white shadow-2xs'
                            : dayObj.isCurrentMonth
                            ? 'text-slate-800'
                            : 'text-slate-350'
                        }`}
                      >
                        {dayObj.date.getDate()}
                      </span>
                      {dayLeaves.length > 0 && (
                        <span className="text-[9px] font-bold text-slate-400">
                          {dayLeaves.length} away
                        </span>
                      )}
                    </div>

                    {/* Stacked employee names */}
                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[75px] scrollbar-none mt-1">
                      {dayLeaves.map((request) => {
                        const empName =
                          (request.employee as any)?.name || 'Employee';
                        return (
                          <div
                            key={request._id}
                            className={`rounded-lg border px-1.5 py-0.5 text-[9px] font-bold truncate tracking-tight ${getLeaveColorClass(
                              request.leaveType
                            )}`}
                            title={`${empName} on ${request.leaveType} leave`}
                          >
                            {empName}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CalendarView;
