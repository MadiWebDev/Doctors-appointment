import { z } from "zod";

export const bookAppointmentSchema = z.object({
  doctor: z.string().min(1, "Doctor ID is required"),
  appointmentDate: z.string().min(1, "Appointment date is required"),
  appointmentTime: z.string().optional(),
  endTime: z.string().optional(),
  appointmentType: z.enum(["in-person", "video"]).optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  notes: z.string().max(1000).optional(),
  medicalHistory: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  slotId: z.string().optional(),
});

export const updateAppointmentSchema = z.object({
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
  endTime: z.string().optional(),
  appointmentType: z.enum(["in-person", "video"]).optional(),
  reason: z.string().min(5).max(500).optional(),
  notes: z.string().max(1000).optional(),
  medicalHistory: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
});

export const rescheduleAppointmentSchema = z.object({
  newDate: z.string().min(1, "New date is required"),
  newTime: z.string().min(1, "New time is required"),
  newEndTime: z.string().min(1, "New end time is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().min(5, "Reason must be at least 5 characters"),
});

export const completeAppointmentSchema = z.object({
  doctorNotes: z.string().max(1000).optional(),
  prescription: z.string().optional(),
  diagnosis: z.string().optional(),
});

export const updateVideoConsultationSchema = z.object({
  meetingUrl: z.string().url("Invalid meeting URL"),
  meetingId: z.string().optional(),
  meetingPassword: z.string().optional(),
  platform: z.enum(["zoom", "google-meet", "other"]).optional(),
});
