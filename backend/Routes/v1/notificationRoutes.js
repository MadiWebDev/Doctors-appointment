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

// ── Static routes MUST come before /:id param routes ────────────────────────
router.get("/",            isAuthenticatedUser, getUserNotifications);
router.get("/unread-count",isAuthenticatedUser, getUnreadCount);

// "read-all" must come before "/:id/read" — otherwise "read-all" is caught as id="read-all"
router.put("/read-all",    isAuthenticatedUser, markAllAsRead);

// Param routes
router.put("/:id/read",    isAuthenticatedUser, markAsRead);
router.delete("/:id",      isAuthenticatedUser, deleteNotification);

export default router;
