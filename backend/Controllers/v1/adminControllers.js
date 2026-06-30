import catchAsyncError from "../../Middleware/catchAsyncError.js";
import User from "../../Models/userModels.js";
import Doctor from "../../Models/doctorModels.js";
import Appointment from "../../Models/appointmentModels.js";
import AuditLog from "../../Models/auditLogModels.js";
import { startOfDay, subDays, format } from "date-fns";

// Get Analytics Data
export const getAnalytics = catchAsyncError(async (req, res, next) => {
  const { timeRange = "7d" } = req.query;

  // Calculate date range
  const days = timeRange === "7d" ? 7 : timeRange === "30d" ? 30 : 90;
  const startDate = startOfDay(subDays(new Date(), days));
  const previousStartDate = startOfDay(subDays(startDate, days));

  // Fetch all data
  const [
    totalUsers,
    totalDoctors,
    totalAppointments,
    appointmentsInRange,
    previousAppointments,
    doctors,
  ] = await Promise.all([
    User.countDocuments({ role: "user" }),
    Doctor.countDocuments({ isVerified: true }),
    Appointment.countDocuments(),
    Appointment.find({ createdAt: { $gte: startDate } }),
    Appointment.find({
      createdAt: { $gte: previousStartDate, $lt: startDate },
    }),
    Doctor.find({ isVerified: true }).populate("user", "username email"),
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
  const revenueChange = previousRevenue > 0 
    ? ((revenueInRange - previousRevenue) / previousRevenue) * 100 
    : 0;
  const appointmentsChange = previousAppointments.length > 0
    ? ((appointmentsInRange.length - previousAppointments.length) / previousAppointments.length) * 100
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
    const status = appointmentStatus.find((s) => s.name.toLowerCase() === item._id);
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
    {
      $sort: { appointmentCount: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  const topDoctors = await Promise.all(
    doctorStats.map(async (stat) => {
      const doctor = await Doctor.findById(stat._id).populate("user", "username");
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
    .populate("patient", "username")
    .populate("doctor", "firstName lastName");

  const activityLog = recentActivity.map((apt) => ({
    type: "appointment",
    message: `New appointment booked with Dr. ${apt.doctor.firstName} ${apt.doctor.lastName}`,
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
      change: 5.2, // Mock data - calculate from previous period
    },
    users: {
      total: totalUsers,
      change: 8.5, // Mock data - calculate from previous period
    },
    appointmentStatus,
    revenueChart,
    topDoctors,
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
      { username: { $regex: search, $options: "i" } },
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
    username: req.user.username,
    userRole: req.user.role,
    action: "user_role_change",
    actionType: "update",
    resourceType: "user",
    resourceId: user._id,
    details: {
      previousRole: user.role,
      newRole: role,
      targetUser: user.username,
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
    username: req.user.username,
    userRole: req.user.role,
    action: "user_delete",
    actionType: "delete",
    resourceType: "user",
    resourceId: user._id,
    details: {
      deletedUser: user.username,
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

  const doctors = await Doctor.find({
    verificationStatus: "pending",
  })
    .populate("user", "username email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Doctor.countDocuments({ verificationStatus: "pending" });

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

  const doctor = await Doctor.findByIdAndUpdate(
    req.params.id,
    {
      verificationStatus: status,
      isVerified: status === "verified",
      rejectionReason: status === "rejected" ? reason : undefined,
      verifiedBy: req.user._id,
      verifiedAt: status === "verified" ? new Date() : undefined,
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
    username: req.user.username,
    userRole: req.user.role,
    action: status === "verified" ? "doctor_verify" : "doctor_reject",
    actionType: "update",
    resourceType: "doctor",
    resourceId: doctor._id,
    details: {
      doctorName: `${doctor.firstName} ${doctor.lastName}`,
      verificationStatus: status,
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

// Get System Logs (Admin)
export const getSystemLogs = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const action = req.query.action;
  const userId = req.query.userId;
  const startDate = req.query.startDate;
  const endDate = req.query.endDate;

  const query = {};
  
  if (action) {
    query.action = action;
  }
  if (userId) {
    query.userId = userId;
  }
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
