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
router.post("/profile", isAuthenticatedUser, authrizeRole("user"), createPatientProfile);
router.get("/profile/me", isAuthenticatedUser, authrizeRole("user"), getMyPatientProfile);
router.put("/profile/:id", isAuthenticatedUser, authrizeRole("user"), updatePatientProfile);

// Medical History
router.post("/profile/:id/medical-history", isAuthenticatedUser, authrizeRole("user"), addMedicalHistory);
router.put("/profile/:id/medical-history/:historyId", isAuthenticatedUser, authrizeRole("user"), updateMedicalHistory);
router.delete("/profile/:id/medical-history/:historyId", isAuthenticatedUser, authrizeRole("user"), deleteMedicalHistory);

// Allergies
router.post("/profile/:id/allergies", isAuthenticatedUser, authrizeRole("user"), addAllergy);
router.put("/profile/:id/allergies/:allergyId", isAuthenticatedUser, authrizeRole("user"), updateAllergy);
router.delete("/profile/:id/allergies/:allergyId", isAuthenticatedUser, authrizeRole("user"), deleteAllergy);

// Current Medications
router.post("/profile/:id/medications", isAuthenticatedUser, authrizeRole("user"), addCurrentMedication);
router.put("/profile/:id/medications/:medicationId", isAuthenticatedUser, authrizeRole("user"), updateCurrentMedication);
router.delete("/profile/:id/medications/:medicationId", isAuthenticatedUser, authrizeRole("user"), deleteCurrentMedication);

// Family History
router.post("/profile/:id/family-history", isAuthenticatedUser, authrizeRole("user"), addFamilyHistory);
router.put("/profile/:id/family-history/:familyId", isAuthenticatedUser, authrizeRole("user"), updateFamilyHistory);
router.delete("/profile/:id/family-history/:familyId", isAuthenticatedUser, authrizeRole("user"), deleteFamilyHistory);

// Lifestyle and Insurance
router.put("/profile/:id/lifestyle", isAuthenticatedUser, authrizeRole("user"), updateLifestyle);
router.put("/profile/:id/insurance", isAuthenticatedUser, authrizeRole("user"), updateInsurance);

// Preferred Doctors
router.post("/profile/:id/preferred-doctors", isAuthenticatedUser, authrizeRole("user"), addPreferredDoctor);
router.delete("/profile/:id/preferred-doctors/:doctorId", isAuthenticatedUser, authrizeRole("user"), removePreferredDoctor);

// Admin routes
router.delete("/admin/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), deletePatient);

export default router;
