import express from "express";
import {
  createPrescription,
  getPrescriptionById,
  getPatientPrescriptions,
  getDoctorPrescriptions,
  getMyPrescriptions,
  getMyPrescriptionsDoctor,
  updatePrescription,
  deletePrescription,
  verifyPrescription,
  markAsDispensed,
  getPrescriptionsByAppointment,
  getActivePrescriptions,
  searchPrescriptions,
} from "../../Controllers/v1/prescriptionControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Protected routes - Doctor only
router.post("/", isAuthenticatedUser, authrizeRole("doctor"), createPrescription);
router.get("/doctor/my-prescriptions", isAuthenticatedUser, authrizeRole("doctor"), getMyPrescriptionsDoctor);

// Protected routes - Patient only
router.get("/my-prescriptions", isAuthenticatedUser, authrizeRole("patient"), getMyPrescriptions);
router.get("/active", isAuthenticatedUser, authrizeRole("patient"), getActivePrescriptions);

// Authenticated routes (any role)
router.get("/search", isAuthenticatedUser, searchPrescriptions);
router.get("/appointment/:appointmentId", isAuthenticatedUser, getPrescriptionsByAppointment);
router.get("/patient/:patientId", isAuthenticatedUser, getPatientPrescriptions);
router.get("/doctor/:doctorId", isAuthenticatedUser, getDoctorPrescriptions);
router.get("/:id", isAuthenticatedUser, getPrescriptionById);

// Protected routes - Doctor only (update/delete)
router.put("/:id", isAuthenticatedUser, authrizeRole("doctor"), updatePrescription);
router.delete("/:id", isAuthenticatedUser, authrizeRole("doctor"), deletePrescription);

// Admin/Pharmacy routes
router.put("/:id/verify", isAuthenticatedUser, authrizeRole("admin", "super_admin"), verifyPrescription);
router.put("/:id/dispense", isAuthenticatedUser, authrizeRole("admin", "super_admin"), markAsDispensed);

export default router;
