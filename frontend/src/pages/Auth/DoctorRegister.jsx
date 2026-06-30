import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Stethoscope, ArrowLeft, Upload, Check } from 'lucide-react';
import { doctorStep1Schema, doctorStep2Schema, doctorStep3Schema } from '../../utils/validators';
import { SPECIALIZATIONS } from '../../utils/helpers';
import { useDispatch } from 'react-redux';
import { registerDoctor } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const DoctorRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register: register1,
    handleSubmit: handleSubmit1,
    formState: { errors: errors1, isSubmitting: isSubmitting1 },
  } = useForm({
    resolver: zodResolver(doctorStep1Schema),
  });

  const {
    register: register2,
    handleSubmit: handleSubmit2,
    formState: { errors: errors2, isSubmitting: isSubmitting2 },
  } = useForm({
    resolver: zodResolver(doctorStep2Schema),
  });

  const {
    register: register3,
    handleSubmit: handleSubmit3,
    formState: { errors: errors3, isSubmitting: isSubmitting3 },
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(doctorStep3Schema),
  });

  const licenseDocument = watch('licenseDocument');

  // Update file preview when licenseDocument changes
  React.useEffect(() => {
    if (licenseDocument && licenseDocument[0]) {
      const file = licenseDocument[0];
      if (file.type.startsWith('image/')) {
        setFilePreview(URL.createObjectURL(file));
      } else {
        setFilePreview(null);
      }
    } else {
      setFilePreview(null);
    }
  }, [licenseDocument]);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('latitude', position.coords.latitude.toString());
        setValue('longitude', position.coords.longitude.toString());
        toast.success('Location detected successfully');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationError('Unable to get location. Please enter manually.');
      }
    );
  };

  const onStep1Submit = (data) => {
    setFormData({ ...formData, ...data });
    setStep(2);
  };

  const onStep2Submit = (data) => {
    setFormData({ ...formData, ...data });
    setStep(3);
  };

  const onStep3Submit = async (data) => {
    const finalFormData = new FormData();

    // Step 1 data
    finalFormData.append('name', formData.name);
    finalFormData.append('email', formData.email);
    finalFormData.append('phone', formData.phone);
    finalFormData.append('password', formData.password);
    finalFormData.append('confirmPassword', formData.confirmPassword);

    // Step 2 data
    finalFormData.append('licenseNumber', formData.licenseNumber);
    finalFormData.append('specialization', formData.specialization);
    finalFormData.append('experience', formData.experience);
    finalFormData.append('hospitalAffiliation', formData.hospitalAffiliation);
    finalFormData.append('consultationFee', formData.consultationFee);
    finalFormData.append('bio', formData.bio);
    finalFormData.append('qualifications', formData.qualifications);

    // Step 3 data - documents and location
    if (data.licenseDocument && data.licenseDocument[0]) {
      finalFormData.append('licenseDocument', data.licenseDocument[0]);
    }

    // Add location data
    finalFormData.append('street', data.street || '');
    finalFormData.append('city', data.city || '');
    finalFormData.append('state', data.state || '');
    finalFormData.append('country', data.country || '');
    finalFormData.append('zipCode', data.zipCode || '');
    finalFormData.append('latitude', String(data.latitude || 0));
    finalFormData.append('longitude', String(data.longitude || 0));

    try {
      await dispatch(registerDoctor(finalFormData)).unwrap();
      toast.success('Application submitted. Await admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link to="/login" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">MediBook</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Doctor Registration</h2>
        <p className="text-slate-600 mb-8">Complete the 3-step registration process</p>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`step-dot ${s < step ? 'done' : s === step ? 'active' : 'pending'}`}>
                  {s < step ? <Check className="w-4 h-4" /> : s}
                </div>
                <p className={`text-xs mt-2 ${s === step ? 'text-primary-600 font-medium' : 'text-slate-400'}`}>
                  {s === 1 ? 'Personal' : s === 2 ? 'Professional' : 'Documents & Location'}
                </p>
              </div>
              {s < 3 && <div className={`step-line flex-1 mx-4 ${s < step ? 'done' : ''}`}></div>}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Personal Information</h3>
            <form onSubmit={handleSubmit1(onStep1Submit)} className="space-y-6">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  {...register1('name')}
                  className={`input ${errors1.name ? 'input-error' : ''}`}
                  placeholder="Dr. John Doe"
                />
                {errors1.name && <p className="error-msg">{errors1.name.message}</p>}
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  {...register1('email')}
                  className={`input ${errors1.email ? 'input-error' : ''}`}
                  placeholder="doctor@example.com"
                />
                {errors1.email && <p className="error-msg">{errors1.email.message}</p>}
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  {...register1('phone')}
                  className={`input ${errors1.phone ? 'input-error' : ''}`}
                  placeholder="+92 300 1234567"
                />
                {errors1.phone && <p className="error-msg">{errors1.phone.message}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register1('password')}
                    className={`input pr-10 ${errors1.password ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors1.password && <p className="error-msg">{errors1.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register1('confirmPassword')}
                    className={`input pr-10 ${errors1.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors1.confirmPassword && <p className="error-msg">{errors1.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting1} className="btn btn-primary w-full">
                {isSubmitting1 ? 'Processing...' : 'Next Step'}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Professional Info */}
        {step === 2 && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Professional Information</h3>
            <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-6">
              <div>
                <label className="label">License Number</label>
                <input
                  type="text"
                  {...register2('licenseNumber')}
                  className={`input ${errors2.licenseNumber ? 'input-error' : ''}`}
                  placeholder="PMC-12345"
                />
                {errors2.licenseNumber && <p className="error-msg">{errors2.licenseNumber.message}</p>}
              </div>

              <div>
                <label className="label">Specialization</label>
                <select
                  {...register2('specialization')}
                  className={`input ${errors2.specialization ? 'input-error' : ''}`}
                >
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map((spec) => (
                    <option key={spec} value={spec}>
                      {spec}
                    </option>
                  ))}
                </select>
                {errors2.specialization && <p className="error-msg">{errors2.specialization.message}</p>}
              </div>

              <div>
                <label className="label">Experience (years)</label>
                <input
                  type="number"
                  {...register2('experience', { valueAsNumber: true })}
                  className={`input ${errors2.experience ? 'input-error' : ''}`}
                  placeholder="5"
                />
                {errors2.experience && <p className="error-msg">{errors2.experience.message}</p>}
              </div>

              <div>
                <label className="label">Hospital Affiliation</label>
                <input
                  type="text"
                  {...register2('hospitalAffiliation')}
                  className={`input ${errors2.hospitalAffiliation ? 'input-error' : ''}`}
                  placeholder="City Hospital"
                />
                {errors2.hospitalAffiliation && <p className="error-msg">{errors2.hospitalAffiliation.message}</p>}
              </div>

              <div>
                <label className="label">Consultation Fee (PKR)</label>
                <input
                  type="number"
                  {...register2('consultationFee', { valueAsNumber: true })}
                  className={`input ${errors2.consultationFee ? 'input-error' : ''}`}
                  placeholder="1000"
                />
                {errors2.consultationFee && <p className="error-msg">{errors2.consultationFee.message}</p>}
              </div>

              <div>
                <label className="label">Bio</label>
                <textarea
                  {...register2('bio')}
                  className={`input ${errors2.bio ? 'input-error' : ''}`}
                  rows={4}
                  placeholder="Tell us about yourself..."
                />
                {errors2.bio && <p className="error-msg">{errors2.bio.message}</p>}
              </div>

              <div>
                <label className="label">Qualifications (comma-separated)</label>
                <input
                  type="text"
                  {...register2('qualifications')}
                  className={`input ${errors2.qualifications ? 'input-error' : ''}`}
                  placeholder="MBBS, FCPS, MRCP"
                />
                {errors2.qualifications && <p className="error-msg">{errors2.qualifications.message}</p>}
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting2}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting2 ? 'Processing...' : 'Next Step'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Documents & Location */}
        {step === 3 && (
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-slate-900 mb-6">Documents & Location</h3>
            <form onSubmit={handleSubmit3(onStep3Submit)} className="space-y-6">
              {/* License Document Upload */}
              <div>
                <label className="label">License Document (PDF or Image, max 5MB)</label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    {...register3('licenseDocument')}
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    id="license-upload"
                  />
                  <label htmlFor="license-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-slate-400 mt-2">PDF, PNG, JPG up to 5MB</p>
                  </label>
                </div>
                {errors3.licenseDocument && <p className="error-msg">{errors3.licenseDocument.message}</p>}
                
                {filePreview && (
                  <div className="mt-4">
                    <img src={filePreview} alt="Preview" className="max-w-full h-48 object-cover rounded-lg" />
                  </div>
                )}
                
                {licenseDocument && licenseDocument[0] && !filePreview && (
                  <div className="mt-4 p-3 bg-slate-100 rounded-lg">
                    <p className="text-sm text-slate-600">{licenseDocument[0].name}</p>
                  </div>
                )}
              </div>

              {/* Address Information */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <h4 className="font-semibold text-slate-900 mb-4">Practice Address</h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Street Address</label>
                    <input
                      type="text"
                      {...register3('street')}
                      className={`input ${errors3.street ? 'input-error' : ''}`}
                      placeholder="123 Medical Center Drive"
                    />
                    {errors3.street && <p className="error-msg">{errors3.street.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">City</label>
                      <input
                        type="text"
                        {...register3('city')}
                        className={`input ${errors3.city ? 'input-error' : ''}`}
                        placeholder="New York"
                      />
                      {errors3.city && <p className="error-msg">{errors3.city.message}</p>}
                    </div>

                    <div>
                      <label className="label">State</label>
                      <input
                        type="text"
                        {...register3('state')}
                        className={`input ${errors3.state ? 'input-error' : ''}`}
                        placeholder="NY"
                      />
                      {errors3.state && <p className="error-msg">{errors3.state.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Country</label>
                      <input
                        type="text"
                        {...register3('country')}
                        className={`input ${errors3.country ? 'input-error' : ''}`}
                        placeholder="USA"
                      />
                      {errors3.country && <p className="error-msg">{errors3.country.message}</p>}
                    </div>

                    <div>
                      <label className="label">Zip Code</label>
                      <input
                        type="text"
                        {...register3('zipCode')}
                        className={`input ${errors3.zipCode ? 'input-error' : ''}`}
                        placeholder="10001"
                      />
                      {errors3.zipCode && <p className="error-msg">{errors3.zipCode.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="border-t border-slate-200 pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-semibold text-slate-900">Practice Location</h4>
                  <button
                    type="button"
                    onClick={getCurrentLocation}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    📍 Get Current Location
                  </button>
                </div>

                {locationError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                    {locationError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register3('latitude', { valueAsNumber: true })}
                      className={`input ${errors3.latitude ? 'input-error' : ''}`}
                      placeholder="40.7128"
                    />
                    {errors3.latitude && <p className="error-msg">{errors3.latitude.message}</p>}
                  </div>

                  <div>
                    <label className="label">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      {...register3('longitude', { valueAsNumber: true })}
                      className={`input ${errors3.longitude ? 'input-error' : ''}`}
                      placeholder="-74.0060"
                    />
                    {errors3.longitude && <p className="error-msg">{errors3.longitude.message}</p>}
                  </div>
                </div>

                <p className="text-xs text-slate-500 mt-2">
                  * Location coordinates are used to display your practice on the map
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn btn-secondary flex-1"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting3}
                  className="btn btn-primary flex-1"
                >
                  {isSubmitting3 ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRegister;