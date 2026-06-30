import express from "express";
import {
  bookAppointment,
  getAppointmentById,
  getPatientAppointments,
  getDoctorAppointments,
  getAvailableSlots,
  confirmAppointment,
  cancelAppointment,
  rescheduleAppointment,
  completeAppointment,
  markNoShow,
  addToWaitlist,
  updateVideoConsultation,
  createZoomMeeting,
  getZoomMeetingSignature,
} from "../../Controllers/v1/appointmentControllers.js";
import { isAuthenticatedUser, authrizeRole } from "../../Middleware/authE.js";

const router = express.Router();

// Public routes
router.get("/available-slots/:doctorId", getAvailableSlots);

// Protected routes - Patient
router.post("/book", isAuthenticatedUser, authrizeRole("user"), bookAppointment);
router.get("/my-appointments", isAuthenticatedUser, authrizeRole("user"), getPatientAppointments);
router.get("/:id", isAuthenticatedUser, getAppointmentById);
router.put("/:id/cancel", isAuthenticatedUser, authrizeRole("user"), cancelAppointment);
router.put("/:id/reschedule", isAuthenticatedUser, authrizeRole("user"), rescheduleAppointment);
router.put("/:id/waitlist", isAuthenticatedUser, authrizeRole("user"), addToWaitlist);

// Protected routes - Doctor
router.get("/doctor/:doctorId", isAuthenticatedUser, authrizeRole("doctor"), getDoctorAppointments);
router.put("/:id/confirm", isAuthenticatedUser, authrizeRole("doctor"), confirmAppointment);
router.put("/:id/complete", isAuthenticatedUser, authrizeRole("doctor"), completeAppointment);
router.put("/:id/no-show", isAuthenticatedUser, authrizeRole("doctor"), markNoShow);
router.put("/:id/video-consultation", isAuthenticatedUser, authrizeRole("doctor"), updateVideoConsultation);

// Zoom meeting routes
router.post("/:appointmentId/zoom-meeting", isAuthenticatedUser, createZoomMeeting);
router.get("/:appointmentId/zoom-signature", isAuthenticatedUser, getZoomMeetingSignature);

// Admin routes
router.get("/admin/:id", isAuthenticatedUser, authrizeRole("admin", "super_admin"), getAppointmentById);

export default router;
