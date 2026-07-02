import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      await login(data.email, data.password);
      // Wait for a tiny tick to let storage update, then redirect based on role
      const storedUser = localStorage.getItem('leaveflow_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from === '/login' || from.startsWith('/admin') ? '/dashboard' : from, { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('Login error', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Brand Header */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white font-extrabold text-2xl shadow-xl shadow-brand-500/25">
            LF
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-slate-800 tracking-tight">
            Sign in to LeaveFlow <span className="text-brand-600">HR</span>
          </h2>
          <p className="mt-2 text-sm font-medium text-slate-400">
            Enter your enterprise credentials to access your portal
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative mt-2 rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('register' in loginSchema.shape ? 'email' as any : 'email')}
                  className={`block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-hidden transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                    errors.email ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
              </div>
              <div className="relative mt-2 rounded-xl shadow-2xs">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full rounded-xl border border-slate-200 py-3 pl-10 pr-10 text-sm text-slate-800 placeholder-slate-400 outline-hidden transition-all duration-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 ${
                    errors.password ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/20' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center rounded-xl bg-brand-600 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-700 focus:outline-hidden focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner size="sm" color="white" /> : 'Sign In'}
            </button>
          </form>
        </div>

        {/* System Info Footer for testing context */}
        <div className="text-center text-xs text-slate-400">
          <p>LeaveFlow HR Portal &bull; Enterprise Grade Security</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
