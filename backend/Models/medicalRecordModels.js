import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Doctor",
    required: true,
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Appointment",
  },
  
  // Visit Information
  visitDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  visitType: {
    type: String,
    enum: ["in-person", "video", "phone"],
    default: "in-person",
  },
  
  // Chief Complaint
  chiefComplaint: {
    type: String,
    required: true,
    maxlength: 500,
  },
  
  // Symptoms
  symptoms: [
    {
      symptom: {
        type: String,
        required: true,
      },
      severity: {
        type: String,
        enum: ["mild", "moderate", "severe"],
        default: "moderate",
      },
      duration: String,
      onset: Date,
    },
  ],
  
  // Vital Signs
  vitalSigns: {
    temperature: {
      value: Number,
      unit: {
        type: String,
        enum: ["C", "F"],
        default: "C",
      },
    },
    bloodPressure: {
      systolic: Number,
      diastolic: Number,
    },
    heartRate: {
      value: Number,
      unit: {
        type: String,
        enum: ["bpm"],
        default: "bpm",
      },
    },
    respiratoryRate: {
      value: Number,
      unit: {
        type: String,
        enum: ["breaths/min"],
        default: "breaths/min",
      },
    },
    oxygenSaturation: {
      value: Number,
      unit: {
        type: String,
        enum: ["%"],
        default: "%",
      },
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ["kg", "lbs"],
        default: "kg",
      },
    },
    height: {
      value: Number,
      unit: {
        type: String,
        enum: ["cm", "ft"],
        default: "cm",
      },
    },
    bmi: Number,
  },
  
  // Physical Examination
  physicalExamination: {
    general: String,
    heent: String, // Head, Eyes, Ears, Nose, Throat
    cardiovascular: String,
    respiratory: String,
    gastrointestinal: String,
    neurological: String,
    musculoskeletal: String,
    skin: String,
    psychiatric: String,
    other: String,
  },
  
  // Diagnosis
  diagnosis: [
    {
      condition: {
        type: String,
        required: true,
      },
      icdCode: String, // International Classification of Diseases code
      type: {
        type: String,
        enum: ["primary", "secondary", "admission", "discharge"],
        default: "primary",
      },
      notes: String,
    },
  ],
  
  // Treatment Plan
  treatmentPlan: {
    recommendations: [String],
    followUp: {
      required: {
        type: Boolean,
        default: false,
      },
      date: Date,
      notes: String,
    },
    referrals: [
      {
        specialist: String,
        reason: String,
        urgency: {
          type: String,
          enum: ["routine", "urgent", "emergency"],
          default: "routine",
        },
      },
    ],
    labTests: [
      {
        testName: String,
        reason: String,
        urgency: {
          type: String,
          enum: ["routine", "urgent", "stat"],
          default: "routine",
        },
        status: {
          type: String,
          enum: ["pending", "ordered", "completed", "cancelled"],
          default: "pending",
        },
      },
    ],
    imaging: [
      {
        type: String, // X-ray, MRI, CT, Ultrasound, etc.
        bodyPart: String,
        reason: String,
        urgency: {
          type: String,
          enum: ["routine", "urgent", "stat"],
          default: "routine",
        },
        status: {
          type: String,
          enum: ["pending", "scheduled", "completed", "cancelled"],
          default: "pending",
        },
      },
    ],
  },
  
  // Notes
  doctorNotes: {
    type: String,
    maxlength: 2000,
  },
  
  // Attachments
  attachments: [
    {
      fileName: String,
      fileUrl: String,
      fileType: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // Privacy & Access
  isConfidential: {
    type: Boolean,
    default: false,
  },
  accessLevel: {
    type: String,
    enum: ["standard", "restricted", "confidential"],
    default: "standard",
  },
  
  // Status
  status: {
    type: String,
    enum: ["draft", "completed", "amended"],
    default: "completed",
  },
  
  // Amendments
  amendments: [
    {
      amendedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      amendedAt: {
        type: Date,
        default: Date.now,
      },
      reason: String,
      changes: String,
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
medicalRecordSchema.index({ patient: 1, visitDate: -1 });
medicalRecordSchema.index({ doctor: 1, visitDate: -1 });
medicalRecordSchema.index({ appointment: 1 });

// Pre-save middleware to update timestamp
medicalRecordSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
export default MedicalRecord;
