import Appointment from "../Models/appointmentModels.js";
import Doctor from "../Models/doctorModels.js";
import User from "../Models/userModels.js";
import Slot from "../Models/slotModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class AppointmentService {
  /**
   * Book an appointment with atomic slot booking
   */
  async bookAppointment(patientId, appointmentData) {
    const { doctor: doctorId, appointmentDate, appointmentTime, endTime, appointmentType, reason, notes, slotId } = appointmentData;

    // Verify doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.status !== "approved") {
      throw new ErrorHandler("Doctor account is not yet approved", 403);
    }

    // Check if appointment date is in the past
    const appointmentDateObj = new Date(appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (appointmentDateObj < today) {
      throw new ErrorHandler("Cannot book appointments for past dates", 400);
    }

    // If slotId is provided, use atomic slot booking
    if (slotId) {
      // Verify the slot exists and is available
      const slot = await Slot.findById(slotId);
      if (!slot) {
        throw new ErrorHandler("Slot not found", 404);
      }

      if (slot.doctor.toString() !== doctorId) {
        throw new ErrorHandler("Slot does not belong to this doctor", 400);
      }

      if (slot.isBooked) {
        throw new ErrorHandler("Slot is already booked", 400);
      }

      if (slot.isBlocked) {
        throw new ErrorHandler("Slot is blocked by doctor", 400);
      }

      // Create appointment
      const appointment = await Appointment.create({
        patient: patientId,
        doctor: doctorId,
        slotId: slot._id,
        appointmentDate: slot.date,
        appointmentTime: slot.startTime,
        endTime: slot.endTime,
        appointmentType: appointmentType || "in-person",
        reason,
        notes,
        status: "pending",
      });

      // Atomically book the slot
      const bookedSlot = await Slot.bookSlotAtomically(slotId, patientId, appointment._id);
      
      if (!bookedSlot) {
        // Slot was booked by someone else, rollback appointment
        await Appointment.findByIdAndDelete(appointment._id);
        throw new ErrorHandler("Slot was just booked by another user. Please choose a different slot.", 409);
      }

      // Update doctor's total appointments
      await Doctor.findByIdAndUpdate(doctorId, {
        $inc: { totalAppointments: 1 },
      });

      return appointment;
    }

    // Legacy booking without slotId (for backward compatibility)
    // Check if doctor is available at the requested time
    const dayOfWeek = new Date(appointmentDate).toLocaleDateString("en-US", { weekday: "long" });
    const availability = doctor.availability.find(
      (avail) => avail.day === dayOfWeek && avail.isAvailable
    );

    if (!availability) {
      throw new ErrorHandler("Doctor is not available on this day", 400);
    }

    // Check if the requested time is within doctor's availability
    if (appointmentTime < availability.startTime || endTime > availability.endTime) {
      throw new ErrorHandler("Requested time is outside doctor's availability", 400);
    }

    // Check for conflicting appointments (this is also done in the model pre-save hook)
    const conflictingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          appointmentTime: { $lt: endTime },
          endTime: { $gt: appointmentTime },
        },
      ],
    });

    if (conflictingAppointment) {
      throw new ErrorHandler("Time slot is already booked. Please choose a different time.", 409);
    }

    // Create appointment
    const appointment = await Appointment.create({
      patient: patientId,
      doctor: doctorId,
      appointmentDate: new Date(appointmentDate),
      appointmentTime,
      endTime,
      appointmentType: appointmentType || "in-person",
      reason,
      notes,
      status: "pending",
    });

    // Update doctor's total appointments
    await Doctor.findByIdAndUpdate(doctorId, {
      $inc: { totalAppointments: 1 },
    });

    return appointment;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(appointmentId) {
    const appointment = await Appointment.findById(appointmentId)
      .populate("patient", "username email phone")
      .populate("doctor", "firstName lastName specialization consultationFee");

    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    return appointment;
  }

  /**
   * Get patient's appointments
   */
  async getPatientAppointments(patientId, filters = {}, page = 1, limit = 10) {
    const query = { patient: patientId };

    if (filters.status) {
      query.status = filters.status;
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .populate("doctor", "firstName lastName specialization consultationFee profileImage")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      appointments,
      pagination: {
        currentPage: page,
        totalPages,
        totalAppointments: total,
      },
    };
  }

  /**
   * Get doctor's appointments
   */
  async getDoctorAppointments(doctorId, filters = {}, page = 1, limit = 10) {
    const query = { doctor: doctorId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.date) {
      query.appointmentDate = new Date(filters.date);
    }

    const skip = (page - 1) * limit;
    const appointments = await Appointment.find(query)
      .populate("patient", "username email phone")
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      appointments,
      pagination: {
        currentPage: page,
        totalPages,
        totalAppointments: total,
      },
    };
  }

  /**
   * Get available slots for a doctor on a specific date
   */
  async getAvailableSlots(doctorId, date) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    const dayOfWeek = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    const availability = doctor.availability.find(
      (avail) => avail.day === dayOfWeek && avail.isAvailable
    );

    if (!availability) {
      return { available: false, slots: [] };
    }

    // Get all booked appointments for that date
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: new Date(date),
      status: { $in: ["pending", "confirmed"] },
    }).select("appointmentTime endTime");

    // Generate available slots (30-minute intervals)
    const slots = [];
    let currentTime = availability.startTime;
    const endTime = availability.endTime;

    while (currentTime < endTime) {
      const slotEndTime = this.addMinutes(currentTime, 30);

      // Check if this slot is available
      const isBooked = bookedAppointments.some(
        (apt) =>
          (currentTime >= apt.appointmentTime && currentTime < apt.endTime) ||
          (slotEndTime > apt.appointmentTime && slotEndTime <= apt.endTime)
      );

      if (!isBooked) {
        slots.push({
          startTime: currentTime,
          endTime: slotEndTime,
        });
      }

      currentTime = slotEndTime;
    }

    return {
      available: true,
      day: dayOfWeek,
      startTime: availability.startTime,
      endTime: availability.endTime,
      slots,
    };
  }

  /**
   * Confirm appointment
   */
  async confirmAppointment(appointmentId, userId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.status !== "pending") {
      throw new ErrorHandler("Appointment cannot be confirmed", 400);
    }

    // Only doctor or admin can confirm
    const user = await User.findById(userId);
    if (user.role !== "doctor" && user.role !== "admin" && user.role !== "super_admin") {
      throw new ErrorHandler("Not authorized to confirm appointment", 403);
    }

    appointment.status = "confirmed";
    await appointment.save();

    return appointment;
  }

  /**
   * Cancel appointment
   */
  async cancelAppointment(appointmentId, userId, reason) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      throw new ErrorHandler("Appointment cannot be cancelled", 400);
    }

    // Check if user is authorized to cancel
    const user = await User.findById(userId);
    const isPatient = appointment.patient.toString() === userId.toString();
    const isDoctor = appointment.doctor.toString() === user._id.toString();
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    if (!isPatient && !isDoctor && !isAdmin) {
      throw new ErrorHandler("Not authorized to cancel this appointment", 403);
    }

    appointment.status = "cancelled";
    appointment.cancellationDetails = {
      cancelledBy: userId,
      cancelledAt: new Date(),
      cancellationReason: reason,
    };

    await appointment.save();

    // Release the slot if it was booked
    if (appointment.slotId) {
      await Slot.releaseSlot(appointment.slotId);
    }

    // Update doctor's cancelled appointments count
    await Doctor.findByIdAndUpdate(appointment.doctor, {
      $inc: { cancelledAppointments: 1 },
    });

    return appointment;
  }

  /**
   * Reschedule appointment
   */
  async rescheduleAppointment(appointmentId, userId, newDate, newTime, newEndTime, reason) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.status === "cancelled" || appointment.status === "completed") {
      throw new ErrorHandler("Appointment cannot be rescheduled", 400);
    }

    // Check if user is authorized to reschedule
    const user = await User.findById(userId);
    const isPatient = appointment.patient.toString() === userId.toString();
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    if (!isPatient && !isAdmin) {
      throw new ErrorHandler("Not authorized to reschedule this appointment", 403);
    }

    // Check for conflicts with new time
    const conflictingAppointment = await Appointment.findOne({
      doctor: appointment.doctor,
      appointmentDate: new Date(newDate),
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          appointmentTime: { $lt: newEndTime },
          endTime: { $gt: newTime },
        },
      ],
      _id: { $ne: appointmentId },
    });

    if (conflictingAppointment) {
      throw new ErrorHandler("New time slot is already booked", 409);
    }

    // Store old values
    appointment.reschedulingDetails = {
      rescheduledBy: userId,
      rescheduledAt: new Date(),
      reschedulingReason: reason,
      previousDate: appointment.appointmentDate,
      previousTime: appointment.appointmentTime,
    };

    // Update with new values
    appointment.appointmentDate = new Date(newDate);
    appointment.appointmentTime = newTime;
    appointment.endTime = newEndTime;
    appointment.status = "pending"; // Reset to pending for re-confirmation

    await appointment.save();

    return appointment;
  }

  /**
   * Complete appointment
   */
  async completeAppointment(appointmentId, userId, doctorNotes, prescription, diagnosis) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.status !== "confirmed") {
      throw new ErrorHandler("Appointment must be confirmed before completing", 400);
    }

    // Only doctor can complete
    const user = await User.findById(userId);
    if (user.role !== "doctor") {
      throw new ErrorHandler("Not authorized to complete appointment", 403);
    }

    appointment.status = "completed";
    appointment.completedAt = new Date();
    appointment.doctorNotes = doctorNotes;
    appointment.prescription = prescription;
    appointment.diagnosis = diagnosis;

    await appointment.save();

    // Update doctor's completed appointments count
    await Doctor.findByIdAndUpdate(appointment.doctor, {
      $inc: { completedAppointments: 1 },
    });

    return appointment;
  }

  /**
   * Mark as no-show
   */
  async markNoShow(appointmentId, userId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.status !== "confirmed") {
      throw new ErrorHandler("Appointment must be confirmed", 400);
    }

    // Only doctor can mark as no-show
    const user = await User.findById(userId);
    if (user.role !== "doctor") {
      throw new ErrorHandler("Not authorized to mark no-show", 403);
    }

    appointment.status = "no-show";
    appointment.noShowAt = new Date();

    await appointment.save();

    return appointment;
  }

  /**
   * Add to waitlist
   */
  async addToWaitlist(appointmentId, userId) {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      throw new ErrorHandler("Appointment not found", 404);
    }

    if (appointment.isWaitlisted) {
      throw new ErrorHandler("Already on waitlist", 400);
    }

    // Get current waitlist position
    const waitlistCount = await Appointment.countDocuments({
      doctor: appointment.doctor,
      appointmentDate: appointment.appointmentDate,
      isWaitlisted: true,
    });

    appointment.isWaitlisted = true;
    appointment.waitlistedAt = new Date();
    appointment.waitlistPosition = waitlistCount + 1;

    await appointment.save();

    return appointment;
  }

  /**
   * Helper method to add minutes to time string
   */
  addMinutes(timeStr, minutes) {
    const [hours, mins] = timeStr.split(":").map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
  }
}

export default new AppointmentService();
