import Doctor from "../Models/doctorModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class DoctorService {
  /**
   * Create doctor profile
   */
  async createDoctorProfile(userId, doctorData) {
    // Check if doctor profile already exists
    const existingDoctor = await Doctor.findOne({ user: userId });
    if (existingDoctor) {
      throw new ErrorHandler("Doctor profile already exists", 400);
    }

    // Check for duplicate license number
    if (doctorData.licenseNumber) {
      const existingLicense = await Doctor.findOne({ 
        licenseNumber: doctorData.licenseNumber 
      });
      if (existingLicense) {
        throw new ErrorHandler("License number already registered with another doctor", 400);
      }
    }

    // Verify user exists and has doctor role
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (user.role !== "doctor") {
      throw new ErrorHandler("User is not a doctor", 403);
    }

    const doctor = await Doctor.create({
      user: userId,
      ...doctorData,
    });

    return doctor;
  }

  /**
   * Get doctor by ID
   */
  async getDoctorById(doctorId) {
    const doctor = await Doctor.findById(doctorId).populate("user", "username email");
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }
    return doctor;
  }

  /**
   * Get doctor by user ID
   */
  async getDoctorByUserId(userId) {
    const doctor = await Doctor.findOne({ user: userId }).populate("user", "username email");
    if (!doctor) {
      throw new ErrorHandler("Doctor profile not found", 404);
    }
    return doctor;
  }

  /**
   * Get all doctors with filters and pagination
   */
  async getAllDoctors(filters = {}, page = 1, limit = 10) {
    const query = { status: "approved" };

    // Apply filters
    if (filters.specialization) {
      query.specialization = filters.specialization;
    }
    if (filters.city) {
      query["address.city"] = { $regex: filters.city, $options: "i" };
    }
    if (filters.minRating) {
      query.ratings = { $gte: parseFloat(filters.minRating) };
    }
    if (filters.maxFee) {
      query.consultationFee = { $lte: parseFloat(filters.maxFee) };
    }
    if (filters.isOnline !== undefined) {
      query.isOnline = filters.isOnline === "true";
    }

    // Geolocation search
    if (filters.coordinates && filters.maxDistance) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: filters.coordinates.split(",").map(Number),
          },
          $maxDistance: parseFloat(filters.maxDistance) * 1000, // Convert km to meters
        },
      };
    }

    const skip = (page - 1) * limit;
    const doctors = await Doctor.find(query)
      .populate("user", "name email phone")
      .sort({ ratings: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return {
      doctors,
      pagination: {
        currentPage: page,
        totalPages,
        totalDoctors: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update doctor profile
   */
  async updateDoctorProfile(doctorId, updateData, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    // Check if user owns this profile or is admin
    if (doctor.user.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to update this profile", 403);
      }
    }

    const updatedDoctor = await Doctor.findByIdAndUpdate(
      doctorId,
      updateData,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).populate("user", "username email");

    return updatedDoctor;
  }

  /**
   * Add payment method
   */
  async addPaymentMethod(doctorId, paymentData, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add payment method", 403);
    }

    // If this is the first payment method or marked as default, make others non-default
    if (paymentData.isDefault || doctor.paymentMethods.length === 0) {
      doctor.paymentMethods.forEach((method) => {
        method.isDefault = false;
      });
      paymentData.isDefault = true;
    }

    doctor.paymentMethods.push(paymentData);
    await doctor.save();

    return doctor;
  }

  /**
   * Update payment method
   */
  async updatePaymentMethod(doctorId, paymentMethodId, paymentData, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update payment method", 403);
    }

    const paymentMethod = doctor.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      throw new ErrorHandler("Payment method not found", 404);
    }

    // If setting as default, make others non-default
    if (paymentData.isDefault) {
      doctor.paymentMethods.forEach((method) => {
        method.isDefault = false;
      });
    }

    Object.assign(paymentMethod, paymentData);
    await doctor.save();

    return doctor;
  }

  /**
   * Delete payment method
   */
  async deletePaymentMethod(doctorId, paymentMethodId, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete payment method", 403);
    }

    const paymentMethod = doctor.paymentMethods.id(paymentMethodId);
    if (!paymentMethod) {
      throw new ErrorHandler("Payment method not found", 404);
    }

    // Don't allow deletion if it's the only payment method
    if (doctor.paymentMethods.length === 1) {
      throw new ErrorHandler("Cannot delete the only payment method", 400);
    }

    paymentMethod.deleteOne();
    await doctor.save();

    return doctor;
  }

  /**
   * Add document
   */
  async addDocument(doctorId, documentData, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add document", 403);
    }

    doctor.documents.push(documentData);
    await doctor.save();

    return doctor;
  }

  /**
   * Update availability
   */
  async updateAvailability(doctorId, availability, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update availability", 403);
    }

    doctor.availability = availability;
    await doctor.save();

    return doctor;
  }

  /**
   * Update online status
   */
  async updateOnlineStatus(doctorId, isOnline, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    if (doctor.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update online status", 403);
    }

    doctor.isOnline = isOnline;
    doctor.lastOnline = isOnline ? null : new Date();
    await doctor.save();

    return doctor;
  }

  /**
   * Add review
   */
  async addReview(doctorId, reviewData, userId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    // Check if user already reviewed
    const alreadyReviewed = doctor.reviews.find(
      (review) => review.user.toString() === userId.toString()
    );

    if (alreadyReviewed) {
      throw new ErrorHandler("You have already reviewed this doctor", 400);
    }

    const review = {
      user: userId,
      rating: reviewData.rating,
      comment: reviewData.comment,
      verifiedVisit: reviewData.verifiedVisit || false,
    };

    doctor.reviews.push(review);
    await doctor.calculateRatings();

    return doctor;
  }

  /**
   * Verify doctor (Admin)
   */
  async verifyDoctor(doctorId, verificationData, adminId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    doctor.status = verificationData.status;
    doctor.approvedBy = adminId;
    doctor.approvedAt = new Date();

    if (verificationData.status === "rejected") {
      doctor.rejectionReason = verificationData.reason;
    } else {
      doctor.rejectionReason = undefined;
    }

    await doctor.save();
    return doctor;
  }

  /**
   * Get pending verifications (Admin)
   */
  async getPendingVerifications(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const doctors = await Doctor.find({ status: "pending" })
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments({ status: "pending" });
    const totalPages = Math.ceil(total / limit);

    return {
      doctors,
      pagination: {
        currentPage: page,
        totalPages,
        totalDoctors: total,
      },
    };
  }

  /**
   * Delete doctor (Admin)
   */
  async deleteDoctor(doctorId) {
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    await doctor.deleteOne();
    return doctor;
  }
}

export default new DoctorService();
