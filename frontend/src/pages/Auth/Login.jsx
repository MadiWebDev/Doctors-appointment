import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Stethoscope, Users, Calendar, TrendingUp } from 'lucide-react';
import { loginSchema } from '../../utils/validators';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggleCompact } from '../../Components/shared/ThemeToggle';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    try {
      const result = await dispatch(login(data)).unwrap();
      toast.success('Login successful');
      const redirectPath = result.user?.role ? `/${result.user.role}/dashboard` : '/login';
      navigate(redirectPath);
    } catch (error) {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel - Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-600 flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold">MediBook</span>
        </div>
        
        <div className="space-y-8">
          <h1 className="text-4xl font-bold">Your Health, Our Priority</h1>
          <p className="text-lg text-primary-100">
            Book appointments with top doctors, manage your health records, and get the care you deserve.
          </p>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">500+</p>
              <p className="text-sm text-primary-100">Verified Doctors</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Calendar className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-sm text-primary-100">Appointments</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">98%</p>
              <p className="text-sm text-primary-100">Satisfaction</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <Stethoscope className="w-8 h-8 mb-2" />
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-primary-100">Support</p>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-primary-200">© 2024 MediBook. All rights reserved.</p>
      </div>

      {/* Right panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-slate-950">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="lg:hidden flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <img src='/sethoscope1.png' alt='sethoscope' />
              </div>
              <span className="text-2xl font-bold text-slate-900 dark:text-white">MediBook</span>
            </div>
            <div className="ml-auto">
              <ThemeToggleCompact />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome back</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">Sign in to your account to continue</p>

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

            <div className="flex items-center justify-between">
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register as Patient
              </Link>
            </p>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Are you a doctor?{' '}
              <Link to="/doctor-register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
