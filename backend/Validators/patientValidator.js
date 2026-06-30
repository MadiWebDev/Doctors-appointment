import { z } from "zod";

export const createPatientProfileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  dateOfBirth: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date of birth"),
  gender: z.enum(["male", "female", "other"]),
  bloodGroup: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"]).optional(),
  phone: z.string().min(10, "Phone number must be at least 10 characters"),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    country: z.string().optional(),
    zipCode: z.string().optional(),
  }).optional(),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
});

export const updatePatientProfileSchema = createPatientProfileSchema.partial();

export const medicalHistorySchema = z.object({
  condition: z.string().min(1, "Condition is required"),
  diagnosedDate: z.string().optional(),
  status: z.enum(["active", "resolved", "chronic"]).optional(),
  notes: z.string().optional(),
  treatedBy: z.string().optional(),
});

export const allergySchema = z.object({
  allergen: z.string().min(1, "Allergen is required"),
  type: z.enum(["food", "medication", "environmental", "other"]),
  severity: z.enum(["mild", "moderate", "severe", "life-threatening"]).optional(),
  reaction: z.string().optional(),
  diagnosedDate: z.string().optional(),
});

export const medicationSchema = z.object({
  medicationName: z.string().min(1, "Medication name is required"),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  prescribedBy: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  isOngoing: z.boolean().optional(),
  notes: z.string().optional(),
});

export const familyHistorySchema = z.object({
  relationship: z.string().min(1, "Relationship is required"),
  condition: z.string().min(1, "Condition is required"),
  notes: z.string().optional(),
});

export const lifestyleSchema = z.object({
  smoking: z.object({
    status: z.enum(["never", "former", "current"]).optional(),
    cigarettesPerDay: z.number().optional(),
  }).optional(),
  alcohol: z.object({
    status: z.enum(["never", "occasional", "regular", "heavy"]).optional(),
    drinksPerWeek: z.number().optional(),
  }).optional(),
  exercise: z.object({
    frequency: z.enum(["sedentary", "light", "moderate", "active", "very-active"]).optional(),
    hoursPerWeek: z.number().optional(),
  }).optional(),
  diet: z.enum(["balanced", "vegetarian", "vegan", "keto", "paleo", "other"]).optional(),
});

export const insuranceSchema = z.object({
  provider: z.string().optional(),
  policyNumber: z.string().optional(),
  groupNumber: z.string().optional(),
  expiryDate: z.string().optional(),
  isPrimary: z.boolean().optional(),
});
