import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import type { LeaveRequest } from '../api/types';
import { Card } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

const EmployeeCalendar: React.FC = () => {
  const [companyApprovedLeaves, setCompanyApprovedLeaves] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Calendar State
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  const fetchCalendarData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const companyLeaves = await leaveApi.getCalendarLeaves();
      setCompanyApprovedLeaves(companyLeaves || []);
    } catch (error: any) {
      console.error('Failed to load company leaves', error);
      setErrorMsg('Failed to fetch scheduled leaves from the database.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [year, month]);

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    return new Date(y, m, 1).getDay();
  };

  const handlePrevMonth = () => {
    setCalendarDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(year, month + 1, 1));
  };

  const handleTodayMonth = () => {
    setCalendarDate(new Date());
  };

  const generateCalendarDays = () => {
    const totalDays = getDaysInMonth(year, month);
    const firstDayIndex = getFirstDayOfMonth(year, month);
    const prevMonthDays = getDaysInMonth(year, month - 1);

    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
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

    // Next month padding to complete standard 42 slots grid
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

  const getLeavesForDate = (date: Date) => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return companyApprovedLeaves.filter((request) => {
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

  return (
    <div className="space-y-6 font-sans antialiased text-slate-800 p-1">
      {/* Header Container */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-950">
            Company Leave Calendar
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Track team availability timelines and scheduled absences across the organization.
          </p>
        </div>
        <button
          onClick={fetchCalendarData}
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-55 active:scale-95 disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
          Sync Data
        </button>
      </div>

      {/* Connection Offline Box */}
      {errorMsg && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-900 shadow-sm transition-all duration-300">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-rose-900">Sync Interrupted</p>
            <p className="mt-0.5 text-rose-750 font-medium">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Calendar Card */}
      <Card className="border border-slate-200 bg-white shadow-md rounded-2xl overflow-hidden p-6">
        
        {/* Navigation & Controls Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5 mb-5 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900 tracking-tight">
                {monthNames[month]} {year}
              </h4>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Approved Absences Summary</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleTodayMonth}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-50 shadow-sm cursor-pointer"
            >
              This Month
            </button>
            <div className="flex items-center border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden">
              <button
                onClick={handlePrevMonth}
                className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors border-r border-slate-200 cursor-pointer"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Loader View */}
        {isLoading ? (
          <div className="flex flex-col justify-center items-center py-28 space-y-3">
            <Spinner size="md" />
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Gathering Leaves...</span>
          </div>
        ) : (
          <div>
            {/* Weekday Headers Layout */}
            <div className="grid grid-cols-7 mb-2 text-center font-bold text-xs uppercase tracking-wider text-slate-400 select-none">
              {weekdayNames.map((d) => (
                <div key={d} className="py-2">{d}</div>
              ))}
            </div>

            {/* Interactive Grid Calendar Box */}
            <div className="grid grid-cols-7 gap-px bg-slate-200 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
              {calendarDays.map((dayObj, idx) => {
                const dayLeaves = getLeavesForDate(dayObj.date);
                const isToday = new Date().toDateString() === dayObj.date.toDateString();
                
                // Show up to 2 leaves visually inside the day block, summarize the rest
                const maxVisibleLeaves = 2;
                const visibleLeaves = dayLeaves.slice(0, maxVisibleLeaves);
                const extraCount = dayLeaves.length - maxVisibleLeaves;

                return (
                  <div
                    key={idx}
                    className={`min-h-[100px] p-2 flex flex-col justify-between transition-all duration-150 relative group select-none ${
                      dayObj.isCurrentMonth
                        ? isToday
                          ? 'bg-indigo-50/50 font-semibold'
                          : 'bg-white hover:bg-slate-50/80'
                        : 'bg-slate-50 text-slate-400'
                    }`}
                  >
                    {/* Header Row of the Day Block */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs font-bold flex h-6 w-6 items-center justify-center rounded-full transition-transform group-hover:scale-105 ${
                          isToday
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                            : dayObj.isCurrentMonth ? 'text-slate-700' : 'text-slate-400/60'
                        }`}
                      >
                        {dayObj.date.getDate()}
                      </span>
                      
                      {isToday && (
                        <span className="text-[9px] font-extrabold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-md">
                          Today
                        </span>
                      )}
                    </div>

                    {/* Content Slot / Leaves List */}
                    <div className="mt-2 space-y-1 grow flex flex-col justify-end">
                      {visibleLeaves.map((leave, lIdx) => {
                        // Dynamically extract name depending on if 'employee' is a string or an object
                        const displayName = typeof leave.employee === 'object' && leave.employee !== null
                          ? (leave.employee as any).name
                          : (leave.employee || 'Absent');

                        return (
                          <div
                            key={lIdx}
                            title={`${displayName} (${leave.leaveType || 'Absent'})`}
                            className="w-full text-[10px] font-bold px-2 py-0.5 rounded-md border text-indigo-700 bg-indigo-50 border-indigo-100 truncate shrink-0 transform transition-all hover:translate-x-0.5"
                          >
                            {displayName}
                          </div>
                        );
                      })}
                      
                      {extraCount > 0 && (
                        <div className="text-[9px] font-extrabold text-slate-500 pl-1 py-0.5 tracking-tight">
                          +{extraCount} more down
                        </div>
                      )}
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

export default EmployeeCalendar;