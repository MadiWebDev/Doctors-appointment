import Prescription from "../Models/prescriptionModels.js";
import Patient from "../Models/patientModels.js";
import Doctor from "../Models/doctorModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class PrescriptionService {
  /**
   * Create prescription
   */
  async createPrescription(prescriptionData, doctorId) {
    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    // Verify patient exists
    const patient = await Patient.findById(prescriptionData.patient);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    const prescription = await Prescription.create({
      doctor: doctorId,
      signedBy: doctorId,
      ...prescriptionData,
    });

    return prescription;
  }

  /**
   * Get prescription by ID
   */
  async getPrescriptionById(prescriptionId) {
    const prescription = await Prescription.findById(prescriptionId)
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment")
      .populate("medicalRecord")
      .populate("signedBy", "username email");
    
    if (!prescription) {
      throw new ErrorHandler("Prescription not found", 404);
    }
    return prescription;
  }

  /**
   * Get patient's prescriptions
   */
  async getPatientPrescriptions(patientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const prescriptions = await Prescription.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment")
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments({ patient: patientId });
    const totalPages = Math.ceil(total / limit);

    return {
      prescriptions,
      pagination: {
        currentPage: page,
        totalPages,
        totalPrescriptions: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get doctor's prescriptions
   */
  async getDoctorPrescriptions(doctorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const prescriptions = await Prescription.find({ doctor: doctorId })
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("appointment")
      .sort({ prescriptionDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prescription.countDocuments({ doctor: doctorId });
    const totalPages = Math.ceil(total / limit);

    return {
      prescriptions,
      pagination: {
        currentPage: page,
        totalPages,
        totalPrescriptions: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update prescription
   */
  async updatePrescription(prescriptionId, updateData, userId) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ErrorHandler("Prescription not found", 404);
    }

    // Check if user is authorized (doctor who created it or admin)
    if (prescription.doctor.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to update this prescription", 403);
      }
    }

    const updatedPrescription = await Prescription.findByIdAndUpdate(
      prescriptionId,
      updateData,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment");

    return updatedPrescription;
  }

  /**
   * Delete prescription
   */
  async deletePrescription(prescriptionId, userId) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ErrorHandler("Prescription not found", 404);
    }

    // Check if user is authorized (doctor who created it or admin)
    if (prescription.doctor.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to delete this prescription", 403);
      }
    }

    await prescription.deleteOne();
    return prescription;
  }

  /**
   * Verify prescription (Admin/Pharmacy)
   */
  async verifyPrescription(prescriptionId, userId) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ErrorHandler("Prescription not found", 404);
    }

    prescription.isVerified = true;
    prescription.verifiedBy = userId;
    prescription.verifiedAt = new Date();
    await prescription.save();

    return prescription;
  }

  /**
   * Mark prescription as dispensed
   */
  async markAsDispensed(prescriptionId, dispensedBy) {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) {
      throw new ErrorHandler("Prescription not found", 404);
    }

    prescription.dispensed = true;
    prescription.dispensedAt = new Date();
    prescription.dispensedBy = dispensedBy;
    await prescription.save();

    return prescription;
  }

  /**
   * Get prescriptions by appointment
   */
  async getPrescriptionsByAppointment(appointmentId) {
    const prescriptions = await Prescription.find({ appointment: appointmentId })
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization");

    return prescriptions;
  }

  /**
   * Get active prescriptions for a patient
   */
  async getActivePrescriptions(patientId) {
    const prescriptions = await Prescription.find({
      patient: patientId,
      status: "active",
    })
      .populate("doctor", "firstName lastName specialization")
      .sort({ prescriptionDate: -1 });

    return prescriptions;
  }

  /**
   * Search prescriptions
   */
  async searchPrescriptions(searchTerm, userId, userRole) {
    let query = {};

    if (userRole === "doctor") {
      query.doctor = userId;
    } else if (userRole === "user") {
      // Find patient profile for this user
      const patient = await Patient.findOne({ user: userId });
      if (!patient) {
        throw new ErrorHandler("Patient profile not found", 404);
      }
      query.patient = patient._id;
    }

    // Search in medications and diagnosis
    query.$or = [
      { "medications.medicationName": { $regex: searchTerm, $options: "i" } },
      { "diagnosis.condition": { $regex: searchTerm, $options: "i" } },
      { prescriptionNumber: { $regex: searchTerm, $options: "i" } },
    ];

    const prescriptions = await Prescription.find(query)
      .populate("patient", "firstName lastName dateOfBirth")
      .populate("doctor", "firstName lastName specialization")
      .sort({ prescriptionDate: -1 })
      .limit(50);

    return prescriptions;
  }
}

export default new PrescriptionService();
