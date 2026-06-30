import Notification from "../Models/notificationModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";
import sendEmail from "../utilis/sendEmail.js";

export class NotificationService {
  /**
   * Create notification
   */
  async createNotification(notificationData) {
    const notification = await Notification.create(notificationData);
    
    // Check if user wants email notifications for this type
    const user = await User.findById(notificationData.recipient);
    if (user && this.shouldSendEmail(user, notificationData.type)) {
      await this.sendEmailNotification(user, notification);
    }
    
    return notification;
  }

  /**
   * Get user notifications with pagination
   */
  async getUserNotifications(userId, filters = {}, page = 1, limit = 20) {
    const query = { recipient: userId };

    if (filters.unreadOnly) {
      query.isRead = false;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const skip = (page - 1) * limit;
    const notifications = await Notification.find(query)
      .populate("relatedUser", "username email")
      .populate("relatedDoctor", "firstName lastName")
      .populate("relatedAppointment")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ recipient: userId, isRead: false });

    return {
      notifications,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalNotifications: total,
        unreadCount,
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new ErrorHandler("Notification not found", 404);
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to mark this notification", 403);
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return { success: true, message: "All notifications marked as read" };
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new ErrorHandler("Notification not found", 404);
    }

    if (notification.recipient.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete this notification", 403);
    }

    await notification.deleteOne();
    return { success: true, message: "Notification deleted successfully" };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      recipient: userId,
      isRead: false,
    });
    return { unreadCount: count };
  }

  /**
   * Check if user wants email notifications for this type
   */
  shouldSendEmail(user, type) {
    // This can be enhanced with user notification preferences
    // For now, we'll send emails for high-priority notifications
    const emailNotificationTypes = [
      "appointment_confirmed",
      "appointment_cancelled",
      "appointment_reminder",
      "doctor_verified",
      "doctor_rejected",
    ];
    return emailNotificationTypes.includes(type);
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(user, notification) {
    try {
      const subject = `Doctor Appointment - ${notification.title}`;
      const message = `Hello ${user.username},\n\n${notification.message}\n\nBest regards,\nDoctor Appointment Team`;

      await sendEmail({
        email: user.email,
        subject,
        message,
      });

      notification.emailSent = true;
      notification.emailSentAt = new Date();
      await notification.save();
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  /**
   * Create appointment booked notification
   */
  async notifyAppointmentBooked(patientId, doctorId, appointmentId) {
    const Doctor = await import("../Models/doctorModels.js");
    const doctor = await Doctor.default.findById(doctorId).populate("user");

    await this.createNotification({
      recipient: doctor.user._id,
      type: "appointment_booked",
      title: "New Appointment Booked",
      message: `A new appointment has been booked with you.`,
      relatedUser: patientId,
      relatedDoctor: doctorId,
      relatedAppointment: appointmentId,
      priority: "high",
      actionUrl: `/doctor/appointments/${appointmentId}`,
    });
  }

  /**
   * Create appointment confirmed notification
   */
  async notifyAppointmentConfirmed(patientId, doctorId, appointmentId) {
    await this.createNotification({
      recipient: patientId,
      type: "appointment_confirmed",
      title: "Appointment Confirmed",
      message: `Your appointment has been confirmed.`,
      relatedDoctor: doctorId,
      relatedAppointment: appointmentId,
      priority: "high",
      actionUrl: `/patient/appointments/${appointmentId}`,
    });
  }

  /**
   * Create appointment cancelled notification
   */
  async notifyAppointmentCancelled(patientId, doctorId, appointmentId, reason) {
    const Doctor = await import("../Models/doctorModels.js");
    const doctor = await Doctor.default.findById(doctorId).populate("user");

    // Notify patient
    await this.createNotification({
      recipient: patientId,
      type: "appointment_cancelled",
      title: "Appointment Cancelled",
      message: `Your appointment has been cancelled. Reason: ${reason}`,
      relatedDoctor: doctorId,
      relatedAppointment: appointmentId,
      priority: "high",
      actionUrl: `/patient/appointments/${appointmentId}`,
    });

    // Notify doctor
    await this.createNotification({
      recipient: doctor.user._id,
      type: "appointment_cancelled",
      title: "Appointment Cancelled",
      message: `An appointment has been cancelled.`,
      relatedUser: patientId,
      relatedDoctor: doctorId,
      relatedAppointment: appointmentId,
      priority: "high",
      actionUrl: `/doctor/appointments/${appointmentId}`,
    });
  }

  /**
   * Create appointment reminder notification
   */
  async notifyAppointmentReminder(patientId, doctorId, appointmentId, timeUntil) {
    await this.createNotification({
      recipient: patientId,
      type: "appointment_reminder",
      title: "Appointment Reminder",
      message: `Your appointment is coming up in ${timeUntil}.`,
      relatedDoctor: doctorId,
      relatedAppointment: appointmentId,
      priority: "high",
      actionUrl: `/patient/appointments/${appointmentId}`,
    });
  }

  /**
   * Create doctor verified notification
   */
  async notifyDoctorVerified(doctorId) {
    const Doctor = await import("../Models/doctorModels.js");
    const doctor = await Doctor.default.findById(doctorId).populate("user");

    await this.createNotification({
      recipient: doctor.user._id,
      type: "doctor_verified",
      title: "Account Verified",
      message: `Your doctor account has been verified. You can now start accepting appointments.`,
      relatedDoctor: doctorId,
      priority: "high",
      actionUrl: `/doctor/profile`,
    });
  }

  /**
   * Create doctor rejected notification
   */
  async notifyDoctorRejected(doctorId, reason) {
    const Doctor = await import("../Models/doctorModels.js");
    const doctor = await Doctor.default.findById(doctorId).populate("user");

    await this.createNotification({
      recipient: doctor.user._id,
      type: "doctor_rejected",
      title: "Account Verification Rejected",
      message: `Your doctor account verification has been rejected. Reason: ${reason}`,
      relatedDoctor: doctorId,
      priority: "high",
      actionUrl: `/doctor/profile`,
    });
  }

  /**
   * Create new review notification
   */
  async notifyNewReview(doctorId, patientId, rating) {
    const Doctor = await import("../Models/doctorModels.js");
    const doctor = await Doctor.default.findById(doctorId).populate("user");

    await this.createNotification({
      recipient: doctor.user._id,
      type: "new_review",
      title: "New Review Received",
      message: `You received a ${rating}-star review from a patient.`,
      relatedUser: patientId,
      relatedDoctor: doctorId,
      priority: "medium",
      actionUrl: `/doctor/profile`,
    });
  }
}

export default new NotificationService();
