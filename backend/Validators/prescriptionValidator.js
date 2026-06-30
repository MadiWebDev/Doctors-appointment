import { z } from "zod";

export const createPrescriptionSchema = z.object({
  patient: z.string().min(1, "Patient ID is required"),
  appointment: z.string().optional(),
  medicalRecord: z.string().optional(),
  prescriptionDate: z.string().optional(),
  medications: z.array(z.object({
    medicationName: z.string().min(1, "Medication name is required"),
    genericName: z.string().optional(),
    dosage: z.object({
      value: z.number().min(0, "Dosage value must be positive"),
      unit: z.enum(["mg", "g", "ml", "mcg", "IU", "units"]),
    }).optional(),
    form: z.enum(["tablet", "capsule", "liquid", "injection", "cream", "ointment", "inhaler", "patch", "drops", "other"]),
    route: z.enum(["oral", "intravenous", "intramuscular", "subcutaneous", "topical", "inhalation", "rectal", "other"]).optional(),
    frequency: z.string().min(1, "Frequency is required"),
    duration: z.object({
      value: z.number().min(0, "Duration value must be positive"),
      unit: z.enum(["days", "weeks", "months"]),
    }).optional(),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    refills: z.number().min(0).optional(),
    instructions: z.string().optional(),
    indications: z.string().optional(),
    warnings: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    isActive: z.boolean().optional(),
  })).min(1, "At least one medication is required"),
  diagnosis: z.array(z.object({
    condition: z.string().optional(),
    icdCode: z.string().optional(),
  })).optional(),
  doctorNotes: z.string().max(1000, "Doctor notes must be less than 1000 characters").optional(),
  status: z.enum(["active", "completed", "cancelled", "on-hold"]).optional(),
  pharmacy: z.object({
    name: z.string().optional(),
    address: z.string().optional(),
    phone: z.string().optional(),
    fax: z.string().optional(),
  }).optional(),
});

export const updatePrescriptionSchema = createPrescriptionSchema.partial();
