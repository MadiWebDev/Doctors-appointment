import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Stethoscope, ArrowLeft } from 'lucide-react';
import { patientRegisterSchema } from '../../utils/validators';
import { useDispatch } from 'react-redux';
import { registerPatient, sendOtp } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const PatientRegister = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(patientRegisterSchema),
  });

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerPatient(data)).unwrap();
      setEmail(data.email);
      await dispatch(sendOtp(data.email)).unwrap();
      toast.success('Registration successful. Please verify your email.');
      setStep(2);
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  const onOtpSubmit = async (otp) => {
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      toast.success('Email verified successfully');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(sendOtp(email)).unwrap();
      toast.success('OTP sent successfully');
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    }
  };

  if (step === 2) {
    return <OtpVerification email={email} onSubmit={onOtpSubmit} onResend={handleResendOtp} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
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

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Create patient account</h2>
        <p className="text-slate-600 mb-8">Fill in your details to get started</p>

        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6">
          <div>
            <label className="label">Full Name</label>
            <input
              type="text"
              {...register('name')}
              className={`input ${errors.name ? 'input-error' : ''}`}
              placeholder="John Doe"
            />
            {errors.name && <p className="error-msg">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`input ${errors.email ? 'input-error' : ''}`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="error-msg">{errors.email.message}</p>}
          </div>

          <div>
            <label className="label">Phone Number</label>
            <input
              type="tel"
              {...register('phone')}
              className={`input ${errors.phone ? 'input-error' : ''}`}
              placeholder="+92 300 1234567"
            />
            {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password')}
                className={`input pr-10 ${errors.password ? 'input-error' : ''}`}
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
            {errors.password && <p className="error-msg">{errors.password.message}</p>}
          </div>

          <div>
            <label className="label">Confirm Password</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                {...register('confirmPassword')}
                className={`input pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
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
            {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const OtpVerification = ({ email, onSubmit, onResend }) => {
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSubmit(otp);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-slate-900">MediBook</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Verify your email</h2>
        <p className="text-slate-600 mb-8">
          We've sent a 6-digit code to <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="label">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="input text-center text-2xl tracking-widest"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="btn btn-primary w-full"
          >
            {isSubmitting ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Didn't receive the code?{' '}
            <button onClick={onResend} className="text-primary-600 hover:text-primary-700 font-medium">
              Resend
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PatientRegister;
