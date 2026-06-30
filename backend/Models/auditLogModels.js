import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema({
  // User who performed the action
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  userRole: {
    type: String,
    enum: ["user", "doctor", "admin", "super_admin"],
    required: true,
  },

  // Action details
  action: {
    type: String,
    required: true,
    enum: [
      "login",
      "logout",
      "register",
      "password_change",
      "profile_update",
      "appointment_book",
      "appointment_cancel",
      "appointment_reschedule",
      "appointment_complete",
      "doctor_verify",
      "doctor_reject",
      "user_role_change",
      "user_delete",
      "admin_login",
      "sensitive_data_access",
      "payment_processed",
      "video_call_start",
      "video_call_end",
    ],
  },
  actionType: {
    type: String,
    enum: ["create", "read", "update", "delete", "auth"],
    required: true,
  },

  // Target resource
  resourceType: {
    type: String,
    enum: ["user", "doctor", "appointment", "payment", "system", "none"],
    default: "none",
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
  },

  // Details
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },

  // Request metadata
  ipAddress: String,
  userAgent: String,
  method: String,
  endpoint: String,

  // Status
  status: {
    type: String,
    enum: ["success", "failure"],
    default: "success",
  },
  errorMessage: String,

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1, timestamp: -1 });
auditLogSchema.index({ resourceType: 1, resourceId: 1, timestamp: -1 });
auditLogSchema.index({ timestamp: -1 });

// TTL index - automatically delete logs older than 90 days
auditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const AuditLog = mongoose.model("AuditLog", auditLogSchema);

export default AuditLog;
