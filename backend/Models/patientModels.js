import mongoose from "mongoose";

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, "Please enter your last name"],
    trim: true,
  },
  dateOfBirth: {
    type: Date,
    required: [true, "Please enter your date of birth"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: [true, "Please select your gender"],
  },
  bloodGroup: {
    type: String,
    enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "unknown"],
    default: "unknown",
  },
  
  // Contact Information
  phone: {
    type: String,
    required: [true, "Please enter your phone number"],
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
  },
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  
  // Medical History
  medicalHistory: [
    {
      condition: {
        type: String,
        required: true,
      },
      diagnosedDate: Date,
      status: {
        type: String,
        enum: ["active", "resolved", "chronic"],
        default: "active",
      },
      notes: String,
      treatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
    },
  ],
  
  // Allergies
  allergies: [
    {
      allergen: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: ["food", "medication", "environmental", "other"],
        required: true,
      },
      severity: {
        type: String,
        enum: ["mild", "moderate", "severe", "life-threatening"],
        default: "moderate",
      },
      reaction: String,
      diagnosedDate: Date,
    },
  ],
  
  // Current Medications
  currentMedications: [
    {
      medicationName: {
        type: String,
        required: true,
      },
      dosage: String,
      frequency: String,
      prescribedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
      },
      startDate: Date,
      endDate: Date,
      isOngoing: {
        type: Boolean,
        default: true,
      },
      notes: String,
    },
  ],
  
  // Family Medical History
  familyHistory: [
    {
      relationship: {
        type: String,
        required: true,
      },
      condition: {
        type: String,
        required: true,
      },
      notes: String,
    },
  ],
  
  // Lifestyle Information
  lifestyle: {
    smoking: {
      status: {
        type: String,
        enum: ["never", "former", "current"],
        default: "never",
      },
      cigarettesPerDay: Number,
    },
    alcohol: {
      status: {
        type: String,
        enum: ["never", "occasional", "regular", "heavy"],
        default: "never",
      },
      drinksPerWeek: Number,
    },
    exercise: {
      frequency: {
        type: String,
        enum: ["sedentary", "light", "moderate", "active", "very-active"],
        default: "sedentary",
      },
      hoursPerWeek: Number,
    },
    diet: {
      type: String,
      enum: ["balanced", "vegetarian", "vegan", "keto", "paleo", "other"],
      default: "balanced",
    },
  },
  
  // Insurance Information
  insurance: {
    provider: String,
    policyNumber: String,
    groupNumber: String,
    expiryDate: Date,
    isPrimary: {
      type: Boolean,
      default: true,
    },
  },
  
  // Profile Image
  profileImage: {
    public_id: String,
    url: String,
  },
  
  // Statistics
  totalAppointments: {
    type: Number,
    default: 0,
  },
  completedAppointments: {
    type: Number,
    default: 0,
  },
  cancelledAppointments: {
    type: Number,
    default: 0,
  },
  noShows: {
    type: Number,
    default: 0,
  },
  
  // Preferred Doctors
  preferredDoctors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
    },
  ],
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for efficient queries
patientSchema.index({ user: 1 });
patientSchema.index({ "medicalHistory.condition": 1 });
patientSchema.index({ "allergies.allergen": 1 });

// Virtual property for age
patientSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

const Patient = mongoose.model("Patient", patientSchema);
export default Patient;
