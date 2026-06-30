import express from "express";
import {
  getAnalytics,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getPendingVerifications,
  verifyDoctor,
  getSystemLogs,
} from "../../Controllers/v1/adminControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// All admin routes require authentication and admin/super_admin role
router.use(isAuthenticatedUser, authrizeRole("admin", "super_admin"));

// Analytics
router.get("/analytics", getAnalytics);

// User Management
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Doctor Verification
router.get("/verifications", getPendingVerifications);
router.put("/doctors/:id/verify", verifyDoctor);

// System Logs
router.get("/logs", getSystemLogs);

export default router;
