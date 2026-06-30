import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema({
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
  medicalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MedicalRecord",
  },
  
  // Prescription Details
  prescriptionDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  prescriptionNumber: {
    type: String,
    unique: true,
    required: true,
  },
  
  // Medications
  medications: [
    {
      medicationName: {
        type: String,
        required: true,
      },
      genericName: String,
      dosage: {
        value: Number,
        unit: {
          type: String,
          enum: ["mg", "g", "ml", "mcg", "IU", "units"],
          required: true,
        },
      },
      form: {
        type: String,
        enum: ["tablet", "capsule", "liquid", "injection", "cream", "ointment", "inhaler", "patch", "drops", "other"],
        required: true,
      },
      route: {
        type: String,
        enum: ["oral", "intravenous", "intramuscular", "subcutaneous", "topical", "inhalation", "rectal", "other"],
        default: "oral",
      },
      frequency: {
        type: String,
        required: true,
      },
      duration: {
        value: Number,
        unit: {
          type: String,
          enum: ["days", "weeks", "months"],
          default: "days",
        },
      },
      quantity: {
        type: Number,
        required: true,
      },
      refills: {
        type: Number,
        default: 0,
      },
      instructions: String,
      indications: String,
      warnings: String,
      startDate: {
        type: Date,
        default: Date.now,
      },
      endDate: Date,
      isActive: {
        type: Boolean,
        default: true,
      },
    },
  ],
  
  // Diagnosis
  diagnosis: [
    {
      condition: String,
      icdCode: String,
    },
  ],
  
  // Notes
  doctorNotes: {
    type: String,
    maxlength: 1000,
  },
  
  // Status
  status: {
    type: String,
    enum: ["active", "completed", "cancelled", "on-hold"],
    default: "active",
  },
  
  // Pharmacy Information
  pharmacy: {
    name: String,
    address: String,
    phone: String,
    fax: String,
  },
  
  // Digital Signature
  signedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  signedAt: {
    type: Date,
    default: Date.now,
  },
  
  // Verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  verifiedAt: Date,
  
  // Dispensing Information
  dispensed: {
    type: Boolean,
    default: false,
  },
  dispensedAt: Date,
  dispensedBy: String,
  
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
prescriptionSchema.index({ patient: 1, prescriptionDate: -1 });
prescriptionSchema.index({ doctor: 1, prescriptionDate: -1 });
prescriptionSchema.index({ prescriptionNumber: 1 });
prescriptionSchema.index({ appointment: 1 });

// Pre-save middleware to update timestamp and generate prescription number
prescriptionSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  
  // Generate prescription number if not provided
  if (!this.prescriptionNumber) {
    const count = await this.constructor.countDocuments();
    this.prescriptionNumber = `RX${Date.now()}${String(count + 1).padStart(4, '0')}`;
  }
  
  next();
});

const Prescription = mongoose.model("Prescription", prescriptionSchema);
export default Prescription;
