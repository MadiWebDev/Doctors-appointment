import express from "express";
import {
  getAllSpecializations,
  getActiveSpecializations,
  getSpecialization,
  createSpecialization,
  updateSpecialization,
  deleteSpecialization,
  getSpecializationStats,
} from "../../Controllers/v1/specializationControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Public routes
router.get("/", getAllSpecializations);
router.get("/active", getActiveSpecializations);
router.get("/stats", isAuthenticatedUser, authrizeRole("admin"), getSpecializationStats);
router.get("/:id", getSpecialization);

// Admin only routes
router.post(
  "/",
  isAuthenticatedUser,
  authrizeRole("admin"),
  createSpecialization
);

router.put(
  "/:id",
  isAuthenticatedUser,
  authrizeRole("admin"),
  updateSpecialization
);

router.delete(
  "/:id",
  isAuthenticatedUser,
  authrizeRole("admin"),
  deleteSpecialization
);

export default router;
