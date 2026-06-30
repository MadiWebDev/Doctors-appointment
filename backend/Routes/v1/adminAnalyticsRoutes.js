import express from "express";
import {
  getDashboardStats,
  getAppointmentsDaily,
  getAppointmentsBySpecialization,
  getAppointmentsByStatus,
  getRevenueMonthly,
  getDoctorPerformance,
} from "../../Controllers/v1/adminAnalyticsControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// All routes are admin only
router.use(isAuthenticatedUser, authrizeRole("admin"));

router.get("/stats", getDashboardStats);
router.get("/appointments-daily", getAppointmentsDaily);
router.get("/appointments-specialization", getAppointmentsBySpecialization);
router.get("/appointments-status", getAppointmentsByStatus);
router.get("/revenue-monthly", getRevenueMonthly);
router.get("/doctor-performance", getDoctorPerformance);

export default router;
