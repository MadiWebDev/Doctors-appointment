import patientService from "../../Services/patientService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { createPatientProfileSchema, updatePatientProfileSchema, medicalHistorySchema, allergySchema, medicationSchema, familyHistorySchema, lifestyleSchema, insuranceSchema } from "../../Validators/patientValidator.js";

// Create Patient Profile
export const createPatientProfile = catchAsyncError(async (req, res, next) => {
  const validationResult = createPatientProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.createPatientProfile(req.user._id, validationResult.data);
  res.status(201).json({
    success: true,
    message: "Patient profile created successfully",
    patient,
  });
});

// Get Patient by ID
export const getPatientById = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.getPatientById(req.params.id);
  res.status(200).json({
    success: true,
    patient,
  });
});

// Get Patient by User ID (Own Profile)
export const getMyPatientProfile = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.getPatientByUserId(req.user._id);
  res.status(200).json({
    success: true,
    patient,
  });
});

// Update Patient Profile
export const updatePatientProfile = catchAsyncError(async (req, res, next) => {
  const validationResult = updatePatientProfileSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updatePatientProfile(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Patient profile updated successfully",
    patient,
  });
});

// Add Medical History
export const addMedicalHistory = catchAsyncError(async (req, res, next) => {
  const validationResult = medicalHistorySchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.addMedicalHistory(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medical history added successfully",
    patient,
  });
});

// Update Medical History
export const updateMedicalHistory = catchAsyncError(async (req, res, next) => {
  const validationResult = medicalHistorySchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateMedicalHistory(
    req.params.id,
    req.params.historyId,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medical history updated successfully",
    patient,
  });
});

// Delete Medical History
export const deleteMedicalHistory = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.deleteMedicalHistory(
    req.params.id,
    req.params.historyId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medical history deleted successfully",
    patient,
  });
});

// Add Allergy
export const addAllergy = catchAsyncError(async (req, res, next) => {
  const validationResult = allergySchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.addAllergy(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Allergy added successfully",
    patient,
  });
});

// Update Allergy
export const updateAllergy = catchAsyncError(async (req, res, next) => {
  const validationResult = allergySchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateAllergy(
    req.params.id,
    req.params.allergyId,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Allergy updated successfully",
    patient,
  });
});

// Delete Allergy
export const deleteAllergy = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.deleteAllergy(
    req.params.id,
    req.params.allergyId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Allergy deleted successfully",
    patient,
  });
});

// Add Current Medication
export const addCurrentMedication = catchAsyncError(async (req, res, next) => {
  const validationResult = medicationSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.addCurrentMedication(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medication added successfully",
    patient,
  });
});

// Update Current Medication
export const updateCurrentMedication = catchAsyncError(async (req, res, next) => {
  const validationResult = medicationSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateCurrentMedication(
    req.params.id,
    req.params.medicationId,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medication updated successfully",
    patient,
  });
});

// Delete Current Medication
export const deleteCurrentMedication = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.deleteCurrentMedication(
    req.params.id,
    req.params.medicationId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Medication deleted successfully",
    patient,
  });
});

// Add Family History
export const addFamilyHistory = catchAsyncError(async (req, res, next) => {
  const validationResult = familyHistorySchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.addFamilyHistory(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Family history added successfully",
    patient,
  });
});

// Update Family History
export const updateFamilyHistory = catchAsyncError(async (req, res, next) => {
  const validationResult = familyHistorySchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateFamilyHistory(
    req.params.id,
    req.params.familyId,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Family history updated successfully",
    patient,
  });
});

// Delete Family History
export const deleteFamilyHistory = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.deleteFamilyHistory(
    req.params.id,
    req.params.familyId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Family history deleted successfully",
    patient,
  });
});

// Update Lifestyle
export const updateLifestyle = catchAsyncError(async (req, res, next) => {
  const validationResult = lifestyleSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateLifestyle(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Lifestyle updated successfully",
    patient,
  });
});

// Update Insurance
export const updateInsurance = catchAsyncError(async (req, res, next) => {
  const validationResult = insuranceSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const patient = await patientService.updateInsurance(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Insurance updated successfully",
    patient,
  });
});

// Add Preferred Doctor
export const addPreferredDoctor = catchAsyncError(async (req, res, next) => {
  const { doctorId } = req.body;
  if (!doctorId) {
    return res.status(400).json({
      success: false,
      message: "Doctor ID is required",
    });
  }

  const patient = await patientService.addPreferredDoctor(
    req.params.id,
    doctorId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Preferred doctor added successfully",
    patient,
  });
});

// Remove Preferred Doctor
export const removePreferredDoctor = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.removePreferredDoctor(
    req.params.id,
    req.params.doctorId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Preferred doctor removed successfully",
    patient,
  });
});

// Delete Patient (Admin)
export const deletePatient = catchAsyncError(async (req, res, next) => {
  const patient = await patientService.deletePatient(req.params.id);
  res.status(200).json({
    success: true,
    message: "Patient deleted successfully",
  });
});
