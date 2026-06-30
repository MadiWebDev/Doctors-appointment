import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  
  // Notification type
  type: {
    type: String,
    enum: [
      "appointment_booked",
      "appointment_confirmed",
      "appointment_cancelled",
      "appointment_rescheduled",
      "appointment_reminder",
      "appointment_completed",
      "payment_received",
      "doctor_verified",
      "doctor_rejected",
      "new_review",
      "message_received",
      "system",
    ],
    required: true,
  },
  
  // Notification title
  title: {
    type: String,
    required: true,
  },
  
  // Notification message
  message: {
    type: String,
    required: true,
  },
  
  // Related entities
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  relatedDoctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
  },
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  
  // Read status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // Priority
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium",
  },
  
  // Action URL (for frontend navigation)
  actionUrl: String,
  
  // Email notification status
  emailSent: {
    type: Boolean,
    default: false,
  },
  emailSentAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, type: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
