import medicalRecordService from "../../Services/medicalRecordService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { createMedicalRecordSchema, updateMedicalRecordSchema } from "../../Validators/medicalRecordVault.js";

// Create Medical Record
export const createMedicalRecord = catchAsyncError(async (req, res, next) => {
  const validationResult = createMedicalRecordSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const record = await medicalRecordService.createMedicalRecord(validationResult.data, req.user._id);
  res.status(201).json({
    success: true,
    message: "Medical record created successfully",
    record,
  });
});

// Get Medical Record by ID
export const getMedicalRecordById = catchAsyncError(async (req, res, next) => {
  const record = await medicalRecordService.getMedicalRecordById(req.params.id);
  res.status(200).json({
    success: true,
    record,
  });
});

// Get Patient's Medical Records
export const getPatientMedicalRecords = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await medicalRecordService.getPatientMedicalRecords(req.params.patientId, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get Doctor's Medical Records
export const getDoctorMedicalRecords = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await medicalRecordService.getDoctorMedicalRecords(req.params.doctorId, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Get My Medical Records (Patient)
export const getMyMedicalRecords = catchAsyncError(async (req, res, next) => {
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

  const result = await medicalRecordService.getPatientMedicalRecords(patient._id, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Update Medical Record
export const updateMedicalRecord = catchAsyncError(async (req, res, next) => {
  const validationResult = updateMedicalRecordSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const record = await medicalRecordService.updateMedicalRecord(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medical record updated successfully",
    record,
  });
});

// Delete Medical Record
export const deleteMedicalRecord = catchAsyncError(async (req, res, next) => {
  const record = await medicalRecordService.deleteMedicalRecord(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Medical record deleted successfully",
  });
});

// Get Medical Records by Appointment
export const getMedicalRecordsByAppointment = catchAsyncError(async (req, res, next) => {
  const records = await medicalRecordService.getMedicalRecordsByAppointment(req.params.appointmentId);
  res.status(200).json({
    success: true,
    records,
  });
});

// Search Medical Records
export const searchMedicalRecords = catchAsyncError(async (req, res, next) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Search query is required",
    });
  }

  const records = await medicalRecordService.searchMedicalRecords(q, req.user._id, req.user.role);
  res.status(200).json({
    success: true,
    records,
  });
});
