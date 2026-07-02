import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, ShieldCheck, User, ArrowRight } from 'lucide-react';
import Spinner from '../components/ui/Spinner';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email is required').email('Invalid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
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
      const storedUser = localStorage.getItem('leaveflow_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate(from === '/login' || from.startsWith('/admin') ? '/dashboard' : from, { replace: true });
        }
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      // AuthContext handles errors/toasts
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to quickly fill the form for testing/demo
  const handleQuickFill = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
  };

  return (
    <div className="flex min-h-screen w-screen bg-slate-50 font-sans antialiased selection:bg-brand-500/10">
      {/* Left Side: Professional Form Column */}
      <div className="flex w-full flex-col justify-between px-6 py-12 md:max-w-md lg:max-w-xl lg:px-12 xl:max-w-2xl bg-white shadow-2xl z-10">
        
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 font-black text-white text-lg tracking-wider shadow-lg shadow-brand-600/25">
            LF
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            LeaveFlow<span className="text-brand-600 font-semibold">HR</span>
          </span>
        </div>

        {/* Core Content Box */}
        <div className="my-auto w-full max-w-md mx-auto py-8">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Welcome back
            </h2>
            <p className="mt-2.5 text-sm font-medium text-slate-500">
              Enter your enterprise credentials to access your workplace portal.
            </p>
          </div>

          {/* Form */}
          <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-4 text-sm text-slate-900 placeholder-slate-400 outline-hidden transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 ${
                    errors.email ? 'border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10' : ''
                  }`}
                  placeholder="name@company.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-600">
                  Password
                </label>
              </div>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-11 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-hidden transition-all duration-200 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 ${
                    errors.password ? 'border-rose-300 bg-rose-50/10 focus:border-rose-500 focus:ring-rose-500/10' : ''
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs font-medium text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/10 hover:bg-slate-800 active:scale-[0.99] focus:outline-hidden focus:ring-4 focus:ring-slate-900/10 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Spinner size="sm" color="white" /> : (
                <>
                  Sign In <ArrowRight className="h-4 w-4 ml-0.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Credentials Section */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" /> Quick-Access Demo Roles
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@test.com', 'Admin123')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-200/60 bg-white p-2.5 text-left text-xs transition-all hover:border-brand-500 hover:shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-700 group-hover:text-brand-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-500" /> Admin Panel
                  </div>
                  <div className="text-slate-400 mt-0.5">admin@test.com &bull; Admin123</div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('employee@test.com', 'Employee123')}
                className="group flex w-full items-center justify-between rounded-xl border border-slate-200/60 bg-white p-2.5 text-left text-xs transition-all hover:border-brand-500 hover:shadow-xs"
              >
                <div>
                  <div className="font-semibold text-slate-700 group-hover:text-brand-600 flex items-center gap-1">
                    <User className="h-3.5 w-3.5 text-slate-400 group-hover:text-brand-500" /> Employee Panel
                  </div>
                  <div className="text-slate-400 mt-0.5">employee@test.com &bull; Employee123</div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600">Autofill</span>
              </button>
            </div>
          </div>
        </div>

        {/* Pure Footer context */}
        <div className="text-center text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} LeaveFlow HR &bull; Enterprise Security Verified</p>
        </div>
      </div>

      {/* Right Side: Visual Graphic (Visible on md screens and larger) */}
      <div className="hidden md:relative md:flex md:flex-1 md:items-center md:justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 p-12 overflow-hidden">
        {/* Abstract shapes for depth */}
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-80 w-80 rounded-full bg-slate-500/10 blur-3xl" />
        
        <div className="max-w-md text-center lg:text-left space-y-4">
          <h3 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Streamlining time-off management globally.
          </h3>
          <p className="text-sm font-light text-slate-300 leading-relaxed">
            Automate accruals, optimize approvals, and get actionable team insights instantly. Beautiful, frictionless workforce coordination starts here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;