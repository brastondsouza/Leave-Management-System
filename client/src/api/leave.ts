import api from "./axios";

export const leaveApi = {
  getBalances: async () => {
    const response = await api.get("/leaves/balances");
    return response.data.balances;
  },

  getHistory: async (params?: {
  status?: string;
  leaveType?: string;
  search?: string;
}) => {
    const response = await api.get("/leaves/history", { params });
    return response.data.leaves;
  },

  applyLeave: async (payload: {
  leaveType: "casual" | "sick" | "earned";
  startDate: string;
  endDate: string;
  reason: string;
}) => {
    const response = await api.post("/leaves", payload);
    return response.data.leave;
  },

  getAdminRequests: async (params?: {
  status?: string;
  leaveType?: string;
  search?: string;
}) => {
    const response = await api.get("/leaves/admin/requests", {
      params,
    });

    return response.data.leaves;
  },

  updateRequestStatus: async (
    id: string,
    status: "approved" | "rejected",
    comments?: string
  ) => {
    const response = await api.put(`/leaves/requests/${id}`, {
      status,
      adminComment: comments,
    });

    return response.data.leave;
  },

  getAdminStats: async () => {
    const response = await api.get("/leaves/admin/stats");
    return response.data.stats;
  },
};