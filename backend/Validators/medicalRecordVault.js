import { z } from "zod";

export const createMedicalRecordSchema = z.object({
  patient: z.string().min(1, "Patient ID is required"),
  appointment: z.string().optional(),
  visitDate: z.string().optional(),
  visitType: z.enum(["in-person", "video", "phone"]).optional(),
  chiefComplaint: z.string().min(1, "Chief complaint is required").max(500, "Chief complaint must be less than 500 characters"),
  symptoms: z.array(z.object({
    symptom: z.string().min(1, "Symptom is required"),
    severity: z.enum(["mild", "moderate", "severe"]).optional(),
    duration: z.string().optional(),
    onset: z.string().optional(),
  })).optional(),
  vitalSigns: z.object({
    temperature: z.object({
      value: z.number().optional(),
      unit: z.enum(["C", "F"]).optional(),
    }).optional(),
    bloodPressure: z.object({
      systolic: z.number().optional(),
      diastolic: z.number().optional(),
    }).optional(),
    heartRate: z.object({
      value: z.number().optional(),
      unit: z.enum(["bpm"]).optional(),
    }).optional(),
    respiratoryRate: z.object({
      value: z.number().optional(),
      unit: z.enum(["breaths/min"]).optional(),
    }).optional(),
    oxygenSaturation: z.object({
      value: z.number().optional(),
      unit: z.enum(["%"]).optional(),
    }).optional(),
    weight: z.object({
      value: z.number().optional(),
      unit: z.enum(["kg", "lbs"]).optional(),
    }).optional(),
    height: z.object({
      value: z.number().optional(),
      unit: z.enum(["cm", "ft"]).optional(),
    }).optional(),
    bmi: z.number().optional(),
  }).optional(),
  physicalExamination: z.object({
    general: z.string().optional(),
    heent: z.string().optional(),
    cardiovascular: z.string().optional(),
    respiratory: z.string().optional(),
    gastrointestinal: z.string().optional(),
    neurological: z.string().optional(),
    musculoskeletal: z.string().optional(),
    skin: z.string().optional(),
    psychiatric: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
  diagnosis: z.array(z.object({
    condition: z.string().min(1, "Condition is required"),
    icdCode: z.string().optional(),
    type: z.enum(["primary", "secondary", "admission", "discharge"]).optional(),
    notes: z.string().optional(),
  })).optional(),
  treatmentPlan: z.object({
    recommendations: z.array(z.string()).optional(),
    followUp: z.object({
      required: z.boolean().optional(),
      date: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    referrals: z.array(z.object({
      specialist: z.string().optional(),
      reason: z.string().optional(),
      urgency: z.enum(["routine", "urgent", "emergency"]).optional(),
    })).optional(),
    labTests: z.array(z.object({
      testName: z.string().optional(),
      reason: z.string().optional(),
      urgency: z.enum(["routine", "urgent", "stat"]).optional(),
      status: z.enum(["pending", "ordered", "completed", "cancelled"]).optional(),
    })).optional(),
    imaging: z.array(z.object({
      type: z.string().optional(),
      bodyPart: z.string().optional(),
      reason: z.string().optional(),
      urgency: z.enum(["routine", "urgent", "stat"]).optional(),
      status: z.enum(["pending", "scheduled", "completed", "cancelled"]).optional(),
    })).optional(),
  }).optional(),
  doctorNotes: z.string().max(2000, "Doctor notes must be less than 2000 characters").optional(),
  attachments: z.array(z.object({
    fileName: z.string().optional(),
    fileUrl: z.string().optional(),
    fileType: z.string().optional(),
  })).optional(),
  isConfidential: z.boolean().optional(),
  accessLevel: z.enum(["standard", "restricted", "confidential"]).optional(),
  status: z.enum(["draft", "completed", "amended"]).optional(),
});

export const updateMedicalRecordSchema = createMedicalRecordSchema.partial();
