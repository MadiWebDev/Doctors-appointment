import messageService from "../../Services/messageService.js";
import catchAsyncError from "../../Middleware/catchAsyncError.js";
import { createConversationSchema, sendMessageSchema, editMessageSchema } from "../../Validators/messageValidator.js";

// Create Conversation
export const createConversation = catchAsyncError(async (req, res, next) => {
  const validationResult = createConversationSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const conversation = await messageService.createConversation(
    validationResult.data.participants,
    validationResult.data.conversationType,
    validationResult.data.relatedAppointment
  );
  res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    conversation,
  });
});

// Get Conversation by ID
export const getConversationById = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.getConversationById(req.params.id);
  res.status(200).json({
    success: true,
    conversation,
  });
});

// Get User's Conversations
export const getUserConversations = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  const result = await messageService.getUserConversations(req.user._id, page, limit);
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Send Message
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const validationResult = sendMessageSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const message = await messageService.sendMessage(
    req.params.conversationId,
    req.user._id,
    validationResult.data.recipient,
    validationResult.data
  );
  res.status(201).json({
    success: true,
    message: "Message sent successfully",
    data: message,
  });
});

// Get Conversation Messages
export const getConversationMessages = catchAsyncError(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  const result = await messageService.getConversationMessages(
    req.params.conversationId,
    req.user._id,
    page,
    limit
  );
  res.status(200).json({
    success: true,
    ...result,
  });
});

// Mark Message as Read
export const markAsRead = catchAsyncError(async (req, res, next) => {
  const message = await messageService.markAsRead(req.params.messageId, req.user._id);
  res.status(200).json({
    success: true,
    message: "Message marked as read",
    data: message,
  });
});

// Mark Conversation as Read
export const markConversationAsRead = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.markConversationAsRead(req.params.conversationId, req.user._id);
  res.status(200).json({
    success: true,
    message: "Conversation marked as read",
    conversation,
  });
});

// Delete Message
export const deleteMessage = catchAsyncError(async (req, res, next) => {
  const message = await messageService.deleteMessage(req.params.messageId, req.user._id);
  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: message,
  });
});

// Edit Message
export const editMessage = catchAsyncError(async (req, res, next) => {
  const validationResult = editMessageSchema.safeParse(req.body);
  if (!validationResult.success) {
    const errors = validationResult.error.errors.map(err => err.message);
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  const message = await messageService.editMessage(
    req.params.messageId,
    req.user._id,
    validationResult.data.content
  );
  res.status(200).json({
    success: true,
    message: "Message edited successfully",
    data: message,
  });
});

// Archive Conversation
export const archiveConversation = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.archiveConversation(req.params.conversationId, req.user._id);
  res.status(200).json({
    success: true,
    message: "Conversation archived successfully",
    conversation,
  });
});

// Unarchive Conversation
export const unarchiveConversation = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.unarchiveConversation(req.params.conversationId, req.user._id);
  res.status(200).json({
    success: true,
    message: "Conversation unarchived successfully",
    conversation,
  });
});

// Set Typing Indicator
export const setTypingIndicator = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.setTypingIndicator(req.params.conversationId, req.user._id);
  res.status(200).json({
    success: true,
    conversation,
  });
});

// Remove Typing Indicator
export const removeTypingIndicator = catchAsyncError(async (req, res, next) => {
  const conversation = await messageService.removeTypingIndicator(req.params.conversationId, req.user._id);
  res.status(200).json({
    success: true,
    conversation,
  });
});

// Get Unread Count
export const getUnreadCount = catchAsyncError(async (req, res, next) => {
  const result = await messageService.getUnreadCount(req.user._id);
  res.status(200).json({
    success: true,
    ...result,
  });
});
