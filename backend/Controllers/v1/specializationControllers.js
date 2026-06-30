import Specialization from "../../Models/specializationModels.js";
import Doctor from "../../Models/doctorModels.js";
import ErrorHandler from "../../utilis/errorHandler.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";

/**
 * @desc    Get all specializations
 * @route   GET /api/v1/specialization
 * @access  Public
 */
export const getAllSpecializations = catchAsyncError(async (req, res, next) => {
  const { isActive } = req.query;

  const query = {};
  if (isActive !== undefined) {
    query.isActive = isActive === "true";
  }

  const specializations = await Specialization.find(query).sort({
    displayOrder: 1,
    name: 1,
  });

  res.status(200).json({
    success: true,
    count: specializations.length,
    specializations,
  });
});

/**
 * @desc    Get active specializations (for doctor signup)
 * @route   GET /api/v1/specialization/active
 * @access  Public
 */
export const getActiveSpecializations = catchAsyncError(async (req, res, next) => {
  const specializations = await Specialization.getActiveSpecializations();

  res.status(200).json({
    success: true,
    count: specializations.length,
    specializations,
  });
});

/**
 * @desc    Get single specialization
 * @route   GET /api/v1/specialization/:id
 * @access  Public
 */
export const getSpecialization = catchAsyncError(async (req, res, next) => {
  const specialization = await Specialization.findById(req.params.id);

  if (!specialization) {
    return next(new ErrorHandler("Specialization not found", 404));
  }

  res.status(200).json({
    success: true,
    specialization,
  });
});

/**
 * @desc    Create new specialization
 * @route   POST /api/v1/specialization
 * @access  Private (Admin)
 */
export const createSpecialization = catchAsyncError(async (req, res, next) => {
  const { name, description, icon, displayOrder } = req.body;

  if (!name) {
    return next(new ErrorHandler("Please provide specialization name", 400));
  }

  // Check if specialization already exists
  const existingSpecialization = await Specialization.findOne({ name });
  if (existingSpecialization) {
    return next(new ErrorHandler("Specialization already exists", 400));
  }

  const specialization = await Specialization.create({
    name,
    description,
    icon,
    displayOrder: displayOrder || 0,
    createdBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Specialization created successfully",
    specialization,
  });
});

/**
 * @desc    Update specialization
 * @route   PUT /api/v1/specialization/:id
 * @access  Private (Admin)
 */
export const updateSpecialization = catchAsyncError(async (req, res, next) => {
  const { name, description, icon, isActive, displayOrder } = req.body;

  let specialization = await Specialization.findById(req.params.id);

  if (!specialization) {
    return next(new ErrorHandler("Specialization not found", 404));
  }

  // Check if name is being changed and if it already exists
  if (name && name !== specialization.name) {
    const existingSpecialization = await Specialization.findOne({ name });
    if (existingSpecialization) {
      return next(new ErrorHandler("Specialization name already exists", 400));
    }
  }

  specialization = await Specialization.findByIdAndUpdate(
    req.params.id,
    {
      name,
      description,
      icon,
      isActive,
      displayOrder,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    message: "Specialization updated successfully",
    specialization,
  });
});

/**
 * @desc    Delete specialization
 * @route   DELETE /api/v1/specialization/:id
 * @access  Private (Admin)
 */
export const deleteSpecialization = catchAsyncError(async (req, res, next) => {
  const specialization = await Specialization.findById(req.params.id);

  if (!specialization) {
    return next(new ErrorHandler("Specialization not found", 404));
  }

  // Check if there are doctors with this specialization
  const doctorsCount = await Doctor.countDocuments({
    specialization: specialization.name,
  });

  if (doctorsCount > 0) {
    return next(
      new ErrorHandler(
        `Cannot delete specialization. ${doctorsCount} doctors are associated with it.`,
        400
      )
    );
  }

  await specialization.deleteOne();

  res.status(200).json({
    success: true,
    message: "Specialization deleted successfully",
  });
});

/**
 * @desc    Get specialization statistics
 * @route   GET /api/v1/specialization/stats
 * @access  Private (Admin)
 */
export const getSpecializationStats = catchAsyncError(async (req, res, next) => {
  const specializations = await Specialization.find({ isActive: true });

  const stats = await Promise.all(
    specializations.map(async (spec) => {
      const doctorsCount = await Doctor.countDocuments({
        specialization: spec.name,
        status: "approved",
      });

      return {
        _id: spec._id,
        name: spec.name,
        description: spec.description,
        icon: spec.icon,
        totalDoctors: doctorsCount,
      };
    })
  );

  res.status(200).json({
    success: true,
    stats,
  });
});
