import doctorService from "../../Services/doctorService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { createDoctorProfileSchema, updateDoctorProfileSchema, paymentMethodSchema, documentSchema, reviewSchema, verifyDoctorSchema, updateOnlineStatusSchema } from "../../Validators/doctorValidator.js";

// Create Doctor Profile
export const createDoctorProfile = catchAsyncError(async (req, res, next) => {
  const validationResult = createDoctorProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.createDoctorProfile(req.user._id, validationResult.data);
  res.status(201).json({
    success: true,
    message: "Doctor profile created successfully",
    doctor,
  });
});

// Get Doctor by ID
export const getDoctorById = catchAsyncError(async (req, res, next) => {
  const doctor = await doctorService.getDoctorById(req.params.id);
  res.status(200).json({
    success: true,
    doctor,
  });
});

// Get Doctor by User ID (Own Profile)
export const getMyDoctorProfile = catchAsyncError(async (req, res, next) => {
  const doctor = await doctorService.getDoctorByUserId(req.user._id);
  res.status(200).json({
    success: true,
    doctor,
  });
});

// Get All Doctors with Filters
export const getAllDoctors = catchAsyncError(async (req, res, next) => {
  const filters = {
    specialization: req.query.specialization,
    city: req.query.city,
    minRating: req.query.minRating,
    maxFee: req.query.maxFee,
    isOnline: req.query.isOnline,
    coordinates: req.query.coordinates,
    maxDistance: req.query.maxDistance,
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await doctorService.getAllDoctors(filters, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Update Doctor Profile
export const updateDoctorProfile = catchAsyncError(async (req, res, next) => {
  const validationResult = updateDoctorProfileSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.updateDoctorProfile(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Doctor profile updated successfully",
    doctor,
  });
});

// Add Payment Method
export const addPaymentMethod = catchAsyncError(async (req, res, next) => {
  const validationResult = paymentMethodSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.addPaymentMethod(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Payment method added successfully",
    doctor,
  });
});

// Update Payment Method
export const updatePaymentMethod = catchAsyncError(async (req, res, next) => {
  const validationResult = paymentMethodSchema.partial().safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.updatePaymentMethod(
    req.params.id,
    req.params.paymentMethodId,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Payment method updated successfully",
    doctor,
  });
});

// Delete Payment Method
export const deletePaymentMethod = catchAsyncError(async (req, res, next) => {
  const doctor = await doctorService.deletePaymentMethod(
    req.params.id,
    req.params.paymentMethodId,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Payment method deleted successfully",
    doctor,
  });
});

// Add Document
export const addDocument = catchAsyncError(async (req, res, next) => {
  const validationResult = documentSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.addDocument(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Document added successfully",
    doctor,
  });
});

// Update Availability
export const updateAvailability = catchAsyncError(async (req, res, next) => {
  const { availability } = req.body;
  if (!Array.isArray(availability)) {
    return res.status(400).json({
      success: false,
      message: "Availability must be an array",
    });
  }

  const doctor = await doctorService.updateAvailability(
    req.params.id,
    availability,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Availability updated successfully",
    doctor,
  });
});

// Update Online Status
export const updateOnlineStatus = catchAsyncError(async (req, res, next) => {
  const validationResult = updateOnlineStatusSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.updateOnlineStatus(
    req.params.id,
    validationResult.data.isOnline,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Online status updated successfully",
    doctor,
  });
});

// Add Review
export const addReview = catchAsyncError(async (req, res, next) => {
  const validationResult = reviewSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.addReview(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: "Review added successfully",
    doctor,
  });
});

// Verify Doctor (Admin)
export const verifyDoctor = catchAsyncError(async (req, res, next) => {
  const validationResult = verifyDoctorSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const doctor = await doctorService.verifyDoctor(
    req.params.id,
    validationResult.data,
    req.user._id
  );
  res.status(200).json({
    success: true,
    message: `Doctor ${validationResult.data.status} successfully`,
    doctor,
  });
});

// Get Pending Verifications (Admin)
export const getPendingVerifications = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const result = await doctorService.getPendingVerifications(page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Delete Doctor (Admin)
export const deleteDoctor = catchAsyncError(async (req, res, next) => {
  const doctor = await doctorService.deleteDoctor(req.params.id);
  res.status(200).json({
    success: true,
    message: "Doctor deleted successfully",
  });
});
