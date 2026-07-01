import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, ArrowLeft, Check, Stethoscope,
  User, Mail, Phone, Lock, FileText, Building2, DollarSign,
  MapPin, Loader2, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { doctorStep1Schema, doctorStep2Schema, doctorStep3Schema } from '../../utils/validators';
import { SPECIALIZATIONS } from '../../utils/helpers';
import { useDispatch } from 'react-redux';
import { registerDoctor } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { ThemeToggleCompact } from '../../Components/shared/ThemeToggle';

/* ─── Password strength ─────────────────────────────────────────────────── */
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[@$!%*?&]/.test(pw)) s++;
  const map = [
    { label: '', color: '' },
    { label: 'Very weak',   color: 'bg-red-500' },
    { label: 'Weak',        color: 'bg-orange-500' },
    { label: 'Fair',        color: 'bg-yellow-500' },
    { label: 'Strong',      color: 'bg-lime-500' },
    { label: 'Very strong', color: 'bg-green-500' },
  ];
  return { score: s, ...map[s] };
};

/* ─── Step bar ──────────────────────────────────────────────────────────── */
const STEPS = [
  { label: 'Personal',     desc: 'Account details' },
  { label: 'Professional', desc: 'Medical info' },
  { label: 'Location',     desc: 'Practice address' },
];

const StepBar = ({ current }) => (
  <div className="flex items-center mb-8 select-none">
    {STEPS.map((s, i) => {
      const n = i + 1;
      const done   = n < current;
      const active = n === current;
      return (
        <React.Fragment key={n}>
          <div className="flex flex-col items-center min-w-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
              ${done ? 'bg-green-500 text-white' : active ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100' : 'bg-slate-100 text-slate-400'}`}>
              {done ? <Check className="w-4 h-4" /> : n}
            </div>
            <p className={`text-xs mt-1.5 font-medium hidden sm:block ${active ? 'text-primary-600' : done ? 'text-green-600' : 'text-slate-400'}`}>{s.label}</p>
            <p className={`text-[10px] hidden sm:block ${active ? 'text-primary-400' : 'text-slate-300'}`}>{s.desc}</p>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-3 mt-[-18px] sm:mt-[-26px] transition-all duration-500 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ─── Main component ────────────────────────────────────────────────────── */
const DoctorRegister = () => {
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({});
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationError, setLocationError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const form1 = useForm({ resolver: zodResolver(doctorStep1Schema) });
  const form2 = useForm({ resolver: zodResolver(doctorStep2Schema) });
  const form3 = useForm({ resolver: zodResolver(doctorStep3Schema) });

  const passwordValue = form1.watch('password', '');
  const bioValue      = form2.watch('bio', '');
  const strength      = getPasswordStrength(passwordValue);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported by your browser');
      setLocationStatus('error');
      return;
    }
    setLocationStatus('loading');
    setLocationError('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        form3.setValue('latitude',  pos.coords.latitude,  { shouldValidate: true });
        form3.setValue('longitude', pos.coords.longitude, { shouldValidate: true });
        setLocationStatus('success');
        toast.success('Location detected');
      },
      () => {
        setLocationStatus('error');
        setLocationError('Unable to get location. Enter coordinates manually.');
      }
    );
  };

  const onStep1Submit = (data) => { setFormData((p) => ({ ...p, ...data })); setStep(2); };
  const onStep2Submit = (data) => { setFormData((p) => ({ ...p, ...data })); setStep(3); };

  const onStep3Submit = async (data) => {
    const payload = {
      // step 1
      name:            formData.name,
      email:           formData.email,
      phone:           formData.phone,
      password:        formData.password,
      confirmPassword: formData.confirmPassword,
      // step 2
      licenseNumber:      formData.licenseNumber,
      specialization:     formData.specialization,
      experience:         formData.experience,
      hospitalAffiliation: formData.hospitalAffiliation,
      consultationFee:    formData.consultationFee,
      bio:                formData.bio,
      qualifications:     formData.qualifications,
      // step 3
      street:    data.street    || '',
      city:      data.city      || '',
      state:     data.state     || '',
      country:   data.country   || '',
      zipCode:   data.zipCode   || '',
      latitude:  data.latitude  ?? 0,
      longitude: data.longitude ?? 0,
    };

    try {
      await dispatch(registerDoctor(payload)).unwrap();
      toast.success('Application submitted! Awaiting admin approval.');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  /* shared password eye toggle */
  const EyeBtn = ({ show, toggle }) => (
    <button type="button" onClick={toggle}
      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900 dark:text-white">MediBook</span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">Doctor Registration</span>
          <div className="ml-auto">
            <ThemeToggleCompact />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to login
        </Link>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Doctor Registration</h2>
          <p className="text-slate-500 text-sm mt-1">Complete 3 steps to submit your application for admin review.</p>
        </div>

        <StepBar current={step} />

        {/* ── STEP 1: Personal ── */}
        {step === 1 && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Personal Information</h3>
                <p className="text-xs text-slate-500">Your account credentials</p>
              </div>
            </div>

            <form onSubmit={form1.handleSubmit(onStep1Submit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" {...form1.register('name')}
                      className={`input pl-9 ${form1.formState.errors.name ? 'input-error' : ''}`}
                      placeholder="Dr. John Doe" autoComplete="name" />
                  </div>
                  {form1.formState.errors.name && <p className="error-msg">{form1.formState.errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" {...form1.register('email')}
                      className={`input pl-9 ${form1.formState.errors.email ? 'input-error' : ''}`}
                      placeholder="doctor@example.com" autoComplete="email" />
                  </div>
                  {form1.formState.errors.email && <p className="error-msg">{form1.formState.errors.email.message}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="tel" {...form1.register('phone')}
                      className={`input pl-9 ${form1.formState.errors.phone ? 'input-error' : ''}`}
                      placeholder="+92 300 1234567" autoComplete="tel" />
                  </div>
                  {form1.formState.errors.phone && <p className="error-msg">{form1.formState.errors.phone.message}</p>}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} {...form1.register('password')}
                    className={`input pl-9 pr-10 ${form1.formState.errors.password ? 'input-error' : ''}`}
                    placeholder="••••••••" autoComplete="new-password" />
                  <EyeBtn show={showPassword} toggle={() => setShowPassword(!showPassword)} />
                </div>
                {passwordValue && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength.score ? strength.color : 'bg-slate-200'}`} />
                      ))}
                    </div>
                    {strength.label && (
                      <p className={`text-xs font-medium ${strength.score <= 2 ? 'text-red-500' : strength.score === 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {strength.label}
                      </p>
                    )}
                  </div>
                )}
                {form1.formState.errors.password && <p className="error-msg">{form1.formState.errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="label">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showConfirmPassword ? 'text' : 'password'} {...form1.register('confirmPassword')}
                    className={`input pl-9 pr-10 ${form1.formState.errors.confirmPassword ? 'input-error' : ''}`}
                    placeholder="••••••••" autoComplete="new-password" />
                  <EyeBtn show={showConfirmPassword} toggle={() => setShowConfirmPassword(!showConfirmPassword)} />
                </div>
                {form1.formState.errors.confirmPassword && <p className="error-msg">{form1.formState.errors.confirmPassword.message}</p>}
              </div>

              {/* Requirements */}
              <div className="bg-slate-50 rounded-lg p-3 grid grid-cols-2 gap-1.5">
                {[
                  { check: passwordValue.length >= 8, text: 'At least 8 characters' },
                  { check: /[A-Z]/.test(passwordValue), text: 'One uppercase letter' },
                  { check: /\d/.test(passwordValue),   text: 'One number' },
                  { check: /[@$!%*?&]/.test(passwordValue), text: 'Special character' },
                ].map(({ check, text }) => (
                  <div key={text} className={`flex items-center gap-1.5 text-xs ${check ? 'text-green-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${check ? 'text-green-500' : 'text-slate-300'}`} />
                    {text}
                  </div>
                ))}
              </div>

              <button type="submit" className="btn btn-primary w-full py-2.5 text-sm font-semibold">
                Continue to Professional Info →
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: Professional ── */}
        {step === 2 && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Professional Information</h3>
                <p className="text-xs text-slate-500">Your medical credentials and practice details</p>
              </div>
            </div>

            <form onSubmit={form2.handleSubmit(onStep2Submit)} className="space-y-5" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* License Number */}
                <div>
                  <label className="label">License Number</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" {...form2.register('licenseNumber')}
                      className={`input pl-9 ${form2.formState.errors.licenseNumber ? 'input-error' : ''}`}
                      placeholder="PMC-12345" />
                  </div>
                  {form2.formState.errors.licenseNumber && <p className="error-msg">{form2.formState.errors.licenseNumber.message}</p>}
                </div>

                {/* Specialization */}
                <div>
                  <label className="label">Specialization</label>
                  <select {...form2.register('specialization')}
                    className={`input ${form2.formState.errors.specialization ? 'input-error' : ''}`}>
                    <option value="">Select specialization…</option>
                    {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {form2.formState.errors.specialization && <p className="error-msg">{form2.formState.errors.specialization.message}</p>}
                </div>

                {/* Experience */}
                <div>
                  <label className="label">Years of Experience</label>
                  <input type="number" min="0"
                    {...form2.register('experience', { valueAsNumber: true })}
                    className={`input ${form2.formState.errors.experience ? 'input-error' : ''}`}
                    placeholder="5" />
                  {form2.formState.errors.experience && <p className="error-msg">{form2.formState.errors.experience.message}</p>}
                </div>

                {/* Consultation Fee */}
                <div>
                  <label className="label">Consultation Fee (PKR)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="number" min="0"
                      {...form2.register('consultationFee', { valueAsNumber: true })}
                      className={`input pl-9 ${form2.formState.errors.consultationFee ? 'input-error' : ''}`}
                      placeholder="1500" />
                  </div>
                  {form2.formState.errors.consultationFee && <p className="error-msg">{form2.formState.errors.consultationFee.message}</p>}
                </div>

                {/* Hospital */}
                <div className="md:col-span-2">
                  <label className="label">Hospital / Clinic Affiliation</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="text" {...form2.register('hospitalAffiliation')}
                      className={`input pl-9 ${form2.formState.errors.hospitalAffiliation ? 'input-error' : ''}`}
                      placeholder="City Medical Center" />
                  </div>
                  {form2.formState.errors.hospitalAffiliation && <p className="error-msg">{form2.formState.errors.hospitalAffiliation.message}</p>}
                </div>

                {/* Qualifications */}
                <div className="md:col-span-2">
                  <label className="label">Qualifications</label>
                  <input type="text" {...form2.register('qualifications')}
                    className={`input ${form2.formState.errors.qualifications ? 'input-error' : ''}`}
                    placeholder="MBBS, FCPS, MRCP" />
                  <p className="text-xs text-slate-400 mt-1">Separate multiple qualifications with commas</p>
                  {form2.formState.errors.qualifications && <p className="error-msg">{form2.formState.errors.qualifications.message}</p>}
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label className="label flex justify-between">
                    <span>Professional Bio</span>
                    <span className={`text-xs font-normal ${bioValue.length < 20 ? 'text-red-400' : 'text-slate-400'}`}>
                      {bioValue.length}/500
                    </span>
                  </label>
                  <textarea {...form2.register('bio')} rows={4} maxLength={500}
                    className={`input resize-none ${form2.formState.errors.bio ? 'input-error' : ''}`}
                    placeholder="Tell patients about your experience and areas of expertise…" />
                  {form2.formState.errors.bio && <p className="error-msg">{form2.formState.errors.bio.message}</p>}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn btn-secondary flex-1 py-2.5 text-sm">← Back</button>
                <button type="submit" className="btn btn-primary flex-1 py-2.5 text-sm font-semibold">
                  Continue to Location →
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── STEP 3: Location ── */}
        {step === 3 && (
          <div className="card p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Practice Location</h3>
                <p className="text-xs text-slate-500">Where patients can find you — all fields optional</p>
              </div>
            </div>

            <form onSubmit={form3.handleSubmit(onStep3Submit)} className="space-y-6" noValidate>
              {/* Address */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="label">Street Address</label>
                  <input type="text" {...form3.register('street')} className="input" placeholder="123 Medical Center Drive" />
                </div>
                <div>
                  <label className="label">City</label>
                  <input type="text" {...form3.register('city')} className="input" placeholder="Karachi" />
                </div>
                <div>
                  <label className="label">State / Province</label>
                  <input type="text" {...form3.register('state')} className="input" placeholder="Sindh" />
                </div>
                <div>
                  <label className="label">Country</label>
                  <input type="text" {...form3.register('country')} className="input" placeholder="Pakistan" />
                </div>
                <div>
                  <label className="label">Zip / Postal Code</label>
                  <input type="text" {...form3.register('zipCode')} className="input" placeholder="75500" />
                </div>
              </div>

              {/* GPS */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-slate-700">GPS Coordinates <span className="text-slate-400 font-normal">(optional)</span></p>
                  <button type="button" onClick={getCurrentLocation} disabled={locationStatus === 'loading'}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 transition-colors">
                    {locationStatus === 'loading'  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Detecting…</> :
                     locationStatus === 'success'  ? <><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Detected</> :
                     <><MapPin className="w-3.5 h-3.5" /> Use current location</>}
                  </button>
                </div>

                {locationError && (
                  <div className="mb-4 flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{locationError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Latitude</label>
                    <input type="number" step="any" {...form3.register('latitude', { valueAsNumber: true })}
                      className="input" placeholder="24.8607" />
                  </div>
                  <div>
                    <label className="label">Longitude</label>
                    <input type="number" step="any" {...form3.register('longitude', { valueAsNumber: true })}
                      className="input" placeholder="67.0011" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Used to show your clinic on the patient map</p>
              </div>

              {/* Notice */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex gap-3 text-sm text-amber-700">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
                <div>
                  <p className="font-medium">Application review required</p>
                  <p className="text-amber-600 mt-0.5 text-xs">Your profile will be reviewed by our admin team. You'll be notified by email once approved.</p>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(2)} className="btn btn-secondary flex-1 py-2.5 text-sm">← Back</button>
                <button type="submit" disabled={form3.formState.isSubmitting}
                  className="btn btn-primary flex-1 py-2.5 text-sm font-semibold">
                  {form3.formState.isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting…
                    </span>
                  ) : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        )}

        <p className="mt-6 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default DoctorRegister;
