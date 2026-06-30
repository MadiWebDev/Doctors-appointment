import React, { useEffect, useState } from 'react';
import { Upload, Save } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorById, updateDoctorProfile } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import { formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Profile = () => {
  const dispatch = useDispatch();
  const { selected: doctor, loading } = useSelector((state) => state.doctors);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    bio: '',
    consultationFee: 0,
    hospitalAffiliation: '',
    qualifications: '',
  });
  const [avatarPreview, setAvatarPreview] = useState(null);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchDoctorById(user._id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (doctor) {
      setFormData({
        bio: doctor.bio || '',
        consultationFee: doctor.consultationFee || 0,
        hospitalAffiliation: doctor.hospitalAffiliation || '',
        qualifications: doctor.qualifications || '',
      });
    }
  }, [doctor]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (avatarPreview) {
        const fileInput = document.getElementById('avatar-upload');
        if (fileInput.files[0]) {
          data.append('avatar', fileInput.files[0]);
        }
      }
      await dispatch(updateDoctorProfile(data)).unwrap();
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update profile');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your profile information</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar name={doctor?.name} src={avatarPreview || doctor?.avatar} size="xl" />
            <div>
              <label className="label">Profile Photo</label>
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  id="avatar-upload"
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
                <label
                  htmlFor="avatar-upload"
                  className="btn btn-secondary cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Photo
                </label>
                <p className="text-sm text-slate-500">JPG, PNG up to 5MB</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="label">Bio</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              className="input"
              rows={4}
              placeholder="Tell patients about yourself..."
            />
          </div>

          {/* Consultation Fee */}
          <div>
            <label className="label">Consultation Fee (PKR)</label>
            <input
              type="number"
              name="consultationFee"
              value={formData.consultationFee}
              onChange={handleChange}
              className="input"
              placeholder="1000"
            />
          </div>

          {/* Hospital Affiliation */}
          <div>
            <label className="label">Hospital Affiliation</label>
            <input
              type="text"
              name="hospitalAffiliation"
              value={formData.hospitalAffiliation}
              onChange={handleChange}
              className="input"
              placeholder="City Hospital"
            />
          </div>

          {/* Qualifications */}
          <div>
            <label className="label">Qualifications (comma-separated)</label>
            <input
              type="text"
              name="qualifications"
              value={formData.qualifications}
              onChange={handleChange}
              className="input"
              placeholder="MBBS, FCPS, MRCP"
            />
          </div>

          {/* Read-only fields */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div>
              <label className="label">License Number</label>
              <input
                type="text"
                value={doctor?.licenseNumber || ''}
                disabled
                className="input bg-slate-100"
              />
            </div>
            <div>
              <label className="label">Specialization</label>
              <input
                type="text"
                value={doctor?.specialization || ''}
                disabled
                className="input bg-slate-100"
              />
            </div>
            <div>
              <label className="label">Experience (years)</label>
              <input
                type="text"
                value={doctor?.experience || 0}
                disabled
                className="input bg-slate-100"
              />
            </div>
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

export default Profile;
