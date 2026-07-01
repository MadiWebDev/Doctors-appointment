import express from "express";
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingVerifications,
  verifyDoctor,
  getSystemLogs,
  getAllNotifications,
  broadcastNotification,
  deleteNotificationAdmin,
  bulkDeleteNotifications,
} from "../../Controllers/v1/adminControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// All admin routes require authentication and admin/super_admin role
router.use(isAuthenticatedUser, authrizeRole("admin", "super_admin"));

// Analytics
router.get("/analytics", getAnalytics);

// User Management
router.get("/users",             getAllUsers);
router.put("/users/:id/role",    updateUserRole);
router.delete("/users/:id",      deleteUser);

// Doctor Verification
// /verifications  — list pending
router.get("/verifications",      getPendingVerifications);
// /doctors/:id/verify  — generic (body contains { status })
router.put("/doctors/:id/verify", verifyDoctor);
// /doctors/:id/approve and /doctors/:id/reject — convenience aliases used by the frontend
router.put("/doctors/:id/approve", (req, res, next) => {
  req.body.status = "approved";
  return verifyDoctor(req, res, next);
});
router.put("/doctors/:id/reject",  (req, res, next) => {
  if (!req.body.status) req.body.status = "rejected";
  return verifyDoctor(req, res, next);
});

// System Logs
router.get("/logs", getSystemLogs);

// ─── Notifications ────────────────────────────────────────────────────────
// static routes before /:id
router.get("/notifications",               getAllNotifications);
router.post("/notifications/broadcast",    broadcastNotification);
router.delete("/notifications/bulk-delete", bulkDeleteNotifications);
router.delete("/notifications/:id",        deleteNotificationAdmin);

export default router;
