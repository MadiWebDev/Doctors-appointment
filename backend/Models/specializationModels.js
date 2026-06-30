import mongoose from "mongoose";

const specializationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide specialization name"],
    unique: true,
    trim: true,
    index: true,
  },
  
  description: {
    type: String,
    maxlength: 500,
  },
  
  // Icon or image for the specialization
  icon: {
    type: String,
  },
  
  // Whether this specialization is active
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  },
  
  // Order for display purposes
  displayOrder: {
    type: Number,
    default: 0,
  },
  
  // Statistics
  totalDoctors: {
    type: Number,
    default: 0,
  },
  
  // Created by admin
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  
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

// Index for efficient queries
specializationSchema.index({ name: 1, isActive: 1 });

// Pre-save middleware to update timestamp
specializationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to get all active specializations
specializationSchema.statics.getActiveSpecializations = async function () {
  return this.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
};

// Static method to increment doctor count
specializationSchema.statics.incrementDoctorCount = async function (specializationId) {
  return this.findByIdAndUpdate(
    specializationId,
    { $inc: { totalDoctors: 1 } },
    { new: true }
  );
};

// Static method to decrement doctor count
specializationSchema.statics.decrementDoctorCount = async function (specializationId) {
  return this.findByIdAndUpdate(
    specializationId,
    { $inc: { totalDoctors: -1 } },
    { new: true }
  );
};

const Specialization = mongoose.model("Specialization", specializationSchema);
export default Specialization;
