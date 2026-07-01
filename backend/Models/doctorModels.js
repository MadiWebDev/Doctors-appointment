import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  
  // License Information
  licenseNumber: {
    type: String,
    required: [true, "Please enter your license number"],
    unique: true,
    trim: true,
  },
  
  licenseDocument: {
    type: String,
    default: "pending_verification",
  },
  
  // Profile Information
  firstName: {
    type: String,
    required: [true, "Please enter your first name"],
    trim: true,
  },
  lastName: {
    type: String,
    required: false,
    default: "",
    trim: true,
  },
  specialization: {
    type: String,
    required: [true, "Please enter your specialization"],
    enum: [
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
    ],
  },
  qualifications: {
    type: [String],
    required: [true, "Please enter your qualifications"],
  },
  experience: {
    type: Number,
    required: [true, "Please enter your experience in years"],
    min: 0,
  },
  hospitalAffiliation: {
    type: String,
    required: [true, "Please enter your hospital affiliation"],
  },
  bio: {
    type: String,
    maxlength: 500,
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
  
location: {
  type: {
    type: String,
    enum: ["Point"],
    default: "Point",
  },
  coordinates: {
    type: [Number],
    default: [0, 0], // Default coordinates
    // Or remove required: true
  },
},
  
  // Consultation Fee
  consultationFee: {
    type: Number,
    required: [true, "Please enter consultation fee"],
    min: 0,
  },
  
  // Availability & Slots
  availability: [
    {
      day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true,
      },
      startTime: {
        type: String,
        required: true,
      },
      endTime: {
        type: String,
        required: true,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
    },
  ],
  
  // Payment Methods
  paymentMethods: [
    {
      bankName: {
        type: String,
        required: true,
      },
      accountName: {
        type: String,
        required: true,
      },
      accountNumber: {
        type: String,
        required: true,
      },
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  
  //Documents & Certificates
  documents: [
    {
      documentType: {
        type: String,
        enum: ["Medical License", "Degree Certificate", "ID Proof", "Other"],
        // required: true,
      },
      documentUrl: {
        type: String,
        // required: true,
      },
      documentName: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
      verified: {
        type: Boolean,
        default: false,
      },
    },
  ],
  
  // Profile Image
  profileImage: {
    public_id: String,
    url: String,
  },
  
  // Verification Status
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "suspended"],
    default: "pending",
    index: true,
  }, 
  rejectionReason: String,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  approvedAt: Date,

  // Suspension
  suspensionReason: String,
  suspendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  suspendedAt: Date,
  
  // Reviews & Ratings
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  numOfReviews: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
      },
      comment: String,
      verifiedVisit: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  
  // Online Status
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastOnline: {
    type: Date,
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
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for geolocation queries
doctorSchema.index({ location: "2dsphere" });

// Index for search
doctorSchema.index({ specialization: 1, city: 1, ratings: -1 });

// Update ratings when a new review is added
doctorSchema.methods.calculateRatings = function () {
  let totalRating = 0;
  this.reviews.forEach((review) => {
    totalRating += review.rating;
  });
  this.ratings = totalRating / this.reviews.length;
  this.numOfReviews = this.reviews.length;
  this.save();
};

const Doctor = mongoose.model("Doctor", doctorSchema);
export default Doctor;
