import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  // Basic Information
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  
  // Slot reference (for atomic booking)
  slotId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Slot",
  },
  
  // Appointment Details
  appointmentDate: {
    type: Date,
    required: [true, "Please select appointment date"],
  },
  appointmentTime: {
    type: String,
    required: [true, "Please select appointment time"],
  },
  endTime: {
    type: String,
    required: true,
  },
  
  // Appointment Type
  appointmentType: {
    type: String,
    enum: ["in-person", "video"],
    default: "in-person",
  },
  
  // Video Consultation Details
  videoConsultation: {
    meetingUrl: String,
    meetingId: String,
    meetingPassword: String,
    platform: {
      type: String,
      enum: ["zoom", "google-meet", "other"],
      default: "zoom",
    },
  },
  
  // Status
  status: {
    type: String,
    enum: ["pending", "confirmed", "completed", "cancelled", "no-show", "rescheduled"],
    default: "pending",
  },
  
  // Reason for Visit
  reason: {
    type: String,
    required: [true, "Please provide reason for appointment"],
    maxlength: 500,
  },
  
  // Additional Notes
  notes: {
    type: String,
    maxlength: 1000,
  },
  
  // Medical History (Optional)
  medicalHistory: {
    type: String,
  },
  
  // Symptoms
  symptoms: [String],
  
  // Cancellation Details
  cancellationDetails: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancelledAt: Date,
    cancellationReason: String,
  },
  
  // Rescheduling Details
  reschedulingDetails: {
    rescheduledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    rescheduledAt: Date,
    reschedulingReason: String,
    previousDate: Date,
    previousTime: String,
  },
  
  // Recurring Appointments
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurringPattern: {
    type: String,
    enum: ["daily", "weekly", "monthly"],
  },
  recurringEndDate: Date,
  parentAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded", "failed"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
  },
  paymentAmount: {
    type: Number,
  },
  paidAt: Date,
  
  // Reminders
  remindersSent: {
    twentyFourHour: {
      type: Boolean,
      default: false,
    },
    oneHour: {
      type: Boolean,
      default: false,
    },
  },
  
  // Waitlist
  isWaitlisted: {
    type: Boolean,
    default: false,
  },
  waitlistedAt: Date,
  waitlistPosition: Number,
  
  // Completed Details
  completedAt: Date,
  doctorNotes: String,
  prescription: String,
  diagnosis: String,
  
  // No-show Details
  noShowAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ doctor: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1, appointmentDate: -1 });
appointmentSchema.index({ appointmentDate: 1, appointmentTime: 1, doctor: 1 });

// Pre-save middleware to check for conflicts
appointmentSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("appointmentDate") || this.isModified("appointmentTime")) {
    // Check for conflicting appointments
    const conflictingAppointment = await mongoose.model("Appointment").findOne({
      doctor: this.doctor,
      appointmentDate: this.appointmentDate,
      status: { $in: ["pending", "confirmed"] },
      $or: [
        {
          appointmentTime: { $lt: this.endTime },
          endTime: { $gt: this.appointmentTime },
        },
      ],
      _id: { $ne: this._id },
    });

    if (conflictingAppointment) {
      const error = new Error("Time slot is already booked. Please choose a different time.");
      error.name = "ConflictError";
      return next(error);
    }
  }
  next();
});

// Update timestamp on save
appointmentSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Appointment = mongoose.model("Appointment", appointmentSchema);
export default Appointment;
