import express from "express";
import {
  createMedicalRecord,
  getMedicalRecordById,
  getPatientMedicalRecords,
  getDoctorMedicalRecords,
  getMyMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
  getMedicalRecordsByAppointment,
  searchMedicalRecords,
} from "../../Controllers/v1/medicalRecordControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Protected routes - Doctor only
router.post("/", isAuthenticatedUser, authrizeRole("doctor"), createMedicalRecord);

// Protected routes - Patient only
router.get("/my-records", isAuthenticatedUser, authrizeRole("patient"), getMyMedicalRecords);

// Authenticated routes (any role)
router.get("/search", isAuthenticatedUser, searchMedicalRecords);
router.get("/appointment/:appointmentId", isAuthenticatedUser, getMedicalRecordsByAppointment);
router.get("/patient/:patientId", isAuthenticatedUser, getPatientMedicalRecords);
router.get("/doctor/:doctorId", isAuthenticatedUser, getDoctorMedicalRecords);
router.get("/:id", isAuthenticatedUser, getMedicalRecordById);

// Protected routes - Doctor only (update/delete)
router.put("/:id", isAuthenticatedUser, authrizeRole("doctor"), updateMedicalRecord);
router.delete("/:id", isAuthenticatedUser, authrizeRole("doctor"), deleteMedicalRecord);

// Admin routes
router.delete("/admin/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), deleteMedicalRecord);

export default router;
