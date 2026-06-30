import Patient from "../Models/patientModels.js";
import User from "../Models/userModels.js";
import ErrorHandler from "../utilis/errorHandler.js";

export class PatientService {
  /**
   * Create patient profile
   */
  async createPatientProfile(userId, patientData) {
    // Check if patient profile already exists
    const existingPatient = await Patient.findOne({ user: userId });
    if (existingPatient) {
      throw new ErrorHandler("Patient profile already exists", 400);
    }

    // Verify user exists and has user role
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorHandler("User not found", 404);
    }

    if (user.role !== "user") {
      throw new ErrorHandler("User is not a patient", 403);
    }

    const patient = await Patient.create({
      user: userId,
      ...patientData,
    });

    return patient;
  }

  /**
   * Get patient by ID
   */
  async getPatientById(patientId) {
    const patient = await Patient.findById(patientId).populate("user", "username email");
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }
    return patient;
  }

  /**
   * Get patient by user ID
   */
  async getPatientByUserId(userId) {
    const patient = await Patient.findOne({ user: userId }).populate("user", "username email");
    if (!patient) {
      throw new ErrorHandler("Patient profile not found", 404);
    }
    return patient;
  }

  /**
   * Update patient profile
   */
  async updatePatientProfile(patientId, updateData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    // Check if user owns this profile or is admin
    if (patient.user.toString() !== userId.toString()) {
      const user = await User.findById(userId);
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new ErrorHandler("Not authorized to update this profile", 403);
      }
    }

    const updatedPatient = await Patient.findByIdAndUpdate(
      patientId,
      updateData,
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    ).populate("user", "username email");

    return updatedPatient;
  }

  /**
   * Add medical history entry
   */
  async addMedicalHistory(patientId, historyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add medical history", 403);
    }

    patient.medicalHistory.push(historyData);
    await patient.save();

    return patient;
  }

  /**
   * Update medical history entry
   */
  async updateMedicalHistory(patientId, historyId, historyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update medical history", 403);
    }

    const historyEntry = patient.medicalHistory.id(historyId);
    if (!historyEntry) {
      throw new ErrorHandler("Medical history entry not found", 404);
    }

    Object.assign(historyEntry, historyData);
    await patient.save();

    return patient;
  }

  /**
   * Delete medical history entry
   */
  async deleteMedicalHistory(patientId, historyId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete medical history", 403);
    }

    const historyEntry = patient.medicalHistory.id(historyId);
    if (!historyEntry) {
      throw new ErrorHandler("Medical history entry not found", 404);
    }

    historyEntry.deleteOne();
    await patient.save();

    return patient;
  }

  /**
   * Add allergy
   */
  async addAllergy(patientId, allergyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add allergy", 403);
    }

    patient.allergies.push(allergyData);
    await patient.save();

    return patient;
  }

  /**
   * Update allergy
   */
  async updateAllergy(patientId, allergyId, allergyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update allergy", 403);
    }

    const allergy = patient.allergies.id(allergyId);
    if (!allergy) {
      throw new ErrorHandler("Allergy not found", 404);
    }

    Object.assign(allergy, allergyData);
    await patient.save();

    return patient;
  }

  /**
   * Delete allergy
   */
  async deleteAllergy(patientId, allergyId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete allergy", 403);
    }

    const allergy = patient.allergies.id(allergyId);
    if (!allergy) {
      throw new ErrorHandler("Allergy not found", 404);
    }

    allergy.deleteOne();
    await patient.save();

    return patient;
  }

  /**
   * Add current medication
   */
  async addCurrentMedication(patientId, medicationData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add medication", 403);
    }

    patient.currentMedications.push(medicationData);
    await patient.save();

    return patient;
  }

  /**
   * Update current medication
   */
  async updateCurrentMedication(patientId, medicationId, medicationData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update medication", 403);
    }

    const medication = patient.currentMedications.id(medicationId);
    if (!medication) {
      throw new ErrorHandler("Medication not found", 404);
    }

    Object.assign(medication, medicationData);
    await patient.save();

    return patient;
  }

  /**
   * Delete current medication
   */
  async deleteCurrentMedication(patientId, medicationId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete medication", 403);
    }

    const medication = patient.currentMedications.id(medicationId);
    if (!medication) {
      throw new ErrorHandler("Medication not found", 404);
    }

    medication.deleteOne();
    await patient.save();

    return patient;
  }

  /**
   * Add family history
   */
  async addFamilyHistory(patientId, familyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add family history", 403);
    }

    patient.familyHistory.push(familyData);
    await patient.save();

    return patient;
  }

  /**
   * Update family history
   */
  async updateFamilyHistory(patientId, familyId, familyData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update family history", 403);
    }

    const familyEntry = patient.familyHistory.id(familyId);
    if (!familyEntry) {
      throw new ErrorHandler("Family history entry not found", 404);
    }

    Object.assign(familyEntry, familyData);
    await patient.save();

    return patient;
  }

  /**
   * Delete family history
   */
  async deleteFamilyHistory(patientId, familyId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to delete family history", 403);
    }

    const familyEntry = patient.familyHistory.id(familyId);
    if (!familyEntry) {
      throw new ErrorHandler("Family history entry not found", 404);
    }

    familyEntry.deleteOne();
    await patient.save();

    return patient;
  }

  /**
   * Update lifestyle information
   */
  async updateLifestyle(patientId, lifestyleData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update lifestyle", 403);
    }

    patient.lifestyle = { ...patient.lifestyle, ...lifestyleData };
    await patient.save();

    return patient;
  }

  /**
   * Update insurance information
   */
  async updateInsurance(patientId, insuranceData, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to update insurance", 403);
    }

    patient.insurance = { ...patient.insurance, ...insuranceData };
    await patient.save();

    return patient;
  }

  /**
   * Add preferred doctor
   */
  async addPreferredDoctor(patientId, doctorId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to add preferred doctor", 403);
    }

    // Check if doctor is already in preferred list
    if (patient.preferredDoctors.includes(doctorId)) {
      throw new ErrorHandler("Doctor already in preferred list", 400);
    }

    patient.preferredDoctors.push(doctorId);
    await patient.save();

    return patient;
  }

  /**
   * Remove preferred doctor
   */
  async removePreferredDoctor(patientId, doctorId, userId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    if (patient.user.toString() !== userId.toString()) {
      throw new ErrorHandler("Not authorized to remove preferred doctor", 403);
    }

    patient.preferredDoctors = patient.preferredDoctors.filter(
      (id) => id.toString() !== doctorId.toString()
    );
    await patient.save();

    return patient;
  }

  /**
   * Delete patient (Admin)
   */
  async deletePatient(patientId) {
    const patient = await Patient.findById(patientId);
    if (!patient) {
      throw new ErrorHandler("Patient not found", 404);
    }

    await patient.deleteOne();
    return patient;
  }
}

export default new PatientService();
