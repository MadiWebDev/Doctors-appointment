import notificationService from "../../Services/notificationService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";

// Get User Notifications
export const getUserNotifications = catchAsyncError(async (req, res, next) => {
  const filters = {
    unreadOnly: req.query.unreadOnly === "true",
    type: req.query.type,
  };

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await notificationService.getUserNotifications(req.user._id, filters, page, limit);

  res.status(200).json({
    success: true,
    notifications: result.notifications,
    unreadCount: result.pagination.unreadCount,
    pagination: result.pagination,
  });
});

// Get Unread Count
export const getUnreadCount = catchAsyncError(async (req, res, next) => {
  const result = await notificationService.getUnreadCount(req.user._id);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Mark as Read
export const markAsRead = catchAsyncError(async (req, res, next) => {
  const notification = await notificationService.markAsRead(req.params.id, req.user._id);
  res.status(200).json({
    success: true,
    message: "Notification marked as read",
    notification,
  });
});

// Mark All as Read
export const markAllAsRead = catchAsyncError(async (req, res, next) => {
  const result = await notificationService.markAllAsRead(req.user._id);
  res.status(200).json(result);
});

// Delete Notification
export const deleteNotification = catchAsyncError(async (req, res, next) => {
  const result = await notificationService.deleteNotification(req.params.id, req.user._id);
  res.status(200).json(result);
});
