import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Stethoscope, ArrowLeft } from 'lucide-react';
import { resetPasswordSchema } from '../../utils/validators';
import { useDispatch } from 'react-redux';
import { resetPassword } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Pre-fill email if navigated from ForgotPassword page
  const prefillEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: prefillEmail },
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(resetPassword(data)).unwrap();
      toast.success('Password reset successful');
      navigate('/login');
    } catch (error) {
      toast.error(error || 'Failed to reset password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50">
      <div className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                       <img src='/sethoscope1.png' alt='sethoscope' />

          </div>
          <span className="text-2xl font-bold text-slate-900">MediBook</span>
        </div>

        <h2 className="text-3xl font-bold text-slate-900 mb-2">Reset password</h2>
        <p className="text-slate-600 mb-8">Enter your OTP and new password</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            <label className="label">OTP</label>
            <input
              type="text"
              {...register('otp')}
              className={`input ${errors.otp ? 'input-error' : ''}`}
              placeholder="000000"
              maxLength={6}
            />
            {errors.otp && <p className="error-msg">{errors.otp.message}</p>}
          </div>

          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('newPassword')}
                className={`input pr-10 ${errors.newPassword ? 'input-error' : ''}`}
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
            {errors.newPassword && <p className="error-msg">{errors.newPassword.message}</p>}
          </div>

          <div>
            <label className="label">Confirm New Password</label>
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
            {isSubmitting ? 'Resetting...' : 'Reset password'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-600">
            Remember your password?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
