import prescriptionService from "../../Services/prescriptionService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { createPrescriptionSchema, updatePrescriptionSchema } from "../../Validators/prescriptionValidator.js";

// Create Prescription
export const createPrescription = catchAsyncError(async (req, res, next) => {
  const validationResult = createPrescriptionSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const prescription = await prescriptionService.createPrescription(validationResult.data, req.user._id);
  res.status(201).json({
    success: true,
    message: "Prescription created successfully",
    prescription,
  });
});

// Get Prescription by ID
export const getPrescriptionById = catchAsyncError(async (req, res, next) => {
  const prescription = await prescriptionService.getPrescriptionById(req.params.id);
  res.status(200).json({
    success: true,
    prescription,
  });
});

// Get Patient's Prescriptions
export const getPatientPrescriptions = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await prescriptionService.getPatientPrescriptions(req.params.patientId, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get Doctor's Prescriptions
export const getDoctorPrescriptions = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await prescriptionService.getDoctorPrescriptions(req.params.doctorId, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get My Prescriptions (Patient)
export const getMyPrescriptions = catchAsyncError(async (req, res, next) => {
  const Patient = await import("../../Models/patientModels.js");
  const patient = await Patient.default.findOne({ user: req.user._id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient profile not found",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await prescriptionService.getPatientPrescriptions(patient._id, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get My Prescriptions (Doctor)
export const getMyPrescriptionsDoctor = catchAsyncError(async (req, res, next) => {
  const Doctor = await import("../../Models/doctorModels.js");
  const doctor = await Doctor.default.findOne({ user: req.user._id });
  
  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor profile not found",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await prescriptionService.getDoctorPrescriptions(doctor._id, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Update Prescription
export const updatePrescription = catchAsyncError(async (req, res, next) => {
  const validationResult = updatePrescriptionSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const prescription = await prescriptionService.updatePrescription(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Prescription updated successfully",
    prescription,
  });
});

// Delete Prescription
export const deletePrescription = catchAsyncError(async (req, res, next) => {
  const prescription = await prescriptionService.deletePrescription(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Prescription deleted successfully",
  });
});

// Verify Prescription (Admin/Pharmacy)
export const verifyPrescription = catchAsyncError(async (req, res, next) => {
  const prescription = await prescriptionService.verifyPrescription(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Prescription verified successfully",
    prescription,
  });
});

// Mark as Dispensed
export const markAsDispensed = catchAsyncError(async (req, res, next) => {
  const { dispensedBy } = req.body;
  if (!dispensedBy) {
    return res.status(400).json({
      success: false,
      message: "Dispensed by information is required",
    });
  }

  const prescription = await prescriptionService.markAsDispensed(req.params.id, dispensedBy);
  res.status(200).json({
    success: true,
    message: "Prescription marked as dispensed",
    prescription,
  });
});

// Get Prescriptions by Appointment
export const getPrescriptionsByAppointment = catchAsyncError(async (req, res, next) => {
  const prescriptions = await prescriptionService.getPrescriptionsByAppointment(req.params.appointmentId);
  res.status(200).json({
    success: true,
    prescriptions,
  });
});

// Get Active Prescriptions
export const getActivePrescriptions = catchAsyncError(async (req, res, next) => {
  const Patient = await import("../../Models/patientModels.js");
  const patient = await Patient.default.findOne({ user: req.user._id });
  
  if (!patient) {
    return res.status(404).json({
      success: false,
      message: "Patient profile not found",
    });
  }

  const prescriptions = await prescriptionService.getActivePrescriptions(patient._id);
  res.status(200).json({
    success: true,
    prescriptions,
  });
});

// Search Prescriptions
export const searchPrescriptions = catchAsyncError(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const prescriptions = await prescriptionService.searchPrescriptions(q, req.user._id, req.user.role);
  res.status(200).json({
    success: true,
    prescriptions,
  });
});
