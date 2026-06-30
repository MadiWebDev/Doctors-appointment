import { z } from "zod";

export const createConversationSchema = z.object({
  participants: z.array(z.object({
    user: z.string().min(1, "User ID is required"),
    role: z.enum(["doctor", "patient"]),
    joinedAt: z.string().optional(),
    lastReadAt: z.string().optional(),
    isMuted: z.boolean().optional(),
  })).min(2, "At least 2 participants are required"),
  conversationType: z.enum(["direct", "appointment-based", "group"]).optional(),
  relatedAppointment: z.string().optional(),
});

export const sendMessageSchema = z.object({
  recipient: z.string().min(1, "Recipient ID is required"),
  content: z.string().min(1, "Message content is required").max(5000, "Message content must be less than 5000 characters"),
  messageType: z.enum(["text", "image", "document", "audio", "video", "system"]).optional(),
  attachments: z.array(z.object({
    fileName: z.string().optional(),
    fileUrl: z.string().optional(),
    fileType: z.string().optional(),
    fileSize: z.number().optional(),
  })).optional(),
  relatedAppointment: z.string().optional(),
  relatedMedicalRecord: z.string().optional(),
});

export const editMessageSchema = z.object({
  content: z.string().min(1, "Message content is required").max(5000, "Message content must be less than 5000 characters"),
});
