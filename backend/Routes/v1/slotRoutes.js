import express from "express";
import {
  getAvailableSlots,
  getDoctorSlots,
  generateSlots,
  blockSlot,
  unblockSlot,
  deleteSlotRange,
  bookSlot,
  releaseSlot,
} from "../../Controllers/v1/slotControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Public routes
router.get("/doctor/:doctorId/available", getAvailableSlots);

// Protected routes - Doctor only
router.post(
  "/generate",
  isAuthenticatedUser,
  authrizeRole("doctor"),
  generateSlots
);

router.get(
  "/doctor/:doctorId",
  isAuthenticatedUser,
  authrizeRole("doctor", "admin"),
  getDoctorSlots
);

router.put(
  "/:slotId/block",
  isAuthenticatedUser,
  authrizeRole("doctor"),
  blockSlot
);

router.put(
  "/:slotId/unblock",
  isAuthenticatedUser,
  authrizeRole("doctor"),
  unblockSlot
);

router.delete(
  "/delete-range",
  isAuthenticatedUser,
  authrizeRole("doctor"),
  deleteSlotRange
);

// Internal routes (called by appointment controller)
router.post(
  "/:slotId/book",
  isAuthenticatedUser,
  authrizeRole("patient"),
  bookSlot
);

router.put(
  "/:slotId/release",
  isAuthenticatedUser,
  releaseSlot
);

export default router;
