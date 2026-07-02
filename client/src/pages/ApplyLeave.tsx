import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { leaveApi } from '../api/leave';
import { Card } from '../components/ui/Card';
import Spinner from '../components/ui/Spinner';
import { Calendar, CalendarPlus, ArrowLeft, Info, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const applyLeaveSchema = zod
  .object({
    leaveType: zod.enum(['casual', 'sick', 'earned'], {
      message: 'Please select a leave type',
    }),
    startDate: zod.string().min(1, 'Start date is required'),
    endDate: zod.string().min(1, 'End date is required'),
    reason: zod.string().min(10, 'Reason must be at least 10 characters').max(500, 'Reason must not exceed 500 characters'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.endDate) return true;
      return new Date(data.endDate) >= new Date(data.startDate);
    },
    {
      message: 'End date must be on or after start date',
      path: ['endDate'],
    }
  );

type ApplyLeaveFormValues = zod.infer<typeof applyLeaveSchema>;

const ApplyLeave: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  // Watch fields
  const leaveTypeValue = useWatch({ control, name: 'leaveType' });
  const startDateValue = useWatch({ control, name: 'startDate' });
  const endDateValue = useWatch({ control, name: 'endDate' });

  // Register hidden field for leaveType to keep react-hook-form validation intact
  useEffect(() => {
    register('leaveType');
  }, [register]);

  useEffect(() => {
    if (startDateValue && endDateValue) {
      const start = new Date(startDateValue);
      const end = new Date(endDateValue);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setDuration(diffDays);
      } else {
        setDuration(0);
      }
    } else {
      setDuration(0);
    }
  }, [startDateValue, endDateValue]);

  const onSubmit = async (data: ApplyLeaveFormValues) => {
    setIsSubmitting(true);
    try {
      await leaveApi.applyLeave(data);
      toast.success('Leave request submitted successfully!');
      navigate('/leave-history');
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Failed to submit leave request.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans max-w-4xl mx-auto">
      {/* Header section with back navigations */}
      <div className="flex items-center gap-3.5">
        <button
          onClick={() => navigate(-1)}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors shadow-2xs cursor-pointer focus:outline-hidden"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Request Time Off</h2>
          <p className="text-sm font-semibold text-slate-400 mt-0.5">Submit details for manager approval</p>
        </div>
      </div>

      {/* Main Centered Form Card */}
      <Card className="border-slate-200 overflow-hidden shadow-md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            
            {/* Left Column: Leave Type & Dates */}
            <div className="space-y-6">
              {/* Highlighted Leave Type Selection Cards */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Select Leave Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {/* Casual Leave Toggle Card */}
                  <button
                    type="button"
                    onClick={() => setValue('leaveType', 'casual', { shouldValidate: true })}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 focus:outline-hidden ${
                      leaveTypeValue === 'casual'
                        ? 'border-brand-500 bg-brand-50/50 text-brand-700 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {leaveTypeValue === 'casual' && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider font-semibold">Casual</span>
                  </button>

                  {/* Sick Leave Toggle Card */}
                  <button
                    type="button"
                    onClick={() => setValue('leaveType', 'sick', { shouldValidate: true })}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 focus:outline-hidden ${
                      leaveTypeValue === 'sick'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-800 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {leaveTypeValue === 'sick' && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-amber-600 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider font-semibold">Sick</span>
                  </button>

                  {/* Earned Leave Toggle Card */}
                  <button
                    type="button"
                    onClick={() => setValue('leaveType', 'earned', { shouldValidate: true })}
                    className={`relative flex flex-col items-center justify-center rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 focus:outline-hidden ${
                      leaveTypeValue === 'earned'
                        ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800 shadow-2xs font-bold'
                        : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    {leaveTypeValue === 'earned' && (
                      <span className="absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-white">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                    )}
                    <span className="text-xs uppercase tracking-wider font-semibold">Earned</span>
                  </button>
                </div>
                {errors.leaveType && (
                  <p className="mt-2 text-xs font-semibold text-rose-600">{errors.leaveType.message}</p>
                )}
              </div>

              {/* Start & End Dates Pickers */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label htmlFor="startDate" className="block text-sm font-bold text-slate-700">
                    Start Date
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="startDate"
                      type="date"
                      {...register('startDate')}
                      className={`block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 ${
                        errors.startDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''
                      }`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-655">{errors.startDate.message}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label htmlFor="endDate" className="block text-sm font-bold text-slate-700">
                    End Date
                  </label>
                  <div className="relative mt-2">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <input
                      id="endDate"
                      type="date"
                      {...register('endDate')}
                      className={`block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 ${
                        errors.endDate ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''
                      }`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1.5 text-xs font-semibold text-rose-655">{errors.endDate.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Reason & Styled Duration Summary Card */}
            <div className="space-y-6 flex flex-col justify-between">
              {/* Reason Input */}
              <div>
                <label htmlFor="reason" className="block text-sm font-bold text-slate-700">
                  Reason for Time-Off
                </label>
                <textarea
                  id="reason"
                  rows={4}
                  {...register('reason')}
                  placeholder="Please describe the context of your leave request here..."
                  className={`mt-2 block w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-850 placeholder-slate-400 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 ${
                    errors.reason ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10' : ''
                  }`}
                />
                {errors.reason && (
                  <p className="mt-1.5 text-xs font-semibold text-rose-655">{errors.reason.message}</p>
                )}
              </div>

              {/* Styled Duration Summary Card */}
              {duration > 0 ? (
                <div className="rounded-2xl bg-brand-50/50 border border-brand-100 p-5 animate-fade-in flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600">Leave Duration Summary</p>
                    <p className="text-xs font-semibold text-slate-500 mt-1">
                      {formatDate(startDateValue)} &rarr; {formatDate(endDateValue)}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-1.5 shrink-0 bg-white border border-brand-100 rounded-xl px-4 py-2 shadow-2xs">
                    <span className="text-2xl font-black text-brand-700">{duration}</span>
                    <span className="text-xs font-bold text-slate-500">{duration === 1 ? 'Calendar Day' : 'Calendar Days'}</span>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-5 flex items-center gap-3.5 text-xs font-semibold text-slate-400">
                  <Info className="h-5 w-5 text-slate-400 shrink-0" />
                  <span>Choose categories and fill in valid start/end dates to preview duration details.</span>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions Footer Buttons */}
          <div className="mt-8 flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all focus:outline-hidden cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-700 transition-all disabled:opacity-75 cursor-pointer focus:outline-hidden"
            >
              {isSubmitting ? (
                <Spinner size="sm" color="white" />
              ) : (
                <>
                  <CalendarPlus className="h-4.5 w-4.5" />
                  Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ApplyLeave;
