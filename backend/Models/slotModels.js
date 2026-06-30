import mongoose from "mongoose";

const slotSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
    index: true,
  },
  
  // Date and Time
  date: {
    type: Date,
    required: [true, "Please provide slot date"],
    index: true,
  },
  
  startTime: {
    type: String,
    required: [true, "Please provide start time"],
  },
  
  endTime: {
    type: String,
    required: [true, "Please provide end time"],
  },
  
  // Duration in minutes (15, 30, 60)
  duration: {
    type: Number,
    required: true,
    enum: [15, 30, 60],
    default: 30,
  },
  
  // Booking Status
  isBooked: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  bookedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
  bookedAt: Date,
  
  // Blocking Status (for vacations, emergencies)
  isBlocked: {
    type: Boolean,
    default: false,
    index: true,
  },
  
  blockReason: String,
  
  blockedAt: Date,
  
  // Appointment Reference
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  
  // Metadata
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

// Compound indexes for efficient queries
slotSchema.index({ doctor: 1, date: 1, isBooked: 1 });
slotSchema.index({ doctor: 1, date: 1, isBlocked: 1 });
slotSchema.index({ date: 1, startTime: 1, doctor: 1, isBooked: 1 });

// Pre-save middleware to update timestamp
slotSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to find available slots for a doctor on a specific date
slotSchema.statics.findAvailableSlots = async function (doctorId, date) {
  return this.find({
    doctor: doctorId,
    date: new Date(date),
    isBooked: false,
    isBlocked: false,
  }).sort({ startTime: 1 });
};

// Static method to book a slot atomically
slotSchema.statics.bookSlotAtomically = async function (slotId, patientId, appointmentId) {
  return this.findOneAndUpdate(
    {
      _id: slotId,
      isBooked: false,
      isBlocked: false,
    },
    {
      isBooked: true,
      bookedBy: patientId,
      bookedAt: new Date(),
      appointment: appointmentId,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Static method to block a slot
slotSchema.statics.blockSlot = async function (slotId, reason) {
  return this.findByIdAndUpdate(
    slotId,
    {
      isBlocked: true,
      blockReason: reason,
      blockedAt: new Date(),
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Static method to unblock a slot
slotSchema.statics.unblockSlot = async function (slotId) {
  return this.findByIdAndUpdate(
    slotId,
    {
      isBlocked: false,
      blockReason: undefined,
      blockedAt: undefined,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

// Static method to release a booked slot (when appointment is cancelled)
slotSchema.statics.releaseSlot = async function (slotId) {
  return this.findByIdAndUpdate(
    slotId,
    {
      isBooked: false,
      bookedBy: undefined,
      bookedAt: undefined,
      appointment: undefined,
    },
    {
      new: true,
      runValidators: true,
    }
  );
};

const Slot = mongoose.model("Slot", slotSchema);
export default Slot;
