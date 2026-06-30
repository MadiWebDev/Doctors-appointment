import Slot from "../../Models/slotModels.js";
import Doctor from "../../Models/doctorModels.js";
import ErrorHandler from "../../utilis/errorHandler.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { addDays, format, parse } from "date-fns";

/**
 * @desc    Get available slots for a doctor on a specific date
 * @route   GET /api/v1/slot/doctor/:doctorId/available
 * @access  Public
 */
export const getAvailableSlots = catchAsyncError(async (req, res, next) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  // Validate date
  if (!date) {
    return next(new ErrorHandler("Please provide a date", 400));
  }

  const queryDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if date is in the past
  if (queryDate < today) {
    return next(new ErrorHandler("Cannot book appointments for past dates", 400));
  }

  // Check if doctor exists and is approved
  const doctor = await Doctor.findById(doctorId);
  if (!doctor) {
    return next(new ErrorHandler("Doctor not found", 404));
  }

  if (doctor.status !== "approved") {
    return next(new ErrorHandler("Doctor account is not yet approved", 403));
  }

  // Get available slots
  const slots = await Slot.findAvailableSlots(doctorId, date);

  res.status(200).json({
    success: true,
    count: slots.length,
    slots,
  });
});

/**
 * @desc    Get all slots for a doctor (authenticated)
 * @route   GET /api/v1/slot/doctor/:doctorId
 * @access  Private (Doctor)
 */
export const getDoctorSlots = catchAsyncError(async (req, res, next) => {
  const { doctorId } = req.params;
  const { startDate, endDate, status } = req.query;

  // Check if the requesting user is the doctor
  if (req.user.role !== "doctor" && req.user.role !== "admin") {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor && req.user.role === "doctor") {
    return next(new ErrorHandler("Doctor profile not found", 404));
  }

  // Build query
  const query = { doctor: doctorId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  if (status === "booked") {
    query.isBooked = true;
  } else if (status === "available") {
    query.isBooked = false;
    query.isBlocked = false;
  } else if (status === "blocked") {
    query.isBlocked = true;
  }

  const slots = await Slot.find(query).sort({ date: 1, startTime: 1 });

  res.status(200).json({
    success: true,
    count: slots.length,
    slots,
  });
});

/**
 * @desc    Generate slots for a doctor for the next 30 days
 * @route   POST /api/v1/slot/generate
 * @access  Private (Doctor)
 */
export const generateSlots = catchAsyncError(async (req, res, next) => {
  const {
    workingDays,
    startTime,
    endTime,
    slotDuration,
    startDate,
    endDate,
  } = req.body;

  // Validate input
  if (!workingDays || !Array.isArray(workingDays) || workingDays.length === 0) {
    return next(new ErrorHandler("Please provide working days", 400));
  }

  if (!startTime || !endTime) {
    return next(new ErrorHandler("Please provide start and end time", 400));
  }

  if (!slotDuration || ![15, 30, 60].includes(slotDuration)) {
    return next(new ErrorHandler("Slot duration must be 15, 30, or 60 minutes", 400));
  }

  // Get doctor profile
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new ErrorHandler("Doctor profile not found", 404));
  }

  // Check if doctor is approved
  if (doctor.status !== "approved") {
    return next(new ErrorHandler("Doctor account is not yet approved", 403));
  }

  // Set date range (default to next 30 days)
  const start = startDate ? new Date(startDate) : new Date();
  const end = endDate ? new Date(endDate) : addDays(start, 30);

  // Generate slots
  const slotsToCreate = [];
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  let currentDate = start;
  while (currentDate <= end) {
    const dayName = daysOfWeek[currentDate.getDay()];

    if (workingDays.includes(dayName)) {
      // Parse start and end times
      const startMinutes = parse(startTime, "HH:mm", currentDate).getHours() * 60 + parse(startTime, "HH:mm", currentDate).getMinutes();
      const endMinutes = parse(endTime, "HH:mm", currentDate).getHours() * 60 + parse(endTime, "HH:mm", currentDate).getMinutes();

      // Generate time slots
      for (let time = startMinutes; time + slotDuration <= endMinutes; time += slotDuration) {
        const slotStartHour = Math.floor(time / 60);
        const slotStartMinute = time % 60;
        const slotEndHour = Math.floor((time + slotDuration) / 60);
        const slotEndMinute = (time + slotDuration) % 60;

        const slotStartTime = `${String(slotStartHour).padStart(2, "0")}:${String(slotStartMinute).padStart(2, "0")}`;
        const slotEndTime = `${String(slotEndHour).padStart(2, "0")}:${String(slotEndMinute).padStart(2, "0")}`;

        // Check if slot already exists
        const existingSlot = await Slot.findOne({
          doctor: doctor._id,
          date: new Date(currentDate),
          startTime: slotStartTime,
          endTime: slotEndTime,
        });

        if (!existingSlot) {
          slotsToCreate.push({
            doctor: doctor._id,
            date: new Date(currentDate),
            startTime: slotStartTime,
            endTime: slotEndTime,
            duration: slotDuration,
          });
        }
      }
    }

    currentDate = addDays(currentDate, 1);
  }

  // Insert slots in bulk
  if (slotsToCreate.length > 0) {
    await Slot.insertMany(slotsToCreate);
  }

  res.status(201).json({
    success: true,
    message: `Generated ${slotsToCreate.length} slots`,
    count: slotsToCreate.length,
  });
});

/**
 * @desc    Block a specific slot
 * @route   PUT /api/v1/slot/:slotId/block
 * @access  Private (Doctor)
 */
export const blockSlot = catchAsyncError(async (req, res, next) => {
  const { slotId } = req.params;
  const { reason } = req.body;

  // Get doctor profile
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new ErrorHandler("Doctor profile not found", 404));
  }

  // Get slot
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return next(new ErrorHandler("Slot not found", 404));
  }

  // Check if slot belongs to this doctor
  if (slot.doctor.toString() !== doctor._id.toString()) {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  // Check if slot is already booked
  if (slot.isBooked) {
    return next(new ErrorHandler("Cannot block a booked slot", 400));
  }

  // Block the slot
  const blockedSlot = await Slot.blockSlot(slotId, reason || "Blocked by doctor");

  res.status(200).json({
    success: true,
    message: "Slot blocked successfully",
    slot: blockedSlot,
  });
});

/**
 * @desc    Unblock a specific slot
 * @route   PUT /api/v1/slot/:slotId/unblock
 * @access  Private (Doctor)
 */
export const unblockSlot = catchAsyncError(async (req, res, next) => {
  const { slotId } = req.params;

  // Get doctor profile
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new ErrorHandler("Doctor profile not found", 404));
  }

  // Get slot
  const slot = await Slot.findById(slotId);
  if (!slot) {
    return next(new ErrorHandler("Slot not found", 404));
  }

  // Check if slot belongs to this doctor
  if (slot.doctor.toString() !== doctor._id.toString()) {
    return next(new ErrorHandler("Unauthorized access", 403));
  }

  // Unblock the slot
  const unblockedSlot = await Slot.unblockSlot(slotId);

  res.status(200).json({
    success: true,
    message: "Slot unblocked successfully",
    slot: unblockedSlot,
  });
});

/**
 * @desc    Delete slots for a date range
 * @route   DELETE /api/v1/slot/delete-range
 * @access  Private (Doctor)
 */
export const deleteSlotRange = catchAsyncError(async (req, res, next) => {
  const { startDate, endDate } = req.body;

  if (!startDate || !endDate) {
    return next(new ErrorHandler("Please provide start and end date", 400));
  }

  // Get doctor profile
  const doctor = await Doctor.findOne({ user: req.user._id });
  if (!doctor) {
    return next(new ErrorHandler("Doctor profile not found", 404));
  }

  // Delete only unbooked slots
  const result = await Slot.deleteMany({
    doctor: doctor._id,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
    isBooked: false,
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} slots`,
    deletedCount: result.deletedCount,
  });
});

/**
 * @desc    Book a slot atomically (called internally by appointment controller)
 * @route   POST /api/v1/slot/:slotId/book
 * @access  Private (Patient)
 */
export const bookSlot = catchAsyncError(async (req, res, next) => {
  const { slotId } = req.params;
  const { appointmentId } = req.body;

  if (!appointmentId) {
    return next(new ErrorHandler("Appointment ID is required", 400));
  }

  // Try to book the slot atomically
  const bookedSlot = await Slot.bookSlotAtomically(slotId, req.user._id, appointmentId);

  if (!bookedSlot) {
    return next(new ErrorHandler("Slot is already booked or blocked", 400));
  }

  res.status(200).json({
    success: true,
    message: "Slot booked successfully",
    slot: bookedSlot,
  });
});

/**
 * @desc    Release a booked slot (called internally when appointment is cancelled)
 * @route   PUT /api/v1/slot/:slotId/release
 * @access  Private
 */
export const releaseSlot = catchAsyncError(async (req, res, next) => {
  const { slotId } = req.params;

  const releasedSlot = await Slot.releaseSlot(slotId);

  if (!releasedSlot) {
    return next(new ErrorHandler("Slot not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Slot released successfully",
    slot: releasedSlot,
  });
});
