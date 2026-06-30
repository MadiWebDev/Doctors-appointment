import express from "express";
import {
  getUserNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../../Controllers/v1/notificationControllers.js";
import { isAuthenticatedUser } from "../../Middleware/authE.js";

const router = express.Router();

// Protected routes
router.get("/", isAuthenticatedUser, getUserNotifications);
router.get("/unread-count", isAuthenticatedUser, getUnreadCount);
router.put("/:id/read", isAuthenticatedUser, markAsRead);
router.put("/read-all", isAuthenticatedUser, markAllAsRead);
router.delete("/:id", isAuthenticatedUser, deleteNotification);

export default router;
