import mongoose from "mongoose";
import Leave from "../models/Leave.js";
import User from "../models/User.js";

const VALID_LEAVE_TYPES = [ "sick", "casual", "earned", ];
const VALID_STATUSES = ["pending", "approved", "rejected"];
const EMPLOYEE_SELECT =
"name email role department designation leaveBalance";

const employeePath = Leave.schema.path("employee") ? "employee" : "user";

const getUserId = (req) => req.user?._id || req.user?.id;

const toDateOnly = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const calculateLeaveDays = (startDate, endDate) => {
  const start = toDateOnly(startDate);
  const end = toDateOnly(endDate);

  if (!start || !end || end < start) return null;

  return Math.floor((end - start) / (24 * 60 * 60 * 1000)) + 1;
};

const getBalance = (user, leaveType) => {
  return user.leaveBalance?.[leaveType] ?? 0;
};

const setBalance = (user, leaveType, balance) => {
  user.leaveBalance[leaveType] = balance;
};

const populateEmployee = (query) => query.populate(employeePath, EMPLOYEE_SELECT);

export const createLeaveRequest = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: "Leave type, start date, end date and reason are required",
      });
    }

    if (!VALID_LEAVE_TYPES.includes(leaveType)) {
      return res.status(400).json({ success: false, message: "Invalid leave type", allowedTypes: VALID_LEAVE_TYPES });
    }

    const days = calculateLeaveDays(startDate, endDate);
    if (!days) {
      return res.status(400).json({ success: false, message: "Invalid leave date range" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const availableBalance = getBalance(user, leaveType);
    if (availableBalance < days){
      return res.status(400).json({
        success: false,
        message: "Insufficient leave balance",
        availableBalance,
        requestedDays: days,
      });
    }

   const leavePayload = {
  [employeePath]: userId,
  leaveType,
  startDate: toDateOnly(startDate),
  endDate: toDateOnly(endDate),
  totalDays: days,
  reason: reason.trim(),
  status: "pending",
};

    const leave = await Leave.create(leavePayload);
    const populatedLeave = await populateEmployee(Leave.findById(leave._id));

    return res.status(201).json({
      success: true,
      message: "Leave request submitted successfully",
      leave: populatedLeave,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to submit leave request", error: error.message });
  }
};

export const getLeaveHistory = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const leaves = await populateEmployee(
      Leave.find({ [employeePath]: userId }).sort({ createdAt: -1 })
    );

    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch leave history", error: error.message });
  }
};

export const getLeaveBalances = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const user = await User.findById(userId).select("leaveBalance")
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
  success: true,
  balances: user.leaveBalance,
});
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch leave balances", error: error.message });
  }
};

export const getAdminLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;

    if (status && !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status filter" });
    }

    const query = status ? { status } : {};
    const leaves = await populateEmployee(Leave.find(query).sort({ createdAt: -1 }));

    return res.status(200).json({ success: true, count: leaves.length, leaves });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch leave requests", error: error.message });
  }
};

export const updateLeaveRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid leave request id" });
    }

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be approved or rejected" });
    }

    let savedLeave;

    await session.withTransaction(async () => {
      const leave = await Leave.findById(id).session(session);

      if (!leave) {
        const error = new Error("Leave request not found");
        error.statusCode = 404;
        throw error;
      }

      if (leave.status !== "pending") {
        const error = new Error("Only pending leave requests can be updated");
        error.statusCode = 400;
        throw error;
      }

      const user = await User.findById(leave[employeePath]).session(session);
      if (!user) {
        const error = new Error("Employee not found");
        error.statusCode = 404;
        throw error;
      }

      if (status === "approved") {
        const availableBalance = getBalance(user, leave.leaveType);

        if (availableBalance < leave.totalDays) {
          const error = new Error("Insufficient leave balance");
          error.statusCode = 400;
          error.availableBalance = availableBalance;
          error.requestedDays = leave.totalDays;
          throw error;
        }

        setBalance(user, leave.leaveType, availableBalance - leave.totalDays);
        await user.save({ session });
      }

      leave.status = status;
      leave.comments = adminComment?.trim() || "";
      leave.approvedBy = getUserId(req);
      

      savedLeave = await leave.save({ session });
    });

    const populatedLeave = await populateEmployee(Leave.findById(savedLeave._id));

    return res.status(200).json({
      success: true,
      message: `Leave request ${status} successfully`,
      leave: populatedLeave,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update leave request",
      availableBalance: error.availableBalance,
      requestedDays: error.requestedDays,
    });
  } finally {
    await session.endSession();
  }
};

export const getAdminLeaveStats = async (req, res) => {
  try {
    const [statusStats, typeStats, totalStats] = await Promise.all([
      Leave.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, days: { $sum: "$totalDays" } } }]),
      Leave.aggregate([{ $group: { _id: "$leaveType", count: { $sum: 1 }, days: { $sum: "$totalDays" } } }]),
      Leave.aggregate([{ $group: { _id: null, totalRequests: { $sum: 1 }, totalDays: { $sum: "$totalDays" } } }]),
    ]);

    const byStatus = VALID_STATUSES.reduce((acc, status) => {
      acc[status] = { count: 0, days: 0 };
      return acc;
    }, {});

    statusStats.forEach((item) => {
      byStatus[item._id] = { count: item.count, days: item.days };
    });

    const byType = typeStats.reduce((acc, item) => {
      acc[item._id || "unknown"] = { count: item.count, days: item.days };
      return acc;
    }, {});

    return res.status(200).json({
      success: true,
      stats: {
        totalRequests: totalStats[0]?.totalRequests || 0,
        totalDays: totalStats[0]?.totalDays || 0,
        byStatus,
        byType,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch leave stats", error: error.message });
  }
};

export const getCalendarLeaves = async (req, res) => {
  try {
    const role = req.user?.role;
    const { status } = req.query;

    if (role === "admin") {
      if (status && !VALID_STATUSES.includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status filter" });
      }
      const query = status ? { status } : {};
      const leaves = await populateEmployee(Leave.find(query).sort({ createdAt: -1 }));
      return res.status(200).json({ success: true, count: leaves.length, leaves });
    } else {
      // Employee role: only return approved leave dates
      // Regardless of query, employees only see approved leaves
      const leaves = await Leave.find({ status: "approved" }).sort({ createdAt: -1 });

      const sanitizedLeaves = leaves.map((leave) => ({
        _id: leave._id,
        startDate: leave.startDate,
        endDate: leave.endDate,
      }));

      return res.status(200).json({ success: true, count: sanitizedLeaves.length, leaves: sanitizedLeaves });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to fetch calendar leaves", error: error.message });
  }
};