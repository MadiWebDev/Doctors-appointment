import appointmentService from "../../Services/appointmentService.js";
import zoomService from "../../Services/zoomService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { bookAppointmentSchema, rescheduleAppointmentSchema, cancelAppointmentSchema, completeAppointmentSchema, updateVideoConsultationSchema } from "../../Validators/appointmentValidator.js";

// Book Appointment
export const bookAppointment = catchAsyncError(async (req, res, next) => {
  const validationResult = bookAppointmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const appointment = await appointmentService.bookAppointment(req.user._id, validationResult.data);
  res.status(201).json({
    success: true,
    message: "Appointment booked successfully",
    appointment,
  });
});

// Get Appointment by ID
export const getAppointmentById = catchAsyncError(async (req, res, next) => {
  const appointment = await appointmentService.getAppointmentById(req.params.id);
  res.status(200).json({
    success: true,
    appointment,
  });
});

// Get Patient's Appointments
export const getPatientAppointments = catchAsyncError(async (req, res, next) => {
  const filters = {
    status: req.query.status,
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await appointmentService.getPatientAppointments(req.user._id, filters, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get Doctor's Appointments
export const getDoctorAppointments = catchAsyncError(async (req, res, next) => {
  const filters = {
    status: req.query.status,
    date: req.query.date,
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await appointmentService.getDoctorAppointments(req.params.doctorId, filters, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get Available Slots
export const getAvailableSlots = catchAsyncError(async (req, res, next) => {
  const { date } = req.query;
  if (!date) {
    return res.status(400).json({
      success: false,
      message: "Date is required",
    });
  }

  const result = await appointmentService.getAvailableSlots(req.params.doctorId, date);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Confirm Appointment
export const confirmAppointment = catchAsyncError(async (req, res, next) => {
  const appointment = await appointmentService.confirmAppointment(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Appointment confirmed successfully",
    appointment,
  });
});

// Cancel Appointment
export const cancelAppointment = catchAsyncError(async (req, res, next) => {
  const validationResult = cancelAppointmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const appointment = await appointmentService.cancelAppointment(
    req.params.id,
    req.user._id,
    validationResult.data.reason
  );
  res.status(200).json({
    success: true,
    message: "Appointment cancelled successfully",
    appointment,
  });
});

// Reschedule Appointment
export const rescheduleAppointment = catchAsyncError(async (req, res, next) => {
  const validationResult = rescheduleAppointmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const appointment = await appointmentService.rescheduleAppointment(
    req.params.id,
    req.user._id,
    validationResult.data.newDate,
    validationResult.data.newTime,
    validationResult.data.newEndTime,
    validationResult.data.reason
  );
  res.status(200).json({
    success: true,
    message: "Appointment rescheduled successfully",
    appointment,
  });
});

// Complete Appointment
export const completeAppointment = catchAsyncError(async (req, res, next) => {
  const validationResult = completeAppointmentSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const appointment = await appointmentService.completeAppointment(
    req.params.id,
    req.user._id,
    validationResult.data.doctorNotes,
    validationResult.data.prescription,
    validationResult.data.diagnosis
  );
  res.status(200).json({
    success: true,
    message: "Appointment completed successfully",
    appointment,
  });
});

// Mark No-Show
export const markNoShow = catchAsyncError(async (req, res, next) => {
  const appointment = await appointmentService.markNoShow(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Appointment marked as no-show",
    appointment,
  });
});

// Add to Waitlist
export const addToWaitlist = catchAsyncError(async (req, res, next) => {
  const appointment = await appointmentService.addToWaitlist(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Added to waitlist successfully",
    appointment,
  });
});

// Update Video Consultation Details
export const updateVideoConsultation = catchAsyncError(async (req, res, next) => {
  const validationResult = updateVideoConsultationSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const Appointment = await import("../../Models/appointmentModels.js");
  const appointment = await Appointment.default.findById(req.params.id);

  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found",
    });
  }

  appointment.videoConsultation = validationResult.data;
  await appointment.save();

  res.status(200).json({
    success: true,
    message: "Video consultation details updated successfully",
    appointment,
  });
});

// Create Zoom Meeting for Appointment
export const createZoomMeeting = catchAsyncError(async (req, res, next) => {
  const { appointmentId } = req.params;
  
  // Get appointment details
  const appointment = await appointmentService.getAppointmentById(appointmentId);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }

  // Check if user is authorized (doctor or patient)
  if (appointment.patient.toString() !== req.user._id.toString() && 
      appointment.doctor.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Not authorized to create meeting for this appointment"
    });
  }

  // Check if meeting already exists
  if (appointment.videoConsultation && appointment.videoConsultation.meetingUrl) {
    return res.status(400).json({
      success: false,
      message: "Zoom meeting already exists for this appointment"
    });
  }

  // Create Zoom meeting
  const appointmentDate = new Date(appointment.appointmentDate);
  const startTime = appointmentDate.toISOString();

  const zoomMeeting = await zoomService.createMeeting({
    topic: `Consultation with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
    type: 2, // Scheduled meeting
    startTime: startTime,
    duration: 30, // Default 30 minutes
    agenda: appointment.reason,
  });

  // Update appointment with Zoom meeting details
  const updatedAppointment = await appointmentService.updateVideoConsultation(
    appointmentId,
    req.user._id,
    {
      meetingUrl: zoomMeeting.joinUrl,
      meetingId: zoomMeeting.meetingId.toString(),
      meetingPassword: zoomMeeting.password,
      platform: "zoom",
    }
  );

  res.status(200).json({
    success: true,
    message: "Zoom meeting created successfully",
    meeting: zoomMeeting,
    appointment: updatedAppointment,
  });
});

// Get Zoom Meeting Signature for Client SDK
export const getZoomMeetingSignature = catchAsyncError(async (req, res, next) => {
  const { appointmentId } = req.params;
  
  const appointment = await appointmentService.getAppointmentById(appointmentId);
  
  if (!appointment) {
    return res.status(404).json({
      success: false,
      message: "Appointment not found"
    });
  }

  if (!appointment.videoConsultation || !appointment.videoConsultation.meetingId) {
    return res.status(400).json({
      success: false,
      message: "No Zoom meeting associated with this appointment"
    });
  }

  // Determine role: 0 = participant, 1 = host
  const role = appointment.doctor.toString() === req.user._id.toString() ? 1 : 0;

  const signature = zoomService.generateMeetingSignature(
    appointment.videoConsultation.meetingId,
    role
  );

  res.status(200).json({
    success: true,
    signature,
    meetingNumber: appointment.videoConsultation.meetingId,
    role,
    meetingUrl: appointment.videoConsultation.meetingUrl,
    password: appointment.videoConsultation.meetingPassword,
  });
});
