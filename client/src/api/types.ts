export type UserRole = 'employee' | 'admin';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  designation: string;
  leaveBalance?: {
    casual: number;
    sick: number;
    earned: number;
  };
}

export type LeaveType = 'casual' | 'sick' | 'earned';

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveBalance {
  leaveType: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

export interface LeaveBalancesResponse {
  casual: LeaveBalance;
  sick: LeaveBalance;
  earned: LeaveBalance;
}

export interface LeaveRequest {
  _id: string;
  employee: User | string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  comments?: string;
  approvedBy?: User | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  pendingRequestsCount: number;
  approvedRequestsCount: number;
  activeEmployeesCount: number;
  onLeaveTodayCount: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}
