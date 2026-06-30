import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  
  // Message Content
  content: {
    type: String,
    required: true,
    maxlength: 5000,
  },
  
  // Message Type
  messageType: {
    type: String,
    enum: ["text", "image", "document", "audio", "video", "system"],
    default: "text",
  },
  
  // Attachments
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number,
    },
  ],
  
  // Related to appointment or medical record
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  relatedMedicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
  },
  
  // Read Status
  isRead: {
    type: Boolean,
    default: false,
  },
  readAt: Date,
  
  // Delivery Status
  isDelivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: Date,
  
  // Reply to
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
  },
  
  // Deleted status
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  deletedAt: Date,
  
  // Edited status
  isEdited: {
    type: Boolean,
    default: false,
  },
  editedAt: Date,
  originalContent: String,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Conversation Schema
const conversationSchema = new mongoose.Schema({
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      role: {
        type: String,
        enum: ["doctor", "patient"],
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      lastReadAt: Date,
      isMuted: {
        type: Boolean,
        default: false,
      },
    },
  ],
  
  // Related to appointment
  relatedAppointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  
  // Conversation Type
  conversationType: {
    type: String,
    enum: ["direct", "appointment-based", "group"],
    default: "direct",
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  archivedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
  // Last message info for quick access
  lastMessage: {
    content: String,
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    timestamp: Date,
  },
  
  // Typing indicators
  typingUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1, createdAt: -1 });
messageSchema.index({ recipient: 1, isRead: 1 });
conversationSchema.index({ participants: 1 });
conversationSchema.index({ relatedAppointment: 1 });
conversationSchema.index({ updatedAt: -1 });

// Pre-save middleware to update timestamp
messageSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

conversationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Message = mongoose.model("Message", messageSchema);
const Conversation = mongoose.model("Conversation", conversationSchema);

export { Message, Conversation };
