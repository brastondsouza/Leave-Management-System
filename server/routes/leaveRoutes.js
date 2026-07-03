import express from "express";
import {
  createLeaveRequest,
  getAdminLeaveRequests,
  getAdminLeaveStats,
  getLeaveBalances,
  getLeaveHistory,
  updateLeaveRequest,
  getCalendarLeaves,
} from "../controllers/leaveController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import roleMiddleware from "../middleware/roleMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createLeaveRequest);
router.get("/history", authMiddleware, getLeaveHistory);
router.get("/balances", authMiddleware, getLeaveBalances);
router.get("/calendar", authMiddleware, getCalendarLeaves);

router.get("/admin/requests", authMiddleware, roleMiddleware("admin"), getAdminLeaveRequests);
router.put("/requests/:id", authMiddleware, roleMiddleware("admin"), updateLeaveRequest);
router.get("/admin/stats", authMiddleware, roleMiddleware("admin"), getAdminLeaveStats);

export default router;