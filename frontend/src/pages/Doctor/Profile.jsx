import React, { useEffect, useState } from 'react';
import { Save, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyDoctorProfile,
  updateDoctorProfile,
} from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const DoctorProfile = () => {
  const dispatch = useDispatch();
  const { myProfile: doctor, loading } = useSelector((state) => state.doctors);

  const [formData, setFormData] = useState({
    bio: '',
    consultationFee: '',
    hospitalAffiliation: '',
  });

  // Load doctor profile on mount
  useEffect(() => {
    dispatch(fetchMyDoctorProfile());
  }, [dispatch]);

  // Populate form once profile loaded
  useEffect(() => {
    if (doctor) {
      setFormData({
        bio: doctor.bio || '',
        consultationFee: doctor.consultationFee || '',
        hospitalAffiliation: doctor.hospitalAffiliation || '',
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor?._id) {
      toast.error('Profile not loaded');
      return;
    }
    try {
      await dispatch(
        updateDoctorProfile({
          doctorId: doctor._id,
          bio: formData.bio,
          consultationFee: Number(formData.consultationFee),
          hospitalAffiliation: formData.hospitalAffiliation,
        })
      ).unwrap();
      toast.success('Profile updated successfully');
      dispatch(fetchMyDoctorProfile()); // refresh
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update profile');
    }
  };

  if (loading && !doctor) return <Spinner />;

  const doctorName = doctor
    ? `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()
    : '';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your professional information</p>
      </div>

      <div className="max-w-2xl">
        {/* Profile Header */}
        <div className="card p-6 mb-6 flex items-center gap-6">
          <Avatar
            name={doctorName}
            src={doctor?.profileImage?.url}
            size="xl"
          />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{doctorName}</h2>
            <p className="text-slate-600">{doctor?.specialization}</p>
            <p className="text-sm text-slate-500 mt-1">
              License: {doctor?.licenseNumber || '—'}
            </p>
            <span
              className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                doctor?.status === 'approved'
                  ? 'bg-green-100 text-green-700'
                  : doctor?.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {doctor?.status
                ? doctor.status.charAt(0).toUpperCase() + doctor.status.slice(1)
                : '—'}
            </span>
          </div>
        </div>

        {/* Read-only info */}
        <div className="card p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Professional Information
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Specialization</p>
              <p className="font-medium text-slate-900">{doctor?.specialization || '—'}</p>
            </div>
            <div>
              <p className="text-slate-500">Experience</p>
              <p className="font-medium text-slate-900">
                {doctor?.experience ?? '—'} years
              </p>
            </div>
            <div>
              <p className="text-slate-500">Qualifications</p>
              <p className="font-medium text-slate-900">
                {Array.isArray(doctor?.qualifications)
                  ? doctor.qualifications.join(', ')
                  : doctor?.qualifications || '—'}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Ratings</p>
              <p className="font-medium text-slate-900">
                {doctor?.ratings ? `${doctor.ratings.toFixed(1)} / 5` : 'No ratings yet'}
                {doctor?.numOfReviews > 0 && ` (${doctor.numOfReviews} reviews)`}
              </p>
            </div>
          </div>
        </div>

        {/* Editable form */}
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          <h3 className="text-lg font-semibold text-slate-900">Edit Profile</h3>

          <div>
            <label className="label">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="input"
              rows={4}
              placeholder="Tell patients about yourself and your expertise..."
            />
          </div>

          <div>
            <label className="label">Consultation Fee (PKR)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="input"
              placeholder="1000"
              min={0}
            />
          </div>

          <div>
            <label className="label">Hospital / Clinic Affiliation</label>
            <input
              type="text"
              name="hospitalAffiliation"
              value={formData.hospitalAffiliation}
              onChange={handleChange}
              className="input"
              placeholder="City Hospital"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DoctorProfile;
