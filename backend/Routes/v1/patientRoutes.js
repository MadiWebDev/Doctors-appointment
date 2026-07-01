import express from "express";
import {
  createPatientProfile,
  getPatientById,
  getMyPatientProfile,
  updatePatientProfile,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  addAllergy,
  updateAllergy,
  deleteAllergy,
  addCurrentMedication,
  updateCurrentMedication,
  deleteCurrentMedication,
  addFamilyHistory,
  updateFamilyHistory,
  deleteFamilyHistory,
  updateLifestyle,
  updateInsurance,
  addPreferredDoctor,
  removePreferredDoctor,
  deletePatient,
} from "../../Controllers/v1/patientControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Public routes
router.get("/:id", getPatientById);

// Protected routes - Patient only
router.post("/profile", isAuthenticatedUser, authrizeRole("patient"), createPatientProfile);
router.get("/profile/me", isAuthenticatedUser, authrizeRole("patient"), getMyPatientProfile);
router.put("/profile/:id", isAuthenticatedUser, authrizeRole("patient"), updatePatientProfile);

// Medical History
router.post("/profile/:id/medical-history", isAuthenticatedUser, authrizeRole("patient"), addMedicalHistory);
router.put("/profile/:id/medical-history/:historyId", isAuthenticatedUser, authrizeRole("patient"), updateMedicalHistory);
router.delete("/profile/:id/medical-history/:historyId", isAuthenticatedUser, authrizeRole("patient"), deleteMedicalHistory);

// Allergies
router.post("/profile/:id/allergies", isAuthenticatedUser, authrizeRole("patient"), addAllergy);
router.put("/profile/:id/allergies/:allergyId", isAuthenticatedUser, authrizeRole("patient"), updateAllergy);
router.delete("/profile/:id/allergies/:allergyId", isAuthenticatedUser, authrizeRole("patient"), deleteAllergy);

// Current Medications
router.post("/profile/:id/medications", isAuthenticatedUser, authrizeRole("patient"), addCurrentMedication);
router.put("/profile/:id/medications/:medicationId", isAuthenticatedUser, authrizeRole("patient"), updateCurrentMedication);
router.delete("/profile/:id/medications/:medicationId", isAuthenticatedUser, authrizeRole("patient"), deleteCurrentMedication);

// Family History
router.post("/profile/:id/family-history", isAuthenticatedUser, authrizeRole("patient"), addFamilyHistory);
router.put("/profile/:id/family-history/:familyId", isAuthenticatedUser, authrizeRole("patient"), updateFamilyHistory);
router.delete("/profile/:id/family-history/:familyId", isAuthenticatedUser, authrizeRole("patient"), deleteFamilyHistory);

// Lifestyle and Insurance
router.put("/profile/:id/lifestyle", isAuthenticatedUser, authrizeRole("patient"), updateLifestyle);
router.put("/profile/:id/insurance", isAuthenticatedUser, authrizeRole("patient"), updateInsurance);

// Preferred Doctors
router.post("/profile/:id/preferred-doctors", isAuthenticatedUser, authrizeRole("patient"), addPreferredDoctor);
router.delete("/profile/:id/preferred-doctors/:doctorId", isAuthenticatedUser, authrizeRole("patient"), removePreferredDoctor);

// Admin routes
router.delete("/admin/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), deletePatient);

export default router;
