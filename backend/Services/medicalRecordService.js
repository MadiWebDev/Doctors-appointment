import MedicalRecord from "../Models/medicalRecordModels.js";
import Patient from "../Models/patientModels.js";
import Doctor from "../Models/doctorModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class MedicalRecordService {
  /**
   * Create medical record
   */
  async createMedicalRecord(recordData, doctorId) {
    // Verify doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new ErrorHandler("Doctor not found", 404);
    }

    // Verify patient exists
    const patient = await Patient.findById(recordData.patient);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    const record = await MedicalRecord.create({
      doctor: doctorId,
      ...recordData,
    });

    return record;
  }

  /**
   * Get medical record by ID
   */
  async getMedicalRecordById(recordId) {
    const record = await MedicalRecord.findById(recordId)
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment");
    
    if (!record) {
      throw new ErrorHandler("Medical record not found", 404);
    }
    return record;
  }

  /**
   * Get patient's medical records
   */
  async getPatientMedicalRecords(patientId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const records = await MedicalRecord.find({ patient: patientId })
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment")
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments({ patient: patientId });
    const totalPages = Math.ceil(total / limit);

    return {
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Get doctor's medical records
   */
  async getDoctorMedicalRecords(doctorId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const records = await MedicalRecord.find({ doctor: doctorId })
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("appointment")
      .sort({ visitDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await MedicalRecord.countDocuments({ doctor: doctorId });
    const totalPages = Math.ceil(total / limit);

    return {
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords: total,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update medical record
   */
  async updateMedicalRecord(recordId, updateData, userId) {
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      throw new ErrorHandler("Medical record not found", 404);
    }

    // Check if user is authorized (doctor who created it or admin)
    if (record.doctor.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to update this record", 403);
      }
    }

    // Add amendment if status is being changed to amended
    if (updateData.status === "amended" && record.status !== "amended") {
      record.amendments.push({
        amendedBy: userId,
        reason: updateData.amendmentReason || "Record updated",
        changes: "Record amended",
      });
    }

    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      recordId,
      updateData,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization")
      .populate("appointment");

    return updatedRecord;
  }

  /**
   * Delete medical record
   */
  async deleteMedicalRecord(recordId, userId) {
    const record = await MedicalRecord.findById(recordId);
    if (!record) {
      throw new ErrorHandler("Medical record not found", 404);
    }

    // Check if user is authorized (doctor who created it or admin)
    if (record.doctor.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to delete this record", 403);
      }
    }

    await record.deleteOne();
    return record;
  }

  /**
   * Get medical records by appointment
   */
  async getMedicalRecordsByAppointment(appointmentId) {
    const records = await MedicalRecord.find({ appointment: appointmentId })
      .populate("patient", "firstName lastName dateOfBirth bloodGroup")
      .populate("doctor", "firstName lastName specialization");

    return records;
  }

  /**
   * Search medical records
   */
  async searchMedicalRecords(searchTerm, userId, userRole) {
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

    // Search in diagnosis, chief complaint, and doctor notes
    query.$or = [
      { "diagnosis.condition": { $regex: searchTerm, $options: "i" } },
      { chiefComplaint: { $regex: searchTerm, $options: "i" } },
      { doctorNotes: { $regex: searchTerm, $options: "i" } },
    ];

    const records = await MedicalRecord.find(query)
      .populate("patient", "firstName lastName dateOfBirth")
      .populate("doctor", "firstName lastName specialization")
      .sort({ visitDate: -1 })
      .limit(50);

    return records;
  }
}

export default new MedicalRecordService();
