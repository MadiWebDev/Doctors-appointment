import express from "express";
import {
  createConversation,
  getConversationById,
  getUserConversations,
  sendMessage,
  getConversationMessages,
  markAsRead,
  markConversationAsRead,
  deleteMessage,
  editMessage,
  archiveConversation,
  unarchiveConversation,
  setTypingIndicator,
  removeTypingIndicator,
  getUnreadCount,
} from "../../Controllers/v1/messageControllers.js";
import { isAuthenticatedUser } from "../../Middleware/authE.js";

const router = express.Router();

// All routes require authentication
router.use(isAuthenticatedUser);

// Conversation routes
router.post("/conversations", createConversation);
router.get("/conversations", getUserConversations);
router.get("/conversations/:id", getConversationById);
router.put("/conversations/:id/archive", archiveConversation);
router.put("/conversations/:id/unarchive", unarchiveConversation);
router.put("/conversations/:id/typing", setTypingIndicator);
router.delete("/conversations/:id/typing", removeTypingIndicator);

// Message routes
router.post("/conversations/:conversationId/messages", sendMessage);
router.get("/conversations/:conversationId/messages", getConversationMessages);
router.put("/messages/:messageId/read", markAsRead);
router.put("/conversations/:conversationId/read-all", markConversationAsRead);
router.put("/messages/:messageId/edit", editMessage);
router.delete("/messages/:messageId", deleteMessage);

// Unread count
router.get("/unread-count", getUnreadCount);

export default router;
