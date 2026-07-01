import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Eye, EyeOff, ArrowLeft, User, Mail, Phone, Lock,
  CheckCircle2, Stethoscope, Users, Calendar, TrendingUp,
  ShieldCheck, Clock,
} from 'lucide-react';
import { patientRegisterSchema } from '../../utils/validators';
import { useDispatch } from 'react-redux';
import { registerPatient, sendOtp, verifyOtp } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { ThemeToggleCompact } from '../../Components/shared/ThemeToggle';

/* ─── Password strength helper ─────────────────────────────────────────── */
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  const map = [
    { label: '', color: '' },
    { label: 'Very weak', color: 'bg-red-500' },
    { label: 'Weak', color: 'bg-orange-500' },
    { label: 'Fair', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-lime-500' },
    { label: 'Very strong', color: 'bg-green-500' },
  ];
  return { score, ...map[score] };
};

/* ─── Brand panel (shared with Login) ──────────────────────────────────── */
const BrandPanel = () => (
  <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col justify-between p-12 text-white">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
        <Stethoscope className="w-6 h-6" />
      </div>
      <span className="text-2xl font-bold">MediBook</span>
    </div>

    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold leading-tight">Your Health,<br />Our Priority</h1>
        <p className="text-lg text-primary-100 mt-4">
          Book appointments with top doctors, manage your health records, and get the care you deserve.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[
          { icon: Users, value: '500+', label: 'Verified Doctors' },
          { icon: Calendar, value: '10K+', label: 'Appointments' },
          { icon: TrendingUp, value: '98%', label: 'Satisfaction' },
          { icon: Stethoscope, value: '24/7', label: 'Support' },
        ].map(({ icon: Icon, value, label }) => (
          <div key={label} className="bg-white/10 rounded-xl p-4">
            <Icon className="w-7 h-7 mb-2 opacity-80" />
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-sm text-primary-100">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 bg-white/10 rounded-xl p-4">
        <ShieldCheck className="w-6 h-6 shrink-0" />
        <p className="text-sm text-primary-100">
          Your data is encrypted and protected by industry-standard security.
        </p>
      </div>
    </div>

    <p className="text-sm text-primary-200">© {new Date().getFullYear()} MediBook. All rights reserved.</p>
  </div>
);

/* ─── Main Registration Form ────────────────────────────────────────────── */
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
    watch,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(patientRegisterSchema) });

  const passwordValue = watch('password', '');
  const strength = getPasswordStrength(passwordValue);

  const onRegisterSubmit = async (data) => {
    try {
      await dispatch(registerPatient(data)).unwrap();
      setEmail(data.email);
      await dispatch(sendOtp(data.email)).unwrap();
      toast.success('Registration successful! Please verify your email.');
      setStep(2);
    } catch (error) {
      toast.error(error || 'Registration failed');
    }
  };

  const onOtpSubmit = async (otp) => {
    try {
      await dispatch(verifyOtp({ email, otp })).unwrap();
      toast.success('Email verified successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'OTP verification failed');
    }
  };

  const handleResendOtp = async () => {
    try {
      await dispatch(sendOtp(email)).unwrap();
      toast.success('New OTP sent to your email');
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex">
        <BrandPanel />
        <OtpVerification email={email} onSubmit={onOtpSubmit} onResend={handleResendOtp} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Right panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950 overflow-y-auto">
        <div className="w-full max-w-md py-6">
          {/* Mobile logo + theme toggle */}
          <div className="flex items-center justify-between mb-6">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">MediBook</span>
            </div>
            <div className="ml-auto">
              <ThemeToggleCompact />
            </div>
          </div>

          <Link to="/login" className="inline-flex items-center text-slate-500 hover:text-slate-800 text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to login
          </Link>

          <h2 className="text-3xl font-bold text-slate-900 mb-1">Create your account</h2>
          <p className="text-slate-500 mb-8 text-sm">
            Already have one?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-5" noValidate>
            {/* Full Name */}
            <div>
              <label className="label">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  {...register('name')}
                  className={`input pl-9 ${errors.name ? 'input-error' : ''}`}
                  placeholder="John Doe"
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="error-msg">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  {...register('email')}
                  className={`input pl-9 ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="error-msg">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  className={`input pl-9 ${errors.phone ? 'input-error' : ''}`}
                  placeholder="+92 300 1234567"
                  autoComplete="tel"
                />
              </div>
              {errors.phone && <p className="error-msg">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`input pl-9 pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength bar */}
              {passwordValue && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score ? strength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  {strength.label && (
                    <p className={`text-xs font-medium ${
                      strength.score <= 2 ? 'text-red-500' :
                      strength.score === 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {strength.label}
                    </p>
                  )}
                </div>
              )}
              {errors.password && <p className="error-msg">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword')}
                  className={`input pl-9 pr-10 ${errors.confirmPassword ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword.message}</p>}
            </div>

            {/* Requirements hint */}
            <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 space-y-1">
              {[
                { check: passwordValue.length >= 8, text: 'At least 8 characters' },
                { check: /[A-Z]/.test(passwordValue), text: 'One uppercase letter' },
                { check: /\d/.test(passwordValue), text: 'One number' },
                { check: /[@$!%*?&]/.test(passwordValue), text: 'One special character (@$!%*?&)' },
              ].map(({ check, text }) => (
                <div key={text} className={`flex items-center gap-2 transition-colors ${check ? 'text-green-600' : ''}`}>
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${check ? 'text-green-500' : 'text-slate-300'}`} />
                  {text}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="mt-6 text-center text-slate-500 text-sm">
            Are you a doctor?{' '}
            <Link to="/doctor-register" className="text-primary-600 hover:text-primary-700 font-medium">
              Register as doctor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

/* ─── OTP Verification Panel ────────────────────────────────────────────── */
const OtpVerification = ({ email, onSubmit, onResend }) => {
  const [digits, setDigits] = useState(Array(6).fill(''));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const handleResend = () => {
    setCountdown(60);
    setCanResend(false);
    onResend();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otp = digits.join('');
    if (otp.length !== 6) return;
    setIsSubmitting(true);
    await onSubmit(otp);
    setIsSubmitting(false);
  };

  const otp = digits.join('');

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
      <div className="w-full max-w-md">
        {/* Mobile logo + theme toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">MediBook</span>
          </div>
          <div className="ml-auto">
            <ThemeToggleCompact />
          </div>
        </div>

        <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
          <Mail className="w-7 h-7 text-primary-600" />
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Check your email</h2>
        <p className="text-slate-500 mb-2 text-sm">We sent a 6-digit verification code to</p>
        <p className="font-semibold text-slate-800 mb-8 text-sm">{email}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 6-digit boxes */}
          <div>
            <label className="label mb-3">Enter verification code</label>
            <div className="flex gap-2 justify-between" onPaste={handlePaste}>
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  className={`w-12 h-14 text-center text-xl font-bold rounded-lg border-2 transition-all outline-none
                    ${digit
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 bg-white text-slate-900'
                    }
                    focus:border-primary-500 focus:ring-2 focus:ring-primary-100`}
                  aria-label={`OTP digit ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || otp.length !== 6}
            className="btn btn-primary w-full py-2.5 text-sm font-semibold"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Verifying…
              </span>
            ) : 'Verify email'}
          </button>
        </form>

        {/* Resend */}
        <div className="mt-6 text-center text-sm">
          {canResend ? (
            <p className="text-slate-500">
              Didn&apos;t receive it?{' '}
              <button
                onClick={handleResend}
                className="text-primary-600 hover:text-primary-700 font-medium"
              >
                Resend code
              </button>
            </p>
          ) : (
            <p className="text-slate-400 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Resend in <span className="font-semibold text-slate-600">{countdown}s</span>
            </p>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Make sure to check your spam folder if you don&apos;t see the email.
        </p>
      </div>
    </div>
  );
};

export default PatientRegister;
