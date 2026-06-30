import { z } from "zod";

export const createDoctorProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  specialization: z.enum([
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Orthopedic",
    "Gynecologist",
    "Ophthalmologist",
    "Dentist",
    "Psychiatrist",
    "Urologist",
    "Other",
  ]),
  qualification: z.string().min(2, "Qualification is required"),
  experience: z.number().min(0, "Experience must be a positive number"),
  about: z.string().max(500).optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }).optional(),
  consultationFee: z.number().min(0, "Consultation fee must be a positive number"),
  availability: z.array(z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean().optional(),
  })).optional(),
});

export const updateDoctorProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  specialization: z.enum([
    "General Physician",
    "Cardiologist",
    "Dermatologist",
    "Neurologist",
    "Pediatrician",
    "Orthopedic",
    "Gynecologist",
    "Ophthalmologist",
    "Dentist",
    "Psychiatrist",
    "Urologist",
    "Other",
  ]).optional(),
  qualification: z.string().min(2).optional(),
  experience: z.number().min(0).optional(),
  about: z.string().max(500).optional(),
  phone: z.string().min(10).optional(),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.array(z.number()).length(2),
  }).optional(),
  consultationFee: z.number().min(0).optional(),
  availability: z.array(z.object({
    day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]),
    startTime: z.string(),
    endTime: z.string(),
    isAvailable: z.boolean().optional(),
  })).optional(),
});

export const paymentMethodSchema = z.object({
  bankName: z.string().min(2, "Bank name is required"),
  accountName: z.string().min(2, "Account name is required"),
  accountNumber: z.string().min(8, "Account number must be at least 8 digits"),
  isDefault: z.boolean().optional(),
});

export const documentSchema = z.object({
  documentType: z.enum(["Medical License", "Degree Certificate", "ID Proof", "Other"]),
  documentUrl: z.string().url("Invalid document URL"),
  documentName: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  comment: z.string().max(500).optional(),
  verifiedVisit: z.boolean().optional(),
});

export const verifyDoctorSchema = z.object({
  status: z.enum(["verified", "rejected"]),
  reason: z.string().optional(),
});

export const updateOnlineStatusSchema = z.object({
  isOnline: z.boolean(),
});
