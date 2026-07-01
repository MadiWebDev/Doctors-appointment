import { Message, Conversation } from "../Models/messageModels.js";
import Patient from "../Models/patientModels.js";
import Doctor from "../Models/doctorModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class MessageService {
  /**
   * Create conversation
   */
  async createConversation(participants, conversationType = "direct", relatedAppointment = null) {
    // Check if conversation already exists between these participants
    const existingConversation = await Conversation.findOne({
      participants: { $all: participants.map(p => p.user) },
      conversationType,
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = await Conversation.create({
      participants,
      conversationType,
      relatedAppointment,
    });

    return conversation;
  }

  /**
   * Get conversation by ID
   */
  async getConversationById(conversationId) {
    const conversation = await Conversation.findById(conversationId)
      .populate("participants.user", "name email")
      .populate("relatedAppointment");
    
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }
    return conversation;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const conversations = await Conversation.find({
      "participants.user": userId,
      isActive: true,
    })
      .populate("participants.user", "name email")
      .populate("relatedAppointment")
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Conversation.countDocuments({
      "participants.user": userId,
      isActive: true,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      conversations,
      pagination: {
        currentPage: page,
        totalPages,
        totalConversations: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Send message
   */
  async sendMessage(conversationId, senderId, recipientId, messageData) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    // Verify sender is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.user.toString() === senderId.toString()
    );
    if (!isParticipant) {
      throw new ErrorHandler("You are not a participant in this conversation", 403);
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      recipient: recipientId,
      ...messageData,
    });

    // Update conversation's last message
    conversation.lastMessage = {
      content: message.content,
      sender: senderId,
      timestamp: new Date(),
    };
    conversation.updatedAt = new Date();
    await conversation.save();

    return message;
  }

  /**
   * Get messages in conversation
   */
  async getConversationMessages(conversationId, userId, page = 1, limit = 50) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ErrorHandler("You are not a participant in this conversation", 403);
    }

    const skip = (page - 1) * limit;
    const messages = await Message.find({
      conversation: conversationId,
      isDeleted: false,
    })
      .populate("sender", "name email")
      .populate("recipient", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({
      conversation: conversationId,
      isDeleted: false,
    });
    const totalPages = Math.ceil(total / limit);

    return {
      messages: messages.reverse(), // Return in chronological order
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new ErrorHandler("Message not found", 404);
    }

    // Only recipient can mark as read
    if (message.recipient.toString() !== userId.toString()) {
      throw new ErrorHandler("You are not authorized to mark this message as read", 403);
    }

    message.isRead = true;
    message.readAt = new Date();
    await message.save();

    return message;
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ErrorHandler("You are not a participant in this conversation", 403);
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        recipient: userId,
        isRead: false,
      },
      {
        isRead: true,
        readAt: new Date(),
      }
    );

    // Update participant's lastReadAt
    const participant = conversation.participants.find(
      (p) => p.user.toString() === userId.toString()
    );
    if (participant) {
      participant.lastReadAt = new Date();
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Delete message
   */
  async deleteMessage(messageId, userId) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new ErrorHandler("Message not found", 404);
    }

    // Only sender can delete their own message
    if (message.sender.toString() !== userId.toString()) {
      throw new ErrorHandler("You are not authorized to delete this message", 403);
    }

    message.isDeleted = true;
    message.deletedBy.push(userId);
    message.deletedAt = new Date();
    await message.save();

    return message;
  }

  /**
   * Edit message
   */
  async editMessage(messageId, userId, newContent) {
    const message = await Message.findById(messageId);
    if (!message) {
      throw new ErrorHandler("Message not found", 404);
    }

    // Only sender can edit their own message
    if (message.sender.toString() !== userId.toString()) {
      throw new ErrorHandler("You are not authorized to edit this message", 403);
    }

    message.originalContent = message.content;
    message.content = newContent;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    return message;
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ErrorHandler("You are not a participant in this conversation", 403);
    }

    if (!conversation.archivedBy.includes(userId)) {
      conversation.archivedBy.push(userId);
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Unarchive conversation
   */
  async unarchiveConversation(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    conversation.archivedBy = conversation.archivedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
    await conversation.save();

    return conversation;
  }

  /**
   * Set typing indicator
   */
  async setTypingIndicator(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.user.toString() === userId.toString()
    );
    if (!isParticipant) {
      throw new ErrorHandler("You are not a participant in this conversation", 403);
    }

    if (!conversation.typingUsers.includes(userId)) {
      conversation.typingUsers.push(userId);
      await conversation.save();
    }

    return conversation;
  }

  /**
   * Remove typing indicator
   */
  async removeTypingIndicator(conversationId, userId) {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      throw new ErrorHandler("Conversation not found", 404);
    }

    conversation.typingUsers = conversation.typingUsers.filter(
      (id) => id.toString() !== userId.toString()
    );
    await conversation.save();

    return conversation;
  }

  /**
   * Get unread message count for user
   */
  async getUnreadCount(userId) {
    const count = await Message.countDocuments({
      recipient: userId,
      isRead: false,
      isDeleted: false,
    });

    return { unreadCount: count };
  }
}

export default new MessageService();
