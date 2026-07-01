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

// ─── All static/prefix routes BEFORE /:id ──────────────────────────────────

// Public list
router.get("/", getAllDoctors);

// Doctor profile — "profile/me" must be before /:id
router.post("/profile",    isAuthenticatedUser, authrizeRole("doctor"), createDoctorProfile);
router.get( "/profile/me", isAuthenticatedUser, authrizeRole("doctor"), getMyDoctorProfile);

// Admin — must be before /:id so "admin" isn't treated as a doctor id
router.get(
  "/admin/pending-verifications",
  isAuthenticatedUser, authrizeRole("admin", "super_admin"),
  getPendingVerifications
);
router.put(
  "/admin/:id/verify",
  isAuthenticatedUser, authrizeRole("admin", "super_admin"),
  verifyDoctor
);
router.delete(
  "/admin/:id",
  isAuthenticatedUser, authrizeRole("admin", "super_admin"),
  deleteDoctor
);

// ─── Param routes ───────────────────────────────────────────────────────────

// Public — single doctor by id (must come after all static prefixes)
router.get("/:id", getDoctorById);

// Doctor — profile updates (after /:id to avoid conflicts)
router.put( "/profile/:id",                    isAuthenticatedUser, authrizeRole("doctor"), updateDoctorProfile);
router.put( "/profile/:id/availability",       isAuthenticatedUser, authrizeRole("doctor"), updateAvailability);
router.put( "/profile/:id/online-status",      isAuthenticatedUser, authrizeRole("doctor"), updateOnlineStatus);
router.post("/profile/:id/payment-methods",    isAuthenticatedUser, authrizeRole("doctor"), addPaymentMethod);
router.put( "/profile/:id/payment-methods/:paymentMethodId", isAuthenticatedUser, authrizeRole("doctor"), updatePaymentMethod);
router.delete("/profile/:id/payment-methods/:paymentMethodId", isAuthenticatedUser, authrizeRole("doctor"), deletePaymentMethod);
router.post("/profile/:id/documents",          isAuthenticatedUser, authrizeRole("doctor"), addDocument);

// Patient — reviews
router.post("/:id/reviews", isAuthenticatedUser, authrizeRole("patient"), addReview);

export default router;
