import express from "express";
import {
  createDoctorProfile,
  getDoctorById,
  getMyDoctorProfile,
  getAllDoctors,
  updateDoctorProfile,
  addPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  addDocument,
  updateAvailability,
  updateOnlineStatus,
  addReview,
  verifyDoctor,
  getPendingVerifications,
  deleteDoctor,
} from "../../Controllers/v1/doctorControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Public routes
router.get("/", getAllDoctors);
router.get("/:id", getDoctorById);

// Protected routes - Doctor only
router.post("/profile", isAuthenticatedUser, authrizeRole("doctor"), createDoctorProfile);
router.get("/profile/me", isAuthenticatedUser, authrizeRole("doctor"), getMyDoctorProfile);
router.put("/profile/:id", isAuthenticatedUser, authrizeRole("doctor"), updateDoctorProfile);
router.put("/profile/:id/availability", isAuthenticatedUser, authrizeRole("doctor"), updateAvailability);
router.put("/profile/:id/online-status", isAuthenticatedUser, authrizeRole("doctor"), updateOnlineStatus);

// Payment methods
router.post("/profile/:id/payment-methods", isAuthenticatedUser, authrizeRole("doctor"), addPaymentMethod);
router.put("/profile/:id/payment-methods/:paymentMethodId", isAuthenticatedUser, authrizeRole("doctor"), updatePaymentMethod);
router.delete("/profile/:id/payment-methods/:paymentMethodId", isAuthenticatedUser, authrizeRole("doctor"), deletePaymentMethod);

// Documents
router.post("/profile/:id/documents", isAuthenticatedUser, authrizeRole("doctor"), addDocument);

// Reviews (Patient only)
router.post("/:id/reviews", isAuthenticatedUser, authrizeRole("user"), addReview);

// Admin routes
router.get("/admin/pending-verifications", isAuthenticatedUser, authrizeRole("admin", "super_admin"), getPendingVerifications);
router.put("/admin/:id/verify", isAuthenticatedUser, authrizeRole("admin", "super_admin"), verifyDoctor);
router.delete("/admin/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), deleteDoctor);

export default router;
