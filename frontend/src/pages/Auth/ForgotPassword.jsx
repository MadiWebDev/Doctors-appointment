import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
import { forgotPasswordSchema } from '../../utils/validators';
import { useDispatch } from 'react-redux';
import { forgotPassword } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { ThemeToggleCompact } from '../../Components/shared/ThemeToggle';

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data) => {
    try {
      await dispatch(forgotPassword(data.email)).unwrap();
      toast.success('OTP sent to your email');
      setSubmittedEmail(data.email);
      setIsSubmitted(true);
    } catch (error) {
      toast.error(error || 'Failed to send OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link to="/login" className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
          <ThemeToggleCompact />
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <img src='/sethoscope1.png' alt='sethoscope' />
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">MediBook</span>
        </div>

        {!isSubmitted ? (
          <>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Forgot password?</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              Enter your email address and we'll send you a 6-digit OTP to reset your password.
            </p>

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

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary w-full"
              >
                {isSubmitting ? 'Sending...' : 'Send OTP'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We've sent a 6-digit OTP to <span className="font-medium text-slate-900 dark:text-white">{submittedEmail}</span>.
              Enter it on the next page to reset your password.
            </p>
            <button
              onClick={() => navigate('/reset-password', { state: { email: submittedEmail } })}
              className="btn btn-primary w-full mb-3"
            >
              Enter OTP &amp; Reset Password
            </button>
            <button
              onClick={() => setIsSubmitted(false)}
              className="btn btn-secondary w-full"
            >
              Use a different email
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-slate-600 dark:text-slate-400">
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

export default ForgotPassword;
