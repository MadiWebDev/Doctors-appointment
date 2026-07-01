import catchAsyncError from "../../Middleware/catchAsyncError.js";
import User from "../../Models/userModels.js";
import Doctor from "../../Models/doctorModels.js";
import Appointment from "../../Models/appointmentModels.js";
import AuditLog from "../../Models/auditLogModels.js";
import Notification from "../../Models/notificationModels.js";
import { startOfDay, subDays, format } from "date-fns";

// Get Analytics Data
export const getAnalytics = catchAsyncError(async (req, res, next) => {
  const { timeRange = "7d" } = req.query;

  // Calculate date range
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = startOfDay(subDays(new Date(), days));
  const previousStartDate = startOfDay(subDays(startDate, days));

  // Fetch all data in parallel
  const [
    totalUsers,
    totalDoctors,
    totalAppointments,
    appointmentsInRange,
    previousAppointments,
  ] = await Promise.all([
    User.countDocuments({ role: "patient" }),
    Doctor.countDocuments({ status: "approved" }),
    Appointment.countDocuments(),
    Appointment.find({ createdAt: { $gte: startDate } }),
    Appointment.find({
      createdAt: { $gte: previousStartDate, $lt: startDate },
    }),
  ]);

  // Calculate revenue
  const revenueInRange = appointmentsInRange.reduce(
    (sum, apt) => sum + (apt.paymentAmount || 0),
    0
  );
  const previousRevenue = previousAppointments.reduce(
    (sum, apt) => sum + (apt.paymentAmount || 0),
    0
  );

  // Calculate changes
  const revenueChange =
    previousRevenue > 0
      ? ((revenueInRange - previousRevenue) / previousRevenue) * 100
      : 0;
  const appointmentsChange =
    previousAppointments.length > 0
      ? ((appointmentsInRange.length - previousAppointments.length) /
          previousAppointments.length) *
        100
      : 0;

  // Appointment status distribution
  const statusDistribution = await Appointment.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const appointmentStatus = [
    { name: "Confirmed", value: 0, color: "#22c55e" },
    { name: "Pending", value: 0, color: "#eab308" },
    { name: "Completed", value: 0, color: "#0284c7" },
    { name: "Cancelled", value: 0, color: "#ef4444" },
    { name: "No-Show", value: 0, color: "#64748b" },
  ];

  statusDistribution.forEach((item) => {
    const status = appointmentStatus.find(
      (s) => s.name.toLowerCase() === item._id
    );
    if (status) status.value = item.count;
  });

  // Revenue chart data (daily)
  const revenueChart = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = startOfDay(subDays(new Date(), i));
    const nextDate = startOfDay(subDays(new Date(), i - 1));

    const dayAppointments = await Appointment.find({
      createdAt: { $gte: date, $lt: nextDate },
      paymentStatus: "paid",
    });

    const dayRevenue = dayAppointments.reduce(
      (sum, apt) => sum + (apt.paymentAmount || 0),
      0
    );

    revenueChart.push({
      date: format(date, "EEE"),
      revenue: dayRevenue,
      appointments: dayAppointments.length,
    });
  }

  // Top performing doctors
  const doctorStats = await Appointment.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $in: ["completed", "confirmed"] },
      },
    },
    {
      $group: {
        _id: "$doctor",
        appointmentCount: { $sum: 1 },
        totalRevenue: { $sum: "$paymentAmount" },
      },
    },
    { $sort: { appointmentCount: -1 } },
    { $limit: 5 },
  ]);

  const topDoctors = await Promise.all(
    doctorStats.map(async (stat) => {
      const doctor = await Doctor.findById(stat._id);
      if (!doctor) return null;
      return {
        name: `Dr. ${doctor.firstName} ${doctor.lastName}`,
        appointments: stat.appointmentCount,
        revenue: stat.totalRevenue || 0,
        rating: doctor.ratings || 0,
      };
    })
  );

  // Recent activity
  const recentActivity = await Appointment.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("patient", "name")
    .populate("doctor", "firstName lastName");

  const activityLog = recentActivity.map((apt) => ({
    type: "appointment",
    message: `New appointment booked with Dr. ${apt.doctor?.firstName} ${apt.doctor?.lastName}`,
    timestamp: apt.createdAt,
  }));

  res.status(200).json({
    success: true,
    revenue: {
      total: revenueInRange,
      change: revenueChange.toFixed(1),
    },
    appointments: {
      total: appointmentsInRange.length,
      change: appointmentsChange.toFixed(1),
    },
    doctors: {
      active: totalDoctors,
      change: 5.2,
    },
    users: {
      total: totalUsers,
      change: 8.5,
    },
    appointmentStatus,
    revenueChart,
    topDoctors: topDoctors.filter(Boolean),
    recentActivity: activityLog,
  });
});

// Get All Users (Admin)
export const getAllUsers = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search || "";
  const role = req.query.role || "";

  const query = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }
  if (role) {
    query.role = role;
  }

  const users = await User.find(query)
    .select("-password")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await User.countDocuments(query);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Update User Role (Admin)
export const updateUserRole = catchAsyncError(async (req, res, next) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: "user_role_change",
    actionType: "update",
    resourceType: "user",
    resourceId: user._id,
    details: {
      newRole: role,
      targetUser: user.name,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user,
  });
});

// Delete User (Admin)
export const deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: "user_delete",
    actionType: "delete",
    resourceType: "user",
    resourceId: user._id,
    details: {
      deletedUser: user.name,
      deletedUserRole: user.role,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

// Get Pending Doctor Verifications
export const getPendingVerifications = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  const doctors = await Doctor.find({ status: "pending" })
    .populate("user", "name email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Doctor.countDocuments({ status: "pending" });

  res.status(200).json({
    success: true,
    doctors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// Verify/Reject Doctor (Admin)
export const verifyDoctor = catchAsyncError(async (req, res, next) => {
  const { status, reason } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be 'approved' or 'rejected'",
    });
  }

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      status,
      rejectionReason: status === "rejected" ? reason : undefined,
      approvedBy: req.user._id,
      approvedAt: status === "approved" ? new Date() : undefined,
    },
    { new: true, runValidators: true }
  );

  if (!doctor) {
    return res.status(404).json({
      success: false,
      message: "Doctor not found",
    });
  }

  // Log the action
  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: status === "approved" ? "doctor_verify" : "doctor_reject",
    actionType: "update",
    resourceType: "doctor",
    resourceId: doctor._id,
    details: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      status,
      rejectionReason: reason,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: `Doctor ${status} successfully`,
    doctor,
  });
});

// Suspend Doctor (Admin)
export const suspendDoctor = catchAsyncError(async (req, res, next) => {
  const { reason } = req.body;

  if (!reason || !reason.trim()) {
    return res.status(400).json({
      success: false,
      message: "A suspension reason is required",
    });
  }

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  if (doctor.status !== "approved") {
    return res.status(400).json({
      success: false,
      message: "Only approved doctors can be suspended",
    });
  }

  doctor.status = "suspended";
  doctor.suspensionReason = reason.trim();
  doctor.suspendedBy = req.user._id;
  doctor.suspendedAt = new Date();
  await doctor.save();

  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: "doctor_suspend",
    actionType: "update",
    resourceType: "doctor",
    resourceId: doctor._id,
    details: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      suspensionReason: reason,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: "Doctor suspended successfully",
    doctor,
  });
});

// Unsuspend (Reinstate) Doctor (Admin)
export const unsuspendDoctor = catchAsyncError(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  if (doctor.status !== "suspended") {
    return res.status(400).json({
      success: false,
      message: "Doctor is not currently suspended",
    });
  }

  doctor.status = "approved";
  doctor.suspensionReason = undefined;
  doctor.suspendedBy = undefined;
  doctor.suspendedAt = undefined;
  await doctor.save();

  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: "doctor_unsuspend",
    actionType: "update",
    resourceType: "doctor",
    resourceId: doctor._id,
    details: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: "Doctor reinstated successfully",
    doctor,
  });
});

// Permanently Remove Doctor (Admin)
export const permanentRemoveDoctor = catchAsyncError(async (req, res, next) => {
  const { reason } = req.body;

  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ success: false, message: "Doctor not found" });
  }

  const doctorName = `${doctor.firstName} ${doctor.lastName}`;
  const doctorUserId = doctor.user;

  // Delete the doctor profile
  await doctor.deleteOne();

  // Also remove the linked user account so they can't log back in as a doctor
  await User.findByIdAndDelete(doctorUserId);

  await AuditLog.create({
    userId: req.user._id,
    username: req.user.name,
    userRole: req.user.role,
    action: "doctor_permanent_remove",
    actionType: "delete",
    resourceType: "doctor",
    resourceId: req.params.id,
    details: {
      doctorName,
      reason: reason || "No reason provided",
    },
    ipAddress: req.ip,
    userAgent: req.get("user-agent"),
    method: req.method,
    endpoint: req.originalUrl,
  });

  res.status(200).json({
    success: true,
    message: "Doctor permanently removed from the platform",
  });
});

// Get System Logs (Admin)
export const getSystemLogs = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const action = req.query.action;
  const userId = req.query.userId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const query = {};

  if (action) query.action = action;
  if (userId) query.userId = userId;
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }

  const logs = await AuditLog.find(query)
    .sort({ timestamp: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await AuditLog.countDocuments(query);

  res.status(200).json({
    success: true,
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

// ─── Admin Notification Controllers ─────────────────────────────────────────

/**
 * GET /api/v1/admin/notifications
 * List ALL platform notifications with filters + pagination.
 */
export const getAllNotifications = catchAsyncError(async (req, res, next) => {
  const page     = parseInt(req.query.page)  || 1;
  const limit    = parseInt(req.query.limit) || 20;
  const type     = req.query.type;
  const priority = req.query.priority;
  const isRead   = req.query.isRead;
  const search   = req.query.search;

  const query = {};
  if (type)     query.type     = type;
  if (priority) query.priority = priority;
  if (isRead !== undefined && isRead !== "") query.isRead = isRead === "true";

  const [notifications, total, unreadTotal] = await Promise.all([
    Notification.find(query)
      .populate("recipient",           "name email role")
      .populate("relatedUser",         "name email")
      .populate("relatedDoctor",       "firstName lastName specialization")
      .populate("relatedAppointment",  "appointmentDate status")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Notification.countDocuments(query),
    Notification.countDocuments({ isRead: false }),
  ]);

  // Client-side search filter on recipient name/email if provided
  // (full-text search requires Atlas; we do a lightweight post-filter here)
  const filtered = search
    ? notifications.filter((n) => {
        const term = search.toLowerCase();
        return (
          (n.recipient?.name  || "").toLowerCase().includes(term) ||
          (n.recipient?.email || "").toLowerCase().includes(term) ||
          (n.title  || "").toLowerCase().includes(term) ||
          (n.message || "").toLowerCase().includes(term)
        );
      })
    : notifications;

  res.status(200).json({
    success: true,
    notifications: filtered,
    unreadTotal,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * POST /api/v1/admin/notifications/broadcast
 * Send a custom system notification to all users, all doctors, all patients,
 * or a single user by id.
 */
export const broadcastNotification = catchAsyncError(async (req, res, next) => {
  const { title, message, priority = "medium", target = "all", userId } = req.body;

  if (!title || !message) {
    return res.status(400).json({ success: false, message: "Title and message are required" });
  }

  let recipients = [];

  if (target === "user" && userId) {
    recipients = [userId];
  } else {
    const roleFilter =
      target === "doctors"  ? "doctor"  :
      target === "patients" ? "patient" : undefined;

    const userQuery = roleFilter ? { role: roleFilter, isActive: true } : { isActive: true };
    const users = await User.find(userQuery).select("_id");
    recipients = users.map((u) => u._id);
  }

  if (recipients.length === 0) {
    return res.status(400).json({ success: false, message: "No recipients found" });
  }

  // Bulk insert
  const docs = recipients.map((recipientId) => ({
    recipient:  recipientId,
    type:       "system",
    title,
    message,
    priority,
    actionUrl:  null,
  }));

  await Notification.insertMany(docs, { ordered: false });

  res.status(201).json({
    success: true,
    message: `Notification sent to ${recipients.length} recipient(s)`,
    count: recipients.length,
  });
});

/**
 * DELETE /api/v1/admin/notifications/:id
 * Hard-delete a single notification.
 */
export const deleteNotificationAdmin = catchAsyncError(async (req, res, next) => {
  const notification = await Notification.findByIdAndDelete(req.params.id);
  if (!notification) {
    return res.status(404).json({ success: false, message: "Notification not found" });
  }
  res.status(200).json({ success: true, message: "Notification deleted" });
});

/**
 * DELETE /api/v1/admin/notifications/bulk-delete
 * Delete all read notifications older than N days (cleanup).
 */
export const bulkDeleteNotifications = catchAsyncError(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const result = await Notification.deleteMany({
    isRead: true,
    createdAt: { $lt: cutoff },
  });

  res.status(200).json({
    success: true,
    message: `Deleted ${result.deletedCount} read notification(s) older than ${days} days`,
    deletedCount: result.deletedCount,
  });
});
