import Appointment from "../../Models/appointmentModels.js";
import Doctor from "../../Models/doctorModels.js";
import User from "../../Models/userModels.js";
import Specialization from "../../Models/specializationModels.js";
import ErrorHandler from "../../utilis/errorHandler.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { subDays, startOfDay, endOfDay, format, startOfMonth, endOfMonth } from "date-fns";

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/v1/admin/analytics/stats
 * @access  Private (Admin)
 */
export const getDashboardStats = catchAsyncError(async (req, res, next) => {
  const totalPatients = await User.countDocuments({ role: "patient" });
  const totalDoctors = await Doctor.countDocuments();
  const pendingApprovals = await Doctor.countDocuments({ status: "pending" });
  
  const today = new Date();
  const startOfToday = startOfDay(today);
  const endOfToday = endOfDay(today);
  
  const todayAppointments = await Appointment.countDocuments({
    appointmentDate: {
      $gte: startOfToday,
      $lte: endOfToday,
    },
  });

  // Calculate total revenue from completed appointments
  const completedAppointments = await Appointment.find({
    status: "completed",
    paymentStatus: "paid",
  }).populate("doctor");

  let totalRevenue = 0;
  completedAppointments.forEach((apt) => {
    if (apt.doctor && apt.doctor.consultationFee) {
      totalRevenue += apt.doctor.consultationFee;
    }
  });

  // Active users in last 30 days
  const thirtyDaysAgo = subDays(today, 30);
  const activeUsers = await User.countDocuments({
    isActive: true,
    createdAt: { $gte: thirtyDaysAgo },
  });

  res.status(200).json({
    success: true,
    stats: {
      totalPatients,
      totalDoctors,
      pendingApprovals,
      todayAppointments,
      totalRevenue,
      activeUsers,
    },
  });
});

/**
 * @desc    Get appointments per day (last 30 days)
 * @route   GET /api/v1/admin/analytics/appointments-daily
 * @access  Private (Admin)
 */
export const getAppointmentsDaily = catchAsyncError(async (req, res, next) => {
  const days = parseInt(req.query.days) || 30;
  const endDate = new Date();
  const startDate = subDays(endDate, days - 1);

  const appointments = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: {
            format: "%Y-%m-%d",
            date: "$appointmentDate",
          },
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing days with 0
  const dailyData = [];
  let currentDate = startDate;
  
  while (currentDate <= endDate) {
    const dateStr = format(currentDate, "yyyy-MM-dd");
    const found = appointments.find((apt) => apt._id === dateStr);
    dailyData.push({
      date: dateStr,
      count: found ? found.count : 0,
    });
    currentDate = new Date(currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  res.status(200).json({
    success: true,
    data: dailyData,
  });
});

/**
 * @desc    Get appointments per specialization
 * @route   GET /api/v1/admin/analytics/appointments-specialization
 * @access  Private (Admin)
 */
export const getAppointmentsBySpecialization = catchAsyncError(async (req, res, next) => {
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate)
    : subDays(new Date(), 30);
  const endDate = req.query.endDate 
    ? new Date(req.query.endDate)
    : new Date();

  const appointments = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      $unwind: "$doctorInfo",
    },
    {
      $group: {
        _id: "$doctorInfo.specialization",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  res.status(200).json({
    success: true,
    data: appointments.map((item) => ({
      specialization: item._id,
      count: item.count,
    })),
  });
});

/**
 * @desc    Get appointment status breakdown
 * @route   GET /api/v1/admin/analytics/appointments-status
 * @access  Private (Admin)
 */
export const getAppointmentsByStatus = catchAsyncError(async (req, res, next) => {
  const startDate = req.query.startDate 
    ? new Date(req.query.startDate)
    : subDays(new Date(), 30);
  const endDate = req.query.endDate 
    ? new Date(req.query.endDate)
    : new Date();

  const appointments = await Appointment.aggregate([
    {
      $match: {
        appointmentDate: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: appointments.map((item) => ({
      status: item._id,
      count: item.count,
    })),
  });
});

/**
 * @desc    Get monthly revenue trend
 * @route   GET /api/v1/admin/analytics/revenue-monthly
 * @access  Private (Admin)
 */
export const getRevenueMonthly = catchAsyncError(async (req, res, next) => {
  const months = parseInt(req.query.months) || 12;
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);

  const appointments = await Appointment.aggregate([
    {
      $match: {
        status: "completed",
        paymentStatus: "paid",
        appointmentDate: {
          $gte: startOfDay(startDate),
          $lte: endOfDay(endDate),
        },
      },
    },
    {
      $lookup: {
        from: "doctors",
        localField: "doctor",
        foreignField: "_id",
        as: "doctorInfo",
      },
    },
    {
      $unwind: "$doctorInfo",
    },
    {
      $group: {
        _id: {
          year: { $year: "$appointmentDate" },
          month: { $month: "$appointmentDate" },
        },
        revenue: {
          $sum: "$doctorInfo.consultationFee",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.year": 1, "_id.month": 1 },
    },
  ]);

  // Fill in missing months
  const monthlyData = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const found = appointments.find(
      (apt) => apt._id.year === year && apt._id.month === month
    );
    
    monthlyData.push({
      year,
      month,
      monthName: format(currentDate, "MMM yyyy"),
      revenue: found ? found.revenue : 0,
      count: found ? found.count : 0,
    });
    
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  res.status(200).json({
    success: true,
    data: monthlyData,
  });
});

/**
 * @desc    Get doctor performance metrics
 * @route   GET /api/v1/admin/analytics/doctor-performance
 * @access  Private (Admin)
 */
export const getDoctorPerformance = catchAsyncError(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const doctors = await Doctor.aggregate([
    {
      $lookup: {
        from: "appointments",
        let: { doctorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$doctor", "$$doctorId"] },
                  { $eq: ["$status", "completed"] },
                ],
              },
            },
          },
        ],
        as: "completedAppointments",
      },
    },
    {
      $addFields: {
        completedCount: { $size: "$completedAppointments" },
      },
    },
    {
      $lookup: {
        from: "appointments",
        let: { doctorId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$doctor", "$$doctorId"] },
                  { $eq: ["$status", "cancelled"] },
                ],
              },
            },
          },
        ],
        as: "cancelledAppointments",
      },
    },
    {
      $addFields: {
        cancelledCount: { $size: "$cancelledAppointments" },
      },
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        specialization: 1,
        ratings: 1,
        numOfReviews: 1,
        consultationFee: 1,
        completedCount: 1,
        cancelledCount: 1,
        totalAppointments: 1,
        completionRate: {
          $cond: [
            { $eq: ["$totalAppointments", 0] },
            0,
            {
              $multiply: [
                {
                  $divide: ["$completedCount", "$totalAppointments"],
                },
                100,
              ],
            },
          ],
        },
      },
    },
    {
      $sort: { completedCount: -1 },
    },
    {
      $limit: limit,
    },
  ]);

  res.status(200).json({
    success: true,
    data: doctors,
  });
});
