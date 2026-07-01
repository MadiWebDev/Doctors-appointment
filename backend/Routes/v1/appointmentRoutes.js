import express from "express";
import {
  bookAppointment,
  getAppointmentById,
  getAllAppointmentsAdmin,
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

// ─── Static / prefix routes FIRST (must come before any /:param routes) ─────

// Public
router.get("/available-slots/:doctorId", getAvailableSlots);

// Admin — list all appointments
router.get(
  "/admin/all",
  isAuthenticatedUser,
  authrizeRole("admin", "super_admin"),
  getAllAppointmentsAdmin
);

// Patient — own appointments
router.get(
  "/my-appointments",
  isAuthenticatedUser,
  authrizeRole("patient"),
  getPatientAppointments
);

// Doctor — own appointments (resolved from user ID via Doctor model)
router.get(
  "/my-doctor-appointments",
  isAuthenticatedUser,
  authrizeRole("doctor"),
  async (req, res, next) => {
    try {
      const Doctor = (await import("../../Models/doctorModels.js")).default;
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor) {
        return res.status(404).json({ success: false, message: "Doctor profile not found" });
      }
      req.params.doctorId = doctor._id.toString();
      next();
    } catch (err) {
      next(err);
    }
  },
  getDoctorAppointments
);

// Doctor — appointments by explicit doctorId
router.get(
  "/doctor/:doctorId",
  isAuthenticatedUser,
  authrizeRole("doctor", "admin", "super_admin"),
  getDoctorAppointments
);

// ─── Param / action routes ───────────────────────────────────────────────────

router.post("/book",            isAuthenticatedUser, authrizeRole("patient"),               bookAppointment);
router.get( "/:id",             isAuthenticatedUser,                                         getAppointmentById);
router.put( "/:id/cancel",      isAuthenticatedUser,                                         cancelAppointment);
router.put( "/:id/reschedule",  isAuthenticatedUser, authrizeRole("patient"),               rescheduleAppointment);
router.put( "/:id/waitlist",    isAuthenticatedUser, authrizeRole("patient"),               addToWaitlist);
router.put( "/:id/confirm",     isAuthenticatedUser, authrizeRole("doctor"),                confirmAppointment);
router.put( "/:id/complete",    isAuthenticatedUser, authrizeRole("doctor"),                completeAppointment);
router.put( "/:id/no-show",     isAuthenticatedUser, authrizeRole("doctor"),                markNoShow);
router.put( "/:id/video-consultation", isAuthenticatedUser, authrizeRole("doctor"),         updateVideoConsultation);

// Zoom
router.post("/:appointmentId/zoom-meeting",  isAuthenticatedUser, createZoomMeeting);
router.get( "/:appointmentId/zoom-signature",isAuthenticatedUser, getZoomMeetingSignature);

export default router;
