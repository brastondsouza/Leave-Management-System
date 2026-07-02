import React, { useEffect, useState } from 'react';
import { leaveApi } from '../api/leave';
import type { LeaveRequest } from '../api/types';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Spinner from '../components/ui/Spinner';
import { RefreshCw, AlertCircle, FileEdit, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const ManageRequests: React.FC = () => {
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('pending'); // default to pending to focus on items needing action

  // Modal / Selected Request
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [comments, setComments] = useState<string>('');

  const fetchRequests = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const data = await leaveApi.getAdminRequests({
        status: statusFilter || undefined,
      });
      setRequests(data);
    } catch (error: any) {
      console.error('Failed to load employee requests', error);
      setErrorMsg('Failed to download leave requests from the server.');
      toast.error('Network connection failure.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const handleOpenProcessModal = (request: LeaveRequest) => {
    setSelectedRequest(request);
    setComments(request.comments || '');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
    setComments('');
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;

    if (status === 'rejected' && !comments.trim()) {
      toast.error('Rejection reason/comments are required.');
      return;
    }

    setIsProcessing(true);
    try {
      await leaveApi.updateRequestStatus(selectedRequest._id, status, comments);
      toast.success(`Request has been ${status === 'approved' ? 'approved' : 'rejected'} successfully.`);
      handleCloseModal();
      fetchRequests();
    } catch (error: any) {
      const errText = error.response?.data?.message || `Failed to update request status.`;
      toast.error(errText);
    } finally {
      setIsProcessing(false);
    }
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
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Manage Leave Requests</h2>
          <p className="text-sm font-medium text-slate-400 mt-0.5">Approve, reject, or comment on employee time off applications</p>
        </div>
        <button
          onClick={fetchRequests}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-2xs hover:bg-slate-50 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
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

      {/* Filters Form Container */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
        <div className="max-w-xs">
          <label htmlFor="status" className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
            Status Filter
          </label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2 block w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-850 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Grid Requests Table */}
      <Table
        headers={['Employee', 'Leave Type', 'Duration', 'Dates', 'Reason', 'Status', 'Actions']}
        isLoading={isLoading}
        isEmpty={requests.length === 0}
        emptyTitle="No Leave Requests Matching Filter"
        emptyDescription="There are no records in the directory corresponding to your selected status option."
      >
        {requests.map((request) => (
          <tr key={request._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/40 transition-colors">
            <td className="px-6 py-4.5">
              <div>
                <p className="font-semibold text-slate-850">{(request.employee as any)?.name}</p>
                <p className="text-xs text-slate-400 font-medium">{(request.employee as any)?.email}</p>
              </div>
            </td>
            <td className="px-6 py-4.5 text-slate-650 font-semibold capitalize">
              {request.leaveType}
            </td>
            <td className="px-6 py-4.5 text-slate-850 font-bold">
              {request.totalDays} {request.totalDays === 1 ? 'day' : 'days'}
            </td>
            <td className="px-6 py-4.5 text-slate-500 font-medium text-xs">
              {formatDate(request.startDate)} - {formatDate(request.endDate)}
            </td>
            <td className="px-6 py-4.5 text-slate-500 font-medium max-w-xs truncate" title={request.reason}>
              {request.reason}
            </td>
            <td className="px-6 py-4.5">
              <Badge status={request.status} />
            </td>
            <td className="px-6 py-4.5">
              {request.status === 'pending' ? (
                <button
                  onClick={() => handleOpenProcessModal(request)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-brand-100 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-100 transition-all shadow-2xs"
                >
                  <FileEdit className="h-3.5 w-3.5" />
                  Process
                </button>
              ) : (
                <button
                  onClick={() => handleOpenProcessModal(request)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                  title="View request logs"
                >
                  View Details
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      {/* Review Request Modal popup */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedRequest?.status === 'pending' ? 'Process Leave Request' : 'Leave Request Log details'}
        footer={
          selectedRequest?.status === 'pending' ? (
            <div className="flex items-center gap-3 w-full justify-between">
              <span className="text-xs font-medium text-slate-400">
                Action will sync with DB.
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus('rejected')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50 transition-all"
                >
                  Reject Request
                </button>
                <button
                  onClick={() => handleUpdateStatus('approved')}
                  disabled={isProcessing}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50 shadow-md shadow-emerald-500/10 transition-all"
                >
                  {isProcessing ? <Spinner size="sm" color="white" /> : <Check className="h-4 w-4" />}
                  Approve Request
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleCloseModal}
              className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close Window
            </button>
          )
        }
      >
        {selectedRequest && (
          <div className="space-y-5">
            {/* Employee profile metadata summary */}
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{(selectedRequest.employee as any)?.name}</p>
                  <p className="text-xs text-slate-500">{(selectedRequest.employee as any)?.email}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation / Team</p>
                  <p className="mt-1 text-sm font-bold text-slate-800">{(selectedRequest.employee as any)?.designation}</p>
                  <p className="text-xs text-slate-500">{(selectedRequest.employee as any)?.department}</p>
                </div>
              </div>
            </div>

            {/* Request Summary details */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Type</p>
                <p className="mt-1 text-sm font-bold text-slate-800 capitalize">{selectedRequest.leaveType}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="mt-1 text-sm font-bold text-slate-800">
                  {selectedRequest.totalDays} {selectedRequest.totalDays === 1 ? 'day' : 'days'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Status</p>
                <div className="mt-1">
                  <Badge status={selectedRequest.status} />
                </div>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Requested Dates</p>
              <p className="mt-1 text-sm font-semibold text-slate-700 bg-slate-50 px-3 py-2 rounded-lg inline-block border border-slate-100">
                {formatDate(selectedRequest.startDate)} &rarr; {formatDate(selectedRequest.endDate)}
              </p>
            </div>

            {/* Reason block */}
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for Request</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-650 bg-slate-50/20 rounded-xl border border-slate-100 p-4 font-medium italic">
                "{selectedRequest.reason}"
              </p>
            </div>

            {/* Feedback / Comments Section */}
            <div>
              <label htmlFor="modalComments" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Manager Review Comments & Feedback
              </label>
              {selectedRequest.status === 'pending' ? (
                <textarea
                  id="modalComments"
                  rows={3}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide comments or explaining reasons for rejection/approval..."
                  className="block w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-hidden transition-all duration-150 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
                />
              ) : (
                <div className="rounded-xl border border-slate-150 bg-slate-50/30 p-3 text-sm font-semibold text-slate-600 italic">
                  {selectedRequest.comments ? `"${selectedRequest.comments}"` : <span className="text-slate-400 font-normal">No review comments provided</span>}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageRequests;
